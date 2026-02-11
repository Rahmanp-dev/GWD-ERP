import { getCourseDetails, getCourseSyllabus } from "@/lib/actions/academy";
import Link from "next/link";
import { ArrowLeft, Settings, FileText, Calendar, Users, DollarSign } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CourseDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const course = await getCourseDetails(id);
    const syllabus = await getCourseSyllabus(id);

    if (!course) notFound();

    return (
        <div className="space-y-8">
            <Link href="/academy/courses" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" /> All Courses
            </Link>

            {/* Course Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                    <div className="flex space-x-3 mt-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border">{course.status}</span>
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border">{course.slug}</span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Operational Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. Syllabus Engine */}
                <Link href={`/academy/courses/${id}/syllabus`} className="block group">
                    <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-blue-500 transition h-full">
                        <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900">Syllabus Engine</h3>
                        <p className="text-sm text-gray-500 mt-2">Define curriculum, outcomes, and materials.</p>
                        <div className="mt-4 text-xs font-medium text-purple-700">
                            {syllabus ? `${syllabus.modules.length} Modules defined` : "Not started"}
                        </div>
                    </div>
                </Link>

                {/* 2. Operations / Batches (Phase 2b) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border opacity-60">
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">Batch Ops</h3>
                    <p className="text-sm text-gray-500 mt-2">Manage cohorts and scheduling.</p>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded mt-3 inline-block">Coming Soon</span>
                </div>

                {/* 3. Instructors (Phase 2c) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border opacity-60">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">Faculty</h3>
                    <p className="text-sm text-gray-500 mt-2">Assign instructors to this course.</p>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded mt-3 inline-block">Coming Soon</span>
                </div>

                {/* 4. Financials */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900">Financials</h3>
                    <div className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Proj. Rev</span>
                            <span className="font-medium">${course.financials?.projectedRevenue?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Seat Price</span>
                            <span className="font-medium">${course.financials?.clientPrice}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
