import Sidebar from "@/components/layout/sidebar";
import NotificationBell from "@/components/layout/notification-bell";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center py-4 px-6 bg-white border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800">Overview</h2>
                    <div className="flex items-center space-x-4">
                        <NotificationBell />
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
