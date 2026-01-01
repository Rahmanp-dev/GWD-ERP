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
