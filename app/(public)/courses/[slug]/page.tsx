import { getPublicCourse } from "@/lib/actions/academy-public";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users, BookOpen, CheckCircle, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function PublicCoursePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getPublicCourse(slug);

    if (!data) notFound();

    const { course, syllabus, batches, instructors } = data;

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Navigation (Simple) */}
            <nav className="border-b sticky top-0 bg-white/80 backdrop-blur z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">GWD Academy</Link>
                    <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Login</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gray-900 text-white py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex space-x-2">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                                {course.difficulty}
                            </span>
                            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                                Online Cohort
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl">
                            {course.description || "Master the skills needed for the future economy with our industry-led curriculum."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <a href="#enroll" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
                                Enroll Now <ArrowRight className="w-5 h-5 ml-2" />
                            </a>
                            <a href="#syllabus" className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition flex items-center justify-center backdrop-blur">
                                View Syllabus
                            </a>
                        </div>
                    </div>
                    <div className="hidden lg:block relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-30"></div>
                        <div className="relative bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
                            <h3 className="text-xl font-bold mb-6 text-gray-200">Course Highlights</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center text-gray-300">
                                    <Clock className="w-5 h-5 mr-3 text-blue-400" />
                                    <span>{syllabus?.modules?.length || 0} Modules</span>
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <BookOpen className="w-5 h-5 mr-3 text-purple-400" />
                                    <span>Project-Based Learning</span>
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <Users className="w-5 h-5 mr-3 text-green-400" />
                                    <span>Live Mentorship</span>
                                </li>
                                <li className="flex items-center text-gray-300">
                                    <ShieldCheck className="w-5 h-5 mr-3 text-yellow-400" />
                                    <span>Certificate of Completion</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content & Syllabus */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12" id="syllabus">

                {/* Left: Description & Syllabus */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">About this Course</h2>
                        <div className="prose prose-lg text-gray-600">
                            {course.markdownContent ? (
                                <div className="whitespace-pre-wrap">{course.markdownContent}</div>
                            ) : (
                                <p>No detailed content provided yet.</p>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Curriculum</h2>
                        <div className="space-y-4">
                            {syllabus?.modules?.map((module: any, idx: number) => (
                                <div key={module._id} className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center font-semibold text-gray-900">
                                        <span>Module {idx + 1}: {module.title}</span>
                                        <span className="text-sm text-gray-500 font-normal">{module.lessons?.length} Lessons</span>
                                    </div>
                                    <div className="px-6 py-4 bg-white border-t">
                                        <ul className="space-y-2">
                                            {module.lessons?.map((lesson: any, lIdx: number) => (
                                                <li key={lIdx} className="flex items-center text-gray-600 text-sm">
                                                    <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                                                    {lesson.title}
                                                    {lesson.durationHighLevel && <span className="ml-auto text-gray-400 text-xs">{lesson.durationHighLevel}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Instructors */}
                    <section>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Instructors</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {instructors.map((inst: any) => (
                                <div key={inst._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition">
                                    <img src={inst.user?.image || "https://ui-avatars.com/api/?name=Instructor"} alt="" className="w-16 h-16 rounded-full bg-gray-200" />
                                    <div>
                                        <h4 className="font-bold text-gray-900">{inst.user?.name}</h4>
                                        <p className="text-sm text-blue-600 font-medium">{inst.headline}</p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{inst.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right: Sticky Enrollment Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden" id="enroll">
                        <div className="p-8 bg-blue-600 text-white text-center">
                            <p className="text-blue-100 uppercase tracking-widest text-xs font-bold mb-2">Total Program Fee</p>
                            <div className="text-5xl font-extrabold flex justify-center items-start">
                                <span className="text-2xl mt-1">$</span>
                                {course.financials?.clientPrice || 499}
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Upcoming Cohorts
                                </h4>
                                {batches.length > 0 ? (
                                    <div className="space-y-3">
                                        {batches.map((batch: any) => (
                                            <div key={batch._id} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-500 cursor-pointer transition bg-gray-50 group">
                                                <div>
                                                    <div className="font-semibold text-gray-900">{format(new Date(batch.startDate), 'MMM dd')} Start</div>
                                                    <div className="text-xs text-gray-500">{batch.schedule?.days?.join(', ')} • {batch.schedule?.time}</div>
                                                </div>
                                                <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:border-blue-600 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 italic">No upcoming batches scheduled.</div>
                                )}
                            </div>

                            <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg transform transition hover:-translate-y-0.5">
                                Secure Your Seat
                            </button>

                            <p className="text-xs text-center text-gray-400">
                                Limited seats available per cohort to ensure personalized attention.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <footer className="bg-gray-50 border-t py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} GWD Academy. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
