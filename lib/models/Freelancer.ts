import mongoose, { Schema, model, models } from 'mongoose';

const FreelancerSchema = new Schema({
    // Personal Details (Confidential)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    linkedinUrl: { type: String },
    portfolioUrl: { type: String },

    // System Access (Optional)
    // If they are given login access, link to User model
    user: { type: Schema.Types.ObjectId, ref: 'User' },

    // Classification
    domain: {
        type: String,
        required: true,
        enum: ['Frontend', 'Backend', 'Fullstack', 'Mobile', 'Design', '3D', 'Video', 'Marketing', 'Copywriting', 'Other']
    },
    skills: [{ type: String }], // e.g. "React", "Blender"
    experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior', 'Expert'], default: 'Mid' },

    // Status & Vetting
    status: {
        type: String,
        enum: ['Applied', 'Vetted', 'Approved', 'Rejected', 'Blacklisted'],
        default: 'Applied'
    },
    vettingNotes: [{
        content: String,
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],

    // Rates (For Internal Reference Only)
    rates: {
        hourly: { type: Number },
        monthly: { type: Number },
        currency: { type: String, default: 'USD' }
    },

    // Compliance
    ndaSigned: { type: Boolean, default: false },
    resumeUrl: { type: String },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        swiftCode: String
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Freelancer = models.Freelancer || model('Freelancer', FreelancerSchema);

export default Freelancer;
