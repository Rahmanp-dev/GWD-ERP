import Link from "next/link";
import { Users, Briefcase } from "lucide-react";

export default function CRMDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">CRM Module</h1>
            <p className="text-gray-600">Manage your relationships, sales pipeline, and deals.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/crm/pipeline" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Sales Pipeline</h3>
                                <p className="text-sm text-gray-500">View and manage your leads board.</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/crm/contacts" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Contacts</h3>
                                <p className="text-sm text-gray-500">Manage all your customer contacts.</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/crm/dashboard" className="group">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Sales Dashboard</h3>
                                <p className="text-sm text-gray-500">KPIs, analytics, and pipeline insights.</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
