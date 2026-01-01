import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import { MessageSquare, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getClientProjects() {
    await dbConnect();
    // In a real scenario, this would filter by the logged-in client user
    // For PM view, we list projects with recent client activity or change requests
    const projects = await Project.find({
        status: 'Active',
        $or: [{ 'changeRequests.0': { $exists: true } }, { clientSentiment: { $ne: 'Neutral' } }]
    }).limit(5).lean();

    return projects;
}

export default async function ClientPortalPage() {
    const projects = await getClientProjects();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
                <p className="text-gray-500">Manage stakeholder communication, approvals, and change requests.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Change Request Log */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 text-blue-500 mr-2" />
                        Change Requests
                    </h2>
                    <div className="space-y-4">
                        {projects.flatMap((p: any) => p.changeRequests || []).slice(0, 3).map((cr: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-semibold text-gray-900">{cr.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cr.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            cr.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {cr.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cr.description}</p>
                                <div className="mt-2 text-xs text-gray-400 flex justify-between">
                                    <span>Impact: {cr.impact}</span>
                                    <span>{new Date(cr.requestedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {projects.flatMap((p: any) => p.changeRequests || []).length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No active change requests.</p>
                        )}
                        <button className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                            View All Requests
                        </button>
                    </div>
                </div>

                {/* Client Sentiment Tracker */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <MessageSquare className="w-5 h-5 text-purple-500 mr-2" />
                        Client Sentiment
                    </h2>
                    <div className="space-y-3">
                        {projects.map((project: any) => (
                            <div key={project._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">{project.title}</h4>
                                    <p className="text-xs text-gray-500">{project.client}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {project.clientSentiment === 'Delighted' && <span className="text-xl">🤩</span>}
                                    {project.clientSentiment === 'Satisfied' && <span className="text-xl">🙂</span>}
                                    {project.clientSentiment === 'Neutral' && <span className="text-xl">😐</span>}
                                    {project.clientSentiment === 'Concerned' && <span className="text-xl">😟</span>}
                                    {project.clientSentiment === 'Angry' && <span className="text-xl">😡</span>}
                                    <span className="text-xs font-medium text-gray-600">{project.clientSentiment}</span>
                                </div>
                            </div>
                        ))}
                        {projects.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No active client tracking data.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
