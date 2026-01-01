import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveRequest extends Document {
    employee: mongoose.Types.ObjectId;
    leaveType: 'Casual' | 'Sick' | 'Annual' | 'Unpaid' | 'Maternity' | 'Paternity' | 'Other';
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: {
        type: String,
        enum: ['Casual', 'Sick', 'Annual', 'Unpaid', 'Maternity', 'Paternity', 'Other'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String }
}, { timestamps: true });

// Calculate days between start and end date
LeaveRequestSchema.pre('save', function () {
    if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        this.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
});

const LeaveRequest: Model<ILeaveRequest> = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;
