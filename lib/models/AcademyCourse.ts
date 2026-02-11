import mongoose, { Schema, model, models } from 'mongoose';

const AcademyCourseSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },

    // Lifecycle
    status: {
        type: String,
        enum: ['Draft', 'Proposal', 'Under Review', 'Approved', 'Building', 'Live', 'Retired'],
        default: 'Draft'
    },

    // Meta & SEO
    description: { type: String },
    shortDescription: { type: String }, // For cards
    thumbnail: { type: String },
    targetAudience: [{ type: String }],
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    seoKeywords: [{ type: String }],

    // CMS Content
    markdownContent: { type: String }, // Detail page content

    // Financial Intelligence (Strategic)
    financials: {
        projectedRevenue: { type: Number },
        breakEvenPoint: { type: Number }, // Number of students
        seatCapacity: { type: Number, default: 30 },
        instructorCost: { type: Number }, // Estimated
        clientPrice: { type: Number }, // Price per student
        currency: { type: String, default: 'USD' }
    },

    // Relations
    programDirector: { type: Schema.Types.ObjectId, ref: 'User' }, // Who owns this
    instructors: [{ type: Schema.Types.ObjectId, ref: 'AcademyInstructor' }],

    // Syllabus Reference (Latest)
    activeSyllabus: { type: Schema.Types.ObjectId, ref: 'AcademySyllabus' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AcademyCourse = models.AcademyCourse || model('AcademyCourse', AcademyCourseSchema);

export default AcademyCourse;
