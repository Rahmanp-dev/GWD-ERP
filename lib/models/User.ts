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
});

const User = models.User || model('User', UserSchema);

export default User;
