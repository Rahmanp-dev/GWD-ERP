import Link from 'next/link';
import { LayoutDashboard, List, Users, FileText, CheckSquare, MessageSquare } from 'lucide-react';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-full">
            {/* Project Delivery Sub-Navigation */}
            <div className="bg-white border-b border-gray-200 px-6 py-2">
                <div className="flex space-x-1 overflow-x-auto">
                    <NavLink href="/projects/dashboard" icon={LayoutDashboard} label="PM Dashboard" />
                    <NavLink href="/projects" icon={List} label="All Projects" />
                    <NavLink href="/projects/my-tasks" icon={CheckSquare} label="My Tasks" />
                    <NavLink href="/hr/employees" icon={Users} label="Team" />
                    <NavLink href="/projects/client-portal" icon={MessageSquare} label="Client Portal" />
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

function NavLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link href={href} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors whitespace-nowrap">
            <Icon className="w-4 h-4 mr-2" />
            {label}
        </Link>
    );
}
