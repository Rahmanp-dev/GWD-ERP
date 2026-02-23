"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

const ROLES = ['CEO', 'CMO', 'CFO', 'Ops', 'HR Manager', 'Sales Manager', 'Head of Sales', 'Salesperson', 'Project Manager', 'User', 'Admin', 'Academy Head', 'Program Director', 'Academy Ops Manager', 'Instructor', 'Content Strategist', 'Production Lead'];

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
    };

    const updateRole = async (id: string, newRole: string) => {
        const res = await fetch("/api/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, role: newRole })
        });
        if (res.ok) {
            fetchUsers();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <Link href="/admin/users/new" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Create User
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 py-1 rounded-full bg-red-100 text-blue-800 text-xs">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                        value={user.role}
                                        onChange={(e) => updateRole(user._id, e.target.value)}
                                        className="border rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {ROLES.map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
