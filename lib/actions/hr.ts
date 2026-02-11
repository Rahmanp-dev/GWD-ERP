"use server";

import dbConnect from "@/lib/db";
import Candidate from "@/lib/models/Candidate";
import Employee from "@/lib/models/Employee";
import User from "@/lib/models/User";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/* --- Recruitment Actions --- */

export async function getCandidates() {
    await dbConnect();
    const candidates = await Candidate.find().sort({ order: 1, createdAt: -1 }).lean();
    return candidates.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        createdAt: c.createdAt.toISOString()
    }));
}

export async function createCandidate(data: any) {
    await dbConnect();

    // Basic validation
    if (!data.name || !data.email || !data.roleApplied) {
        throw new Error("Missing required fields");
    }

    const candidate = await Candidate.create({
        ...data,
        status: 'New'
    });

    revalidatePath('/hr/recruitment');
    return { success: true, id: candidate._id.toString() };
}

export async function updateCandidateStatus(id: string, status: string, newOrder?: number) {
    await dbConnect();

    const updateData: any = { status };
    if (newOrder !== undefined) updateData.order = newOrder;

    await Candidate.findByIdAndUpdate(id, updateData);
    revalidatePath('/hr/recruitment');
    return { success: true };
}

export async function deleteCandidate(id: string) {
    await dbConnect();
    await Candidate.findByIdAndDelete(id);
    revalidatePath('/hr/recruitment');
    return { success: true };
}

export async function hireCandidate(candidateId: string, email: string) {
    await dbConnect();

    // 1. Get Candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) throw new Error("Candidate not found");

    // 2. Create User Account (if not exists)
    // Default password for now: "Welcome123" (In production, send invite email)
    const hashedPassword = await bcrypt.hash("Welcome123", 10);

    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            name: candidate.name,
            email: email,
            password: hashedPassword,
            role: 'Salesperson', // Default role, HR can update later
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}`
        });
    }

    // 3. Create Employee Profile
    const employeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    await Employee.create({
        user: user._id,
        employeeId: employeeId,
        department: candidate.department || 'General',
        position: candidate.roleApplied,
        status: 'Active',
        dateJoined: new Date(),
        candidateId: candidate._id,
        phone: candidate.phone,
        email: email
    });

    // 4. Update Candidate Status
    candidate.status = 'Hired';
    await candidate.save();

    revalidatePath('/hr/recruitment');
    revalidatePath('/hr/directory');
    return { success: true };
}

/* --- Employee Actions --- */

export async function getEmployees() {
    await dbConnect();
    const employees = await Employee.find()
        .populate('user', 'name email role image')
        .sort({ dateJoined: -1 })
        .lean();

    return employees.map((e: any) => ({
        ...e,
        _id: e._id.toString(),
        user: e.user ? {
            ...e.user,
            _id: e.user._id.toString()
        } : null,
        dateJoined: e.dateJoined ? e.dateJoined.toISOString() : null,
        candidateId: e.candidateId ? e.candidateId.toString() : null
    }));
}
