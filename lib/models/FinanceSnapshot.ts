import mongoose, { Schema, model, models } from 'mongoose';

// A snapshot of financial health at a point in time (Monthly/Weekly)
// Used for fast dashboard rendering (avoiding recalculating from raw transactions every time)
const FinanceSnapshotSchema = new Schema({
    date: { type: Date, required: true }, // e.g. 2024-01-31
    period: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'], default: 'Monthly' },

    // Aggregated Metrics
    revenue: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    netIncome: { type: Number, default: 0 },

    // Breakdown
    operationalCosts: { type: Number, default: 0 }, // Fixed overheads
    projectCosts: { type: Number, default: 0 }, // COGS / execution

    // Cashflow Specifics
    cashInflow: { type: Number, default: 0 }, // Liquid cash received
    cashOutflow: { type: Number, default: 0 }, // Liquid cash spent
    accountsReceivable: { type: Number, default: 0 }, // Invoices sent but not paid
    accountsPayable: { type: Number, default: 0 }, // Bills received but not paid

    // Metadata
    metadata: {
        totalInvoices: Number,
        totalTransactions: Number
    },

    // Optional: Link to a specific project for granular snapshots
    // If null, it represents the Global Company Snapshot
    project: { type: Schema.Types.ObjectId, ref: 'Project' },

    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index for fast lookup by date/period and project scope
// We want unique snapshots for a (date, period, project) tuple.
// Note: In Mongo, unique index with null 'project' allows only ONE global snapshot per date/period, which is correct.
FinanceSnapshotSchema.index({ date: -1, period: 1, project: 1 }, { unique: true });

const FinanceSnapshot = models.FinanceSnapshot || model('FinanceSnapshot', FinanceSnapshotSchema);

export default FinanceSnapshot;
