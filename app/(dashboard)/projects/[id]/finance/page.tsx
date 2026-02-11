import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import { getProjectLedger } from '@/lib/actions/finance';
import FinanceLedgerTable from '@/components/finance/ledger-table';
import { notFound } from 'next/navigation';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectFinancePage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    const project = await Project.findById(id).lean();
    if (!project) notFound();

    const ledger = await getProjectLedger(id);

    // Calculate Real-time stats from ledger for the "Infographic" cards
    const totalRevenue = project.budget?.revenue || 0;
    const totalSpend = project.budget?.actual || 0;
    const netMargin = totalRevenue - totalSpend;
    const marginPercent = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{project.title} — Finance</h1>
                    <p className="text-gray-500">Financial Ledger & Performance</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${netMargin >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Net Margin: {netMargin >= 0 ? '+' : ''}{netMargin.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
            </div>

            {/* Infographic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Value</p>
                        <h3 className="text-xl font-bold text-gray-900">
                            {(project.budget?.estimated || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-full">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Collected</p>
                        <h3 className="text-xl font-bold text-green-700">
                            {totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Actual Spend</p>
                        <h3 className="text-xl font-bold text-red-700">
                            {totalSpend.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Margin %</p>
                        <h3 className={`text-xl font-bold ${marginPercent >= 20 ? 'text-green-600' : marginPercent > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {marginPercent.toFixed(1)}%
                        </h3>
                    </div>
                </div>
            </div>

            {/* Ledger */}
            <FinanceLedgerTable projectId={id} initialData={ledger} />
        </div>
    );
}
