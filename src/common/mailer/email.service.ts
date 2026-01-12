import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { format, addDays } from 'date-fns';

export interface InvitationEmailData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  organizationName: string;
  invitationType: 'location_admin' | 'user';
  invitationToken: string;
  locationName?: string;
  role?: string;
}

interface RoleInfo {
  title: string;
  permissions: string[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        template: './password-reset',
        context: {
          appName: this.configService.get('APP_NAME', 'DOVAMFG'),
          resetUrl: resetUrl,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send email verification email to new users
   */
  async sendEmailVerification(
    email: string,
    userName: string,
    verificationToken: string,
    organizationName?: string,
  ) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/email-verification?token=${verificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Welcome to DOVMFG${organizationName ? ` - ${organizationName}` : ''}`,
        template: './email-verification',
        context: {
          userName: userName,
          organizationName: organizationName || 'your organization',
          verificationUrl: verificationUrl,
          appUrl: frontendUrl,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  /**
   * Get role description based on invitation type and role
   */
  private getRoleInfo(invitationType: string, role?: string): RoleInfo {
    // Handle location_admin invitation type
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

    // Role-based descriptions
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

  /**
   * Send invitation email using the full-featured template
   */
  async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const inviteUrl = `${frontendUrl}/invite?token=${data.invitationToken}`;
    const roleInfo = this.getRoleInfo(data.invitationType, data.role);
    const expiryDate = format(addDays(new Date(), 7), 'MMMM d, yyyy');

    // Determine if we should show the location box
    const showLocationBox =
      !!data.locationName && data.role === 'location_manager';

    try {
      this.logger.log(
        `Sending invitation email to ${data.recipientEmail} for ${data.organizationName}`,
      );

      await this.mailerService.sendMail({
        to: data.recipientEmail,
        subject: `${data.senderName} invited you to join ${data.organizationName} - Get started in seconds!`,
        template: './invitation-email',
        context: {
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
        },
      });

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

  /**
   * Send simple invitation email (fallback/lightweight version)
   */
  async sendSimpleInvitationEmail(data: InvitationEmailData): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const inviteUrl = `${frontendUrl}/invite?token=${data.invitationToken}`;

    try {
      this.logger.log(
        `Sending simple invitation email to ${data.recipientEmail}`,
      );

      await this.mailerService.sendMail({
        to: data.recipientEmail,
        subject: `You've been invited to ${data.organizationName}`,
        template: './invitation-email-simple',
        context: {
          recipientName: data.recipientName,
          senderName: data.senderName,
          organizationName: data.organizationName,
          inviteUrl: inviteUrl,
          currentYear: new Date().getFullYear(),
        },
      });

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
