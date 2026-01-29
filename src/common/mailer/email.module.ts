import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      // Import ConfigService to use .env variables
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        // Transport configuration (your existing SMTP settings)
        transport: {
          host: config.get('SMTP_HOST'),
          port: parseInt(config.get('SMTP_PORT', '587'), 10),
          secure: config.get('SMTP_SECURE', 'false') === 'true', // true for 465, false for 587
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
          tls: {
            rejectUnauthorized: false, // Allow self-signed certs in dev
          },
        },
        // Default mail options
        defaults: {
          from:
            config.get('EMAIL_FROM') ||
            `"${config.get('APP_NAME', 'DOVA Manufacturing')}" <${config.get('SMTP_FROM')}>`,
        },
        // Template engine configuration
        template: {
          dir: join(__dirname, '../..', 'templates'), // Path to your templates folder
          adapter: new HandlebarsAdapter(), // Use Handlebars
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
