"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
    isRead: boolean;
    relatedEntity?: {
        type: string;
        id: string;
    };
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications?unreadOnly=true");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAllRead = async () => {
        setLoading(true);
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true })
            });
            setNotifications([]);
        } catch (error) {
            console.error("Failed to mark notifications read", error);
        } finally {
            setLoading(false);
        }
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                disabled={loading}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                            >
                                <CheckCheck className="w-4 h-4 mr-1" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                <Check className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                All caught up!
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm text-gray-900">{notif.title}</div>
                                            <div className="text-xs text-gray-500 mt-1">{notif.message}</div>
                                            <div className="text-xs text-gray-400 mt-2">
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        {notif.relatedEntity && (
                                            <Link
                                                href={`/crm/pipeline`}
                                                className="ml-2 p-1 text-gray-400 hover:text-blue-600"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
