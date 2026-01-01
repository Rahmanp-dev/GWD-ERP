import FinanceChart from "@/components/finance/finance-chart";
import Link from "next/link";
import { FileText, DollarSign, PieChart, Wallet } from "lucide-react";

export default function FinancePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/finance/invoices" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Invoices</h3>
                                <p className="text-sm text-gray-500">Create & manage invoices</p>
                            </div>
                        </div>
                    </div>
                </Link>
                <Link href="/finance/commissions" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Commissions</h3>
                                <p className="text-sm text-gray-500">Sales incentives</p>
                            </div>
                        </div>
                    </div>
                </Link>
                <Link href="/finance/reports" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <PieChart className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
                                <p className="text-sm text-gray-500">Financial analytics</p>
                            </div>
                        </div>
                    </div>
                </Link>
                <Link href="/finance/new?type=Revenue" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Transaction</h3>
                                <p className="text-sm text-gray-500">Record new entry</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <FinanceChart />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <Link href="/finance/new?type=Revenue" className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Record Revenue</Link>
                        <Link href="/finance/new?type=Expense" className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Record Expense</Link>
                        <Link href="/finance/invoices" className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Invoice</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
