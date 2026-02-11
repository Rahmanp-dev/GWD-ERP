import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Task from "@/lib/models/Task";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await dbConnect();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Exclude executives — show only team members who RECEIVE tasks
        const excludeRoles = ['CEO', 'CFO', 'CMO', 'Admin'];

        const teamStats = await User.aggregate([
            { $match: { role: { $nin: excludeRoles } } },
            {
                $lookup: {
                    from: "tasks",
                    localField: "_id",
                    foreignField: "assignee",
                    as: "allTasks"
                }
            },
            {
                // Only keep users who have at least one task
                $match: { "allTasks.0": { $exists: true } }
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    role: 1,
                    pendingTasksList: {
                        $map: {
                            input: {
                                $slice: [
                                    {
                                        $filter: {
                                            input: "$allTasks",
                                            as: "task",
                                            cond: { $ne: ["$$task.status", "Done"] }
                                        }
                                    },
                                    6
                                ]
                            },
                            as: "t",
                            in: { _id: "$$t._id", title: "$$t.title", status: "$$t.status", priority: "$$t.priority", dueDate: "$$t.dueDate" }
                        }
                    },
                    completedTasksList: {
                        $map: {
                            input: {
                                $slice: [
                                    {
                                        $filter: {
                                            input: "$allTasks",
                                            as: "task",
                                            cond: {
                                                $and: [
                                                    { $eq: ["$$task.status", "Done"] },
                                                    { $gte: ["$$task.completedAt", today] }
                                                ]
                                            }
                                        }
                                    },
                                    5
                                ]
                            },
                            as: "t",
                            in: { _id: "$$t._id", title: "$$t.title" }
                        }
                    },
                    pendingTasks: {
                        $size: {
                            $filter: {
                                input: "$allTasks",
                                as: "task",
                                cond: { $ne: ["$$task.status", "Done"] }
                            }
                        }
                    },
                    completedTasks: {
                        $size: {
                            $filter: {
                                input: "$allTasks",
                                as: "task",
                                cond: {
                                    $and: [
                                        { $eq: ["$$task.status", "Done"] },
                                        { $gte: ["$$task.completedAt", today] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { pendingTasks: -1, completedTasks: -1 } },
            { $limit: 20 }
        ]);

        // Recent completed tasks to show in the feed 
        const recentCompleted = await Task.find({ status: 'Done', completedAt: { $gte: today } })
            .sort({ completedAt: -1 })
            .limit(10)
            .populate('assignee', 'name image')
            .populate('requester', 'name role')
            .lean();

        return NextResponse.json(
            JSON.parse(JSON.stringify({ teamStats, recentCompleted }))
        );

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
