"use client";

import { BadgeCheck, DollarSign } from "lucide-react";

export default function InstructorStrip({ instructors }: { instructors: any[] }) {
    if (!instructors || instructors.length === 0) return null;

    return (
        <section className="py-24 bg-gray-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Learn from Builders, Not Just Teachers</h2>
                    <p className="text-lg text-gray-600">Our faculty includes Principals, CTOs, and 7-figure Freelancers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {instructors.map((inst, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition text-center group">
                            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-blue-500 transition">
                                <img
                                    src={inst.user?.image || "https://ui-avatars.com/api/?name=" + inst.user?.name}
                                    alt={inst.user?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-bold text-gray-900">{inst.user?.name}</h3>
                            <p className="text-xs text-blue-600 font-medium mb-3 uppercase tracking-wide">{inst.specialization || "Expert"}</p>

                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 bg-gray-50 py-2 rounded">
                                <BadgeCheck className="w-3 h-3 text-green-500" />
                                <span>Verified Earner</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
