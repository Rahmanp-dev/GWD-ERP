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

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Project = models.Project || model('Project', ProjectSchema);

export default Project;
