import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: LeaveRequest } = await import("@/lib/models/LeaveRequest");
        const { default: Employee } = await import("@/lib/models/Employee");
        await import("@/lib/models/User");

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const employeeId = searchParams.get('employeeId');

        const userRole = session.user?.role?.toLowerCase() || "";
        const userId = session.user?.id;

        let query: any = {};

        // Regular employees see only their own leave requests
        if (!['ceo', 'hr manager', 'admin'].includes(userRole)) {
            const employee = await Employee.findOne({ user: userId });
            if (employee) {
                query.employee = employee._id;
            } else {
                return NextResponse.json([]);
            }
        }

        if (status) query.status = status;
        if (employeeId) query.employee = employeeId;

        const leaves = await LeaveRequest.find(query)
            .populate('employee', 'name email department')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json(leaves);
    } catch (e: any) {
        console.error("Leave GET Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: LeaveRequest } = await import("@/lib/models/LeaveRequest");
        const { default: Employee } = await import("@/lib/models/Employee");

        const body = await req.json();
        const { leaveType, startDate, endDate, reason } = body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Find employee record for current user
        const employee = await Employee.findOne({ user: session.user?.id });
        if (!employee) {
            return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
        }

        // Calculate days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const leave = await LeaveRequest.create({
            employee: employee._id,
            leaveType,
            startDate,
            endDate,
            days,
            reason,
            status: 'Pending'
        });

        return NextResponse.json(leave, { status: 201 });
    } catch (e: any) {
        console.error("Leave POST Error:", e);
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userRole = session.user?.role?.toLowerCase() || "";

        // Only HR Manager, CEO, Admin can approve/reject
        if (!['ceo', 'hr manager', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: "Not authorized to approve leaves" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();
        const { default: LeaveRequest } = await import("@/lib/models/LeaveRequest");

        const body = await req.json();
        const { id, action, rejectionReason } = body;

        if (!id || !action) {
            return NextResponse.json({ error: "ID and action required" }, { status: 400 });
        }

        const updateData: any = {};

        if (action === 'approve') {
            updateData.status = 'Approved';
            updateData.approvedBy = session.user?.id;
            updateData.approvedAt = new Date();
        } else if (action === 'reject') {
            updateData.status = 'Rejected';
            updateData.approvedBy = session.user?.id;
            updateData.rejectionReason = rejectionReason || 'No reason provided';
        } else if (action === 'cancel') {
            updateData.status = 'Cancelled';
        }

        const leave = await LeaveRequest.findByIdAndUpdate(id, updateData, { new: true })
            .populate('employee', 'name email')
            .populate('approvedBy', 'name');

        return NextResponse.json(leave);
    } catch (e: any) {
        console.error("Leave PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
