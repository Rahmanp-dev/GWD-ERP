"use client";

import { useState, useEffect } from "react";
import {
    BarChart3,
    PieChart,
    LineChart,
    TrendingUp,
    Calendar,
    Download,
    Filter
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function ReportsBuilder() {
    const [reportType, setReportType] = useState<"sales" | "projects" | "finance">("sales");
    const [dateRange, setDateRange] = useState("month");
    const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReportData();
    }, [reportType, dateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Fetch appropriate data based on report type
            let endpoint = "";
            switch (reportType) {
                case "sales":
                    endpoint = "/api/crm/analytics/dashboard";
                    break;
                case "finance":
                    endpoint = "/api/finance/commissions";
                    break;
                default:
                    endpoint = "/api/crm/analytics/dashboard";
            }

            const res = await fetch(endpoint);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data based on report type
    const getChartData = () => {
        if (!data) return { labels: [], datasets: [] };

        if (reportType === "sales") {
            const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
            return {
                labels: stages,
                datasets: [{
                    label: 'Pipeline Value',
                    data: stages.map(stage => {
                        const s = data?.pipelineStats?.find((i: any) => i._id === stage);
                        return s ? s.totalValue : 0;
                    }),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(34, 197, 94, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderRadius: 4
                }]
            };
        }

        if (reportType === "finance") {
            return {
                labels: ['Pending', 'Approved', 'Paid'],
                datasets: [{
                    label: 'Commission Amount',
                    data: [
                        data?.totals?.totalPending || 0,
                        data?.totals?.totalApproved || 0,
                        data?.totals?.totalPaid || 0
                    ],
                    backgroundColor: [
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(34, 197, 94, 0.7)'
                    ]
                }]
            };
        }

        return { labels: [], datasets: [] };
    };

    const chartData = getChartData();
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Report Builder</h1>
                <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as any)}
                        className="border rounded px-3 py-2 text-sm"
                    >
                        <option value="sales">Sales Pipeline</option>
                        <option value="finance">Commissions</option>
                        <option value="projects">Projects</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2 ml-auto">
                    <button
                        onClick={() => setChartType("bar")}
                        className={`p-2 rounded ${chartType === 'bar' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        <BarChart3 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setChartType("pie")}
                        className={`p-2 rounded ${chartType === 'pie' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        <PieChart className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setChartType("line")}
                        className={`p-2 rounded ${chartType === 'line' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        <LineChart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {reportType === 'sales' ? 'Pipeline Value by Stage' :
                        reportType === 'finance' ? 'Commission Status Breakdown' :
                            'Report Visualization'}
                </h3>
                {loading ? (
                    <div className="text-center text-gray-500 py-12">Loading...</div>
                ) : (
                    <div className="h-80 flex items-center justify-center">
                        {chartType === 'bar' && <Bar options={chartOptions} data={chartData} />}
                        {chartType === 'pie' && <Pie options={chartOptions} data={chartData} />}
                        {chartType === 'line' && <Line options={chartOptions} data={chartData} />}
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Total Value</span>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {reportType === 'sales' ?
                            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format((data?.totalPipelineValue || 0) + (data?.totalRevenue || 0)) :
                            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format((data?.totals?.totalPending || 0) + (data?.totals?.totalApproved || 0) + (data?.totals?.totalPaid || 0))
                        }
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Record Count</span>
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {reportType === 'sales' ?
                            data?.pipelineStats?.reduce((acc: number, s: any) => acc + s.count, 0) || 0 :
                            data?.commissions?.length || 0
                        }
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Report Generated</span>
                        <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-lg font-medium text-gray-700">
                        {new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
