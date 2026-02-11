import mongoose from "mongoose";

const KpiSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The executive/head responsible
    metricType: {
        type: String,
        enum: ['Count', 'Revenue', 'Boolean', 'Percentage'],
        default: 'Count'
    },
    target: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, default: '' }, // e.g., "$", "%", "calls"
    period: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
        default: 'Daily'
    },
    visibility: {
        type: String,
        enum: ['Public', 'Private', 'Restricted'],
        default: 'Public'
    },
    department: { type: String }, // e.g., "Sales", "Academy"
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.KPI || mongoose.model("KPI", KpiSchema);
