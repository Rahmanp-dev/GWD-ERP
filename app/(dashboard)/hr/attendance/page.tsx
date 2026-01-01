import dbConnect from '@/lib/db';
import LeaveRequest from '@/lib/models/LeaveRequest';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
    await dbConnect();

    // Fetch pending leave requests
    const pendingLeaves = await LeaveRequest.find({ status: 'Pending' })
        .populate('employee', 'name jobTitle image')
        .sort({ startDate: 1 })
        .lean();

    // Mock stats
    const onLeaveCount = await LeaveRequest.countDocuments({
        status: 'Approved',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance & Leave</h1>
                    <p className="text-gray-500">Manage time off, approvals, and daily presence.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        On Leave Today: <span className="font-bold">{onLeaveCount}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Approvals */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <Clock className="w-5 h-5 text-orange-500 mr-2" />
                            Pending Leave Requests
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {pendingLeaves.map((request: any) => (
                            <div key={request._id} className="p-4 hover:bg-gray-50 flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                                        {request.employee?.image ? (
                                            <img src={request.employee.image} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-gray-500 font-bold">{request.employee?.name?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{request.employee?.name}</p>
                                        <p className="text-xs text-gray-500">{request.leaveType} • {request.days} Days</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pendingLeaves.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No pending requests.
                            </div>
                        )}
                    </div>
                </div>

                {/* Timesheet / Mock Calendar Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                        Team Calendar
                    </h2>
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">Enterpirse Calendar Integration Required</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
