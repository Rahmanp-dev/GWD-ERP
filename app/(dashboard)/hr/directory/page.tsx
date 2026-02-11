import { getEmployees } from "@/lib/actions/hr";
import { Search, UserPlus, Mail, Phone, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function EmployeeDirectoryPage() {
    const employees = await getEmployees();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
                    <p className="text-sm text-gray-500">{employees.length} Active Employees</p>
                </div>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" /> Add Employee
                </button>
            </div>

            {/* Search/Filter Bar (Visual Only for now) */}
            <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Search employees..." className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <select className="border rounded-md px-3 py-2 text-sm bg-white">
                    <option>All Departments</option>
                    <option>Sales</option>
                    <option>Engineering</option>
                    <option>HR</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((emp: any) => (
                    <div key={emp._id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center relative group">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-2xl font-bold text-gray-500">
                            {emp.user?.name?.charAt(0) || '?'}
                        </div>

                        <h3 className="font-bold text-gray-900">{emp.user?.name || 'Unknown'}</h3>
                        <p className="text-sm text-blue-600 font-medium mb-1">{emp.position}</p>
                        <p className="text-xs text-gray-500 mb-4">{emp.department} • Joined {emp.dateJoined ? format(new Date(emp.dateJoined), 'MMM yyyy') : 'N/A'}</p>

                        <div className="w-full flex justify-center space-x-4 border-t pt-4">
                            <a href={`mailto:${emp.user?.email}`} className="text-gray-500 hover:text-blue-600 flex items-center text-xs">
                                <Mail className="w-3 h-3 mr-1" /> Email
                            </a>
                            {emp.phone && (
                                <a href={`tel:${emp.phone}`} className="text-gray-500 hover:text-green-600 flex items-center text-xs">
                                    <Phone className="w-3 h-3 mr-1" /> Call
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {employees.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-gray-400">
                        No employees found. Hire someone from Recruitment module!
                    </div>
                )}
            </div>
        </div>
    );
}
