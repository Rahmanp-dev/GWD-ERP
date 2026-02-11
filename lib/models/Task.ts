import mongoose, { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    project: { type: Schema.Types.ObjectId, ref: 'Project' }, // Optional for ad-hoc/general tasks
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },

    // KPI / Executive Checklist Fields
    requester: { type: Schema.Types.ObjectId, ref: 'User' }, // For "Request Task" flow
    approver: { type: Schema.Types.ObjectId, ref: 'User' }, // Executive who approved
    linkedKPI: { type: Schema.Types.ObjectId, ref: 'KPI' }, // Contribution to a specific KPI

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

    // Quality & Control
    acceptanceCriteria: [{
        criteria: String,
        met: { type: Boolean, default: false }
    }],
    reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    isProvisional: { type: Boolean, default: false }, // If true, requires review before 'Done'

    // Subtasks / Breakdown
    subtasks: [{
        title: String,
        completed: { type: Boolean, default: false },
        assignee: { type: Schema.Types.ObjectId, ref: 'User' }
    }],

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

    // Operational Tracking
    timeInCurrentStatus: { type: Number, default: 0 }, // Hours in current status
    reassignCount: { type: Number, default: 0 },
    lastStatusChange: { type: Date, default: Date.now },

    statusHistory: [{
        status: { type: String },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        durationHours: { type: Number } // Duration in previous status
    }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamps and history middleware
TaskSchema.pre('save', function () {
    this.updatedAt = new Date();

    if (this.isModified('status')) {
        // Calculate duration since last status change
        const now = new Date();
        const lastChange = this.lastStatusChange || this.createdAt;
        const durationHours = (now.getTime() - new Date(lastChange).getTime()) / (1000 * 60 * 60);

        // Add to history
        this.statusHistory.push({
            status: this.status, // previous status is actually tricky to capture here without 'init' hook, simplified for now
            changedAt: now,
            durationHours: durationHours
        });

        this.lastStatusChange = now;
        this.timeInCurrentStatus = 0;
    }

    if (this.isModified('assignee')) {
        this.reassignCount = (this.reassignCount || 0) + 1;
    }
});

const Task = models.Task || model('Task', TaskSchema);

export default Task;
