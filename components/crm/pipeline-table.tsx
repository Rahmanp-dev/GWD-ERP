"use client";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

export default function PipelineTable({ leads, onDealClick }: { leads: any[], onDealClick?: (id: string) => void }) {
    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 h-full overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                        <tr
                            key={lead._id}
                            onClick={() => onDealClick?.(lead._id)}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{lead.title}</div>
                                <div className="text-xs text-gray-500">{lead.accountName || "No Account"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${lead.status === 'Closed Won' ? 'bg-green-100 text-green-800' :
                                        lead.status === 'Closed Lost' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'}`}>
                                    {lead.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.value || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded border 
                                    ${lead.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                        lead.priority === 'Low' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                    {lead.priority || 'Medium'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                    {lead.assignedTo?.image ? (
                                        <img className="h-6 w-6 rounded-full mr-2" src={lead.assignedTo.image} alt="" />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-xs">
                                            {lead.assignedTo?.name?.[0] || "?"}
                                        </div>
                                    )}
                                    {lead.assignedTo?.name || "Unassigned"}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
