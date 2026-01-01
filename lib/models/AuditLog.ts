import mongoose, { Schema, model, models } from 'mongoose';

/**
 * Audit Log Schema
 * 
 * Records all significant actions in the system for security and compliance.
 */

const AuditLogSchema = new Schema({
    // Who performed the action
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userEmail: { type: String },
    userRole: { type: String },

    // What action was performed
    action: {
        type: String,
        enum: [
            'CREATE', 'READ', 'UPDATE', 'DELETE',
            'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
            'APPROVE', 'REJECT', 'EXPORT',
            'STATUS_CHANGE', 'ASSIGN', 'CONVERT'
        ],
        required: true
    },

    // On which entity
    entityType: {
        type: String,
        enum: ['User', 'Lead', 'Project', 'Task', 'Commission', 'Automation', 'Contact', 'Employee'],
        required: true
    },
    entityId: { type: Schema.Types.ObjectId },
    entityName: { type: String },

    // What changed (for updates)
    changes: [{
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed
    }],

    // Additional context
    description: { type: String },

    // Request metadata
    ipAddress: { type: String },
    userAgent: { type: String },

    // Result
    success: { type: Boolean, default: true },
    errorMessage: { type: String },

    timestamp: { type: Date, default: Date.now }
});

// Index for efficient querying
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

const AuditLog = models.AuditLog || model('AuditLog', AuditLogSchema);

export default AuditLog;
