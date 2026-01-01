import { BarChart2, Download, FileText } from 'lucide-react';

export default function OperationsReportsPage() {
    const reports = [
        { title: "Weekly Resource Utilization", date: "Generated today", size: "1.2 MB" },
        { title: "Project Health Summary (Q3)", date: "Generated 2 days ago", size: "2.4 MB" },
        { title: "PM Performance Scorecard", date: "Generated 1 week ago", size: "0.8 MB" },
        { title: "Workflow Efficiency Audit", date: "Generated 1 week ago", size: "1.5 MB" },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Operations Reports</h1>
                <p className="text-gray-500">Download generated reports for offline analysis and presentations.</p>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden divide-y divide-gray-200">
                {reports.map((report, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-50 rounded-lg mr-4">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{report.title}</h3>
                                <p className="text-sm text-gray-500">{report.date} • {report.size}</p>
                            </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 border rounded-lg hover:bg-gray-100">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
