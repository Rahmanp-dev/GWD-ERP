import ProjectBoard from "@/components/project/project-board";
import dbConnect from "@/lib/db";
import Project from "@/lib/models/Project";
import Link from "next/link";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    await dbConnect();
    const project = await Project.findById(id);

    if (!project) return <div>Project not found</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                    <p className="text-gray-500">{project.description}</p>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/projects/${id}/tasks/new`} className="px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded hover:bg-blue-700">
                        Add Task
                    </Link>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <ProjectBoard projectId={id} />
            </div>
        </div>
    );
}
