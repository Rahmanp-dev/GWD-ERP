import mongoose, { Schema, model, models } from 'mongoose';

const DailyReportSchema = new Schema({
    date: { type: Date, required: true }, // Midnight timestamp
    summary: { type: String, required: false }, // Text summary

    // Key Metrics Snapshot
    metrics: {
        tasks: {
            completed: { type: Number, default: 0 },
            created: { type: Number, default: 0 },
            pending: { type: Number, default: 0 }
        },
        sales: {
            leadsCreated: { type: Number, default: 0 },
            dealsClosed: { type: Number, default: 0 },
            revenue: { type: Number, default: 0 }
        },
        finance: {
            invoicesSent: { type: Number, default: 0 },
            paymentsReceived: { type: Number, default: 0 },
            cashflow: { type: Number, default: 0 }
        },
        hr: {
            presentCount: { type: Number, default: 0 },
            leaveCount: { type: Number, default: 0 }
        },
        projects: {
            activeCount: { type: Number, default: 0 },
            completedCount: { type: Number, default: 0 }
        },
        // KPI Snapshot
        kpis: [{
            title: String,
            department: String,
            target: Number,
            value: Number,
            unit: String
        }]
    },

    generatedBy: { type: String, default: 'System' },
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

// Index for faster queries
DailyReportSchema.index({ date: -1 });

const DailyReport = models.DailyReport || model('DailyReport', DailyReportSchema);

export default DailyReport;
