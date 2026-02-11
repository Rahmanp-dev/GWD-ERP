import mongoose, { Schema, model, models } from 'mongoose';

const EmployeeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    position: { type: String, required: true },

    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Terminated'],
        default: 'Active'
    },

    dateJoined: { type: Date, default: Date.now },

    // Contact & Personal (Could be in User, but often separate for HR privacy)
    phone: { type: String },
    address: { type: String },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },

    // Candidate Reference (if hired from pipeline)
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate' }

}, { timestamps: true });

const Employee = models.Employee || model('Employee', EmployeeSchema);

export default Employee;
