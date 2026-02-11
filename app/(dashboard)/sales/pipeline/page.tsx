import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';
import User from '@/lib/models/User';
import { Filter, Lock, Unlock, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getGovernancePipeline(searchParams: { rep?: string, filter?: string }) {
    await dbConnect();

    const query: any = { status: { $nin: ['Closed Won', 'Closed Lost'] } };

    if (searchParams.rep) {
        query.assignedTo = searchParams.rep;
    }

    if (searchParams.filter === 'risk') {
        query.riskScore = { $gt: 50 };
    } else if (searchParams.filter === 'stalled') {
        // Mock stalled: created > 30 days ago and still in early stages
        // In real app, use lastActivityDate
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query.createdAt = { $lt: thirtyDaysAgo };
    }

    const leads = await Lead.find(query)
        .populate('assignedTo', 'name email')
        .sort({ value: -1 })
        .lean();

    // Fetch all sales reps for filter dropdown
    const reps = await User.find({ role: { $in: ['Salesperson', 'Sales Manager'] } }).select('name').lean();

    return { leads: JSON.parse(JSON.stringify(leads)), reps: JSON.parse(JSON.stringify(reps)) };
}

export default async function PipelineGovernancePage({ searchParams }: { searchParams: Promise<{ rep?: string, filter?: string }> }) {
    const params = await searchParams;
    const { leads, reps } = await getGovernancePipeline(params);

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Lead': return 'bg-gray-100 text-gray-800';
            case 'Qualified': return 'bg-blue-100 text-blue-800';
            case 'Proposal': return 'bg-purple-100 text-purple-800';
            case 'Negotiation': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pipeline Governance</h1>
                    <p className="text-gray-500">Inspect deals, enforce hygiene, and manage risks.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link href="/sales/pipeline" className={`px-4 py-2 rounded-md text-sm font-medium border ${!params.filter && !params.rep ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                        All Deals
                    </Link>
                    <Link href="/sales/pipeline?filter=risk" className={`px-4 py-2 rounded-md text-sm font-medium border ${params.filter === 'risk' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                        ⚠️ At Risk
                    </Link>
                    <Link href="/sales/pipeline?filter=stalled" className={`px-4 py-2 rounded-md text-sm font-medium border ${params.filter === 'stalled' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                        🐢 Stalled
                    </Link>
                </div>
            </div>

            {/* Rep Filter - Simplified for Server Component Demo */}
            <div className="flex gap-2 flex-wrap items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Filter by Rep:</span>
                <Link href="/sales/pipeline" className={`text-xs px-2 py-1 rounded border ${!params.rep ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}>
                    All
                </Link>
                {reps.map((rep: any) => (
                    <Link
                        key={rep._id}
                        href={`/sales/pipeline?rep=${rep._id}`}
                        className={`text-xs px-2 py-1 rounded border ${params.rep === rep._id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                    >
                        {rep.name}
                    </Link>
                ))}
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal / Account</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk / Health</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Governance</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map((lead: any) => (
                            <tr key={lead._id} className="hover:bg-gray-50 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <Link href={`/crm/pipeline/${lead._id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                            {lead.title}
                                        </Link>
                                        <span className="text-xs text-gray-500">{lead.accountName || 'No Data'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                        {lead.status !== 'Closed Won' && lead.status !== 'Closed Lost' && (
                                            <Link
                                                href={`/sales/pipeline/${lead._id}/convert`}
                                                className="text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-2 py-1 rounded transition-colors flex items-center"
                                            >
                                                Win & Convert
                                            </Link>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${lead.value?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {lead.assignedTo?.name || 'Unassigned'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {lead.riskScore > 50 ? (
                                        <div className="flex items-center text-red-600">
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            <span className="text-xs font-bold">High Risk ({lead.riskScore})</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-green-600 font-medium">Healthy</span>
                                    )}
                                    {lead.validationErrors?.length > 0 && (
                                        <div className="text-xs text-orange-600 mt-1">Missing Fields</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-gray-400 hover:text-gray-600" title="Lock Stage">
                                            <Lock className="w-4 h-4" />
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-900 text-xs border border-blue-200 bg-blue-50 px-2 py-1 rounded">
                                            Override
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No deals found for this filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
