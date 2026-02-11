"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBatch } from "@/lib/actions/academy-batches";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function NewBatchPage({ courses, instructors }: { courses: any[], instructors: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState<string[]>([]);

    const toggleDay = (day: string) => {
        if (days.includes(day)) setDays(days.filter(d => d !== day));
        else setDays([...days, day]);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data: any = Object.fromEntries(formData.entries());
        data.days = days;

        try {
            await createBatch(data);
            router.push("/academy/batches");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/academy/batches" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Schedule
            </Link>

            <h1 className="text-2xl font-bold text-gray-900">Schedule New Batch</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                    <input name="name" required placeholder="e.g. React Cohort 5 - Feb" className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Course</label>
                        <select name="courseId" required className="mt-1 block w-full rounded-md border p-2 bg-white border-gray-300">
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Instructor</label>
                        <select name="instructorId" className="mt-1 block w-full rounded-md border p-2 bg-white border-gray-300">
                            <option value="">-- Assign Later --</option>
                            {instructors.map(i => <option key={i._id} value={i._id}>{i.user?.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input name="startDate" type="date" required className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input name="endDate" type="date" className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Schedule</label>
                    <div className="flex space-x-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <button
                                key={day} type="button"
                                onClick={() => toggleDay(day)}
                                className={`px-3 py-1 rounded-full text-sm border ${days.includes(day) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Time (Timezone UTC)</label>
                    <input name="time" placeholder="e.g. 10:00 AM - 12:00 PM" className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Scheduling..." : "Create Batch"}
                    </button>
                </div>
            </form>
        </div>
    );
}
