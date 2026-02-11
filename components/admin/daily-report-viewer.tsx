export default function DailyReportViewer({ report }: { report: any }) {
    if (!report) return <div className="text-gray-500">Select a report to view details</div>;

    const { metrics } = report;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Report: {new Date(report.date).toLocaleDateString()}</h2>
                <span className="text-sm text-gray-500">Generated: {new Date(report.createdAt).toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Sales Revenue</div>
                    <div className="text-2xl font-bold">${metrics.sales?.revenue?.toLocaleString()}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Deals Closed</div>
                    <div className="text-2xl font-bold">{metrics.sales?.dealsClosed}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Tasks Completed</div>
                    <div className="text-2xl font-bold">{metrics.tasks?.completed}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Invoices Sent</div>
                    <div className="text-2xl font-bold">{metrics.finance?.invoicesSent}</div>
                </div>
            </div>

            <div className="flex border-b mb-4 space-x-4">
                <button className="px-4 py-2 border-b-2 border-blue-600 font-medium text-blue-600">Overview</button>
                {/* Simplified for now, just render all sections below */}
            </div>

            {/* KPI Section */}
            <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex justify-between items-center">
                    <span>Key Performance Indicators</span>
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{metrics.kpis?.length || 0} Tracked</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metrics.kpis?.map((kpi: any, idx: number) => {
                        const percent = kpi.target > 0 ? Math.min(100, (kpi.value / kpi.target) * 100) : 0;
                        return (
                            <div key={idx} className="bg-gray-50 p-3 rounded border">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{kpi.department}</div>
                                <div className="font-medium truncate" title={kpi.title}>{kpi.title}</div>
                                <div className="flex items-end justify-between mt-2">
                                    <div className="text-2xl font-bold">
                                        {kpi.value?.toLocaleString()}
                                        <span className="text-sm font-normal text-gray-500 ml-1">/ {kpi.target?.toLocaleString()} {kpi.unit}</span>
                                    </div>
                                    <div className="text-sm font-bold text-blue-600">{Math.round(percent)}%</div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                    {(!metrics.kpis || metrics.kpis.length === 0) && (
                        <div className="col-span-full text-center text-gray-500 py-4 italic">No active KPIs tracked in this report</div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Section */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Sales Performance</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between"><span>Leads Created</span><span className="font-bold">{metrics.sales?.leadsCreated}</span></div>
                        <div className="flex justify-between"><span>Deals Closed</span><span className="font-bold text-green-600">{metrics.sales?.dealsClosed}</span></div>
                        <div className="flex justify-between"><span>Revenue Booked</span><span className="font-bold text-green-600">${metrics.sales?.revenue?.toLocaleString()}</span></div>
                    </div>
                </div>

                {/* Operations Section */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Project & Task Health</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between"><span>Active Projects</span><span className="font-bold">{metrics.projects?.activeCount}</span></div>
                        <div className="flex justify-between"><span>Tasks Created</span><span className="font-bold">{metrics.tasks?.created}</span></div>
                        <div className="flex justify-between"><span>Tasks Completed</span><span className="font-bold text-green-600">{metrics.tasks?.completed}</span></div>
                        <div className="flex justify-between"><span>Pending Tasks</span><span className="font-bold text-orange-600">{metrics.tasks?.pending}</span></div>
                    </div>
                </div>

                {/* HR & Finance Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Human Resources</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span>Present Today</span><span className="font-bold text-green-600">{metrics.hr?.presentCount}</span></div>
                            <div className="flex justify-between"><span>On Leave</span><span className="font-bold text-red-600">{metrics.hr?.leaveCount}</span></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Finance</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span>Invoices Sent</span><span className="font-bold">{metrics.finance?.invoicesSent}</span></div>
                            <div className="flex justify-between"><span>Payments Received</span><span className="font-bold text-green-600">${metrics.finance?.paymentsReceived?.toLocaleString()}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
