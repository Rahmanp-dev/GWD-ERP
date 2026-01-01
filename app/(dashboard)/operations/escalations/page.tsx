import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import { AlertTriangle, TrendingUp, CheckCircle, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getEscalations() {
    await dbConnect();

    // Fetch projects with risks or red/yellow health
    // In a real system, you might have a dedicated Escalation model
    const escalations = await Project.find({
        status: 'Active',
        $or: [
            { health: { $in: ['Red', 'Yellow'] } },
            { riskStatus: { $in: ['High', 'Critical'] } }
        ]
    })
        .populate('manager', 'name email')
        .sort({ updatedAt: -1 })
        .lean();

    return escalations;
}

export default async function EscalationsPage() {
    const escalations = await getEscalations();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Escalation Inbox</h1>
                    <p className="text-gray-500">Manage critical incidents, project risks, and intervention requests.</p>
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    + Raise Escalation
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {escalations.map((project: any) => (
                    <div key={project._id} className="bg-white p-6 rounded-xl border border-l-4 border-l-red-500 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${project.riskStatus === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {project.riskStatus} Risk
                                </span>
                                <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                            </div>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                                Current Health: <span className="font-medium">{project.health}</span>.
                                Needs attention due to identified risks affecting delivery timeline or budget.
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    PM: {project.manager?.name}
                                </span>
                                <span className="flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    Risks: {project.risks?.length || 0} Open
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-2 md:w-48 shrink-0">
                            <button className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Add Note
                            </button>
                            <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Resolve
                            </button>
                        </div>
                    </div>
                ))}

                {escalations.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <div className="flex flex-col items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                            <p className="text-lg font-medium text-gray-900">All Clear!</p>
                            <p className="text-gray-500">No active escalations or critical risks found.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
