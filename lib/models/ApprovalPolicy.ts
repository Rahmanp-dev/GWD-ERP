import mongoose, { Schema, model, models } from 'mongoose';

const ApprovalPolicySchema = new Schema({
    vertical: { type: String, required: true, unique: true }, // e.g., 'Founder', 'Social', 'Sponsor_Assets'
    require_ceo_signoff: { type: Boolean, default: true },
    allow_strategist_publish: { type: Boolean, default: false },
    auto_escalate: { type: Boolean, default: false },
    delegated_userId: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // Optional CEO delegation default

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ApprovalPolicy = models.ApprovalPolicy || model('ApprovalPolicy', ApprovalPolicySchema);

export default ApprovalPolicy;
