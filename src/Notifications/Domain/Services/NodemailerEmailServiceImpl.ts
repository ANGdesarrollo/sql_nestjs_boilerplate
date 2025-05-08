import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { SentMessageInfo, Options } from 'nodemailer/lib/smtp-transport';

import { EnvService } from '../../../Config/Env/EnvService';

import { EmailService } from './EmailService';

@Injectable()
export class NodemailerEmailServiceImpl implements EmailService
{
  private readonly transporter: Transporter<SentMessageInfo, Options>;

  constructor(private readonly env: EnvService)
  {
    const { host, port, secure, user, pass } = this.env.smtp;

    this.transporter = createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined
    });
  }

  async send({ to, subject, body, attachments = [] }): Promise<void>
  {
    await this.transporter.sendMail({
      from: this.env.smtp.from,
      to,
      subject,
      html: body,
      attachments
    });
  }
}
