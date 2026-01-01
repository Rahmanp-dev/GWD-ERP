import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { Mail, Phone, MoreHorizontal, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getEmployees(filter?: string) {
    await dbConnect();

    let query: any = { role: { $nin: ['User', 'Candidate'] } };

    if (filter === 'risk') {
        query.attritionRisk = 'High';
    } else if (filter === 'new') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query.joinDate = { $gt: thirtyDaysAgo };
    }

    const employees = await User.find(query).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(employees));
}

export default async function EmployeesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
    const params = await searchParams;
    const employees = await getEmployees(params.filter);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
                    <p className="text-gray-500">{employees.length} Active Employees</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {employees.map((emp: any) => (
                    <div key={emp._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6 text-center">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-500 font-bold text-2xl">
                                {emp.image ? <img src={emp.image} alt={emp.name} className="w-full h-full rounded-full object-cover" /> : emp.name?.charAt(0)}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 truncate">{emp.name}</h3>
                            <p className="text-sm text-blue-600 mb-1">{emp.jobTitle || emp.role}</p>
                            <p className="text-xs text-gray-500 uppercase">{emp.department || 'General'}</p>

                            {emp.attritionRisk === 'High' && (
                                <div className="mt-3 inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Retention Risk
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-around border-t border-gray-100">
                            <button className="text-gray-500 hover:text-gray-700"><Mail className="w-5 h-5" /></button>
                            <button className="text-gray-500 hover:text-gray-700"><Phone className="w-5 h-5" /></button>
                            <button className="text-gray-500 hover:text-gray-700"><MoreHorizontal className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
