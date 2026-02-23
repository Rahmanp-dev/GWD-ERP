"use client";

import { useState } from "react";
import { convertRequestToIdea, rejectContentRequest } from "@/lib/actions/content-command";
import { Inbox, CheckCircle, XCircle, Clock, ExternalLink, Loader2 } from "lucide-react";

export default function RequestsTab({ requests, role }: { requests: any[], role: string }) {
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAccept = async (request: any) => {
        setProcessingId(request._id);
        try {
            await convertRequestToIdea(request._id, {
                title: request.title,
                vertical: request.moduleCategory,
                purpose: request.objective,
                referenceLinks: request.referenceUrl ? [request.referenceUrl] : [],
                platform: request.platform ? [request.platform] : [],
            });
        } catch (error) {
            console.error(error);
            alert("Failed to convert request");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Reject this content request?")) return;
        setProcessingId(id);
        try {
            await rejectContentRequest(id);
        } catch (error) {
            console.error(error);
            alert("Failed to reject request");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Content Request Inbox</h2>
                    <p className="text-sm text-gray-500">Incoming requests from Department Heads.</p>
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 pb-10">
                {requests.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        <Inbox className="w-12 h-12 text-gray-300 mb-3" />
                        <p>Inbox zero! No pending content requests.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req._id} className="bg-white border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.urgency === 'ASAP' ? 'bg-red-100 text-red-700' :
                                            req.urgency === 'High' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {req.urgency}
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">{req.moduleCategory}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{req.title}</h3>

                                <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-medium text-gray-800">Objective:</span> {req.objective || 'Not specified'}
                                </p>

                                <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1.5" />
                                        <span>Deadline: {req.deadline ? new Date(req.deadline).toLocaleDateString() : 'None'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium mr-1.5">Platform:</span>
                                        <span>{req.platform || 'General'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium mr-1.5">Requested by:</span>
                                        <span>{req.requestedById?.name || 'Unknown'}</span>
                                    </div>
                                </div>

                                {req.referenceUrl && (
                                    <a href={req.referenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center mt-3 text-sm text-blue-600 hover:underline">
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        View Reference
                                    </a>
                                )}
                            </div>

                            {(role === 'CEO' || role === 'Content Strategist' || role === 'Admin') && (
                                <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0 items-center justify-center shrink-0">
                                    <button
                                        onClick={() => handleAccept(req)}
                                        disabled={processingId === req._id}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {processingId === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                        Convert to Idea
                                    </button>
                                    <button
                                        onClick={() => handleReject(req._id)}
                                        disabled={processingId === req._id}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
