import { auth } from "@/auth";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
    const session = await auth();
    let employees = [];

    try {
        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: Employee } = await import("@/lib/models/Employee");
        employees = await Employee.find({}).sort({ name: 1 });
    } catch (e) {
        console.error("Failed to fetch employees:", e);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                <Link href="/hr/employees/new" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add Employee</Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((e) => (
                            <tr key={e._id.toString()}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{e.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.position}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.status}</td>
                            </tr>
                        ))}
                        {employees.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No employees found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
