import mongoose, { Schema, model, models } from 'mongoose';

/**
 * Automation Schema
 * 
 * Defines trigger-action rules for sales process automation.
 * Example: When deal moves to "Closed Won" -> Notify CEO, Set Closed Date
 */

const AutomationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },

    // Trigger Configuration
    trigger: {
        type: {
            type: String,
            enum: ['STAGE_CHANGE', 'DEAL_IDLE', 'VALUE_THRESHOLD', 'DATE_TRIGGER'],
            required: true
        },
        // For STAGE_CHANGE
        fromStage: { type: String },
        toStage: { type: String },
        // For DEAL_IDLE
        idleDays: { type: Number },
        // For VALUE_THRESHOLD
        valueThreshold: { type: Number },
        operator: { type: String, enum: ['>', '<', '>=', '<=', '='] }
    },

    // Actions to Execute
    actions: [{
        type: {
            type: String,
            enum: ['NOTIFY_USER', 'NOTIFY_ROLE', 'SET_FIELD', 'CREATE_TASK', 'SEND_EMAIL'],
            required: true
        },
        // Target for notification
        targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        targetRole: { type: String },
        // For SET_FIELD
        fieldName: { type: String },
        fieldValue: { type: Schema.Types.Mixed },
        // Notification content
        notificationTitle: { type: String },
        notificationMessage: { type: String }
    }],

    // Metadata
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Automation = models.Automation || model('Automation', AutomationSchema);

export default Automation;
