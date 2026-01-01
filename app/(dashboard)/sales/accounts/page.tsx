import { Map, Shield, Users } from 'lucide-react';

export default function AccountsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Territory & Account Control</h1>
                <p className="text-gray-500">Manage account ownership, territories, and protection rules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center h-64">
                    <div className="p-4 bg-blue-50 rounded-full mb-4">
                        <Map className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Territory Map</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">Geographic and industry-based assignment rules coming soon.</p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                        Configure Territories
                    </button>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center h-64">
                    <div className="p-4 bg-green-50 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Protected Accounts</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">Define key accounts that are locked to specific senior reps.</p>
                    <button className="mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                        View Protected List
                    </button>
                </div>
            </div>
        </div>
    );
}
