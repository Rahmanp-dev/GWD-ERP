import mongoose, { Schema, model, models } from 'mongoose';

const CandidateSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },

    // Role Info
    roleApplied: { type: String, required: true },
    department: { type: String },

    // Kanban Status
    status: {
        type: String,
        enum: ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'],
        default: 'New'
    },

    // Application Data
    resumeUrl: { type: String },
    coverLetter: { type: String },
    portfolioUrl: { type: String },

    // Interview Process
    interviewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, min: 0, max: 5 }, // Average rating
    notes: [{
        content: String,
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],

    order: { type: Number, default: 0 }, // For DnD

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Candidate = models.Candidate || model('Candidate', CandidateSchema);

export default Candidate;
