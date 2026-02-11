import ProjectBoard from "@/components/project/project-board";
import { getProjectDetails } from "@/lib/actions/project";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const project = await getProjectDetails(id);

    if (!project) return notFound();

    // Financial Badge (Only visible if data exists i.e. CFO/CEO)
    const showFinancials = project.budget?.clientPrice !== undefined;

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                    <p className="text-gray-500">{project.description}</p>

                    {/* Financial Badge Integration */}
                    {showFinancials && (
                        <div className="mt-2 flex space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Margin: {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.budget.currency }).format(project.budget.projectedMargin)}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Revenue: {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.budget.currency }).format(project.budget.clientPrice)}
                            </span>
                        </div>
                    )}
                    {!showFinancials && (
                        <div className="mt-2 text-xs text-gray-400">
                            Execution Budget: {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.budget.currency }).format(project.budget.executionBudget)}
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <Link href={`/ops/contracts`} className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm flex items-center">
                        View Contracts
                    </Link>
                    <Link href={`/projects/${id}/tasks/new`} className="px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded hover:bg-blue-700 text-sm flex items-center">
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
