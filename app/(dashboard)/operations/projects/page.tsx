import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import { AlertTriangle, CheckCircle, Clock, AlertOctagon, Filter, Search } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getProjects(searchParams: { status?: string, risk?: string }) {
    await dbConnect();
    const query: any = {};

    if (searchParams.status) {
        query.status = searchParams.status;
    }

    if (searchParams.risk === 'risk') {
        query.$or = [
            { health: { $in: ['Red', 'Yellow'] } },
            { riskStatus: { $in: ['High', 'Critical'] } }
        ];
    }

    const projects = await Project.find(query).populate('manager', 'name email').sort({ updatedAt: -1 }).lean();
    return JSON.parse(JSON.stringify(projects));
}

export default async function ProjectsHealthPage({ searchParams }: { searchParams: Promise<{ status?: string, risk?: string }> }) {
    const params = await searchParams;
    const projects = await getProjects(params);

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'Green': return 'bg-green-100 text-green-800 border-green-200';
            case 'Yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Red': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRiskBadge = (risk: string) => {
        switch (risk) {
            case 'Critical': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Critical Risk</span>;
            case 'High': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">High Risk</span>;
            case 'Medium': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Medium Risk</span>;
            default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Low Risk</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Project Health Matrix</h1>
                    <p className="text-sm text-gray-500">Deep dive into project timelines, budgets, and risks.</p>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                    <Link href="/operations/projects?risk=risk" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${params.risk === 'risk' ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                        ⚠️ At Risk
                    </Link>
                    <Link href="/operations/projects" className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">
                        View All
                    </Link>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map((project: any) => (
                            <tr key={project._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">{project.title}</span>
                                        <span className="text-xs text-gray-500">{project.client}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {project.manager?.name || 'Unassigned'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getHealthColor(project.health)}`}>
                                        {project.health}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getRiskBadge(project.riskStatus)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <div className="flex flex-col">
                                        <span>Est: ${project.budget?.estimated?.toLocaleString()}</span>
                                        <span className={project.budget?.actual > project.budget?.estimated ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                            Act: ${project.budget?.actual?.toLocaleString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/projects/${project._id}`} className="text-blue-600 hover:text-blue-900">
                                        Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {projects.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No projects found matching the criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
