import mongoose, { Schema, model, models } from 'mongoose';

const FinanceLedgerSchema = new Schema({
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    type: {
        type: String,
        enum: ['Inflow', 'Outflow', 'Adjustment', 'Liability'],
        required: true
    },
    category: {
        type: String,
        enum: [
            'Client Payment',       // Inflow
            'Ops Cost',            // Outflow
            'Project Cost',        // Outflow
            'Developer Advance',   // Outflow (Recoverable)
            'Internal Investment', // Outflow (Recoverable)
            'Liability',           // Liability (Future Outflow)
            'Refund',              // Adjustment
            'Correction'           // Adjustment
        ],
        required: true
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },

    // Metadata links
    metadata: {
        invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
        paymentId: { type: String }, // External Trans ID
        userId: { type: Schema.Types.ObjectId, ref: 'User' }, // Who created it
        notes: { type: String }
    },

    // Status & Audit
    status: {
        type: String,
        enum: ['Pending', 'Cleared', 'Reversed'],
        default: 'Pending'
    },
    reversible: { type: Boolean, default: true },
    isReversal: { type: Boolean, default: false }, // If true, this is a contra-entry
    originalTransactionId: { type: Schema.Types.ObjectId, ref: 'FinanceLedger' }, // If reversed, link to original

    // Snapshot
    balanceAfter: { type: Number } // Running balance at time of insertion
}, { timestamps: true });

// Index for quick project ledger retrieval
FinanceLedgerSchema.index({ project: 1, date: -1 });

const FinanceLedger = models.FinanceLedger || model('FinanceLedger', FinanceLedgerSchema);

export default FinanceLedger;
