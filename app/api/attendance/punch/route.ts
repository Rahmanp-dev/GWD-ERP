import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();

        const { default: Employee } = await import("@/lib/models/Employee");
        const { default: Attendance } = await import("@/lib/models/Attendance");

        // Find employee linked to user
        let employee = await Employee.findOne({ user: session.user?.id });

        // Auto-create employee record if not found
        if (!employee) {
            employee = await Employee.create({
                name: session.user?.name || "Unknown",
                email: session.user?.email,
                department: "General",
                position: session.user?.role || "Employee",
                user: session.user?.id,
                dateOfJoining: new Date(),
                status: "Active"
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find today's attendance
        let attendance = await Attendance.findOne({ employee: employee._id, date: today });

        const now = new Date();

        if (!attendance) {
            // Clock In
            attendance = await Attendance.create({
                employee: employee._id,
                date: today,
                checkIn: now,
                status: 'Present'
            });
            return NextResponse.json({ message: "Clocked In", data: attendance });
        } else if (!attendance.checkOut) {
            // Clock Out
            attendance.checkOut = now;
            await attendance.save();
            return NextResponse.json({ message: "Clocked Out", data: attendance });
        } else {
            return NextResponse.json({ message: "Already clocked out today" }, { status: 400 });
        }
    } catch (e: any) {
        console.error("Attendance Punch Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    return NextResponse.json({ status: "ok" });
}
