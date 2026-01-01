import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { default: dbConnect } = await import("@/lib/db");
        await dbConnect();

        const { default: User } = await import("@/lib/models/User");

        const existingAdmin = await User.findOne({ email: "admin@example.com" });
        if (existingAdmin) {
            return NextResponse.json({ message: "Admin user already exists. Login with admin@example.com / password123" });
        }

        const hashedPassword = await bcrypt.hash("password123", 10);

        const admin = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: hashedPassword,
            role: "CEO", // Highest privilege
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        });

        return NextResponse.json({
            message: "Admin user created successfully!",
            credentials: { email: "admin@example.com", password: "password123" }
        });

    } catch (e: any) {
        console.error("Seed Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
