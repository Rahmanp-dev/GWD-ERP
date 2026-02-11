import { getCourseDetails, getCourseSyllabus } from "@/lib/actions/academy";
import SyllabusBuilder from "@/components/academy/syllabus-builder";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SyllabusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Parallel data fetching
    const [course, syllabus] = await Promise.all([
        getCourseDetails(id),
        getCourseSyllabus(id)
    ]);

    if (!course) notFound();

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Link href={`/academy/courses/${id}`} className="flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course Dashboard
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Layers className="w-6 h-6 mr-2 text-blue-600" />
                        Syllabus Intelligence: {course.title}
                    </h1>
                    <p className="text-gray-500">Define modules, learning outcomes, and content structure.</p>
                </div>
                <div className="text-right text-sm text-gray-400">
                    <p>Status: {course.status}</p>
                    <p>Version: v{syllabus?.version || 1} (Draft)</p>
                </div>
            </div>

            <SyllabusBuilder courseId={id} initialData={syllabus} />
        </div>
    );
}
