import mongoose, { Schema, model, models } from 'mongoose';

const TransactionSchema = new Schema({
    type: { type: String, enum: ['Revenue', 'Expense'], required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., Sales, Salary, Rent
    description: { type: String },
    date: { type: Date, default: Date.now },
    relatedProject: { type: Schema.Types.ObjectId, ref: 'Project' },
    createdAt: { type: Date, default: Date.now },
});

const Transaction = models.Transaction || model('Transaction', TransactionSchema);

export default Transaction;
