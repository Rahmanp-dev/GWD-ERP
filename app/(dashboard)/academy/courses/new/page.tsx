"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourseProposal } from "@/lib/actions/academy";
import { ArrowLeft, Rocket, DollarSign, Target } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        try {
            await createCourseProposal(data);
            router.push("/academy/courses"); // Redirect to list
        } catch (err: any) {
            setError(err.message || "Failed to create proposal");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/academy" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to HQ
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-gray-900">New Course Proposal</h1>
                <p className="text-gray-500">Define the strategic and financial viability of a new program.</p>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-8">

                {/* Section 1: Product Definition */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center text-gray-800">
                        <Rocket className="w-5 h-5 mr-2 text-blue-600" />
                        Course Definition
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Course Title</label>
                            <input name="title" required className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="e.g. Advanced React Patterns" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                            <input name="slug" required className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="advanced-react-patterns" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Difficulty Limit</label>
                            <select name="difficulty" className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                </div>

                <hr />

                {/* Section 2: Strategy */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center text-gray-800">
                        <Target className="w-5 h-5 mr-2 text-purple-600" />
                        Market Strategy
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target Audience (Comma separated)</label>
                        <input name="targetAudience" placeholder="Junior Devs, Career Switchers" className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                </div>

                <hr />

                {/* Section 3: Financial ROI */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center text-gray-800">
                        <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                        Financial Intelligence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Client Price (per seat)</label>
                            <input name="clientPrice" type="number" required className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="499" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Projected Revenue (Total)</label>
                            <input name="projectedRevenue" type="number" className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="15000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Est. Instructor Cost</label>
                            <input name="instructorCost" type="number" className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="5000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Break-even (Students)</label>
                            <input name="breakEvenPoint" type="number" className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="10" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 mr-3 text-gray-700 hover:bg-gray-50 border rounded-md">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm disabled:opacity-50">
                        {loading ? "Submitting Proposal..." : "Submit Proposal"}
                    </button>
                </div>
            </form>
        </div>
    );
}
