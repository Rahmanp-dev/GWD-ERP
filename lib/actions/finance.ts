"use server";

import dbConnect from "@/lib/db";
import FinanceLedger from "@/lib/models/FinanceLedger";
import Project from "@/lib/models/Project";
import { revalidatePath } from "next/cache";

export type TransactionInput = {
    projectId: string;
    type: 'Inflow' | 'Outflow' | 'Adjustment' | 'Liability';
    category: string;
    amount: number;
    description: string;
    date?: Date;
    metadata?: any;
    userId: string;
};

export async function recordTransaction(data: TransactionInput) {
    await dbConnect();

    // 1. Get current project balance
    // We calculate balance dynamically or fetch last snapshot. 
    // For 'Google Sheets' style, strict sequential balance is complex if we allow back-dated entries.
    // For now, we will calculate 'Running Balance' based on simple accumulation of ALL prev transactions.
    // OPTIMIZATION: In production, rely on a 'FinanceSnapshot' model. Here we aggreate.

    // Validate Project
    const project = await Project.findById(data.projectId);
    if (!project) throw new Error("Project not found");

    // 2. Create the Transaction
    const transaction = await FinanceLedger.create({
        project: data.projectId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date || new Date(),
        metadata: {
            ...data.metadata,
            userId: data.userId
        },
        status: 'Cleared' // Auto-clear for now, unless 'Pending' flow needed
    });

    // 3. Recalculate Project Balance (Simulated Ledger)
    // We could trigger an async aggregation here to update 'Project.budget.actual' properties

    if (data.type === 'Inflow') {
        // Revenue
        await Project.findByIdAndUpdate(data.projectId, { $inc: { 'budget.revenue': data.amount } });
    } else if (data.type === 'Outflow' || data.type === 'Liability') {
        // Cost / Liability increasing actual spend/commitment? 
        // Usually Liability doesn't increase 'Actual Spend' until paid, but it hits the P&L. 
        // For simplistic 'Actual Cost', we'll add it.
        await Project.findByIdAndUpdate(data.projectId, { $inc: { 'budget.actual': data.amount } });
    }

    revalidatePath(`/projects/${data.projectId}`);
    return { success: true, id: transaction._id };
}

export async function getProjectLedger(projectId: string) {
    await dbConnect();
    const ledger = await FinanceLedger.find({ project: projectId })
        .sort({ date: -1, createdAt: -1 })
        .lean();

    // Calculate running balance in reverse (or forward)
    // For UI, we often want 'Balance After' this row.
    // Let's do a quick calc:

    let totalBalance = 0;
    // This simple loop implies we shouldn't paginate too heavily without snapshots.
    // For < 1000 rows, this is instant.

    const ledgerWithBalance = ledger.map((entry: any) => {
        // Logic depends on sorting. If Descending (newest first), we need total first.
        return {
            ...entry,
            _id: entry._id.toString(),
            project: entry.project.toString(),
            date: entry.date.toISOString()
        };
    });

    return ledgerWithBalance;
}

import { generateInvoicePDF } from "@/lib/pdf/invoice-generator";
import Invoice from "@/lib/models/Invoice";

export async function downloadInvoicePDF(invoiceId: string) {
    await dbConnect();
    const invoice = await Invoice.findById(invoiceId).lean();
    if (!invoice) throw new Error("Invoice not found");

    // We need to pass a plain object to the generator, likely cleaner than the mongoose doc
    // .lean() helps, but let's ensure dates are strings if the generator expects strings, 
    // though our generator casts `new Date(invoice.createdAt)` so Date objects are fine.

    // We do need to populate client if it's a ref, but schema says client is embedded object { name: String... }
    // So distinct populate not needed unless linking to 'Company'.

    const pdfBuffer = await generateInvoicePDF(invoice);

    // Server actions must return serializable data. 
    // We cannot return a Buffer directly. We return base64 string.
    return {
        base64: Buffer.from(pdfBuffer).toString('base64'),
        filename: `${invoice.invoiceNumber || 'invoice'}.pdf`
    };
}

import { auth } from "@/auth";

export async function reverseTransaction(transactionId: string, reason: string) {
    await dbConnect();
    const session = await auth();
    // In prod, check role: if (session?.user?.role !== 'CFO' && session?.user?.role !== 'CEO') throw Error

    const original = await FinanceLedger.findById(transactionId);
    if (!original) throw new Error("Transaction not found");
    if (original.status === 'Reversed') throw new Error("Already reversed");

    // Contra Entry
    await FinanceLedger.create({
        project: original.project,
        type: original.type,
        category: 'Correction',
        amount: -original.amount,
        description: `REVERSAL: ${original.description} (${reason})`,
        date: new Date(),
        metadata: {
            notes: reason,
            originalTransactionId: original._id,
            userId: session?.user?.id || 'system'
        },
        status: 'Cleared',
        isReversal: true
    });

    // Mark Original
    original.status = 'Reversed';
    await original.save();

    // Update Project Stats
    if (original.type === 'Inflow') {
        await Project.findByIdAndUpdate(original.project, { $inc: { 'budget.revenue': -original.amount } });
    } else if (original.type === 'Outflow' || original.type === 'Liability') {
        await Project.findByIdAndUpdate(original.project, { $inc: { 'budget.actual': -original.amount } });
    }

    revalidatePath(`/projects/${original.project}`);
    return { success: true };
}

