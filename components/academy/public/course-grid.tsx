"use client";

import Link from "next/link";
import { ArrowRight, Users, Clock } from "lucide-react";
import { format } from "date-fns";

export default function CourseGrid({ courses }: { courses: any[] }) {
    return (
        <section id="courses" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Career Acceleration Tracks</h2>
                        <p className="text-gray-500 mt-2">Select a program to start your journey.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <Link key={course._id} href={`/courses/${course.slug}`} className="group block h-full">
                            <div className="h-full bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col">
                                {/* Image Placeholder or Gradient */}
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${course.difficulty === 'Advanced' ? 'from-purple-600 to-blue-600' : 'from-blue-600 to-cyan-500'} opacity-90 group-hover:scale-105 transition duration-500`}></div>
                                    <div className="absolute top-4 left-4 inline-block px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full border border-white/20">
                                        {course.difficulty}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
                                        <div className="text-xs font-medium text-white/80 mb-1">{course.category || "Development"}</div>
                                        <h3 className="text-xl font-bold leading-tight">{course.title}</h3>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">

                                    {/* Cohort Info */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {course.nextBatch ? (
                                                <span className="text-green-600 font-medium">Starts {format(new Date(course.nextBatch.startDate), 'MMM dd')}</span>
                                            ) : (
                                                <span>Flexible Start</span>
                                            )}
                                        </div>
                                        {course.nextBatch && (
                                            <span className="text-orange-500 font-medium">{course.nextBatch.seatsLeft} Seats Left</span>
                                        )}
                                    </div>

                                    <div className="mb-6 flex-1">
                                        <p className="text-gray-600 line-clamp-3 text-sm">{course.shortDescription || course.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t mt-auto">
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase">Tuition</p>
                                            <p className="text-xl font-bold text-gray-900">${course.financials?.clientPrice?.toLocaleString() || 499}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
