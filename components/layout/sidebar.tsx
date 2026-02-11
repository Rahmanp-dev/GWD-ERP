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
    Calendar,
    Shield,
    GraduationCap,
    BookOpen,
    CheckSquare,
    Gauge
} from "lucide-react";
import { signOut } from "next-auth/react";

// Role-specific navigation configurations
const roleNavConfigs: Record<string, any[]> = {
    ceo: [
        { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
        { href: "/kpi", label: "KPI Board", icon: Gauge },
        { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
        { href: "/calendar", label: "Calendar", icon: Calendar },
        { href: "/crm", label: "Sales", icon: Target },
        { href: "/projects", label: "Projects", icon: Briefcase },
        { href: "/finance", label: "Finance", icon: DollarSign },
        { href: "/academy", label: "Academy", icon: GraduationCap },
        { href: "/hr", label: "HR", icon: UserCheck },
        { href: "/admin/daily-reports", label: "Daily Reports", icon: FileText },
        { href: "/admin", label: "Admin", icon: Settings },
    ],
    cmo: [
        { href: "/dashboard", label: "Sales Overview", icon: LayoutDashboard },
        { href: "/kpi", label: "KPI Board", icon: Gauge },
        { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
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
    "head of sales": [
        { href: "/dashboard", label: "Team Dashboard", icon: LayoutDashboard },
        { href: "/kpi", label: "KPI Board", icon: Gauge },
        { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
        { href: "/crm", label: "Pipeline", icon: Target },
        { href: "/crm/manager", label: "Team View", icon: Users },
        { href: "/crm/dashboard", label: "Analytics", icon: BarChart3 },
        { href: "/finance/commissions", label: "Incentives", icon: Wallet },
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
        { href: "/operations", label: "Ops Dashboard", icon: LayoutDashboard },
        { href: "/operations/projects", label: "Projects & Health", icon: Briefcase },
        { href: "/operations/performance", label: "PM Performance", icon: Activity },
        { href: "/operations/resources", label: "Resources", icon: Users },
        { href: "/ops/contracts", label: "Contracts", icon: FileText },
        { href: "/operations/governance", label: "Governance", icon: Shield },
    ],
    "operations manager": [
        { href: "/operations", label: "Ops Dashboard", icon: LayoutDashboard },
        { href: "/operations/projects", label: "Projects & Health", icon: Briefcase },
        { href: "/operations/performance", label: "PM Performance", icon: Activity },
        { href: "/operations/resources", label: "Resources", icon: Users },
        { href: "/ops/contracts", label: "Contracts", icon: FileText },
        { href: "/operations/governance", label: "Governance", icon: Shield },
    ],
    cfo: [
        { href: "/dashboard", label: "Finance Dashboard", icon: LayoutDashboard },
        { href: "/kpi", label: "KPI Board", icon: Gauge },
        { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
        { href: "/finance", label: "Finance", icon: DollarSign },
        { href: "/finance/commissions", label: "Commissions", icon: Wallet },
        { href: "/finance/reports", label: "Reports", icon: BarChart3 },
        { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
    ],
    "hr manager": [
        { href: "/hr/dashboard", label: "HR Dashboard", icon: LayoutDashboard },
        { href: "/hr/freelancers", label: "Talent Pool", icon: Briefcase },
        { href: "/hr/employees", label: "Employees", icon: Users },
        { href: "/hr/recruitment", label: "Recruitment", icon: Target },
        { href: "/hr/attendance", label: "Attendance", icon: Activity },
        { href: "/hr/performance", label: "Performance", icon: UserCheck },
    ],
    "academy head": [
        { href: "/academy", label: "Academy HQ", icon: GraduationCap },
        { href: "/kpi", label: "KPI Board", icon: Gauge },
        { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
        { href: "/academy/courses", label: "Courses", icon: BookOpen },
        { href: "/academy/instructors", label: "Instructors", icon: Users },
        { href: "/finance", label: "Financials", icon: DollarSign },
        { href: "/hr", label: "HR", icon: UserCheck },
    ],
    "program director": [
        { href: "/academy", label: "Academy HQ", icon: GraduationCap },
        { href: "/academy/courses", label: "Courses", icon: BookOpen },
        { href: "/academy/syllabus", label: "Syllabus", icon: FileText },
        { href: "/academy/instructors", label: "Faculty", icon: Users },
    ],
    "academy ops manager": [
        { href: "/academy", label: "Academy Ops", icon: GraduationCap },
        { href: "/academy/batches", label: "Batches", icon: Calendar },
        { href: "/academy/students", label: "Students", icon: Users },
        { href: "/academy/instructors", label: "Faculty", icon: Users },
    ],
    "instructor": [
        { href: "/academy/portal", label: "My Portal", icon: GraduationCap },
        { href: "/academy/my-courses", label: "My Courses", icon: BookOpen },
        { href: "/academy/my-batches", label: "My Batches", icon: Calendar },
    ],
    admin: [
        { href: "/dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
        { href: "/calendar", label: "Calendar", icon: Calendar },
        { href: "/crm", label: "CRM", icon: Target },
        { href: "/projects", label: "Projects", icon: Briefcase },
        { href: "/academy", label: "Academy", icon: GraduationCap },
        { href: "/hr", label: "HR", icon: UserCheck },
        { href: "/finance", label: "Finance", icon: DollarSign },
        { href: "/admin/daily-reports", label: "System Reports", icon: FileText },
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
        <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 shadow-sm">
            {/* Logo Header */}
            <div className="flex items-center justify-center h-16 border-b border-gray-100 px-4">
                <img src="/gwdlogonobg.png" alt="GWD" className="h-35 w-auto" />
            </div>

            {/* Navigation */}
            <div className="flex flex-col flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link: any) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href ||
                        (link.href !== "/dashboard" && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href + link.label}
                            href={link.href}
                            className={clsx(
                                "flex items-center px-4 py-2.5 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-red-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="mb-3 text-sm">
                    <p className="font-semibold text-gray-900">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium uppercase bg-red-100 text-red-600 rounded">
                        {session?.user?.role}
                    </span>
                </div>
                <button
                    onClick={() => signOut()}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}


