import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { InvitationEmailData } from './email.service';
import { format, addDays } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

interface RoleInfo {
  title: string;
  permissions: string[];
}

@Injectable()
export class ResendEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private resend: Resend;
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private emailFrom: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not configured. Resend emails will fail.',
      );
    }
    this.resend = new Resend(apiKey);
    this.emailFrom =
      this.configService.get('EMAIL_FROM') || 'DOVMFG <noreply@dovamfg.com>';
    this.loadTemplates();
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, '../../..', 'templates');
    const templateFiles = [
      'email-verification',
      'invitation-email',
      'invitation-email-simple',
      'password-reset',
    ];

    for (const templateName of templateFiles) {
      const templatePath = path.join(templatesDir, `${templateName}.hbs`);
      try {
        if (fs.existsSync(templatePath)) {
          const templateSource = fs.readFileSync(templatePath, 'utf-8');
          this.templates.set(templateName, Handlebars.compile(templateSource));
          this.logger.log(`Loaded template: ${templateName}`);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to load template ${templateName}: ${error.message}`,
        );
      }
    }
  }

  private renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    return template(context);
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    try {
      const html = this.renderTemplate('password-reset', {
        appName: this.configService.get('APP_NAME', 'DOVAMFG'),
        resetUrl: resetUrl,
        year: new Date().getFullYear(),
      });

      const { error } = await this.resend.emails.send({
        from: this.emailFrom,
        to: email,
        subject: 'Password Reset Request',
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }

  async sendEmailVerification(
    email: string,
    userName: string,
    verificationToken: string,
    organizationName?: string,
  ) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/email-verification?token=${verificationToken}`;

    try {
      const html = this.renderTemplate('email-verification', {
        userName: userName,
        organizationName: organizationName || 'your organization',
        verificationUrl: verificationUrl,
        appUrl: frontendUrl,
        year: new Date().getFullYear(),
      });

      const { error } = await this.resend.emails.send({
        from: this.emailFrom,
        to: email,
        subject: `Welcome to DOVMFG${organizationName ? ` - ${organizationName}` : ''}`,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  private getRoleInfo(invitationType: string, role?: string): RoleInfo {
    if (invitationType === 'location_admin') {
      return {
        title: 'Location Administrator',
        permissions: [
          'Manage location operations',
          'View production schedules',
          'Track work orders and OEE',
          'Manage location staff',
        ],
      };
    }

    const roleDescriptions: Record<string, RoleInfo> = {
      company_admin: {
        title: 'Company Administrator',
        permissions: [
          'Manage users and permissions',
          'Configure company settings',
          'View all production data and reports',
          'Manage departments and locations',
        ],
      },
      location_admin: {
        title: 'Location Administrator',
        permissions: [
          'Manage location operations',
          'View production schedules',
          'Track work orders and OEE',
          'Manage location staff',
        ],
      },
      operator: {
        title: 'Operator',
        permissions: [
          'Track work orders',
          'Log production updates',
          'Report downtime',
          'Update work order status',
        ],
      },
      supervisor: {
        title: 'Supervisor',
        permissions: [
          'Monitor production floor',
          'Manage work orders',
          'Review OEE metrics',
          'Assist operators',
        ],
      },
      admin: {
        title: 'Administrator',
        permissions: [
          'Manage users and permissions',
          'Configure settings',
          'View all reports',
          'Manage locations',
        ],
      },
      super_admin: {
        title: 'Super Administrator',
        permissions: [
          'Full system access',
          'Manage all companies',
          'System configuration',
          'Advanced administration',
        ],
      },
      user: {
        title: 'User',
        permissions: [
          'Access production data',
          'View work orders',
          'Basic reporting',
        ],
      },
    };

    const roleKey = role?.toLowerCase() || 'operator';
    return (
      roleDescriptions[roleKey] || {
        title: role
          ? role
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l: string) => l.toUpperCase())
          : 'Team Member',
        permissions: ['Access production data', 'Track work orders'],
      }
    );
  }

  async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const inviteUrl = `${frontendUrl}/invite?token=${data.invitationToken}`;
    const roleInfo = this.getRoleInfo(data.invitationType, data.role);
    const expiryDate = format(addDays(new Date(), 7), 'MMMM d, yyyy');
    const showLocationBox =
      !!data.locationName && data.role === 'location_manager';

    try {
      this.logger.log(
        `Sending invitation email to ${data.recipientEmail} for ${data.organizationName}`,
      );

      const html = this.renderTemplate('invitation-email', {
        recipientName: data.recipientName,
        senderName: data.senderName,
        organizationName: data.organizationName,
        inviteUrl: inviteUrl,
        roleTitle: roleInfo.title,
        permissions: roleInfo.permissions,
        expiryDate: expiryDate,
        currentYear: new Date().getFullYear(),
        showLocationBox: showLocationBox,
        locationName: data.locationName,
        customMessage: data.customMessage,
      });

      const { error } = await this.resend.emails.send({
        from: this.emailFrom,
        to: data.recipientEmail,
        subject: `${data.senderName} invited you to join ${data.organizationName} - Get started in seconds!`,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(
        `Invitation email sent successfully to ${data.recipientEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send invitation email to ${data.recipientEmail}`,
        error,
      );
      throw error;
    }
  }

  async sendSimpleInvitationEmail(data: InvitationEmailData): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const inviteUrl = `${frontendUrl}/invite?token=${data.invitationToken}`;

    try {
      this.logger.log(
        `Sending simple invitation email to ${data.recipientEmail}`,
      );

      const html = this.renderTemplate('invitation-email-simple', {
        recipientName: data.recipientName,
        senderName: data.senderName,
        organizationName: data.organizationName,
        inviteUrl: inviteUrl,
        currentYear: new Date().getFullYear(),
      });

      const { error } = await this.resend.emails.send({
        from: this.emailFrom,
        to: data.recipientEmail,
        subject: `You've been invited to ${data.organizationName}`,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logger.log(
        `Simple invitation email sent successfully to ${data.recipientEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send simple invitation email to ${data.recipientEmail}`,
        error,
      );
      throw error;
    }
  }
}
