import { CheckSquare, User, FileText } from 'lucide-react';

export default function OnboardingPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Onboarding Tracker</h1>
                <p className="text-gray-500">Track progress of new joiners.</p>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Joiner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
                                        JD
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">John Doe</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 15, 2026</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Engineering</td>
                            <td className="px-6 py-4 whitespace-nowrap align-middle">
                                <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Pre-boarding
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="p-8 text-center text-gray-500 text-sm border-t">
                    No other active onboarding tasks.
                </div>
            </div>
        </div>
    );
}
