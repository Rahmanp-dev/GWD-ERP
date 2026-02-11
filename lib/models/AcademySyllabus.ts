import mongoose, { Schema, model, models } from 'mongoose';

// Recursive structure for deep curriculum
const LessonSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['Video', 'Article', 'Quiz', 'Project', 'Live Session'], default: 'Live Session' },
    durationHighLevel: { type: String }, // e.g. "2 hours"
    learningOutcomes: [{ type: String }],
    isFreePreview: { type: Boolean, default: false }
});

const ModuleSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    lessons: [LessonSchema]
});

const AcademySyllabusSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'AcademyCourse', required: true },
    version: { type: Number, required: true, default: 1 },

    // Who edited this version
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    modules: [ModuleSchema],

    // Simple rollback tracking
    changeLog: { type: String }, // e.g. "Added Module 5"

    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure version uniqueness per course
AcademySyllabusSchema.index({ course: 1, version: 1 }, { unique: true });

const AcademySyllabus = models.AcademySyllabus || model('AcademySyllabus', AcademySyllabusSchema);

export default AcademySyllabus;
