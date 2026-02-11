"use server";

import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- Batch Operations ---

export async function createBatch(data: any) {
    await dbConnect();
    const session = await auth();
    const userRole = session.user?.role?.toLowerCase() || '';
    if (!session || !['ceo', 'academy head', 'academy ops manager', 'admin'].includes(userRole)) {
        throw new Error("Unauthorized");
    }

    const { default: AcademyBatch } = await import("@/lib/models/AcademyBatch");

    try {
        const batch = await AcademyBatch.create({
            name: data.name,
            course: data.courseId,
            instructor: data.instructorId || null,
            startDate: data.startDate,
            endDate: data.endDate,
            schedule: {
                days: data.days, // Array e.g. ["Mon", "Wed"]
                time: data.time
            },
            status: 'Scheduled',
            maxStudents: Number(data.maxStudents) || 30
        });

        revalidatePath('/academy/batches');
        return { success: true, id: batch._id.toString() };
    } catch (e: any) {
        console.error("Batch Create Error:", e);
        throw new Error("Failed to create batch");
    }
}

export async function getBatches(filter: string = 'All') {
    await dbConnect();
    const { default: AcademyBatch } = await import("@/lib/models/AcademyBatch");

    let query = {};
    if (filter !== 'All') query = { status: filter };

    const batches = await AcademyBatch.find(query)
        .populate("course", "title")
        .populate({
            path: 'instructor',
            populate: { path: 'user', select: 'name image' }
        })
        .sort({ startDate: 1 })
        .lean();

    return batches.map((b: any) => ({
        ...b,
        _id: b._id.toString(),
        course: b.course ? { ...b.course, _id: b.course._id.toString() } : null,
        instructor: b.instructor ? {
            ...b.instructor,
            _id: b.instructor._id.toString(),
            user: b.instructor.user ? { ...b.instructor.user, _id: b.instructor.user._id.toString() } : null
        } : null
    }));
}

// --- Student Operations ---

export async function enrollStudent(data: any) {
    await dbConnect();
    const session = await auth();
    const userRole = session.user?.role?.toLowerCase() || '';
    // Only Admin/Ops or Self-Enrollment (if we add payment later)
    // For now: Manual Enrollment by Admin
    if (!session || !['ceo', 'academy head', 'academy ops manager', 'admin'].includes(userRole)) {
        throw new Error("Unauthorized");
    }

    const { default: AcademyStudent } = await import("@/lib/models/AcademyStudent");
    const { default: AcademyBatch } = await import("@/lib/models/AcademyBatch");

    // Check if student profile exists for user
    let student = await AcademyStudent.findOne({ user: data.userId });
    if (!student) {
        student = await AcademyStudent.create({ user: data.userId });
    }

    // Check existing enrollment
    const isEnrolled = student.enrollments.some((e: any) => e.batch?.toString() === data.batchId);
    if (isEnrolled) throw new Error("Student already enrolled in this batch.");

    // Add enrollment
    student.enrollments.push({
        course: data.courseId,
        batch: data.batchId,
        status: 'Active'
    });
    await student.save();

    // Increment batch count
    await AcademyBatch.findByIdAndUpdate(data.batchId, { $inc: { enrolledStudentCount: 1 } });

    revalidatePath(`/academy/batches/${data.batchId}`);
    return { success: true };
}
