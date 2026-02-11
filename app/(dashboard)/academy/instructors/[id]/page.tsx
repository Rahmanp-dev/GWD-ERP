import { getInstructorDetails } from "@/lib/actions/academy";
import InstructorActions from "@/components/academy/instructor-actions";
import Link from "next/link";
import { ArrowLeft, Linkedin, Briefcase, Calendar, Star } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function InstructorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const instructor = await getInstructorDetails(id);

    if (!instructor) notFound();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link href="/academy/instructors" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Faculty
            </Link>

            {/* Header / Profile Card */}
            <div className="bg-white p-8 rounded-lg shadow-sm border flex flex-col md:flex-row items-start gap-8">
                <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    {instructor.user?.image && <img src={instructor.user.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{instructor.user?.name}</h1>
                            <p className="text-lg text-gray-600 font-medium">{instructor.headline}</p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500" /> {instructor.rating || "New"}</span>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 uppercase text-xs font-bold tracking-wide">
                                    {instructor.status}
                                </span>
                            </div>
                        </div>
                        {instructor.linkedinUrl && (
                            <a href={instructor.linkedinUrl} target="_blank" className="text-blue-600 hover:text-blue-800">
                                <Linkedin className="w-6 h-6" />
                            </a>
                        )}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="text-xs text-gray-500 uppercase block">Total Students</span>
                            <span className="font-bold text-xl">{instructor.studentsTaught || 0}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <span className="text-xs text-gray-500 uppercase block">Batches</span>
                            <span className="font-bold text-xl">{instructor.batchesCompleted || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Bio */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                        <div className="bg-white p-6 rounded-lg shadow-sm border text-gray-700 whitespace-pre-wrap">
                            {instructor.bio || "No biography provided."}
                        </div>
                    </section>

                    {/* Expertise */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Domain Expertise</h2>
                        <div className="flex flex-wrap gap-2">
                            {instructor.expertise?.map((s: string) => (
                                <span key={s} className="px-3 py-1 bg-white border rounded-full text-gray-700 shadow-sm">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    {/* Agreement / Actions */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Briefcase className="w-4 h-4 mr-2" /> Agreement
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Model</span>
                                <span className="font-medium">{instructor.agreement?.type || "Revenue Share"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Share %</span>
                                <span className="font-medium">{instructor.agreement?.sharePercentage || 0}%</span>
                            </div>
                        </div>

                        <InstructorActions id={instructor._id} currentStatus={instructor.status} />
                    </div>

                    {/* Activity (Placeholder for Phase 2) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border opacity-50">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" /> Recent Batches
                        </h3>
                        <p className="text-sm text-gray-500">No active batches assigned.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
