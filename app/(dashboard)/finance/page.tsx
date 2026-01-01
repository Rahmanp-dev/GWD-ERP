import FinanceChart from "@/components/finance/finance-chart";
import Link from "next/link";
import { auth } from "@/auth";

export default function FinancePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <FinanceChart />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <Link href="/finance/new?type=Revenue" className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Record Revenue</Link>
                        <Link href="/finance/new?type=Expense" className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Record Expense</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
