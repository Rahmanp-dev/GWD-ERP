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
    UserCheck,
    BarChart3,
    Target,
    Wallet,
    FileText,
    Activity,
    Calendar
} from "lucide-react";
import { signOut } from "next-auth/react";

// Role-specific navigation configurations
const roleNavConfigs: Record<string, any[]> = {
    ceo: [
        { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
        { href: "/calendar", label: "Calendar", icon: Calendar },
        { href: "/crm", label: "Sales", icon: Target },
        { href: "/projects", label: "Projects", icon: Briefcase },
        { href: "/finance", label: "Finance", icon: DollarSign },
        { href: "/hr", label: "HR", icon: UserCheck },
        { href: "/admin", label: "Admin", icon: Settings },
    ],
    cmo: [
        { href: "/dashboard", label: "Sales Overview", icon: LayoutDashboard },
        { href: "/crm", label: "Pipeline", icon: Target },
        { href: "/crm/manager", label: "Team", icon: Users },
        { href: "/finance/commissions", label: "Commissions", icon: Wallet },
    ],
    "sales manager": [
        { href: "/dashboard", label: "Team Dashboard", icon: LayoutDashboard },
        { href: "/crm", label: "Pipeline", icon: Target },
        { href: "/crm/manager", label: "Team View", icon: Users },
        { href: "/crm/dashboard", label: "Analytics", icon: BarChart3 },
    ],
    salesperson: [
        { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
        { href: "/crm/pipeline", label: "My Pipeline", icon: Target },
        { href: "/crm/contacts", label: "Contacts", icon: Users },
        { href: "/finance/commissions", label: "Incentives", icon: Wallet },
    ],
    "project manager": [
        { href: "/dashboard", label: "PM Dashboard", icon: LayoutDashboard },
        { href: "/projects", label: "Projects", icon: Briefcase },
        { href: "/finance/reports", label: "Reports", icon: FileText },
    ],
    pm: [
        { href: "/dashboard", label: "PM Dashboard", icon: LayoutDashboard },
        { href: "/projects", label: "Projects", icon: Briefcase },
        { href: "/finance/reports", label: "Reports", icon: FileText },
    ],
    ops: [
        { href: "/dashboard", label: "Ops Dashboard", icon: LayoutDashboard },
        { href: "/projects", label: "Workflows", icon: Activity },
        { href: "/hr/employees", label: "Resources", icon: Users },
    ],
    "operations manager": [
        { href: "/dashboard", label: "Ops Dashboard", icon: LayoutDashboard },
        { href: "/projects", label: "Workflows", icon: Activity },
        { href: "/hr/employees", label: "Resources", icon: Users },
    ],
    cfo: [
        { href: "/dashboard", label: "Finance Dashboard", icon: LayoutDashboard },
        { href: "/finance", label: "Finance", icon: DollarSign },
        { href: "/finance/commissions", label: "Commissions", icon: Wallet },
        { href: "/finance/reports", label: "Reports", icon: BarChart3 },
        { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
    ],
    "hr manager": [
        { href: "/dashboard", label: "HR Dashboard", icon: LayoutDashboard },
        { href: "/hr", label: "HR Hub", icon: UserCheck },
        { href: "/hr/employees", label: "Employees", icon: Users },
        { href: "/hr/attendance", label: "Attendance", icon: Activity },
        { href: "/hr/leave", label: "Leave", icon: Target },
        { href: "/hr/recruitment", label: "Recruitment", icon: Target },
    ],
    admin: [
        { href: "/dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
        { href: "/calendar", label: "Calendar", icon: Calendar },
        { href: "/crm", label: "CRM", icon: Target },
        { href: "/projects", label: "Projects", icon: Briefcase },
        { href: "/hr", label: "HR", icon: UserCheck },
        { href: "/finance", label: "Finance", icon: DollarSign },
        { href: "/admin", label: "Admin", icon: Settings },
    ],
};

// Default navigation for unknown roles
const defaultNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role?.toLowerCase() || "";

    // Get role-specific navigation or default
    const links = roleNavConfigs[role] || defaultNav;

    return (
        <div className="flex flex-col h-screen w-64 bg-gray-900 text-white border-r border-gray-800">
            <div className="flex items-center justify-center h-16 border-b border-gray-800">
                <h1 className="text-xl font-bold">GWD ERP</h1>
            </div>

            <div className="flex flex-col flex-1 p-4 space-y-2 overflow-y-auto">
                {links.map((link: any) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href ||
                        (link.href !== "/dashboard" && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href + link.label}
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
                    <p className="text-xs uppercase mt-1 text-blue-400">{session?.user?.role}</p>
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
