import mongoose, { Schema, Document } from 'mongoose';

export interface IContentRequest extends Document {
    title: string;
    moduleCategory: string;
    urgency: 'Standard' | 'High' | 'ASAP';
    deadline?: Date;
    platform?: string;
    objective?: string;
    referenceUrl?: string;
    requestedById: mongoose.Types.ObjectId;
    status: 'Pending' | 'Accepted' | 'Rejected';
    convertedToIdeaId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ContentRequestSchema = new Schema<IContentRequest>({
    title: { type: String, required: true },
    moduleCategory: { type: String, required: true },
    urgency: { type: String, enum: ['Standard', 'High', 'ASAP'], default: 'Standard' },
    deadline: { type: Date },
    platform: { type: String },
    objective: { type: String },
    referenceUrl: { type: String },
    requestedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    convertedToIdeaId: { type: Schema.Types.ObjectId, ref: 'ContentItem' },
}, { timestamps: true });

const ContentRequest = mongoose.models.ContentRequest || mongoose.model<IContentRequest>('ContentRequest', ContentRequestSchema);

export default ContentRequest;
