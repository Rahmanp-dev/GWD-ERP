import mongoose, { Schema, Document } from 'mongoose';

export interface IContentModule extends Document {
    name: string;
    category: 'Event' | 'Academy' | 'Branding' | 'Sales' | 'Other';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    startDate?: Date;
    endDate?: Date;
    goal?: string;
    audience?: string;
    associatedHeadId?: mongoose.Types.ObjectId;
    status: 'Planning' | 'Active' | 'Completed' | 'Archived';
    createdAt: Date;
    updatedAt: Date;
}

const ContentModuleSchema = new Schema<IContentModule>({
    name: { type: String, required: true },
    category: { type: String, enum: ['Event', 'Academy', 'Branding', 'Sales', 'Other'], default: 'Other' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    startDate: { type: Date },
    endDate: { type: Date },
    goal: { type: String },
    audience: { type: String },
    associatedHeadId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Planning', 'Active', 'Completed', 'Archived'], default: 'Planning' },
}, { timestamps: true });

const ContentModule = mongoose.models.ContentModule || mongoose.model<IContentModule>('ContentModule', ContentModuleSchema);

export default ContentModule;
