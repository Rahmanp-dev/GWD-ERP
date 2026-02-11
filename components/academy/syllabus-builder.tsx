"use client";

import { useState } from "react";
import { updateSyllabusStructure } from "@/lib/actions/academy";
import { Plus, Trash, Save, ChevronDown, ChevronRight, FileText, Video, HelpCircle, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SyllabusBuilder({ courseId, initialData }: { courseId: string, initialData?: any }) {
    const router = useRouter();
    const [modules, setModules] = useState<any[]>(initialData?.modules || []);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggle = (idx: number) => setExpanded(p => ({ ...p, [idx]: !p[idx] }));

    const addModule = () => {
        setModules([...modules, { title: "New Module", description: "", lessons: [] }]);
    };

    const removeModule = (idx: number) => {
        if (!confirm("Delete module?")) return;
        setModules(modules.filter((_, i) => i !== idx));
    };

    const updateModule = (idx: number, field: string, val: string) => {
        const newModules = [...modules];
        newModules[idx][field] = val;
        setModules(newModules);
    };

    const addLesson = (moduleIdx: number) => {
        const newModules = [...modules];
        newModules[moduleIdx].lessons.push({ title: "New Lesson", type: "Video", durationHighLevel: "10m" });
        setExpanded(p => ({ ...p, [moduleIdx]: true })); // Auto expand
        setModules(newModules);
    };

    const updateLesson = (moduleIdx: number, lessonIdx: number, field: string, val: string) => {
        const newModules = [...modules];
        newModules[moduleIdx].lessons[lessonIdx][field] = val;
        setModules(newModules);
    };

    const removeLesson = (moduleIdx: number, lessonIdx: number) => {
        const newModules = [...modules];
        newModules[moduleIdx].lessons = newModules[moduleIdx].lessons.filter((_: any, i: number) => i !== lessonIdx);
        setModules(newModules);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateSyllabusStructure(courseId, modules);
            alert("Syllabus Saved Successfully!");
            router.refresh();
        } catch (e) {
            alert("Failed to save syllabus");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                <div>
                    <h2 className="font-bold text-gray-800">Curriculum Structure</h2>
                    <p className="text-xs text-gray-500">{modules.length} Modules • {modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons</p>
                </div>
                <div className="space-x-2">
                    <button onClick={addModule} className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center inline-flex">
                        <Plus className="w-4 h-4 mr-1" /> Add Module
                    </button>
                    <button onClick={handleSave} disabled={loading} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center inline-flex disabled:opacity-50">
                        <Save className="w-4 h-4 mr-1" /> {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {modules.map((m, mIdx) => (
                    <div key={mIdx} className="border rounded-lg bg-white overflow-hidden shadow-sm">

                        {/* Module Header */}
                        <div className="flex items-center p-3 bg-gray-50 border-b">
                            <button onClick={() => toggle(mIdx)} className="mr-3 text-gray-400">
                                {expanded[mIdx] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                            <div className="flex-1 flex gap-2">
                                <input
                                    className="font-bold bg-transparent border-none focus:ring-0 w-full"
                                    value={m.title}
                                    onChange={(e) => updateModule(mIdx, 'title', e.target.value)}
                                    placeholder="Module Title"
                                />
                            </div>
                            <button onClick={() => removeModule(mIdx)} className="text-red-400 hover:text-red-600">
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Module Body */}
                        {expanded[mIdx] && (
                            <div className="p-4 bg-gray-50/50 space-y-3">
                                {/* Lessons List */}
                                {m.lessons.map((l: any, lIdx: number) => (
                                    <div key={lIdx} className="flex items-center gap-2 pl-4 py-2 bg-white border rounded">
                                        <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />

                                        <select
                                            className="text-xs border-none bg-gray-100 rounded p-1 w-24"
                                            value={l.type}
                                            onChange={(e) => updateLesson(mIdx, lIdx, 'type', e.target.value)}
                                        >
                                            <option value="Video">Video</option>
                                            <option value="Article">Article</option>
                                            <option value="Quiz">Quiz</option>
                                            <option value="Project">Project</option>
                                        </select>

                                        <input
                                            className="flex-1 text-sm border-none focus:ring-0"
                                            value={l.title}
                                            onChange={(e) => updateLesson(mIdx, lIdx, 'title', e.target.value)}
                                            placeholder="Lesson Title"
                                        />

                                        <input
                                            className="w-20 text-xs border-none text-right text-gray-500 focus:ring-0"
                                            value={l.durationHighLevel}
                                            onChange={(e) => updateLesson(mIdx, lIdx, 'durationHighLevel', e.target.value)}
                                            placeholder="Duration"
                                        />

                                        <button onClick={() => removeLesson(mIdx, lIdx)} className="text-gray-300 hover:text-red-500">
                                            <Trash className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                <button onClick={() => addLesson(mIdx)} className="w-full py-2 border border-dashed rounded text-xs text-gray-500 hover:bg-gray-50 flex items-center justify-center">
                                    <Plus className="w-3 h-3 mr-1" /> Add Lesson
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {modules.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-400">
                        No modules created yet. Start building your curriculum.
                    </div>
                )}
            </div>
        </div>
    );
}
