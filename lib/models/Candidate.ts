import mongoose, { Schema, model, models } from 'mongoose';

const CandidateSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String },
    position: { type: String, required: true },
    resumeLink: { type: String },
    status: {
        type: String,
        enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'],
        default: 'Applied'
    },
    order: { type: Number, default: 0 }, // For DnD pipeline
    createdAt: { type: Date, default: Date.now },
});

const Candidate = models.Candidate || model('Candidate', CandidateSchema);

export default Candidate;
