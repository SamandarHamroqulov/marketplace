import { Injectable } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
  ) { }

  async sendOtpEmail(
    email: string,
    otp: string,
  ) {
    await this.mailerService.sendMail({
      to: email,

      subject: 'Your Verification OTP',

      html: `
        <div
          style="
            font-family: Arial,
            sans-serif;
            padding: 20px;
          "
        >
          <h1>Email Verification</h1>

          <p>
            Your verification code is:
          </p>

          <div
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 20px 0;
            "
          >
            ${otp}
          </div>

          <p>
            This OTP expires in 5 minutes.
          </p>
        </div>
      `,
    });
  }
}