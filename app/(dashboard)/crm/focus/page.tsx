import { auth } from "@/auth";
import { getFocusLeads } from "@/lib/actions/crm";
import { Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function FocusModePage() {
    const session = await auth();
    const { stale, today } = await getFocusLeads();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Focus Mode</h1>
                <p className="text-gray-500">Your daily sales cockpit. Clear the queue.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Today's Action Queue */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-700">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Today's Queue ({today.length})</h2>
                    </div>

                    {today.length === 0 ? (
                        <div className="p-8 bg-green-50 border border-green-100 rounded-xl text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-green-800">All caught up!</h3>
                            <p className="text-green-600">No scheduled follow-ups for today.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {today.map((lead: any) => (
                                <div key={lead._id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{lead.title}</h3>
                                            <p className="text-sm text-gray-500">{lead.accountName}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${lead.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {lead.priority}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Status: <span className="font-medium text-gray-800">{lead.status}</span>
                                        </div>
                                        <button className="text-sm text-blue-600 font-medium hover:underline">
                                            Log Activity &rarr;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Stale & Rotting Leads */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-700">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">At Risk / Stale ({stale.length})</h2>
                    </div>

                    {stale.length === 0 ? (
                        <div className="p-8 bg-gray-50 border border-gray-100 rounded-xl text-center">
                            <p className="text-gray-500">Pipeline is healthy. No rotting deals.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stale.map((lead: any) => (
                                <div key={lead._id} className="p-4 bg-orange-50 border border-orange-100 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{lead.title}</h3>
                                            <p className="text-sm text-gray-600">
                                                Last active: {lead.activityStats?.lastActivityDays || 7}+ days ago
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">
                                            ${lead.value?.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex space-x-3">
                                        <button className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm font-medium hover:bg-gray-50 text-gray-700">
                                            Nudge
                                        </button>
                                        <button className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm font-medium hover:bg-gray-50 text-red-600">
                                            Mark Lost
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
