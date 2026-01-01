import mongoose, { Schema, model, models } from 'mongoose';

/**
 * Commission Schema
 * 
 * Tracks sales commissions for closed deals.
 */

const CommissionSchema = new Schema({
    // The user receiving the commission
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // The deal that generated the commission
    dealId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    dealTitle: { type: String },

    // Commission calculation
    dealValue: { type: Number, required: true },
    commissionRate: { type: Number, required: true }, // e.g., 0.05 for 5%
    commissionAmount: { type: Number, required: true },

    // Status
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Paid', 'Rejected'],
        default: 'Pending'
    },

    // Payment info
    paymentDate: { type: Date },
    paymentReference: { type: String },

    // Approval workflow
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },

    notes: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Commission = models.Commission || model('Commission', CommissionSchema);

export default Commission;
