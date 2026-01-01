import mongoose, { Schema, model, models } from 'mongoose';

/**
 * Commission Rate Configuration Schema
 * 
 * Defines commission rate rules for different scenarios.
 */

const CommissionRateSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },

    // Rate
    rate: { type: Number, required: true }, // e.g., 0.05 for 5%

    // Conditions for applying this rate
    conditions: {
        // Deal size ranges
        minDealValue: { type: Number },
        maxDealValue: { type: Number },

        // Specific user or role
        forUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        forRole: { type: String },

        // Deal source
        dealSource: { type: String },

        // Deal stage
        dealStage: { type: String }
    },

    // Priority (higher = evaluated first)
    priority: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const CommissionRate = models.CommissionRate || model('CommissionRate', CommissionRateSchema);

export default CommissionRate;
