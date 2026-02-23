import mongoose, { Schema, model, models } from 'mongoose';

const ApprovalLogSchema = new Schema({
    level: { type: String, enum: ['level_1', 'level_2'], required: true },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    decision: { type: String, enum: ['approved', 'changes'], required: true },
    note: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const CommentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['general', 'feedback', 'clarification', 'note', 'revision'], default: 'general' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const VersionSchema = new Schema({
    versionNumber: { type: Number, required: true },
    assetUrl: { type: String, required: true },
    submittedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedback: { type: String }, // Strategist feedback on this specific version
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const ProductionApprovalSchema = new Schema({
    assetId: { type: String, required: true },
    approverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    decision: { type: String, enum: ['approved', 'changes'], required: true },
    note: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ContentItemSchema = new Schema({
    title: { type: String, required: true },
    vertical: { type: String, required: true },
    status: {
        type: String,
        enum: ['draft', 'editing', 'review', 'revision', 'in_review_l1', 'approved_l1', 'in_review_l2', 'approved_l2', 'scheduled', 'published'],
        default: 'draft'
    },

    // Command Center / Idea Stack fields
    moduleId: { type: Schema.Types.ObjectId, ref: 'ContentModule' },
    contentType: { type: String }, // e.g., Reel, YouTube, Poster, Story, Blog
    platform: { type: [String] }, // e.g., Instagram, LinkedIn, YouTube, Website
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },

    // Structured Brief
    brief: {
        objective: { type: String },
        duration: { type: String },
        tone: { type: String },
        mustHaves: { type: String },
        cta: { type: String }
    },

    // Legacy simple fields (migrating towards brief)
    purpose: { type: String },
    script: { type: String },
    referenceLinks: { type: [String], default: [] },

    // Production Task Routing
    assignedEditorId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedStrategistId: { type: Schema.Types.ObjectId, ref: 'User' },
    assets: [{
        url: { type: String, required: true },
        version: { type: Number, default: 1 },
        notes: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Configuration for the specific item (inherited from ApprovalPolicy but overridable)
    approval_flow: { type: [String], default: ['level_1', 'level_2'] },
    allowed_level_1_roles: { type: [String], default: ['Content Strategist', 'Production Lead'] },
    publish_permission_roles: { type: [String], default: ['Content Strategist', 'CEO', 'Admin'] },

    // Delegation and Routing logic
    delegated_to_userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    auto_escalate: { type: Boolean, default: false },

    // Audit Trails
    approvals: [ApprovalLogSchema],
    production_approvals: [ProductionApprovalSchema],
    comments: [CommentSchema],
    versions: [VersionSchema],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ContentItem = models.ContentItem || model('ContentItem', ContentItemSchema);

export default ContentItem;
