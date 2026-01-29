import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';
import { ResendEmailService } from './resend-email.service';

// Token for DI - allows consumers to inject either service
export const EMAIL_SERVICE = 'EMAIL_SERVICE';

@Module({
  imports: [
    // Only import MailerModule if not in production (for SMTP fallback)
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: parseInt(config.get('SMTP_PORT', '587'), 10),
          secure: config.get('SMTP_SECURE', 'false') === 'true',
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from:
            config.get('EMAIL_FROM') ||
            `"${config.get('APP_NAME', 'DOVA Manufacturing')}" <${config.get('SMTP_FROM')}>`,
        },
        template: {
          dir: join(__dirname, '../../..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [
    EmailService,
    ResendEmailService,
    {
      provide: EMAIL_SERVICE,
      useFactory: (
        configService: ConfigService,
        emailService: EmailService,
        resendEmailService: ResendEmailService,
      ) => {
        const useResend = configService.get('RESEND_API_KEY');
        const isProduction = configService.get('NODE_ENV') === 'production';

        if (useResend && isProduction) {
          console.log('[EmailModule] Using ResendEmailService for production');
          return resendEmailService;
        }

        console.log('[EmailModule] Using SMTP EmailService');
        return emailService;
      },
      inject: [ConfigService, EmailService, ResendEmailService],
    },
  ],
  exports: [EMAIL_SERVICE, EmailService, ResendEmailService],
})
export class EmailModule {}
