"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitFreelancerApplication } from "@/lib/actions/freelancer";
import { UserPlus, ArrowLeft, Save } from "lucide-react";

export default function AddFreelancerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            domain: formData.get("domain"),
            skills: (formData.get("skills") as string).split(',').map(s => s.trim()),
            experienceLevel: formData.get("experienceLevel"),
            linkedinUrl: formData.get("linkedinUrl"),
            portfolioUrl: formData.get("portfolioUrl"),
            hourlyRate: formData.get("hourlyRate"),
        };

        try {
            await submitFreelancerApplication(data);
            router.push('/hr/freelancers');
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to add freelancer");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Freelancer</h1>
                    <p className="text-gray-500">Manually onboard talent into the vetted pool.</p>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">

                {/* Personal Info */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input name="name" required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input name="email" type="email" required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input name="phone" type="tel" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                            <input name="linkedinUrl" type="url" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6"></div>

                {/* Professional Info */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Primary Domain</label>
                            <select name="domain" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                                <option>Frontend</option>
                                <option>Backend</option>
                                <option>Fullstack</option>
                                <option>Mobile</option>
                                <option>Design</option>
                                <option>Marketing</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                            <select name="experienceLevel" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2">
                                <option>Junior</option>
                                <option>Mid</option>
                                <option>Senior</option>
                                <option>Expert</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                            <input name="skills" placeholder="React, Node.js, TypeScript..." className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hourly Rate (USD)</label>
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input name="hourlyRate" type="number" className="pl-6 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Portfolio URL</label>
                            <input name="portfolioUrl" type="url" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {loading ? "Adding..." : "Add Freelancer"}
                    </button>
                </div>

            </form>
        </div>
    );
}
