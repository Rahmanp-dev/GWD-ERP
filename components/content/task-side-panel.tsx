"use client";

import { useState, useEffect } from "react";
import {
    X, Loader2, Save, FileText, User as UserIcon, CheckCircle, Smartphone,
    MessageSquare, Send, AlertTriangle, Upload, Clock, Flag, Sparkles,
    ClipboardCheck, Link2, HelpCircle, ChevronRight
} from "lucide-react";
import {
    updateIdeaDetails, getProductionUsers, addIdeaComment,
    updateIdeaStatus, addAssetVersion, submitVersionFeedback
} from "@/lib/actions/content-command";

const QUALITY_CHECKS = [
    { id: 'logo', label: 'Correct logo usage' },
    { id: 'colors', label: 'Brand colors accurate' },
    { id: 'captions', label: 'Captions typo-free' },
    { id: 'sound', label: 'Sound levels balanced' },
    { id: 'resolution', label: 'Resolution optimized' },
    { id: 'cta', label: 'CTA included' },
];

const COMMENT_TYPES = [
    { id: 'general', label: 'Discussion', color: 'blue' },
    { id: 'feedback', label: 'Feedback', color: 'purple' },
    { id: 'clarification', label: 'Clarification', color: 'orange' },
    { id: 'note', label: 'Note', color: 'green' },
];

