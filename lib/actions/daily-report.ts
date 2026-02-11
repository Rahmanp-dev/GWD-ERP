"use server";

import dbConnect from "@/lib/db";
import DailyReport from "@/lib/models/DailyReport";
import Task from "@/lib/models/Task";
import Lead from "@/lib/models/Lead";
import Invoice from "@/lib/models/Invoice";
import Attendance from "@/lib/models/Attendance";
import Project from "@/lib/models/Project";
import KPI from "@/lib/models/KPI";
import { revalidatePath } from "next/cache";

export async function generateDailyReport() {
    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateRange = { $gte: today, $lt: tomorrow };

    // 1. Tasks
    const taskStats = await Task.aggregate([
        {
            $group: {
                _id: null,
                created: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", today] }, { $lt: ["$createdAt", tomorrow] }] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $and: [{ $gte: ["$updatedAt", today] }, { $lt: ["$updatedAt", tomorrow] }, { $eq: ["$status", "Done"] }] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $ne: ["$status", "Done"] }, 1, 0] } } // Snapshot of current pending
            }
        }
    ]);

    // 2. Sales (Leads & Revenue)
    const leadStats = await Lead.aggregate([
        {
            $group: {
                _id: null,
                leadsCreated: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", today] }, { $lt: ["$createdAt", tomorrow] }] }, 1, 0] } },
                dealsClosed: { $sum: { $cond: [{ $and: [{ $gte: ["$updatedAt", today] }, { $lt: ["$updatedAt", tomorrow] }, { $eq: ["$status", "Closed Won"] }] }, 1, 0] } },
                revenue: { $sum: { $cond: [{ $and: [{ $gte: ["$updatedAt", today] }, { $lt: ["$updatedAt", tomorrow] }, { $eq: ["$status", "Closed Won"] }] }, "$value", 0] } }
            }
        }
    ]);

    // 3. Finance (Invoices)
    const invoiceStats = await Invoice.aggregate([
        {
            $group: {
                _id: null,
                invoicesSent: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", today] }, { $lt: ["$createdAt", tomorrow] }] }, 1, 0] } },
                paymentsReceived: { $sum: { $cond: [{ $and: [{ $gte: ["$updatedAt", today] }, { $lt: ["$updatedAt", tomorrow] }, { $eq: ["$status", "Paid"] }] }, "$total", 0] } },
            }
        }
    ]);

    // 4. HR (Attendance)
    const attendanceStats = await Attendance.aggregate([
        { $match: { date: { $gte: today, $lt: tomorrow } } },
        {
            $group: {
                _id: null,
                presentCount: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                leaveCount: { $sum: { $cond: [{ $eq: ["$status", "On Leave"] }, 1, 0] } }
            }
        }
    ]);

    // 5. Projects
    const projectCount = await Project.countDocuments({ status: { $ne: "Completed" } });
    const completedProjectCount = await Project.countDocuments({ status: "Completed", updatedAt: dateRange });

    // 6. KPIs (Active Snapshot)
    const { default: KPI } = await import("@/lib/models/KPI");

    // Fetch all and filter in memory to avoid query issues
    const allKpis = await KPI.find({}).lean();
    const activeKpis = allKpis.filter((k: any) => k.status === 'Active');

    // Calculate actual values for task-based KPIs (since currentValue might not be updated on task toggle)
    const kpiSnapshot = await Promise.all(activeKpis.map(async (k: any) => {
        let actualValue = k.currentValue;

        // If it's a Count metric, check for linked tasks
        if (k.metricType === 'Count') {
            const linkedTaskCount = await Task.countDocuments({ linkedKPI: k._id, status: 'Done' });
            // If we found linked tasks or if the target implies it's task-based, we prioritize the task count
            // Note: If manual updates are also used, this might override. Assuming Count = Linked Tasks for now.
            if (linkedTaskCount > 0 || k.currentValue === 0) {
                actualValue = linkedTaskCount;
            }
        }

        return {
            title: k.title,
            department: k.department || 'General',
            target: k.target,
            value: actualValue,
            unit: k.unit
        };
    }));

    const metrics = {
        tasks: {
            created: taskStats[0]?.created || 0,
            completed: taskStats[0]?.completed || 0,
            pending: taskStats[0]?.pending || 0
        },
        sales: {
            leadsCreated: leadStats[0]?.leadsCreated || 0,
            dealsClosed: leadStats[0]?.dealsClosed || 0,
            revenue: leadStats[0]?.revenue || 0
        },
        finance: {
            invoicesSent: invoiceStats[0]?.invoicesSent || 0,
            paymentsReceived: invoiceStats[0]?.paymentsReceived || 0,
            cashflow: 0 // Placeholder or calculated if expense model exists
        },
        hr: {
            presentCount: attendanceStats[0]?.presentCount || 0,
            leaveCount: attendanceStats[0]?.leaveCount || 0
        },
        projects: {
            activeCount: projectCount,
            completedCount: completedProjectCount
        },
        kpis: kpiSnapshot
    };

    // Auto-generate summary text
    const summary = `Daily Report for ${today.toLocaleDateString()}: ${metrics.sales.dealsClosed} deals closed ($${metrics.sales.revenue}), ${metrics.tasks.completed} tasks completed. Tracking ${kpiSnapshot.length} KPIs.`;

    // Create a new snapshot report
    // We use 'date' as the generation timestamp
    await DailyReport.create({
        date: new Date(), // Current timestamp
        metrics,
        summary,
        generatedBy: 'System'
    });

    revalidatePath('/admin/daily-reports');
    return { success: true };
}

export async function getDailyReports() {
    await dbConnect();
    return DailyReport.find().sort({ date: -1 }).limit(30).lean();
}
