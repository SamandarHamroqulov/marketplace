import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
    generateOtp(length = 6): string {
        let otp = '';

        for (let i = 0; i < length; i++) {
            otp += Math.floor(
                Math.random() * 10,
            ).toString();
        }

        return otp;
    }

    getOtpExpiration(minutes = 5): Date {
        return new Date(
            Date.now() + minutes * 60 * 1000,
        );
    }
    verifyOtp(storedOtp: string, providedOtp: string): boolean {
        return storedOtp === providedOtp;
    }
    isOtpExpired(expiresAt: Date): boolean {
        return new Date() > expiresAt;
    }

}
