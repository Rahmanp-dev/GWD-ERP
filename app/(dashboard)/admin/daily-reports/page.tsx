import { getDailyReports } from "@/lib/actions/daily-report";
import DailyReportViewer from "@/components/admin/daily-report-viewer";
import GenerateReportButton from "@/components/admin/generate-report-button";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DailyReportsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const reports: any[] = await getDailyReports();
    const { id } = await searchParams;

    const selectedReport = id ? reports.find((r: any) => r._id.toString() === id) : reports[0];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Daily System Reports</h1>
                    <p className="text-gray-500">Track system performance and key metrics day by day.</p>
                </div>
                <GenerateReportButton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                {/* Sidebar List */}
                <div className="lg:col-span-1 border rounded-lg bg-white overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50 font-medium text-sm text-gray-500">
                        History ({reports.length})
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="divide-y">
                            {reports.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm">No reports generated yet</div>
                            ) : (
                                reports.map((report: any) => {
                                    const isSelected = selectedReport?._id.toString() === report._id.toString();
                                    return (
                                        <Link
                                            key={report._id}
                                            href={`/admin/daily-reports?id=${report._id}`}
                                            className={`block p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                                        >
                                            <div className="font-medium text-gray-900">
                                                {new Date(report.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                <span className="text-gray-500 font-normal ml-2 text-xs">
                                                    {new Date(report.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {report.summary}
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {selectedReport ? (
                        <DailyReportViewer report={selectedReport} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                            <p>Select a report to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
