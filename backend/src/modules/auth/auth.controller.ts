import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResendOtpDto, VerifyOtpDto } from './dto/create-auth.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Post("verify-otp")
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp)
  }

  @Post("resend-otp")
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto.email)
  }

  @Post("forgot-password")
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email)
  }

  @Post("reset-password")
  async resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('password') password: string
  ) {
    return this.authService.resetPassword(email, otp, password)
  }

  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  async changePassword(
    @Body('email') email: string,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.authService.changePassword(email, oldPassword, newPassword)
  }

  @UseGuards(JwtAuthGuard)
  @Post("deactivate-account")
  async deactivateAccount(@Body('email') email: string) {
    return this.authService.deactivateAccount(email)
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @Post("refresh-token")
  async refreshToken(@Req() req: Request) {
    return this.authService.refresh(req)
  }
}
