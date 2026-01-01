import mongoose, { Schema, model, models } from 'mongoose';

/**
 * Notification Schema
 * 
 * Stores in-app notifications for users.
 */

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['INFO', 'SUCCESS', 'WARNING', 'ALERT'],
        default: 'INFO'
    },
    isRead: { type: Boolean, default: false },

    // Link to related entity
    relatedEntity: {
        type: { type: String, enum: ['DEAL', 'PROJECT', 'TASK', 'USER'] },
        id: { type: Schema.Types.ObjectId }
    },

    // Source automation (if triggered by automation)
    automationId: { type: Schema.Types.ObjectId, ref: 'Automation' },

    createdAt: { type: Date, default: Date.now }
});

const Notification = models.Notification || model('Notification', NotificationSchema);

export default Notification;
