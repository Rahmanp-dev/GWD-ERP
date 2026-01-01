import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { Star, TrendingUp, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PerformancePage() {
    await dbConnect();

    // Fetch users for performance review (e.g., active employees)
    const employees = await User.find({
        role: { $nin: ['User', 'Candidate'] },
        employeeStatus: 'Active'
    }).sort({ performanceRating: 1 }).limit(10).lean();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Performance Management</h1>
                <p className="text-gray-500">Appraisals, skill matrix, and career development plans.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Watchlist (Low Rating) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        Performance Watchlist (Rating &lt; 3)
                    </h2>
                    <div className="space-y-3">
                        {employees.filter((e: any) => (e.performanceRating || 0) < 3).map((emp: any) => (
                            <div key={emp._id} className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                    <p className="text-xs text-red-700">{emp.jobTitle}</p>
                                </div>
                                <span className="text-sm font-bold text-red-700">{emp.performanceRating}/5</span>
                            </div>
                        ))}
                        {employees.filter((e: any) => (e.performanceRating || 0) < 3).length === 0 && (
                            <p className="text-sm text-gray-500 italic">No employees flagged for low performance.</p>
                        )}
                    </div>
                </div>

                {/* Top Talent */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Star className="w-5 h-5 text-yellow-500 mr-2" />
                        Top Talent (Rating 5)
                    </h2>
                    <div className="space-y-3">
                        {employees.filter((e: any) => (e.performanceRating || 0) >= 5).map((emp: any) => (
                            <div key={emp._id} className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                    <p className="text-xs text-yellow-700">{emp.jobTitle}</p>
                                </div>
                                <span className="text-sm font-bold text-yellow-700">5.0/5</span>
                            </div>
                        ))}
                        {employees.filter((e: any) => (e.performanceRating || 0) >= 5).length === 0 && (
                            <p className="text-sm text-gray-500 italic">No employees with top rating yet.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center col-span-1 lg:col-span-2">
                    <div className="p-4 bg-purple-50 rounded-full mb-4">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Skill Matrix</h3>
                    <p className="text-gray-500 mt-2">Team capabilities visualization.</p>
                </div>
            </div>
        </div>
    );
}
