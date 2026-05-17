import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { OtpService } from '../../common/services/otp.service';
import { Role } from 'src/common/enums/role.enum';
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,

    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) { }
  async register(registerDto: RegisterDto) {
    const user = await this.userService.findByEmail(registerDto.email);
    if (user) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const otp = this.otpService.generateOtp();
    const otpExpiration = this.otpService.getOtpExpiration();
    await this.mailService.sendOtpEmail(registerDto.email, otp);
    await this.userService.create({
      fullName: registerDto.fullName,
      email: registerDto.email,
      password: hashedPassword,
      role: Role.USER,
      verificationCode: otp,
      verificationCodeExpires: otpExpiration,
    });
    return { message: 'User successfully registered. Verify your email with OTP.' };
  }

  async getMe(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const hashed = await bcrypt.hash(refreshToken, 10);

    await this.userRepo.update(user.id, {
      hashedRefreshToken: hashed,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user,
      accessToken,
    };
  }
  async verifyOtp(email: string, otp: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    if (this.otpService.isOtpExpired(user.verificationCodeExpires)) {
      throw new Error("OTP has expired");
    }
    const isOtpValid = this.otpService.verifyOtp(user.verificationCode, otp);
    if (!isOtpValid) {
      throw new Error("Invalid OTP");
    }
    const updatedUser = await this.userService.update(user.id, {
      isVerified: true,
      verificationCode: "",
      verificationCodeExpires: new Date(),
    });
    return updatedUser;
  }
  async resendOtp(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.isVerified) {
      throw new Error("User is already verified");
    }
    const otp = this.otpService.generateOtp();
    const otpExpiration = this.otpService.getOtpExpiration();
    const resendLimit = 5;
    if (user.resendCount >= resendLimit) {
      throw new Error("Resend limit reached");
    }
    await this.mailService.sendOtpEmail(email, otp);
    const updatedUser = await this.userService.update(user.id, {
      verificationCode: otp,
      verificationCodeExpires: otpExpiration,
      resendCount: user.resendCount + 1,
    });

    return { message: "OTP resent successfully" };
  }
  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found")
    }
    const otp = this.otpService.generateOtp();
    const otpExpiration = this.otpService.getOtpExpiration();
    await this.mailService.sendOtpEmail(email, otp);
    const updatedUser = await this.userService.update(user.id, {
      verificationCode: otp,
      verificationCodeExpires: otpExpiration,
    });
    return { message: "OTP sent successfully" };
  }
  async resetPassword(email: string, otp: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found")
    }
    if (this.otpService.isOtpExpired(user.verificationCodeExpires)) {
      throw new Error("OTP has expired");
    }
    const isOtpValid = this.otpService.verifyOtp(user.verificationCode, otp);
    if (!isOtpValid) {
      throw new Error("Invalid OTP");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await this.userService.update(user.id, {
      password: hashedPassword,
      verificationCode: "",
      verificationCodeExpires: new Date(),
    });
    return updatedUser;
  }
  async changePassword(email: string, oldPassword: string, newPassword: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found")
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.userService.update(user.id, {
      password: hashedPassword,
    });
    return { message: "Password changed successfully" };
  }
  async deactivateAccount(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found")
    }
    const updatedUser = await this.userService.update(user.id, {
      isActive: false,
    });
    return { message: "Account deleted successfully" };
  }
  async activateAccount(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found")
    }
    const updatedUser = await this.userService.update(user.id, {
      isActive: true,
    });
    return { message: "Account activated successfully" };
  }
  async refresh(req: Request) {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new Error('No refresh token');
    }

    const payload = this.jwtService.verify(token);

    const user = await this.userRepo.findOneBy({
      id: payload.id,
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.hashedRefreshToken) {
      throw new Error('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(
      token,
      user.hashedRefreshToken,
    );

    if (!isValid) {
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = this.jwtService.sign(
      {
        id: user.id,
        role: user.role,
      },
      {
        expiresIn: '15m',
      },
    );

    return {
      accessToken: newAccessToken,
    };
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies.refreshToken;

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        await this.userRepo.update(payload.id, {
          hashedRefreshToken: null,
        });
      } catch (e) {

      }
    }

    res.clearCookie('refreshToken');
    return { message: 'Logout successfully' };
  }
}
