"use server";

import dbConnect from "@/lib/db";
import { auth } from "@/auth";

export async function getPublicCourse(slug: string) {
    await dbConnect();
    const { default: AcademyCourse } = await import("@/lib/models/AcademyCourse");
    const { default: AcademySyllabus } = await import("@/lib/models/AcademySyllabus");
    const { default: AcademyInstructor } = await import("@/lib/models/AcademyInstructor");
    const { default: AcademyBatch } = await import("@/lib/models/AcademyBatch");

    const course = await AcademyCourse.findOne({ slug, status: 'Live' }).lean();
    if (!course) return null;

    // Get Syllabus
    const syllabus = await AcademySyllabus.findById(course.activeSyllabus).lean();

    // Get Batches (Upcoming)
    const batches = await AcademyBatch.find({
        course: course._id,
        status: { $in: ['Scheduled', 'Open for Enrollment'] },
        startDate: { $gte: new Date() }
    }).sort({ startDate: 1 }).limit(3).lean();

    // Get Instructors
    const instructors = await AcademyInstructor.find({ _id: { $in: course.instructors } })
        .populate('user', 'name image')
        .lean();

    return {
        course: { ...course, _id: course._id.toString() },
        syllabus: syllabus ? {
            ...syllabus,
            _id: syllabus._id.toString(),
            modules: syllabus.modules.map((m: any) => ({
                ...m,
                _id: m._id.toString(),
                lessons: m.lessons.map((l: any) => ({ ...l, _id: l._id.toString() }))
            }))
        } : null,
        batches: batches.map((b: any) => ({ ...b, _id: b._id.toString() })),
        instructors: instructors.map((i: any) => ({
            ...i,
            _id: i._id.toString(),
            user: i.user ? { ...i.user, _id: i.user._id.toString() } : null
        }))
    };
}

export async function getHomePageData() {
    await dbConnect();
    const { default: AcademyCourse } = await import("@/lib/models/AcademyCourse");
    const { default: AcademyInstructor } = await import("@/lib/models/AcademyInstructor");
    const { default: AcademyStudent } = await import("@/lib/models/AcademyStudent");
    const { default: AcademyBatch } = await import("@/lib/models/AcademyBatch");

    // 1. Live Stats
    const totalStudents = await AcademyStudent.countDocuments();
    // Calculate simulated "Alumni Revenue" based on students * avg salary uplift (Mock for now, or derived)
    const activeBatches = await AcademyBatch.countDocuments({ status: { $in: ['Active', 'Scheduled'] } });

    // 2. Featured Instructors (Top rated or random)
    const instructors = await AcademyInstructor.find({ status: 'Approved' })
        .populate('user', 'name image headline')
        .limit(5)
        .lean();

    // 3. Courses (Live only)
    const courses = await AcademyCourse.find({ status: 'Live' })
        .populate('instructors', 'user') // Just need ID or basic info
        .limit(6)
        .sort({ 'financials.projectedRevenue': -1 }) // Show "Premium" first maybe?
        .lean();

    // Attach basic batch info for urgency
    const coursesWithBatches = await Promise.all(courses.map(async (c: any) => {
        const nextBatch = await AcademyBatch.findOne({
            course: c._id,
            status: 'Scheduled',
            startDate: { $gte: new Date() }
        }).sort({ startDate: 1 }).lean();

        return {
            ...c,
            _id: c._id.toString(),
            nextBatch: nextBatch ? {
                startDate: nextBatch.startDate,
                seatsLeft: (nextBatch.maxStudents || 30) - (nextBatch.enrolledStudentCount || 0)
            } : null
        };
    }));

    return {
        stats: {
            students: totalStudents,
            alumniRevenue: totalStudents * 12000, // Mock: $12k uplift per student
            activeFreelancers: Math.floor(totalStudents * 0.4), // 40% freelance rate
            hiringPartners: 15 + Math.floor(Math.random() * 5) // Mock
        },
        instructors: instructors.map((i: any) => ({
            ...i,
            _id: i._id.toString(),
            user: i.user ? { ...i.user, _id: i.user._id.toString() } : null
        })),
        courses: coursesWithBatches
    };
}
