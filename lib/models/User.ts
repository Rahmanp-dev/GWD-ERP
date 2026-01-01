import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth
    image: { type: String },
    role: {
        type: String,
        enum: ['CEO', 'CMO', 'CFO', 'Ops', 'HR Manager', 'Sales Manager', 'Salesperson', 'Project Manager', 'User'],
        default: 'User'
    },
    createdAt: { type: Date, default: Date.now },

    // HR & Talent Management
    jobTitle: { type: String },
    department: { type: String },
    employeeStatus: {
        type: String,
        enum: ['Onboarding', 'Active', 'Probation', 'Notice Period', 'Exited', 'Terminated'],
        default: 'Active'
    },
    joinDate: { type: Date },

    // Performance & Skills
    performanceRating: { type: Number, min: 1, max: 5, default: 3 }, // 1-5 scale
    skills: [{ type: String }],

    // Risk & Retention
    attritionRisk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    riskFactors: [{ type: String }], // e.g. "Below market salary", "No promotion in 2 years"

    // Compensation (Access restricted to Admin/HR/CFO)
    salary: { type: Number }, // Base Annual
    currency: { type: String, default: 'USD' }
});

const User = models.User || model('User', UserSchema);

export default User;
