import Link from "next/link";
import { Users, FileText, BarChart3 } from "lucide-react";

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
            <p className="text-gray-600">System settings and user management.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/users" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">User Management</h3>
                                <p className="text-sm text-gray-500">Manage users and roles.</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/audit-logs" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Audit Logs</h3>
                                <p className="text-sm text-gray-500">View system activity trail.</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/finance/reports" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Reports</h3>
                                <p className="text-sm text-gray-500">Analytics and reporting.</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
