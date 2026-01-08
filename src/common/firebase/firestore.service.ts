import { Injectable, Logger } from '@nestjs/common';
import { getFirebaseApp, admin } from './firebase.config';
import { Employee } from '@/database/entities/employee.entity';

/**
 * TypeScript interfaces for Firestore documents
 */
export interface FirestoreNotificationData {
  notificationId: string;
  type: string;
  createdAt: admin.firestore.FieldValue;
  relatedEntity?: {
    orderId?: string;
    requestId?: string;
    [key: string]: any;
  };
}

export interface EmployeeNotificationInput {
  customerId?: string;
  branchId?: string;
  providerId?: string;
  notificationId: string;
  type: string;
  relatedEntity?: {
    orderId?: string;
    requestId?: string;
    [key: string]: any;
  };
}

@Injectable()
export class FirestoreService {
  private readonly logger = new Logger(FirestoreService.name);
  private firestore: admin.firestore.Firestore;

  constructor() {
    try {
      const app = getFirebaseApp();
      this.firestore = admin.firestore(app);
      this.logger.log('Firestore service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Firestore service', error);
      throw error;
    }
  }

  /**
   * Creates a Firebase custom token for employee authentication
   * Embeds customerId and branchId as custom claims for Firestore security rules
   *
   * @param employee - Employee entity with customer/branch relationships
   * @returns Firebase custom token string
   */
  async createCustomTokenForEmployee(employee: Employee): Promise<string> {
    try {
      const customClaims: Record<string, any> = {};
      // Add customerId if employee belongs to a customer
      if (employee.customerId) {
        customClaims.customerId = employee.customerId || employee?.customer?.id;
      }
      // Add branchId if employee belongs to a branch
      if (employee.branch?.id) {
        customClaims.branchId = employee.branch.id;
        // Add providerId if employee's branch has a provider
        if (employee.branch?.provider?.id) {
          customClaims.providerId = employee.branch.provider.id;
        }
      }

      // Ensure at least one grouping identifier exists
      if (
        !customClaims.customerId &&
        !customClaims.branchId &&
        !customClaims.providerId
      ) {
        // System admin users don't need specific group IDs
        customClaims.isSystemAdmin = true;
      }

      const auth = admin.auth(getFirebaseApp());
      const firebaseToken = await auth.createCustomToken(
        employee.id,
        customClaims,
      );
      return firebaseToken;
    } catch (error) {
      this.logger.error(
        `Failed to create Firebase token for employee ${employee?.id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Saves a notification event to Firestore for real-time updates
   * Supports multiple collection strategies:
   * 1. Customer-scoped: system_events/customer_{customerId}/notifications
   * 2. Branch-scoped: system_events/branch_{branchId}/notifications
   * 3. Provider-scoped: system_events/provider_{providerId}/notifications
   * 4. System-wide: system_events/system_admin/notifications
   *
   * @param data - Notification data including grouping identifiers
   */
  async saveEmployeeNotification(
    data: EmployeeNotificationInput,
  ): Promise<void> {
    try {
      const notificationDoc: FirestoreNotificationData = {
        notificationId: data.notificationId,
        type: data.type,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        relatedEntity: data.relatedEntity,
      };

      const collections: string[] = [];

      // Determine all applicable collection paths
      if (data.customerId) {
        collections.push(`customer_${data.customerId}`);
      }

      if (data.branchId) {
        collections.push(`branch_${data.branchId}`);
      }

      if (data.providerId) {
        collections.push(`provider_${data.providerId}`);
      }

      // If no specific scope, it's a system-wide notification for admins
      if (collections.length === 0) {
        collections.push('system_admin');
      }

      // Write to all applicable collections
      const writePromises = collections.map((groupId) =>
        this.firestore
          .collection('system_events')
          .doc(groupId)
          .collection('notifications')
          .doc(data.notificationId)
          .set(notificationDoc),
      );

      await Promise.all(writePromises);

      this.logger.log(
        `Notification ${data.notificationId} synced to Firestore collections: ${collections.join(', ')}`,
      );
    } catch (error) {
      // Log error but don't throw - Firestore is supplementary
      this.logger.error(
        `Failed to sync notification ${data.notificationId} to Firestore`,
        error,
      );
    }
  }

  /**
   * Delete a notification from Firestore
   * Useful for cleanup or when notifications are marked as read
   *
   * @param groupId - Customer or Branch ID
   * @param notificationId - Notification ID to delete
   */
  async deleteEmployeeNotification(
    groupId: string,
    notificationId: string,
  ): Promise<void> {
    try {
      await this.firestore
        .collection('system_events')
        .doc(groupId)
        .collection('notifications')
        .doc(notificationId)
        .delete();

      this.logger.log(
        `Notification ${notificationId} deleted from Firestore for group ${groupId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete notification ${notificationId} from Firestore`,
        error,
      );
    }
  }
}
