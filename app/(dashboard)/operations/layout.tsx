import { Shield, BarChart2, Users, AlertTriangle, Layers, Clock, Activity, FileText } from 'lucide-react';
import Link from 'next/link';

export default function OperationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { name: 'Dashboard', href: '/operations', icon: Shield },
        { name: 'Projects', href: '/operations/projects', icon: Layers },
        { name: 'PM Performance', href: '/operations/performance', icon: Activity },
        { name: 'Resources', href: '/operations/resources', icon: Users },
        { name: 'Approvals', href: '/operations/approvals', icon: Clock },
        { name: 'Escalations', href: '/operations/escalations', icon: AlertTriangle },
        { name: 'Reports', href: '/operations/reports', icon: BarChart2 },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Ops Sub-navigation */}
            <div className="bg-white border-b px-6 py-3 flex items-center space-x-6 overflow-x-auto shadow-sm sticky top-0 z-10">
                <div className="flex items-center text-red-600 font-bold mr-4 shrink-0">
                    <Shield className="w-5 h-5 mr-2" />
                    OPS CONTROL
                </div>
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors whitespace-nowrap"
                    >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.name}
                    </Link>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-auto">
                {children}
            </div>
        </div>
    );
}
