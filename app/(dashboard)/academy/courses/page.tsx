import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import AcademyCourse from "@/lib/models/AcademyCourse";
import Link from "next/link";
import { Plus, BookOpen, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CoursesListPage() {
    const session = await auth();
    if (!session) redirect("/login");

    await dbConnect();
    const courses = await AcademyCourse.find({}).sort({ createdAt: -1 }).lean();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
                    <p className="text-gray-500">Manage lifecycle from proposal to retirement.</p>
                </div>
                <Link href="/academy/courses/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Propose Course
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                    <div key={course._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition p-5">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                ${course.status === 'Draft' ? 'bg-gray-100 text-gray-600' :
                                    course.status === 'Proposal' ? 'bg-yellow-100 text-yellow-600' :
                                        course.status === 'Live' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {course.status}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(course.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                            {course.description || "No description provided."}
                        </p>

                        {/* Strategic Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {course.difficulty && (
                                <span className="text-xs px-2 py-0.5 bg-gray-50 border rounded text-gray-600">
                                    {course.difficulty}
                                </span>
                            )}
                            <span className="text-xs px-2 py-0.5 bg-green-50 border border-green-100 text-green-700 font-medium">
                                ROI: ${course.financials?.projectedRevenue?.toLocaleString() || 0}
                            </span>
                        </div>

                        <div className="border-t pt-4">
                            <Link href={`/academy/courses/${course._id}`} className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                                Manage Course <BookOpen className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No courses found. Start by proposing one.
                </div>
            )}
        </div>
    );
}
