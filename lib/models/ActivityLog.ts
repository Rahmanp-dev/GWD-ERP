import mongoose, { Schema, model, models } from 'mongoose';

/**
 * Activity Log Schema
 * 
 * CRM-specific activity tracking for deals, contacts, and sales activities.
 * This is different from the system-wide AuditLog - this is for business activities
 * that users should see (calls, emails, meetings, notes, status changes).
 */

const ActivityLogSchema = new Schema({
    // Related entity
    entityType: {
        type: String,
        enum: ['Lead', 'Contact', 'Project'],
        required: true
    },
    entityId: { type: Schema.Types.ObjectId, required: true },

    // Activity type
    activityType: {
        type: String,
        enum: [
            'NOTE', 'CALL', 'EMAIL', 'MEETING',
            'STATUS_CHANGE', 'ASSIGNMENT',
            'CREATED', 'UPDATED', 'CONVERTED'
        ],
        required: true
    },

    // Activity details
    title: { type: String },
    description: { type: String },

    // For status changes
    oldValue: { type: String },
    newValue: { type: String },

    // For calls/meetings
    duration: { type: Number }, // minutes
    outcome: { type: String, enum: ['Completed', 'No Answer', 'Left Voicemail', 'Rescheduled', 'Cancelled'] },
    scheduledAt: { type: Date },

    // Who performed the activity
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Visibility
    isPrivate: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient querying
ActivityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
ActivityLogSchema.index({ performedBy: 1, createdAt: -1 });

const ActivityLog = models.ActivityLog || model('ActivityLog', ActivityLogSchema);

export default ActivityLog;
