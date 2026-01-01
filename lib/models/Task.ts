import mongoose, { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },

    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'In Review', 'Blocked', 'Done'],
        default: 'To Do'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },

    // Timeline
    dueDate: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },

    // Time Tracking
    estimatedHours: { type: Number, default: 0 },
    timeLogs: [{
        hours: { type: Number },
        description: { type: String },
        loggedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        loggedAt: { type: Date, default: Date.now }
    }],

    // Blockers
    blockers: [{
        description: { type: String },
        isResolved: { type: Boolean, default: false },
        reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reportedAt: { type: Date, default: Date.now },
        resolvedAt: { type: Date }
    }],

    // Dependencies
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],

    // Comments
    comments: [{
        content: { type: String },
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],

    // Ordering (for Kanban)
    order: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Task = models.Task || model('Task', TaskSchema);

export default Task;