export default function TaskSidePanel({
    item,
    onClose,
    onSuccess,
    role,
    userId
}: {
    item: any;
    onClose: () => void;
    onSuccess: () => void;
    role: string;
    userId: string;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>(item.comments || []);
    const [versions, setVersions] = useState<any[]>(item.versions || []);
    const [newComment, setNewComment] = useState("");
    const [commentType, setCommentType] = useState("general");
    const [activeSection, setActiveSection] = useState<'brief' | 'activity' | 'versions'>('brief');
    const [qualityChecks, setQualityChecks] = useState<Record<string, boolean>>({});
    const [showQualityGate, setShowQualityGate] = useState(false);
    const [newVersionUrl, setNewVersionUrl] = useState("");
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackVersionId, setFeedbackVersionId] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const isStrategistOrCEO = role === 'CEO' || role === 'Content Strategist' || role === 'Admin';
    const isEditorAssigned = item.assignedEditorId?._id === userId || item.assignedEditorId === userId;

    const [formData, setFormData] = useState({
        script: item.script || "",
        assignedEditorId: item.assignedEditorId?._id || item.assignedEditorId || "",
        platform: item.platform?.[0] || "General",
        priority: item.priority || "Medium",
        briefObjective: item.brief?.objective || item.purpose || "",
        briefDuration: item.brief?.duration || "",
        briefTone: item.brief?.tone || "",
        briefMustHaves: item.brief?.mustHaves || "",
        briefCta: item.brief?.cta || ""
    });

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setIsVisible(true));
        const fetchUsers = async () => {
            try { setUsers(await getProductionUsers()); } catch { }
        };
        fetchUsers();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateIdeaDetails(item._id, {
                script: formData.script,
                purpose: formData.briefObjective,
                assignedEditorId: formData.assignedEditorId === "" ? null : formData.assignedEditorId,
                platform: [formData.platform],
                priority: formData.priority,
                brief: {
                    objective: formData.briefObjective,
                    duration: formData.briefDuration,
                    tone: formData.briefTone,
                    mustHaves: formData.briefMustHaves,
                    cta: formData.briefCta
                }
            });
            onSuccess();
        } catch (error) {
            alert("Failed to save");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setIsLoading(true);
        try {
            const res = await addIdeaComment(item._id, userId, newComment, commentType);
            if (res.success && res.comment) {
                setComments([...comments, { ...res.comment, type: commentType, userId: { name: 'You' } }]);
            }
            setNewComment("");
        } catch { alert("Error adding comment"); }
        finally { setIsLoading(false); }
    };

    const handleUploadVersion = async () => {
        if (!newVersionUrl.trim()) return;
        setIsLoading(true);
        try {
            const res = await addAssetVersion(item._id, userId, newVersionUrl);
            if (res.success && res.version) {
                setVersions([...versions, { ...res.version, submittedById: { name: 'You' } }]);
            }
            setNewVersionUrl("");
        } catch { alert("Failed to upload version"); }
        finally { setIsLoading(false); }
    };

    const handleVersionFeedback = async (versionId: string, decision: 'approved' | 'rejected') => {
        if (!feedbackText.trim() && decision === 'rejected') { alert("Please provide feedback"); return; }
        setIsLoading(true);
        try {
            await submitVersionFeedback(item._id, versionId, feedbackText, decision);
            setVersions(versions.map(v => v._id === versionId ? { ...v, status: decision, feedback: feedbackText } : v));
            setFeedbackText(""); setFeedbackVersionId(null);
        } catch { alert("Failed"); }
        finally { setIsLoading(false); }
    };

    const handleSubmitForReview = async () => {
        const allChecked = QUALITY_CHECKS.every(c => qualityChecks[c.id]);
        if (!allChecked) { setShowQualityGate(true); setActiveSection('brief'); return; }
        setIsLoading(true);
        try { await updateIdeaStatus(item._id, 'in_review_l1'); onSuccess(); }
        catch { alert("Failed"); }
        finally { setIsLoading(false); }
    };

    const priorityColors: Record<string, string> = {
        Low: 'bg-gray-100 text-gray-600', Medium: 'bg-blue-50 text-blue-700',
        High: 'bg-orange-50 text-orange-700', Urgent: 'bg-red-50 text-red-700'
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Slide-in Panel */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-[560px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/80 shrink-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-200 text-gray-700">{item.vertical || 'General'}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'published' ? 'bg-green-100 text-green-700' : item.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                {item.status?.replace(/_/g, ' ')}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityColors[formData.priority] || ''}`}>
                                <Flag className="w-3 h-3 inline mr-0.5 -mt-0.5" />{formData.priority}
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 truncate">{item.title}</h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full border text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all ml-3 shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Section Tabs */}
                <div className="flex border-b bg-white px-5 shrink-0">
                    {(['brief', 'activity', 'versions'] as const).map(s => (
                        <button key={s} onClick={() => setActiveSection(s)}
                            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors capitalize ${activeSection === s ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
                            {s === 'brief' ? '📋 Brief' : s === 'activity' ? `💬 Activity (${comments.length})` : `📦 Versions (${versions.length})`}
                        </button>
                    ))}
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto p-5">

                    {/* BRIEF */}
                    {activeSection === 'brief' && (
                        <form id="panel-form" onSubmit={handleSubmit} className="space-y-5">
                            {/* Assignment */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Editor</label>
                                    <select disabled={!isStrategistOrCEO} className="w-full px-2 py-2 border rounded-lg text-sm bg-white disabled:bg-gray-50" value={formData.assignedEditorId} onChange={e => setFormData({ ...formData, assignedEditorId: e.target.value })}>
                                        <option value="">-- None --</option>
                                        {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Priority</label>
                                    <select disabled={!isStrategistOrCEO} className="w-full px-2 py-2 border rounded-lg text-sm bg-white disabled:bg-gray-50" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                        <option value="Low">🟢 Low</option>
                                        <option value="Medium">🔵 Medium</option>
                                        <option value="High">🟠 High</option>
                                        <option value="Urgent">🔴 Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Platform</label>
                                <select className="w-full px-2 py-2 border rounded-lg text-sm bg-white" value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })}>
                                    <option value="Instagram Reel">Instagram Reel</option>
                                    <option value="YouTube Longform">YouTube Longform</option>
                                    <option value="LinkedIn Post">LinkedIn Post</option>
                                    <option value="Website Hero">Website Hero</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            {/* Structured Brief */}
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
                                <h4 className="text-xs font-bold text-indigo-900 flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Production Brief</h4>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Objective & Goal" value={formData.briefObjective} onChange={e => setFormData({ ...formData, briefObjective: e.target.value })} />
                                <div className="grid grid-cols-2 gap-3">
                                    <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Duration (30s, 2min)" value={formData.briefDuration} onChange={e => setFormData({ ...formData, briefDuration: e.target.value })} />
                                    <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Tone (Hype, Minimal)" value={formData.briefTone} onChange={e => setFormData({ ...formData, briefTone: e.target.value })} />
                                </div>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Must-include elements..." value={formData.briefMustHaves} onChange={e => setFormData({ ...formData, briefMustHaves: e.target.value })} />
                                <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="CTA (Register Now, DM Us...)" value={formData.briefCta} onChange={e => setFormData({ ...formData, briefCta: e.target.value })} />
                            </div>

                            {/* Script */}
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Script / Copy</label>
                                <textarea rows={4} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="Script, captions, or post copy..." value={formData.script} onChange={e => setFormData({ ...formData, script: e.target.value })} />
                            </div>

                            {/* Reference Links */}
                            {item.referenceLinks?.length > 0 && (
                                <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
                                    <h4 className="text-xs font-bold text-sky-800 mb-1 flex items-center"><Link2 className="w-3 h-3 mr-1" /> References</h4>
                                    {item.referenceLinks.map((l: string, i: number) => (
                                        <a key={i} href={l} target="_blank" rel="noreferrer" className="block text-xs text-blue-600 hover:underline truncate">{l}</a>
                                    ))}
                                </div>
                            )}

                            {/* Quality Checklist */}
                            {isEditorAssigned && (item.status === 'editing' || item.status === 'revision') && (
                                <div className={`border rounded-lg p-3 ${showQualityGate && !QUALITY_CHECKS.every(c => qualityChecks[c.id]) ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center">
                                        <ClipboardCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Quality Check
                                        {showQualityGate && !QUALITY_CHECKS.every(c => qualityChecks[c.id]) && <span className="ml-2 text-[10px] text-red-600">⚠ Complete all</span>}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {QUALITY_CHECKS.map(c => (
                                            <label key={c.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                                <input type="checkbox" checked={qualityChecks[c.id] || false} onChange={e => setQualityChecks({ ...qualityChecks, [c.id]: e.target.checked })} className="rounded border-gray-300 text-emerald-600" />
                                                <span className={qualityChecks[c.id] ? 'text-gray-400 line-through' : ''}>{c.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </form>
                    )}

                    {/* ACTIVITY */}
                    {activeSection === 'activity' && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {comments.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic text-center py-6">No activity yet.</p>
                                ) : (
                                    comments.map((c: any, i: number) => {
                                        const cType = COMMENT_TYPES.find(ct => ct.id === (c.type || 'general')) || COMMENT_TYPES[0];
                                        return (
                                            <div key={i} className="flex gap-2.5 text-sm">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 text-[10px] ${cType.color === 'blue' ? 'bg-blue-100 text-blue-700' : cType.color === 'purple' ? 'bg-purple-100 text-purple-700' : cType.color === 'orange' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                    {c.userId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 bg-gray-50 border rounded-lg rounded-tl-none p-2.5">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-semibold text-gray-900 text-xs">{c.userId?.name || 'Unknown'}</span>
                                                            <span className={`px-1 py-0.5 text-[9px] rounded font-medium ${cType.color === 'blue' ? 'bg-blue-50 text-blue-600' : cType.color === 'purple' ? 'bg-purple-50 text-purple-600' : cType.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{cType.label}</span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{c.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Comment Input */}
                            <div className="bg-gray-50 rounded-lg border p-3 space-y-2">
                                <div className="flex gap-2">
                                    <select value={commentType} onChange={e => setCommentType(e.target.value)} className="px-2 py-1.5 border rounded text-xs bg-white">
                                        {COMMENT_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
                                    </select>
                                    {isEditorAssigned && (
                                        <button type="button" onClick={() => setCommentType('clarification')} className="px-2 py-1.5 text-[10px] font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100 flex items-center">
                                            <HelpCircle className="w-3 h-3 mr-0.5" /> Clarify
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <textarea rows={2} className="flex-1 px-2 py-1.5 border rounded text-xs bg-white" placeholder="Leave an update..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                                    <button type="button" disabled={isLoading || !newComment.trim()} onClick={handleAddComment} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 transition-colors disabled:opacity-50">
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VERSIONS */}
                    {activeSection === 'versions' && (
                        <div className="space-y-4">
                            {versions.length === 0 ? (
                                <div className="py-6 text-center text-gray-400 border border-dashed rounded-lg">
                                    <Upload className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                                    <p className="text-xs">No versions yet.</p>
                                </div>
                            ) : (
                                versions.map((v: any, i: number) => (
                                    <div key={v._id || i} className={`border rounded-lg p-3 ${v.status === 'approved' ? 'bg-green-50 border-green-200' : v.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gray-200 text-gray-700">V{v.versionNumber}</span>
                                                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded capitalize ${v.status === 'approved' ? 'bg-green-100 text-green-700' : v.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{v.status}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400">{new Date(v.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <a href={v.assetUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline break-all">{v.assetUrl}</a>
                                        {v.feedback && (
                                            <div className="mt-2 bg-white/80 border rounded p-2">
                                                <p className="text-[10px] font-semibold text-gray-500 mb-0.5">Feedback:</p>
                                                <p className="text-xs text-gray-800">{v.feedback}</p>
                                            </div>
                                        )}
                                        {isStrategistOrCEO && v.status === 'pending' && (
                                            <div className="mt-2 pt-2 border-t">
                                                {feedbackVersionId === v._id ? (
                                                    <div className="space-y-2">
                                                        <textarea rows={2} className="w-full px-2 py-1.5 border rounded text-xs" placeholder="Feedback..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleVersionFeedback(v._id, 'approved')} disabled={isLoading} className="flex-1 px-2 py-1.5 text-[10px] font-medium text-white bg-green-600 rounded disabled:opacity-50">✓ Approve</button>
                                                            <button onClick={() => handleVersionFeedback(v._id, 'rejected')} disabled={isLoading} className="flex-1 px-2 py-1.5 text-[10px] font-medium text-white bg-red-600 rounded disabled:opacity-50">✗ Revise</button>
                                                            <button onClick={() => { setFeedbackVersionId(null); setFeedbackText(""); }} className="px-2 py-1.5 text-[10px] text-gray-500 border rounded">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setFeedbackVersionId(v._id)} className="text-[10px] font-medium text-purple-700 hover:underline">Review →</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            {isEditorAssigned && (item.status === 'editing' || item.status === 'revision') && (
                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                    <h4 className="text-xs font-bold text-purple-900 mb-2 flex items-center"><Upload className="w-3.5 h-3.5 mr-1" /> Upload Version</h4>
                                    <div className="flex gap-2">
                                        <input className="flex-1 px-2 py-1.5 border rounded text-xs bg-white" placeholder="Drive/Dropbox link..." value={newVersionUrl} onChange={e => setNewVersionUrl(e.target.value)} />
                                        <button type="button" onClick={handleUploadVersion} disabled={isLoading || !newVersionUrl.trim()} className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded disabled:opacity-50">
                                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Panel Footer */}
                <div className="p-4 border-t bg-white flex justify-between gap-2 shrink-0">
                    <div>
                        {isEditorAssigned && (item.status === 'editing' || item.status === 'revision') && (
                            <button type="button" onClick={handleSubmitForReview} disabled={isLoading}
                                className="px-4 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center transition-colors disabled:opacity-50">
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                                Submit for Review
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-xs font-medium text-gray-600 border rounded-lg hover:bg-gray-50">Close</button>
                        {activeSection === 'brief' && (
                            <button type="submit" form="panel-form" disabled={isLoading}
                                className="px-4 py-2 text-xs font-medium text-white bg-gray-900 hover:bg-black rounded-lg flex items-center disabled:opacity-50">
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                                Save
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
