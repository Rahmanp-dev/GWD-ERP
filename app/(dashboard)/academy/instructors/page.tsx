import { getInstructors } from "@/lib/actions/academy";
import Link from "next/link";
import { Plus, Users, Star, Award } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function InstructorsPage() {
    const instructors = await getInstructors();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Faculty & Instructors</h1>
                    <p className="text-gray-500">Manage your teaching talent pool.</p>
                </div>
                <Link href="/academy/instructors/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Onboard Instructor
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrics</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {instructors.map((i: any) => (
                            <tr key={i._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                                            {i.user?.image ? <img src={i.user.image} alt="" /> : <Users className="w-5 h-5" />}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{i.user?.name || "Unknown"}</div>
                                            <div className="text-xs text-gray-500">{i.headline}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {i.expertise?.slice(0, 3).map((s: string) => (
                                            <span key={s} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${i.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            i.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {i.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center space-x-3">
                                        <span className="flex items-center"><Star className="w-3 h-3 mr-1 text-yellow-500" /> {i.rating || 0}</span>
                                        <span className="flex items-center"><Award className="w-3 h-3 mr-1 text-blue-500" /> {i.batchesCompleted || 0} Batches</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/academy/instructors/${i._id}`} className="text-blue-600 hover:text-blue-900">
                                        Manage
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {instructors.length === 0 && (
                    <div className="p-12 text-center text-gray-500">No instructors found.</div>
                )}
            </div>
        </div>
    );
}
