import mongoose, { Schema, model, models } from 'mongoose';

const AttendanceSchema = new Schema({
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true }, // Normalized to midnight
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ['Present', 'Absent', 'Half Day', 'Late'], default: 'Absent' },
    createdAt: { type: Date, default: Date.now },
});

const Attendance = models.Attendance || model('Attendance', AttendanceSchema);

export default Attendance;
