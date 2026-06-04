import nodemailer from "nodemailer";
import type { IEmailService } from "../../domain/interface/IEmailService.js";

class EmailService implements IEmailService {

  private transporter;

  constructor() {

    this.transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOtpEmail(
    email: string,
    otp: string
  ): Promise<void> {

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: "JanFix OTP Verification",

      html: `
        <h2>Your OTP Code</h2>
        <p>Your verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });
  }
}

export default EmailService;