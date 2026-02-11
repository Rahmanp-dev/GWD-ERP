"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInstructorProfile } from "@/lib/actions/academy";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewInstructorPage({ users }: { users: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(formData.entries());

        try {
            await createInstructorProfile(data);
            router.push("/academy/instructors");
        } catch (err: any) {
            setError(err.message || "Failed to add instructor");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/academy/instructors" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Instructors
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Onboard Instructor</h1>
                <p className="text-gray-500">Promote an existing user/freelancer to Academy Faculty.</p>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">

                <div>
                    <label className="block text-sm font-medium text-gray-700">Select User</label>
                    <select name="userId" required className="mt-1 block w-full rounded-md border p-2 bg-white border-gray-300">
                        <option value="">-- Choose Candidate --</option>
                        {users.map((u) => (
                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Public Headline</label>
                    <input name="headline" required placeholder="Ex-Google Engineer, Python Expert" className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Core Expertise (Comma separated)</label>
                    <input name="expertise" required placeholder="Python, Django, AWS" className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                    <input name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea name="bio" rows={4} className="mt-1 block w-full rounded-md border p-2 border-gray-300" placeholder="Short professional biography..." />
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Onboarding..." : "Onboard Instructor"}
                    </button>
                </div>
            </form>
        </div>
    );
}
