import Link from "next/link";
import { Users, UserCheck, Clock } from "lucide-react";

export default function HRPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
            <p className="text-gray-600">Employee records, attendance, and recruitment.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/hr/employees" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Employees</h3>
                                <p className="text-sm text-gray-500">Manage employee database.</p>
                            </div>
                        </div>
                    </div>
                </Link>
                <Link href="/hr/attendance" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Attendance</h3>
                                <p className="text-sm text-gray-500">View attendance logs.</p>
                            </div>
                        </div>
                    </div>
                </Link>
                <Link href="/hr/recruitment" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-pink-100 text-pink-600 rounded-full group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Recruitment</h3>
                                <p className="text-sm text-gray-500">Manage candidate pipeline.</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
