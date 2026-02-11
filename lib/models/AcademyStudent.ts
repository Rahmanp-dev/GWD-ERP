import mongoose, { Schema, model, models } from 'mongoose';

const AcademyStudentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Enrollments
    enrollments: [{
        course: { type: Schema.Types.ObjectId, ref: 'AcademyCourse' },
        batch: { type: Schema.Types.ObjectId, ref: 'AcademyBatch' },
        enrollmentDate: { type: Date, default: Date.now },
        status: { type: String, enum: ['Active', 'Completed', 'Dropped', 'Failed'], default: 'Active' },

        // Progress
        completedLessons: [{ type: String }], // Lesson IDs or Titles
        progressPercent: { type: Number, default: 0 },
        finalGrade: { type: String }, // A, B, C...
        certificateId: { type: String }
    }],

    // Talent Graph Data
    skills: [{
        name: { type: String },
        proficiency: { type: Number, min: 1, max: 10 } // Assessed via projects
    }],

    // Engagement
    totalLearningHours: { type: Number, default: 0 },
    lastActive: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AcademyStudent = models.AcademyStudent || model('AcademyStudent', AcademyStudentSchema);

export default AcademyStudent;
