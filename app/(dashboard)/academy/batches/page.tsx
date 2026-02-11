import { getBatches } from "@/lib/actions/academy-batches";
import Link from "next/link";
import { Plus, Calendar, Clock, User, Users } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function BatchesPage() {
    const batches = await getBatches();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Batch Operations</h1>
                    <p className="text-gray-500">Scheduled cohorts and active classes.</p>
                </div>
                <Link href="/academy/batches/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Batch
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch: any) => (
                    <div key={batch._id} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:border-blue-300 transition">
                        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                            <span className="font-semibold text-gray-900">{batch.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium 
                                ${batch.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {batch.status}
                            </span>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                {format(new Date(batch.startDate), 'MMM dd')} - {batch.endDate ? format(new Date(batch.endDate), 'MMM dd, yyyy') : 'Ongoing'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                {batch.schedule?.days?.join(', ')} • {batch.schedule?.time}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                {batch.instructor?.user?.name || "Unassigned"}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                {batch.enrolledStudentCount} / {batch.maxStudents} Students
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 border-t text-center">
                            <Link href={`/academy/batches/${batch._id}`} className="text-xs font-medium text-blue-600 hover:underline">
                                Manage Batch Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {batches.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No scheduled batches found.
                </div>
            )}
        </div>
    );
}
