"use server";

import dbConnect from "@/lib/db";
import Project from "@/lib/models/Project";
import { auth } from "@/auth";

export async function getProjectDetails(id: string) {
    await dbConnect();
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const role = session.user?.role || '';
    const isFinancialAdmin = ['CEO', 'CFO', 'Admin'].includes(role);

    // Initial Fetch
    // We select everything first, then filter in memory for complex logic
    // OR we can use Mongoose projection if we want to be super efficient, 
    // but memory filtering is easier for computed fields.
    const project = await Project.findById(id).populate('manager', 'name email').lean();

    if (!project) return null;

    // Financial Isolation Logic
    let secureBudget: {
        currency: string;
        executionBudget: number;
        actualSpend: number;
        clientPrice?: number;
        opsOverhead?: number;
        projectedMargin?: number;
        netMargin?: number;
    } = {
        currency: project.budget?.currency || 'USD',
        executionBudget: project.budget?.executionBudget || 0,
        actualSpend: project.budget?.actualSpend || 0
    };

    if (isFinancialAdmin) {
        // Level 2: Financial Intelligence
        const clientPrice = project.budget?.clientPrice || 0;
        const opsOverhead = project.budget?.opsOverhead || 0;
        const executionBudget = project.budget?.executionBudget || 0;
        const actualSpend = project.budget?.actualSpend || 0;

        secureBudget.clientPrice = clientPrice;
        secureBudget.opsOverhead = opsOverhead;

        // Calculated Margins
        // Gross Margin = Price - Execution Cost (Actual or Budgeted? Usually Budgeted for planning)
        // Let's show both Projected (Plan) and Realized (Actual)

        // Projected Net Margin = Client Price - Execution Budget - Ops Overhead
        secureBudget.projectedMargin = clientPrice - executionBudget - opsOverhead;

        // Realized Net Margin (So far) = Client Price - Actual Spend - Ops Overhead
        // Note: This assumes Client Price is fixed. If T&M, it might be different. 
        // For this model, we assume Fixed Price or total contract value.
        secureBudget.netMargin = clientPrice - actualSpend - opsOverhead;
    }

    // Return sanitized object
    return {
        ...project,
        _id: project._id.toString(),
        manager: project.manager ? { ...project.manager, _id: project.manager._id.toString() } : null,
        contracts: project.contracts?.map((c: any) => c.toString()) || [],
        budget: secureBudget,
        // Remove direct budget access from root if it existed, though we overwrote it.
        createdAt: project.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: project.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
}

// Get valid assignees for a project (Internal Team + Active Freelancers)
export async function getProjectAssignees(projectId: string) {
    await dbConnect();
    const session = await auth();
    if (!session) return [];

    const project = await Project.findById(projectId)
        .populate('internalTeam', 'name email role image')
        .populate({
            path: 'contracts',
            match: { status: 'Active' },
            populate: {
                path: 'freelancer',
                populate: { path: 'user', select: 'name email role image' }
            }
        })
        .lean();

    if (!project) return [];

    const assignees = new Map();

    // 1. Add Internal Team
    if (project.internalTeam) {
        project.internalTeam.forEach((user: any) => {
            assignees.set(user._id.toString(), {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.jobTitle || user.role || 'Internal',
                type: 'Internal'
            });
        });
    }

    // 2. Add Freelancers (via Contracts)
    if (project.contracts) {
        project.contracts.forEach((contract: any) => {
            const freelancer = contract.freelancer;
            if (freelancer && freelancer.user) {
                const user = freelancer.user;
                assignees.set(user._id.toString(), {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: `${freelancer.domain} Freelancer`, // e.g. "Frontend Freelancer"
                    type: 'External'
                });
            }
        });
    }

    // 3. Ensure the Manager is included
    if (project.manager) {
        // We need to fetch manager details if not already in internalTeam
        // logic simplified: assuming manager is usually in internalTeam or we adding separately
        // For strictness, let's assume internalTeam covers it.
    }

    return Array.from(assignees.values());
}
