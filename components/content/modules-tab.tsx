"use client";

import { useState } from "react";
import { Plus, Target, Users, CalendarDays, MoreVertical } from "lucide-react";
import NewModuleModal from "./new-module-modal";

export default function ModulesTab({ modules, role, onSelectModule }: { modules: any[], role: string, onSelectModule?: (id: string) => void }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Content Modules</h2>
                    <p className="text-sm text-gray-500">Active campaigns, events, and brand initiatives.</p>
                </div>
                {(role === 'CEO' || role === 'Content Strategist' || role === 'Admin') && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Module
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-10">
                {modules.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        No active modules. Create your first campaign container!
                    </div>
                ) : (
                    modules.map(module => (
                        <div key={module._id} className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                                        {module.category}
                                    </span>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{module.name}</h3>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2 mt-4">
                                {module.goal && (
                                    <div className="flex items-start text-sm text-gray-600">
                                        <Target className="w-4 h-4 mr-2 text-red-500 shrink-0 mt-0.5" />
                                        <span>{module.goal}</span>
                                    </div>
                                )}
                                {module.audience && (
                                    <div className="flex items-start text-sm text-gray-600">
                                        <Users className="w-4 h-4 mr-2 text-blue-500 shrink-0 mt-0.5" />
                                        <span>{module.audience}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 pt-4 border-t flex justify-between items-center text-xs text-gray-500">
                                <div className="flex items-center">
                                    <CalendarDays className="w-3.5 h-3.5 mr-1" />
                                    {module.startDate ? new Date(module.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                                    {module.endDate ? ` - ${new Date(module.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
                                </div>
                                <button
                                    onClick={() => onSelectModule && onSelectModule(module._id)}
                                    className="text-red-600 font-medium hover:underline"
                                >
                                    View Ideas &rarr;
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <NewModuleModal onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}