export async function updateInvoiceTerms(invoiceId: string, terms: string) {
    await dbConnect();
    const invoice = await Invoice.findByIdAndUpdate(invoiceId, { termsAndConditions: terms }, { new: true });
    if (!invoice) throw new Error("Invoice not found");
    revalidatePath(`/finance/invoices/${invoiceId}`);
    return { success: true };
}

export async function getFinanceOverview() {
    await dbConnect();

    // 1. Aggregated Revenue & Spend from Projects
    const projectStats = await Project.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$budget.revenue" },
                totalSpend: { $sum: "$budget.actual" },
                totalBudget: { $sum: "$budget.estimated" }
            }
        }
    ]);

    const stats = projectStats[0] || { totalRevenue: 0, totalSpend: 0, totalBudget: 0 };

    // 2. Outstanding Invoices
    const invoiceStats = await Invoice.aggregate([
        { $match: { status: { $ne: 'Paid' } } },
        {
            $group: {
                _id: null,
                outstandingAmount: { $sum: "$total" },
                count: { $sum: 1 }
            }
        }
    ]);

    const outstanding = invoiceStats[0] || { outstandingAmount: 0, count: 0 };

    // 3. Recent Transactions
    const recentTransactions = await FinanceLedger.find()
        .sort({ date: -1 })
        .limit(10)
        .populate('project', 'title')
        .lean();

    // 4. Monthly Cash Flow (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await FinanceLedger.aggregate([
        { $match: { date: { $gte: sixMonthsAgo }, status: 'Cleared' } },
        {
            $group: {
                _id: {
                    month: { $month: "$date" },
                    year: { $year: "$date" },
                    type: "$type"
                },
                total: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return {
        financials: {
            revenue: stats.totalRevenue,
            expenses: stats.totalSpend,
            netIncome: stats.totalRevenue - stats.totalSpend,
            outstandingInvoices: outstanding.outstandingAmount,
            outstandingCount: outstanding.count
        },
        recentTransactions: recentTransactions.map((t: any) => ({
            ...t,
            _id: t._id.toString(),
            project: t.project ? { _id: t.project._id.toString(), title: t.project.title } : null,
            date: t.date.toISOString()
        })),
        monthlyChart: monthlyStats
    };
}

import FinanceSnapshot from "@/lib/models/FinanceSnapshot";

export async function generateMonthlySnapshot(date: Date = new Date()) {
    await dbConnect();

    // 1. Define Range: Start to End of given month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // 2. Aggregate Ledger for this month
    const ledgerStats = await FinanceLedger.aggregate([
        {
            $match: {
                date: { $gte: startOfMonth, $lte: endOfMonth },
                status: 'Cleared'
            }
        },
        {
            $group: {
                _id: null,
                totalInflow: {
                    $sum: { $cond: [{ $eq: ["$type", "Inflow"] }, "$amount", 0] }
                },
                totalOutflow: {
                    $sum: { $cond: [{ $in: ["$type", ["Outflow", "Liability"]] }, "$amount", 0] }
                },
                projectCosts: {
                    $sum: { $cond: [{ $eq: ["$category", "Project Cost"] }, "$amount", 0] }
                },
                opsCosts: {
                    $sum: { $cond: [{ $eq: ["$category", "Ops Cost"] }, "$amount", 0] }
                },
                count: { $sum: 1 }
            }
        }
    ]);

    const stats = ledgerStats[0] || { totalInflow: 0, totalOutflow: 0, projectCosts: 0, opsCosts: 0, count: 0 };

    // 3. Accounts Receivable/Payable
    // Ideally this needs to be point-in-time, but for simplicity we calculate current open state.
    // For true historical accuracy, we'd need temporal tables or event sourcing. 
    // Here we assume "At end of this month, what IS the state?" - simplified to "Current State" for MVP.

    const arStats = await Invoice.aggregate([
        { $match: { status: { $ne: 'Paid' }, dueDate: { $lte: endOfMonth } } }, // Due by end of this month or earlier
        { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const ar = arStats[0]?.total || 0;

    // 4. Upsert Snapshot
    const snapshot = await FinanceSnapshot.findOneAndUpdate(
        {
            date: startOfMonth, // Normalize to 1st of month
            period: 'Monthly'
        },
        {
            revenue: stats.totalInflow,
            expenses: stats.totalOutflow,
            netIncome: stats.totalInflow - stats.totalOutflow,
            operationalCosts: stats.opsCosts,
            projectCosts: stats.projectCosts,
            cashInflow: stats.totalInflow, // Assuming cleared inflows = cash
            cashOutflow: stats.totalOutflow,
            accountsReceivable: ar,
            metadata: {
                totalTransactions: stats.count
            }
        },
        { upsert: true, new: true }
    );

    revalidatePath('/finance');
    return { success: true, id: snapshot._id.toString() };
}

export async function getCashflowWaterfall() {
    await dbConnect();

    // Get last 6 monthly snapshots
    const snapshots = await FinanceSnapshot.find({ period: 'Monthly' })
        .sort({ date: 1 })
        .limit(6)
        .lean();

    return snapshots.map((s: any) => ({
        month: s.date.toISOString(), // Client will format
        revenue: s.revenue,
        expenses: s.expenses,
        netIncome: s.netIncome,
        cashPosition: s.cashInflow - s.cashOutflow // Net Cash Flow
    }));
}

