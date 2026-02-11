import mongoose, { Schema, model, models } from 'mongoose';

const ContractSchema = new Schema({
    // Key Relationships
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    freelancer: { type: Schema.Types.ObjectId, ref: 'Freelancer', required: true },

    // Contract Metadata
    contractNumber: { type: String, unique: true }, // Auto-generated
    title: { type: String, required: true }, // e.g., "Frontend Development - Phase 1"

    // Status
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Signed', 'Active', 'Completed', 'Terminated'],
        default: 'Draft'
    },

    // Timeline
    startDate: { type: Date, required: true },
    endDate: { type: Date },

    // Financial Terms (Level 3 - Payout Layer)
    paymentType: { type: String, enum: ['Fixed', 'Milestone', 'Hourly', 'Monthly'], required: true },
    amount: { type: Number, required: true }, // Total value or rate
    currency: { type: String, default: 'USD' },
    paymentSchedule: { type: String }, // Usage description e.g., "50% upfront, 50% completion"

    // Scope & Legal
    scopeOfWork: { type: String, required: true },
    deliverables: [{ type: String }],

    // Clauses (Booleans to confirm inclusion)
    clauses: {
        confidentiality: { type: Boolean, default: true }, // White-label enforcement
        ipOwnership: { type: Boolean, default: true }, // "Work for Hire"
        termination: { type: Boolean, default: true },
        nonCompete: { type: Boolean, default: true }
    },

    // Signatures
    signedByFreelancerAt: { type: Date },
    signedByCompanyAt: { type: Date },
    documentUrl: { type: String }, // PDF Path

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to generate contract number
ContractSchema.pre('save', async function (next) {
    if (!this.contractNumber) {
        // Format: CTR-YYYY-RANDOM
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        this.contractNumber = `CTR-${year}-${random}`;
    }
    // next() handled by async
});

const Contract = models.Contract || model('Contract', ContractSchema);

export default Contract;
