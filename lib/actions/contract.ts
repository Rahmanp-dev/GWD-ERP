"use server";

import dbConnect from "@/lib/db";
import Contract from "@/lib/models/Contract";
import Project from "@/lib/models/Project";
import Freelancer from "@/lib/models/Freelancer";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { generateContractPDF } from "@/lib/pdf/contract-generator"; // Will create this

export async function createContract(data: any) {
    await dbConnect();
    const session = await auth();

    // Only Ops, Admin, CEO can create contracts
    if (!session || !['CEO', 'Ops', 'Operations Manager', 'Admin'].includes(session.user?.role || '')) {
        throw new Error("Unauthorized");
    }

    // Validation
    if (!data.projectId || !data.freelancerId) {
        throw new Error("Missing Project or Freelancer");
    }

    const contract = await Contract.create({
        ...data,
        project: data.projectId,
        freelancer: data.freelancerId,
        status: 'Draft',
        // Auto-include standard clauses
        clauses: {
            confidentiality: true,
            ipOwnership: true,
            termination: true,
            nonCompete: true
        }
    });

    // Link to Project
    await Project.findByIdAndUpdate(data.projectId, {
        $push: { contracts: contract._id }
    });

    revalidatePath('/ops/contracts');
    return { success: true, id: contract._id.toString() };
}

export async function getContracts(filter: string = 'All') {
    await dbConnect();
    const session = await auth();
    console.log("getContracts Session:", session?.user?.email, !!session);
    if (!session) {
        console.error("getContracts: No session found");
        throw new Error("Unauthorized");
    }

    let query: any = {};
    if (filter !== 'All') {
        query.status = filter;
    }

    // Role-based visibility
    // Freelancers should only see their own (if they had logic access), but for now this is internal ops view

    const contracts = await Contract.find(query)
        .populate('project', 'title')
        .populate('freelancer', 'name email')
        .sort({ createdAt: -1 })
        .lean();

    return contracts.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        project: c.project ? { ...c.project, _id: c.project._id.toString() } : null,
        freelancer: c.freelancer ? { ...c.freelancer, _id: c.freelancer._id.toString() } : null,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate ? c.endDate.toISOString() : null,
        createdAt: c.createdAt.toISOString()
    }));
}

export async function generateAndSendContract(contractId: string) {
    await dbConnect();
    const contract = await Contract.findById(contractId)
        .populate('project')
        .populate('freelancer');

    if (!contract) throw new Error("Contract not found");

    // Generate PDF Buffer (Server-side)
    const pdfBuffer = await generateContractPDF(contract);

    // In a real app, upload to S3/Blob storage and save URL
    // For now, we'll return base64 or simulate "Sent" status

    contract.status = 'Sent';
    await contract.save();

    revalidatePath('/ops/contracts');
    return { success: true };
}

// Fetch helper for form dropdowns
export async function getContractFormData() {
    await dbConnect();
    const projects = await Project.find({ status: { $ne: 'Completed' } }).select('title _id').lean();
    const freelancers = await Freelancer.find({ status: 'Approved' }).select('name _id domain rates').lean();

    return {
        projects: projects.map((p: any) => ({ ...p, _id: p._id.toString() })),
        freelancers: freelancers.map((f: any) => ({ ...f, _id: f._id.toString() }))
    };
}
