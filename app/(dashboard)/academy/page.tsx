import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import AcademyCourse from "@/lib/models/AcademyCourse";
import AcademyStudent from "@/lib/models/AcademyStudent";
import AcademyBatch from "@/lib/models/AcademyBatch";
import { Link } from "lucide-react"; // Wait, icon vs next/link
import NextLink from "next/link"; // Alias
import {
    Users, TrendingUp, DollarSign, BookOpen, AlertCircle,
    ArrowRight, GraduationCap, Target
} from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AcademyDashboardPage() {
    const session = await auth();
    if (!session) redirect("/login");

    await dbConnect();

    // Calculate High Level Stats
    const totalStudents = await AcademyStudent.countDocuments();
    const activeCourses = await AcademyCourse.countDocuments({ status: 'Live' });
    const totalRevenueCourse = await AcademyCourse.aggregate([
        { $match: { status: 'Live' } },
        { $group: { _id: null, total: { $sum: "$financials.projectedRevenue" } } }
    ]);

    // Active Batches
    const activeBatchesCount = await AcademyBatch.countDocuments({ status: 'Active' });

    // Recent Enrollments (Mock/Populated if we had data)
    const recentStudents = await AcademyStudent.find().sort({ updatedAt: -1 }).limit(5).populate('user', 'name image').lean();

    return (
        <div className="space-y-8">
            {/* Command Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Academy Command Center</h1>
                    <p className="text-gray-500">Talent Manufacturing Engine Stats & Operations.</p>
                </div>
                <div className="flex space-x-3">
                    <NextLink href="/academy/courses/new" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700">
                        + New Product
                    </NextLink>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Students</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{totalStudents}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Users className="w-6 h-6" /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Projected Value</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">${totalRevenueCourse[0]?.total?.toLocaleString() || 0}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-green-600"><DollarSign className="w-6 h-6" /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Products</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{activeCourses}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600"><BookOpen className="w-6 h-6" /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Live Cohorts</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{activeBatchesCount}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><TrendingUp className="w-6 h-6" /></div>
                    </div>
                </div>
            </div>

            {/* Operations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* 1. Product Lifecycle */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-indigo-600" /> Product Operations
                    </h3>
                    <div className="space-y-2">
                        <NextLink href="/academy/courses" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border group cursor-pointer">
                            <span className="text-sm font-medium text-gray-700">Course Portfolio</span>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                        </NextLink>
                        <NextLink href="/academy/courses/new" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border group cursor-pointer">
                            <span className="text-sm font-medium text-gray-700">Launch New Course</span>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                        </NextLink>
                    </div>
                </div>

                {/* 2. Talent Factory */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" /> Talent Operations
                    </h3>
                    <div className="space-y-2">
                        <NextLink href="/academy/batches" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border group cursor-pointer">
                            <span className="text-sm font-medium text-gray-700">Batch Scheduler</span>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                        </NextLink>
                        <NextLink href="/academy/instructors" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border group cursor-pointer">
                            <span className="text-sm font-medium text-gray-700">Faculty Management</span>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                        </NextLink>
                    </div>
                </div>

                {/* 3. Recent Activity (Feed) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-indigo-600" /> Recent Enrollments
                    </h3>
                    {recentStudents.length > 0 ? (
                        <div className="space-y-3">
                            {recentStudents.map((s: any) => (
                                <div key={s._id} className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                        {s.user?.image && <img src={s.user.image} alt="" />}
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">{s.user?.name}</div>
                                        <div className="text-xs text-gray-500">Joined recently</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No recent activity.</p>
                    )}
                </div>

            </div>
        </div>
    );
}
