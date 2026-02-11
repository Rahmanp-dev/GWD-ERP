
import { getFinanceOverview } from "@/lib/actions/finance";
import { format } from "date-fns";
import Link from "next/link";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Activity,
    ArrowUpRight,
    ArrowDownLeft
} from "lucide-react";
import CashflowChart from "@/components/finance/cashflow-chart";

export const dynamic = 'force-dynamic';

export default async function FinanceDashboardPage() {
    const data = await getFinanceOverview();
    // Use default empty array for monthlyChart if undefined to prevent crash
    const { financials, recentTransactions, monthlyChart = [] } = data;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finance Overview</h1>
                    <p className="text-gray-500">Company Performance & Cash Flow</p>
                </div>
                <div className="flex space-x-3">
                    <Link href="/finance/invoices" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Manage Invoices
                    </Link>
                    <Link href="/finance/reports" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                        Full Reports
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-full">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-50 rounded-full"> Revenue</span>
                    </div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {financials.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-full">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {financials.expenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Net Income</p>
                    <h3 className={`text-2xl font-bold ${financials.netIncome >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {financials.netIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm border-l-4 border-l-yellow-400">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-yellow-700 px-2 py-1 bg-yellow-100 rounded-full">{financials.outstandingCount} Unpaid</span>
                    </div>
                    <p className="text-sm text-gray-500">Outstanding Invoices</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                        {financials.outstandingInvoices.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visual Analytics */}
                <div className="bg-white p-6 rounded-lg border shadow-sm lg:col-span-2">
                    <h3 className="font-bold text-gray-800 mb-6">Financial Performance</h3>
                    <div className="h-64 w-full relative">
                        {monthlyChart && monthlyChart.length > 0 ? (
                            <CashflowChart data={monthlyChart} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm bg-gray-50 rounded-lg">
                                No financial data available for chart
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Feed */}
                <div className="bg-white rounded-lg border shadow-sm lg:col-span-1 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {recentTransactions.map((t: any) => (
                            <div key={t._id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-full mt-1 ${t.type === 'Inflow' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type === 'Inflow' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{t.description}</p>
                                            <p className="text-xs text-gray-500">{t.project?.title || 'General'}</p>
                                            <p className="text-xs text-gray-400 mt-1">{format(new Date(t.date), 'MMM dd, HH:mm')}</p>
                                        </div>
                                    </div>
                                    <span className={`font-mono font-bold text-sm ${t.type === 'Inflow' ? 'text-green-700' : 'text-red-700'}`}>
                                        {t.type === 'Inflow' ? '+' : '-'}{t.amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {recentTransactions.length === 0 && (
                            <div className="p-8 text-center text-gray-400 text-sm">No recent transactions</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
