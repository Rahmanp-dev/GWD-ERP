import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const session = await auth();
        const role = session?.user?.role?.toLowerCase();
        if (role !== "ceo" && role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();

        const { default: User } = await import("@/lib/models/User");

        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error: any) {
        console.error("Admin Users GET Error:", error);
        return NextResponse.json([]);
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        const userRole = session?.user?.role?.toLowerCase();
        if (userRole !== "ceo" && userRole !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();

        const body = await req.json();
        const { id, role } = body;

        if (!id || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { default: User } = await import("@/lib/models/User");
        const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
        return NextResponse.json(user);
    } catch (e: any) {
        console.error("Admin Users PUT Error:", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Allow CEO or Admin roles (case-insensitive)
        const userRole = session?.user?.role?.toLowerCase();
        if (userRole !== "ceo" && userRole !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();

        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { default: User } = await import("@/lib/models/User");

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const { default: bcrypt } = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/ /g, '')}`
        });

        return NextResponse.json({ message: "User created successfully", user: { id: newUser._id, email: newUser.email } });

    } catch (e: any) {
        console.error("Admin Users POST Error:", e);
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}
