import { auth } from "@/auth";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    const session = await auth();
    let projects = [];
    try {
        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Project } = await import("@/lib/models/Project");
        projects = await Project.find({}).sort({ createdAt: -1 });
    } catch (e) {
        console.error("Projects Build Error:", e);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <Link href="/projects/new" className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    <Plus className="w-5 h-5 mr-1" />
                    New Project
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link key={project._id.toString()} href={`/projects/${project._id}`}>
                        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                            <p className="text-gray-600 line-clamp-2 mb-4">{project.description || "No description"}</p>
                            <div className="flex justify-between items-center text-sm">
                                <span className={`px-2 py-1 rounded-full ${project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {project.status}
                                </span>
                                <span className="text-gray-500">
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
                {projects.length === 0 && (
                    <div className="col-span-3 text-center py-10 text-gray-500">
                        No projects found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
