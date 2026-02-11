import mongoose, { Schema, model, models } from 'mongoose';

const LeadSchema = new Schema({
    title: { type: String, required: true }, // Deal Name
    accountName: { type: String }, // Company
    contactPerson: { type: String }, // Lead Contact Name
    contact: { type: Schema.Types.ObjectId, ref: 'Contact' }, // Link to Contact ID

    status: {
        type: String,
        enum: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
        default: 'Lead'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    value: { type: Number, default: 0 },

    // Dates
    expectedCloseDate: { type: Date },
    lastContactDate: { type: Date },
    closedDate: { type: Date },

    source: {
        type: String,
        enum: ['Referral', 'Event', 'Cold Outreach', 'Partner', 'Website', 'Other'],
        default: 'Other'
    },

    // Sales Intelligence
    probability: { type: Number, min: 0, max: 100, default: 0 }, // Win probability %
    riskScore: { type: Number, default: 0 }, // Calculated risk 0-100
    riskFactors: [{ type: String }], // Reasons for risk ('Stalled', 'No Decision Maker', 'Discount High')

    // Governance & Control
    stageLocked: { type: Boolean, default: false }, // Prevent movement without override
    validationErrors: [{ type: String }], // Why it's stuck or marked invalid for stage move

    // Automation & Focus
    nextFollowUp: { type: Date }, // For "Today's Queue"
    lossReason: { type: String }, // Required if Closed Lost
    automationFlags: {
        manualOverride: { type: Boolean, default: false }, // If true, skip auto-probability updates
        autoTaskCreated: { type: Boolean, default: false }
    },

    // Operations Handover
    handoverStatus: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Not Applicable'],
        default: 'Not Applicable'
    },
    handoverChecklist: [{
        item: String,
        completed: { type: Boolean, default: false },
        completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        completedAt: Date
    }],

    // Activity Summary (Auto-aggregated)
    activityStats: {
        calls: { type: Number, default: 0 },
        emails: { type: Number, default: 0 },
        meetings: { type: Number, default: 0 },
        lastActivityDays: { type: Number, default: 0 }, // Days since last touch
    },

    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },

    // Embedded Data
    notes: [{
        content: String,
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    logs: [{
        field: String,
        oldValue: String,
        newValue: String,
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now }
    }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    order: { type: Number, default: 0 }
});

const Lead = models.Lead || model('Lead', LeadSchema);

export default Lead;
