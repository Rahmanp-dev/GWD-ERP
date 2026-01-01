import mongoose, { Schema, model, models } from 'mongoose';

const ProjectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },

    // Team
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Client / Account Info
    client: { type: String },
    clientContact: { type: String },

    // Status & Health
    status: {
        type: String,
        enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Planning'
    },
    health: {
        type: String,
        enum: ['Green', 'Yellow', 'Red'],
        default: 'Green'
    },

    // Budget
    budget: {
        estimated: { type: Number, default: 0 },
        actual: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' }
    },

    // Timeline
    startDate: { type: Date },
    endDate: { type: Date },

    // Operational Metrics
    healthScore: { type: Number, default: 100 }, // 0-100 score auto-calculated
    riskStatus: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },

    // Client & Stakeholder Management
    clientSentiment: { type: String, enum: ['Delighted', 'Satisfied', 'Neutral', 'Concerned', 'Angry'], default: 'Neutral' },
    deliveryConfidence: { type: Number, min: 0, max: 100, default: 80 }, // PM's confidence index

    changeRequests: [{
        title: String,
        description: String,
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        impact: { type: String, enum: ['None', 'Low', 'High', 'Critical'] }, // Impact on scope/budget
        requestedBy: String,
        requestedAt: { type: Date, default: Date.now },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }],

    pmPerformanceMetrics: {
        onTimeDeliveryScore: { type: Number, default: 100 },
        budgetVariance: { type: Number, default: 0 },
        stakeholderSatisfaction: { type: Number, default: 5 } // 1-5 scale
    },

    // Risk Tracking
    risks: [{
        description: { type: String },
        severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
        mitigationPlan: { type: String },
        status: { type: String, enum: ['Open', 'Mitigated', 'Closed'], default: 'Open' },
        createdAt: { type: Date, default: Date.now }
    }],

    // Link to Sales Deal (for conversion)
    linkedDealId: { type: Schema.Types.ObjectId, ref: 'Lead' },

    // Activity/Notes
    notes: [{
        content: { type: String },
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],

    // URL Friendly ID
    slug: { type: String, unique: true, sparse: true },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt and generate slug on save
ProjectSchema.pre('save', async function () {
    this.updatedAt = new Date();

    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        // Append random string to ensure uniqueness if needed, but for now simple slug
        this.slug = `${this.slug}-${Math.floor(Math.random() * 10000)}`;
    }
    // next() removed for async
});

const Project = models.Project || model('Project', ProjectSchema);

export default Project;
