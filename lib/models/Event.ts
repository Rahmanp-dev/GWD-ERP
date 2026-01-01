import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    description?: string;
    type: 'meeting' | 'deadline' | 'reminder' | 'task' | 'holiday' | 'other';
    startDate: Date;
    endDate?: Date;
    allDay: boolean;
    location?: string;
    color?: string;
    participants?: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    relatedTo?: {
        model: 'Task' | 'Project' | 'Lead' | 'Invoice';
        id: mongoose.Types.ObjectId;
    };
    reminders?: {
        type: 'email' | 'notification';
        before: number; // minutes before event
    }[];
    status: 'scheduled' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['meeting', 'deadline', 'reminder', 'task', 'holiday', 'other'],
        default: 'other'
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    allDay: { type: Boolean, default: false },
    location: { type: String },
    color: { type: String, default: '#3b82f6' }, // Default blue
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relatedTo: {
        model: { type: String, enum: ['Task', 'Project', 'Lead', 'Invoice'] },
        id: { type: Schema.Types.ObjectId }
    },
    reminders: [{
        type: { type: String, enum: ['email', 'notification'] },
        before: { type: Number } // minutes
    }],
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, { timestamps: true });

// Index for date range queries
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ participants: 1 });

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
