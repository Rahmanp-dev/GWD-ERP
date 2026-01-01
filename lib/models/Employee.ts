import mongoose, { Schema, model, models } from 'mongoose';

const EmployeeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // Link to auth user
    name: { type: String, required: true },
    email: { type: String },
    department: { type: String },
    position: { type: String },
    salary: { type: Number },
    joiningDate: { type: Date },
    status: { type: String, enum: ['Active', 'Terminated', 'On Leave'], default: 'Active' },
    createdAt: { type: Date, default: Date.now },
});

const Employee = models.Employee || model('Employee', EmployeeSchema);

export default Employee;
