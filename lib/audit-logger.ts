/**
 * Audit Logger Utility
 * 
 * Helper functions for logging audit events throughout the application.
 */

import dbConnect from '@/lib/db';
import AuditLog from '@/lib/models/AuditLog';

export interface AuditLogEntry {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    action: string;
    entityType: string;
    entityId?: string;
    entityName?: string;
    changes?: Array<{ field: string; oldValue: any; newValue: any }>;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
    try {
        await dbConnect();
        await AuditLog.create({
            ...entry,
            timestamp: new Date()
        });
    } catch (error) {
        // Don't throw - audit logging should not break the main flow
        console.error('Audit logging failed:', error);
    }
}

// Convenience functions for common actions
export async function logCreate(
    user: { id?: string; name?: string; email?: string; role?: string },
    entityType: string,
    entityId: string,
    entityName: string
) {
    await logAudit({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: 'CREATE',
        entityType,
        entityId,
        entityName,
        description: `Created ${entityType}: ${entityName}`
    });
}

export async function logUpdate(
    user: { id?: string; name?: string; email?: string; role?: string },
    entityType: string,
    entityId: string,
    entityName: string,
    changes: Array<{ field: string; oldValue: any; newValue: any }>
) {
    await logAudit({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: 'UPDATE',
        entityType,
        entityId,
        entityName,
        changes,
        description: `Updated ${entityType}: ${entityName}`
    });
}

export async function logDelete(
    user: { id?: string; name?: string; email?: string; role?: string },
    entityType: string,
    entityId: string,
    entityName: string
) {
    await logAudit({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: 'DELETE',
        entityType,
        entityId,
        entityName,
        description: `Deleted ${entityType}: ${entityName}`
    });
}

export async function logStatusChange(
    user: { id?: string; name?: string; email?: string; role?: string },
    entityType: string,
    entityId: string,
    entityName: string,
    oldStatus: string,
    newStatus: string
) {
    await logAudit({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: 'STATUS_CHANGE',
        entityType,
        entityId,
        entityName,
        changes: [{ field: 'status', oldValue: oldStatus, newValue: newStatus }],
        description: `Changed ${entityType} status: ${oldStatus} → ${newStatus}`
    });
}

export async function logLogin(
    user: { id?: string; name?: string; email?: string; role?: string },
    success: boolean,
    ipAddress?: string,
    errorMessage?: string
) {
    await logAudit({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: success ? 'LOGIN' : 'LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        entityName: user.email,
        success,
        errorMessage,
        ipAddress
    });
}
