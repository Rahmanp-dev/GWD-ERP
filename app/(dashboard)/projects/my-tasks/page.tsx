import { CheckSquare, Filter, Clock } from 'lucide-react';

export default function MyTasksPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                <p className="text-gray-500">Focus on what's assigned to you. Sort by priority and due date.</p>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex space-x-2">
                        <button className="px-3 py-1.5 bg-white border rounded text-sm text-gray-700 font-medium shadow-sm hover:bg-gray-50">
                            Due Today
                        </button>
                        <button className="px-3 py-1.5 bg-white border rounded text-sm text-gray-700 font-medium shadow-sm hover:bg-gray-50">
                            High Priority
                        </button>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                <div className="divide-y divide-gray-200">
                    {/* Mock Task 1 */}
                    <div className="p-4 hover:bg-gray-50 flex items-start gap-4">
                        <div className="mt-1">
                            <input type="checkbox" className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">Review final designs for Q3 Campaign</h3>
                            <p className="text-xs text-gray-500 mt-1">Marketing Revamp • Due Today</p>
                        </div>
                        <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded">
                            High
                        </span>
                    </div>
                    {/* Mock Task 2 */}
                    <div className="p-4 hover:bg-gray-50 flex items-start gap-4">
                        <div className="mt-1">
                            <input type="checkbox" className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">Update budget spreadsheet</h3>
                            <p className="text-xs text-gray-500 mt-1">Operations • Due Tomorrow</p>
                        </div>
                        <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded">
                            Normal
                        </span>
                    </div>
                </div>
                <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 border-t">
                    Showing 2 of 2 tasks
                </div>
            </div>
        </div>
    );
}
