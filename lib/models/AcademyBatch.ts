import mongoose, { Schema, model, models } from 'mongoose';

const AcademyBatchSchema = new Schema({
    name: { type: String, required: true }, // e.g. "React Batch 1 - Jan 2026"
    course: { type: Schema.Types.ObjectId, ref: 'AcademyCourse', required: true },

    // Who is teaching
    instructor: { type: Schema.Types.ObjectId, ref: 'AcademyInstructor' },

    // Schedule
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    schedule: {
        days: [{ type: String }], // ["Mon", "Wed", "Fri"]
        time: { type: String }, // "10:00 AM - 12:00 PM"
        timezone: { type: String, default: 'UTC' }
    },

    // Operations
    status: {
        type: String,
        enum: ['Scheduled', 'Open for Enrollment', 'Active', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },

    // Zoom/Meet Integration (Placeholder)
    meetingLink: { type: String },

    // Capacity
    maxStudents: { type: Number, default: 30 },
    enrolledStudentCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AcademyBatch = models.AcademyBatch || model('AcademyBatch', AcademyBatchSchema);

export default AcademyBatch;
