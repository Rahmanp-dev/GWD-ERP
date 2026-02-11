import mongoose, { Schema, model, models } from 'mongoose';

const AcademyInstructorSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Status Pipeline
    status: {
        type: String,
        enum: ['Applied', 'Vetting', 'Interview', 'Approved', 'Contracted', 'Active', 'Inactive', 'Rejected'],
        default: 'Applied'
    },

    // Professional Profile (Public facing on Course Page)
    headline: { type: String },
    bio: { type: String },
    linkedinUrl: { type: String },
    portfolioUrl: { type: String },
    expertise: [{ type: String }],
    yearsExperience: { type: Number },

    // Metrics (Talent Engine)
    rating: { type: Number, default: 0 },
    studentsTaught: { type: Number, default: 0 },
    batchesCompleted: { type: Number, default: 0 },

    // Agreement / Financials (Private)
    agreement: {
        type: { type: String, enum: ['Revenue Share', 'Fixed', 'Hybrid'], default: 'Revenue Share' },
        sharePercentage: { type: Number }, // e.g. 30%
        fixedRate: { type: Number },
        currency: { type: String, default: 'USD' },
        contractUrl: { type: String } // Ops/Contract PDF link
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AcademyInstructor = models.AcademyInstructor || model('AcademyInstructor', AcademyInstructorSchema);

export default AcademyInstructor;
