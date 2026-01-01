import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import { Activity, TrendingUp, AlertCircle, CheckSquare } from 'lucide-react';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

async function getPMStats() {
    await dbConnect();

    // Fetch all projects with manager details
    const projects = await Project.find({ status: { $ne: 'Cancelled' } })
        .populate('manager', 'name email avatar')
        .lean();

    const pmStats: Record<string, any> = {};

    projects.forEach((project: any) => {
        if (!project.manager?._id) return;

        const managerId = project.manager._id.toString();

        if (!pmStats[managerId]) {
            pmStats[managerId] = {
                manager: project.manager,
                projectsCount: 0,
                activeProjects: 0,
                completedProjects: 0,
                healthStats: { Green: 0, Yellow: 0, Red: 0 },
                budgetVarianceSum: 0,
                projectsWithBudget: 0
            };
        }

        const stats = pmStats[managerId];
        stats.projectsCount++;
        if (project.status === 'Active') stats.activeProjects++;
        if (project.status === 'Completed') stats.completedProjects++;

        if (project.health) {
            stats.healthStats[project.health] = (stats.healthStats[project.health] || 0) + 1;
        }

        // Simple budget variance calc (Estimated vs Actual)
        if (project.budget?.estimated > 0) {
            const variance = ((project.budget.actual - project.budget.estimated) / project.budget.estimated) * 100;
            stats.budgetVarianceSum += variance;
            stats.projectsWithBudget++;
        }
    });

    return Object.values(pmStats).map(stat => ({
        ...stat,
        avgBudgetVariance: stat.projectsWithBudget > 0 ? (stat.budgetVarianceSum / stat.projectsWithBudget).toFixed(1) : 0,
        riskScore: (stat.healthStats.Red * 3) + (stat.healthStats.Yellow * 1) // Simple risk calculation
    }));
}

export default async function PMPerformancePage() {
    const pmStats = await getPMStats();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">PM Performance Scorecards</h1>
                <p className="text-gray-500">Track project manager effectiveness, delivery health, and budget adherence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pmStats.map((pm: any) => (
                    <div key={pm.manager._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {pm.manager.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{pm.manager.name}</h3>
                                <p className="text-sm text-gray-500">{pm.activeProjects} Active Projects</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xs text-blue-600 font-medium uppercase mb-1">Total Projects</div>
                                    <div className="text-2xl font-bold text-blue-900">{pm.projectsCount}</div>
                                </div>
                                <div className={`p-3 rounded-lg ${Number(pm.avgBudgetVariance) > 10 ? 'bg-red-50' : 'bg-green-50'}`}>
                                    <div className={`text-xs font-medium uppercase mb-1 ${Number(pm.avgBudgetVariance) > 10 ? 'text-red-600' : 'text-green-600'}`}>
                                        Budget Var.
                                    </div>
                                    <div className={`text-2xl font-bold ${Number(pm.avgBudgetVariance) > 10 ? 'text-red-900' : 'text-green-900'}`}>
                                        {Number(pm.avgBudgetVariance) > 0 ? '+' : ''}{pm.avgBudgetVariance}%
                                    </div>
                                </div>
                            </div>

                            {/* Portfolio Health */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                    <Activity className="w-4 h-4 mr-2" /> Portfolio Health
                                </h4>
                                <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                                    {pm.healthStats.Green > 0 && (
                                        <div style={{ flex: pm.healthStats.Green }} className="bg-green-500" title={`Green: ${pm.healthStats.Green}`} />
                                    )}
                                    {pm.healthStats.Yellow > 0 && (
                                        <div style={{ flex: pm.healthStats.Yellow }} className="bg-yellow-400" title={`Yellow: ${pm.healthStats.Yellow}`} />
                                    )}
                                    {pm.healthStats.Red > 0 && (
                                        <div style={{ flex: pm.healthStats.Red }} className="bg-red-500" title={`Red: ${pm.healthStats.Red}`} />
                                    )}
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>{pm.healthStats.Green} Healthy</span>
                                    <span>{pm.healthStats.Yellow + pm.healthStats.Red} At Risk</span>
                                </div>
                            </div>

                            {/* Operational Stats */}
                            <div className="space-y-3 pt-3 border-t">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 text-orange-500" /> Risk Score
                                    </span>
                                    <span className={`font-medium ${pm.riskScore > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {pm.riskScore}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {pmStats.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                    <p className="text-gray-500">No project managers found with active projects.</p>
                </div>
            )}
        </div>
    );
}
