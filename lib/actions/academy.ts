"use server";

import dbConnect from "@/lib/db";
import AcademyCourse from "@/lib/models/AcademyCourse";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCourseProposal(data: any) {
    await dbConnect();
    const session = await auth();

    const userRole = session.user?.role?.toLowerCase() || '';
    if (!session || !['ceo', 'academy head', 'program director', 'admin'].includes(userRole)) {
        throw new Error("Unauthorized: Only Leadership can propose courses.");
    }

    // Basic Validation
    if (!data.title || !data.slug) {
        throw new Error("Title and Slug are required.");
    }

    try {
        const newCourse = await AcademyCourse.create({
            title: data.title,
            slug: data.slug,
            programDirector: session.user?.id,
            status: 'Proposal',
            // Meta
            targetAudience: data.targetAudience?.split(',').map((s: string) => s.trim()) || [],
            difficulty: data.difficulty || 'Beginner',
            // Financials (Initial Estimates)
            financials: {
                projectedRevenue: Number(data.projectedRevenue) || 0,
                instructorCost: Number(data.instructorCost) || 0,
                breakEvenPoint: Number(data.breakEvenPoint) || 0,
                clientPrice: Number(data.clientPrice) || 0
            }
        });

        revalidatePath('/academy');
        return { success: true, id: newCourse._id.toString() };
    } catch (error: any) {
        console.error("Course Proposal Error:", error);
        if (error.code === 11000) {
            throw new Error("A course with this slug already exists.");
        }
        throw new Error("Failed to create proposal.");
    }
}

export async function getAcademyStats() {
    await dbConnect();
    const courseCount = await AcademyCourse.countDocuments();
    const activeData = await AcademyCourse.aggregate([
        { $match: { status: 'Live' } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$financials.projectedRevenue" } // Placeholder
            }
        }
    ]);

    // ... existing stats code ...
}

// --- Instructor Engine ---

export async function getInstructors() {
    await dbConnect();
    const { default: AcademyInstructor } = await import("@/lib/models/AcademyInstructor");
    const instructors = await AcademyInstructor.find({})
        .populate("user", "name email image")
        .sort({ createdAt: -1 })
        .lean();

    return instructors.map((i: any) => ({
        ...i,
        _id: i._id.toString(),
        user: i.user ? { ...i.user, _id: i.user._id.toString() } : null
    }));
}

export async function getInstructorDetails(id: string) {
    await dbConnect();
    const { default: AcademyInstructor } = await import("@/lib/models/AcademyInstructor");
    const instructor = await AcademyInstructor.findById(id)
        .populate("user", "name email image role")
        .lean();

    if (!instructor) return null;

    return {
        ...instructor,
        _id: instructor._id.toString(),
        user: instructor.user ? { ...instructor.user, _id: instructor.user._id.toString() } : null
    };
}

// Using existing User ID to create Instructor Profile
export async function createInstructorProfile(data: any) {
    await dbConnect();
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const { default: AcademyInstructor } = await import("@/lib/models/AcademyInstructor");

    // Check if duplicate
    const existing = await AcademyInstructor.findOne({ user: data.userId });
    if (existing) throw new Error("User is already an instructor.");

    const instructor = await AcademyInstructor.create({
        user: data.userId,
        headline: data.headline,
        bio: data.bio,
        expertise: data.expertise?.split(',').map((s: string) => s.trim()) || [],
        status: 'Applied',
        linkedinUrl: data.linkedinUrl
    });

    revalidatePath('/academy/instructors');
    return { success: true, id: instructor._id.toString() };
}

export async function updateInstructorStatus(id: string, status: string) {
    await dbConnect();
    const session = await auth();
    const userRole = session.user?.role?.toLowerCase() || '';
    // Only Head or Ops
    if (!session || !['ceo', 'academy head', 'academy ops manager', 'admin'].includes(userRole)) {
        throw new Error("Unauthorized");
    }

    const { default: AcademyInstructor } = await import("@/lib/models/AcademyInstructor");

    await AcademyInstructor.findByIdAndUpdate(id, { status });
    revalidatePath('/academy/instructors');
    return { success: true };
}

export async function getPotentialInstructors() {
    await dbConnect();
    const { default: User } = await import("@/lib/models/User");
    const { default: AcademyInstructor } = await import("@/lib/models/AcademyInstructor");

    // Get IDs of existing instructors
    const existingIds = await AcademyInstructor.find().distinct('user');

    // Find users not in that list
    // Ideally filter by role or something, but for now just getAll excluding existing
    return User.find({
        _id: { $nin: existingIds },
        role: { $ne: 'User' } // Only employees/freelancers with some role
    }).select('name email role').lean().then(users => users.map((u: any) => ({ ...u, _id: u._id.toString() })));
}

// --- Syllabus Engine ---

export async function getCourseDetails(id: string) {
    await dbConnect();
    const { default: AcademyCourse } = await import("@/lib/models/AcademyCourse");
    const course = await AcademyCourse.findById(id).lean();
    if (!course) return null;
    return { ...course, _id: course._id.toString() };
}

export async function getCourseSyllabus(courseId: string) {
    await dbConnect();
    const { default: AcademySyllabus } = await import("@/lib/models/AcademySyllabus");

    // Get latest version
    const syllabus = await AcademySyllabus.findOne({ course: courseId })
        .sort({ version: -1 })
        .lean();

    if (!syllabus) return null;

    return {
        ...syllabus,
        _id: syllabus._id.toString(),
        course: syllabus.course.toString(),
        modules: syllabus.modules.map((m: any) => ({
            ...m,
            _id: m._id.toString(),
            lessons: m.lessons.map((l: any) => ({ ...l, _id: l._id.toString() }))
        }))
    };
}

// Create or Update Syllabus (Always creates new version for audit trail if desired, or updates current Draft)
// For simplicity V1: Just upsert the latest version
export async function updateSyllabusStructure(courseId: string, modules: any[]) {
    await dbConnect();
    const session = await auth();
    const userRole = session.user?.role?.toLowerCase() || '';
    if (!session || !['ceo', 'academy head', 'program director', 'admin'].includes(userRole)) {
        throw new Error("Unauthorized");
    }

    const { default: AcademySyllabus } = await import("@/lib/models/AcademySyllabus");
    const { default: AcademyCourse } = await import("@/lib/models/AcademyCourse");

    // Check if exists
    let syllabus = await AcademySyllabus.findOne({ course: courseId }).sort({ version: -1 });

    if (!syllabus) {
        syllabus = await AcademySyllabus.create({
            course: courseId,
            version: 1,
            updatedBy: session.user?.id,
            modules: modules
        });

        // Link to course
        await AcademyCourse.findByIdAndUpdate(courseId, { activeSyllabus: syllabus._id });
    } else {
        // Update existing for now (Version control usually requires "Publish" step, we'll keep it simple)
        syllabus.modules = modules;
        syllabus.updatedBy = session.user?.id;
        await syllabus.save();
    }

    revalidatePath(`/academy/courses/${courseId}`);
    return { success: true };
}
