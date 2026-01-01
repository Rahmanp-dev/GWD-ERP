"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { clsx } from "clsx";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    DollarSign,
    Settings,
    LogOut,
    UserCheck
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role;

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [] }, // All
        { href: "/crm", label: "CRM", icon: Users, roles: ["CEO", "Sales Manager", "Salesperson", "Admin", "admin"] },
        { href: "/projects", label: "Projects", icon: Briefcase, roles: ["CEO", "Project Manager", "Ops", "Admin", "admin"] },
        { href: "/hr", label: "HR", icon: UserCheck, roles: ["CEO", "HR Manager", "CFO", "Admin", "admin"] },
        { href: "/finance", label: "Finance", icon: DollarSign, roles: ["CEO", "CFO", "Admin", "admin"] },
        { href: "/admin", label: "Admin", icon: Settings, roles: ["CEO", "Admin", "admin"] },
    ];

    return (
        <div className="flex flex-col h-screen w-64 bg-gray-900 text-white border-r border-gray-800">
            <div className="flex items-center justify-center h-16 border-b border-gray-800">
                <h1 className="text-xl font-bold">GWD ERP</h1>
            </div>

            <div className="flex flex-col flex-1 p-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    if (link.roles.length > 0 && role && !link.roles.includes(role)) {
                        return null;
                    }

                    const Icon = link.icon;
                    const isActive = pathname.startsWith(link.href);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "flex items-center px-4 py-2 rounded-md transition-colors",
                                isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {link.label}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-800">
                <div className="mb-4 text-sm text-gray-400">
                    <p className="font-semibold text-white">{session?.user?.name}</p>
                    <p className="text-xs">{session?.user?.email}</p>
                    <p className="text-xs uppercase mt-1 text-blue-400">{role}</p>
                </div>
                <button
                    onClick={() => signOut()}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-400 rounded-md hover:bg-gray-800 hover:text-white"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
