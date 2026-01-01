import Link from 'next/link';
import { LayoutDashboard, Users, Target, BarChart2, Briefcase, Zap } from 'lucide-react';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-full">
            {/* Sales Control Sub-Navigation */}
            <div className="bg-white border-b border-gray-200 px-6 py-2">
                <div className="flex space-x-1 overflow-x-auto">
                    <NavLink href="/sales" icon={LayoutDashboard} label="Control Tower" />
                    <NavLink href="/sales/pipeline" icon={Target} label="Pipeline Governance" />
                    <NavLink href="/sales/performance" icon={BarChart2} label="Team Performance" />
                    <NavLink href="/sales/accounts" icon={Briefcase} label="Territory & Accounts" />
                    <NavLink href="/finance/commissions" icon={Zap} label="Incentives" />
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
