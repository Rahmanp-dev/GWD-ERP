"use server";

import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- KPI Operations ---

export async function getKPIs(period: string = 'Daily') {
    await dbConnect();
    const session = await auth();
    if (!session) return [];

    const { default: KPI } = await import("@/lib/models/KPI");
    const { default: Task } = await import("@/lib/models/Task");
    await import("@/lib/models/User"); // Register User schema for populate

    // Fetch KPIs - Populate Owner
    const kpis = await KPI.find({ status: 'Active', period })
        .populate('owner', 'name role image')
        .lean();

    // Attach Progress & Tasks
    const enrichedKPIs = await Promise.all(kpis.map(async (kpi: any) => {
        const tasks = await Task.find({
            linkedKPI: kpi._id,
            status: { $ne: 'Archived' }
        }).populate('assignee', 'name image').populate('requester', 'name role').sort({ createdAt: -1 }).lean() as any[];

        const completedTasks = tasks.filter((t: any) => t.status === 'Done').length;
        const totalTasks = tasks.length;

        // Calculate Progress (Simple Task-based or Value-based if implemented later)
        let progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Manual override if 'currentValue' is used directly
        if (kpi.metricType !== 'Count' && kpi.target > 0) {
            progress = (kpi.currentValue / kpi.target) * 100;
        }

        return {
            ...kpi,
            _id: kpi._id.toString(),
            owner: kpi.owner ? {
                ...kpi.owner,
                _id: kpi.owner._id.toString()
            } : null,
            progress: Math.round(progress),
            tasks: tasks.map((t: any) => ({
                ...t,
                _id: t._id.toString(),
                assignee: t.assignee ? { ...t.assignee, _id: t.assignee._id.toString() } : null
            }))
        };
    }));

    return JSON.parse(JSON.stringify(enrichedKPIs));
}

export async function createKPI(data: any) {
    await dbConnect();
    const session = await auth();
    // Only Executives/Admins
    if (!session || !['CEO', 'CFO', 'CMO', 'Admin'].includes(session.user?.role || '')) {
        throw new Error("Unauthorized: Only Executives can create KPIs");
    }

    const { default: KPI } = await import("@/lib/models/KPI");

    await KPI.create({
        title: data.title,
        owner: data.owner || session.user?.id,
        target: Number(data.target),
        metricType: data.metricType,
        period: data.period || 'Daily'
    });

    revalidatePath('/dashboard/kpi');
}

// --- Task Operations ---

export async function createTask(data: any) {
    await dbConnect();
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const { default: Task } = await import("@/lib/models/Task");

    // Auto-approve if Executive
    const isExec = ['CEO', 'CFO', 'CMO', 'Admin'].includes(session.user?.role || '');
    const status = isExec ? 'To Do' : 'Requested';

    await Task.create({
        title: data.title,
        assignee: data.assignee || session.user?.id,
        requester: session.user?.id,
        linkedKPI: data.kpiId || null,
        status: status,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date()
    });

    revalidatePath('/dashboard/kpi');
}

export async function toggleTask(taskId: string, status: string) {
    await dbConnect();
    const { default: Task } = await import("@/lib/models/Task");

    await Task.findByIdAndUpdate(taskId, {
        status: status,
        completedAt: status === 'Done' ? new Date() : null
    });

    revalidatePath('/dashboard/kpi');
}
