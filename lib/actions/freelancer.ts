"use server";

import dbConnect from "@/lib/db";
import Freelancer from "@/lib/models/Freelancer";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Public Action (No Auth Required)
export async function submitFreelancerApplication(data: any) {
    await dbConnect();

    // Basic validation
    if (!data.name || !data.email || !data.domain) {
        throw new Error("Missing required fields");
    }

    const existing = await Freelancer.findOne({ email: data.email });
    if (existing) {
        throw new Error("Application with this email already exists");
    }

    const freelancer = await Freelancer.create({
        ...data,
        status: 'Applied',
        rates: {
            hourly: data.hourlyRate ? parseFloat(data.hourlyRate) : undefined,
            currency: 'USD'
        }
    });

    return { success: true, id: freelancer._id.toString() };
}

// HR Actions (Protected)
export async function getFreelancers(filter: 'Applied' | 'Vetted' | 'Approved' | 'All' = 'All') {
    await dbConnect();
    const session = await auth();
    if (!session || !['CEO', 'HR Manager', 'Admin'].includes(session.user?.role || '')) {
        // Ops Managers can only see Approved freelancers
        if (session?.user?.role === 'Ops' || session?.user?.role === 'Project Manager') {
            const approved = await Freelancer.find({ status: 'Approved' }).sort({ name: 1 }).lean();
            return approved.map(serializeFreelancer);
        }
        throw new Error("Unauthorized");
    }

    let query: any = {};
    if (filter !== 'All') {
        query.status = filter;
    }

    const freelancers = await Freelancer.find(query).sort({ createdAt: -1 }).lean();
    return freelancers.map(serializeFreelancer);
}

export async function updateFreelancerStatus(id: string, status: string, notes?: string) {
    await dbConnect();
    const session = await auth();

    // Only HR and Admin/CEO can approve/vet
    if (!session || !['CEO', 'HR Manager', 'Admin'].includes(session.user?.role || '')) {
        throw new Error("Unauthorized");
    }

    const updateData: any = { status };
    if (notes) {
        updateData.$push = {
            vettingNotes: {
                content: notes,
                author: session.user?.id,
                createdAt: new Date()
            }
        };
    }

    await Freelancer.findByIdAndUpdate(id, updateData);
    revalidatePath('/hr/freelancers');
    revalidatePath('/ops/contracts'); // Revalidate contracts in case they are waiting for approval
    return { success: true };
}

// System Integration: Create User Account for Freelancer
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function createFreelancerAccount(freelancerId: string) {
    await dbConnect();
    const session = await auth();

    if (!session || !['CEO', 'HR Manager', 'Admin'].includes(session.user?.role || '')) {
        throw new Error("Unauthorized");
    }

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) throw new Error("Freelancer not found");

    if (freelancer.user) {
        throw new Error("Freelancer already has a user account");
    }

    // Default password: freelancerName + 123!
    // In prod, send reset password email
    const defaultPassword = `${freelancer.name.split(' ')[0].toLowerCase()}123!`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = await User.create({
        name: freelancer.name,
        email: freelancer.email,
        password: hashedPassword,
        role: 'User', // Standard user role, maybe 'Freelancer' in future
        jobTitle: 'Freelancer',
        department: 'External',
        employeeStatus: 'Active',
        joinDate: new Date()
    });

    // Link User to Freelancer
    freelancer.user = newUser._id;
    freelancer.status = 'Approved'; // Auto-approve if giving access
    await freelancer.save();

    revalidatePath('/hr/freelancers');
    revalidatePath('/ops/contracts');

    return { success: true, email: newUser.email, password: defaultPassword };
}

function serializeFreelancer(f: any) {
    return {
        ...f,
        _id: f._id.toString(),
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
        vettingNotes: f.vettingNotes?.map((n: any) => ({
            ...n,
            _id: n._id?.toString(),
            author: n.author?.toString(),
            createdAt: n.createdAt.toISOString()
        }))
    };
}
