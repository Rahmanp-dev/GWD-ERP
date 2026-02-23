"use client";

import { useState, useEffect } from "react";
import {
    X, Loader2, Save, FileText, User as UserIcon, CheckCircle, Smartphone,
    MessageSquare, Send, AlertTriangle, Upload, ChevronDown, ChevronUp,
    Clock, Flag, Sparkles, ClipboardCheck, Link2, HelpCircle, Palette
} from "lucide-react";
import {
    updateIdeaDetails, getProductionUsers, addIdeaComment,
    updateIdeaStatus, addAssetVersion, submitVersionFeedback
} from "@/lib/actions/content-command";

// --- Sub-components ---

// Quality Checklist for Editors before submitting
const QUALITY_CHECKS = [
    { id: 'logo', label: 'Correct logo usage & placement' },
    { id: 'colors', label: 'Brand colors are accurate' },
    { id: 'captions', label: 'Captions / text are aligned & typo-free' },
    { id: 'sound', label: 'Sound levels are balanced (if video)' },
    { id: 'resolution', label: 'Resolution optimized for platform' },
    { id: 'cta', label: 'Call-to-action is included' },
];

const COMMENT_TYPES = [
    { id: 'general', label: 'Discussion', icon: MessageSquare, color: 'blue' },
    { id: 'feedback', label: 'Feedback', icon: Sparkles, color: 'purple' },
    { id: 'clarification', label: 'Clarification', icon: HelpCircle, color: 'orange' },
    { id: 'note', label: 'Production Note', icon: FileText, color: 'green' },
];

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    Low: { color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
    Medium: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    High: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    Urgent: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
};

export default function IdeaDetailModal({
    item,
    onClose,
    onSuccess,
    role,
    userId
}: {
    item: any,
    onClose: () => void,
    onSuccess: () => void,
    role: string,
    userId: string
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>(item.comments || []);
    const [versions, setVersions] = useState<any[]>(item.versions || []);
    const [newComment, setNewComment] = useState("");
    const [commentType, setCommentType] = useState("general");
    const [activeTab, setActiveTab] = useState<'brief' | 'activity' | 'versions'>('brief');
    const [qualityChecks, setQualityChecks] = useState<Record<string, boolean>>({});
    const [showQualityGate, setShowQualityGate] = useState(false);

    // Version upload
    const [newVersionUrl, setNewVersionUrl] = useState("");
    // Version feedback
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackVersionId, setFeedbackVersionId] = useState<string | null>(null);

    const isStrategistOrCEO = role === 'CEO' || role === 'Content Strategist' || role === 'Admin';
    const isEditorAssigned = item.assignedEditorId?._id === userId || item.assignedEditorId === userId;

    const [formData, setFormData] = useState({
        script: item.script || "",
        objective: item.purpose || "",
        assignedEditorId: item.assignedEditorId?._id || item.assignedEditorId || "",
        platform: item.platform?.[0] || "General",
        priority: item.priority || "Medium",
        // Structured Brief fields
        briefObjective: item.brief?.objective || item.purpose || "",
        briefDuration: item.brief?.duration || "",
        briefTone: item.brief?.tone || "",
        briefMustHaves: item.brief?.mustHaves || "",
        briefCta: item.brief?.cta || ""
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const u = await getProductionUsers();
                setUsers(u);
            } catch (error) {
                console.error("Failed to load users");
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateIdeaDetails(item._id, {
                script: formData.script,
                purpose: formData.objective,
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
            console.error(error);
            alert("Failed to update idea details");
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
                const populatedComment = {
                    ...res.comment,
                    type: commentType,
                    userId: { name: 'You', image: null }
                };
                setComments([...comments, populatedComment]);
            }
            setNewComment("");
        } catch (error) {
            console.error("Failed to add comment", error);
            alert("Error adding comment");
        } finally {
            setIsLoading(false);
        }
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
        } catch (error) {
            alert("Failed to upload version");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVersionFeedback = async (versionId: string, decision: 'approved' | 'rejected') => {
        if (!feedbackText.trim() && decision === 'rejected') {
            alert("Please provide feedback before rejecting");
            return;
        }
        setIsLoading(true);
        try {
            await submitVersionFeedback(item._id, versionId, feedbackText, decision);
            setVersions(versions.map(v =>
                v._id === versionId ? { ...v, status: decision, feedback: feedbackText } : v
            ));
            setFeedbackText("");
            setFeedbackVersionId(null);
        } catch (error) {
            alert("Failed to submit feedback");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitForReview = async () => {
        // Quality Gate: Check if all items are checked
        const allChecked = QUALITY_CHECKS.every(check => qualityChecks[check.id]);
        if (!allChecked) {
            setShowQualityGate(true);
            setActiveTab('brief'); // Scroll them to see the checklist
            return;
        }
        setIsLoading(true);
        try {
            await updateIdeaStatus(item._id, 'in_review_l1');
            onSuccess();
        } catch (error) {
            alert("Failed to submit for review");
        } finally {
            setIsLoading(false);
        }
    };

    const priorityStyle = PRIORITY_CONFIG[formData.priority] || PRIORITY_CONFIG.Medium;

    // Filter comments by type for display
    const getCommentsByType = (type: string) => comments.filter((c: any) => (c.type || 'general') === type);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b bg-gray-50/80">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700">
                                {item.vertical || 'General'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === 'published' ? 'bg-green-100 text-green-700' :
                                item.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                }`}>
                                {item.status.replace(/_/g, ' ')}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityStyle.bg} ${priorityStyle.color} ${priorityStyle.border} border`}>
                                <Flag className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                                {formData.priority}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full border text-gray-400 hover:text-gray-900 shadow-sm transition-all hover:bg-gray-50 ml-4">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b bg-white px-5">
                    {(['brief', 'activity', 'versions'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {tab === 'brief' ? '📋 Brief & Config' : tab === 'activity' ? '💬 Activity' : '📦 Versions'}
                            {tab === 'activity' && comments.length > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 font-bold">{comments.length}</span>
                            )}
                            {tab === 'versions' && versions.length > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700 font-bold">{versions.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

                    {/* ===== BRIEF & CONFIG TAB ===== */}
                    {activeTab === 'brief' && (
                        <form id="idea-form" onSubmit={handleSubmit} className="space-y-6">
                            {/* Assignment Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div>
                                    <label className="flex items-center text-xs font-semibold text-gray-600 mb-1.5">
                                        <UserIcon className="w-3.5 h-3.5 mr-1 text-blue-500" />
                                        Assigned Editor
                                    </label>
                                    <select
                                        disabled={!isStrategistOrCEO}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white text-sm disabled:bg-gray-100"
                                        value={formData.assignedEditorId}
                                        onChange={(e) => setFormData({ ...formData, assignedEditorId: e.target.value })}
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center text-xs font-semibold text-gray-600 mb-1.5">
                                        <Smartphone className="w-3.5 h-3.5 mr-1 text-pink-500" />
                                        Platform
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white text-sm"
                                        value={formData.platform}
                                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    >
                                        <option value="Instagram Reel">Instagram Reel</option>
                                        <option value="YouTube Longform">YouTube Longform</option>
                                        <option value="LinkedIn Post">LinkedIn Post</option>
                                        <option value="Website Hero">Website Hero</option>
                                        <option value="General">General / Multi-platform</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center text-xs font-semibold text-gray-600 mb-1.5">
                                        <Flag className="w-3.5 h-3.5 mr-1 text-orange-500" />
                                        Priority
                                    </label>
                                    <select
                                        disabled={!isStrategistOrCEO}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white text-sm disabled:bg-gray-100"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="Low">🟢 Low</option>
                                        <option value="Medium">🔵 Medium</option>
                                        <option value="High">🟠 High</option>
                                        <option value="Urgent">🔴 Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Structured Brief Builder */}
                            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-100 rounded-xl p-5">
                                <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center">
                                    <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" />
                                    Production Brief
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Objective & Goal</label>
                                        <textarea
                                            rows={2}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 bg-white text-sm"
                                            placeholder="What is the goal of this piece? Who is the audience?"
                                            value={formData.briefObjective}
                                            onChange={(e) => setFormData({ ...formData, briefObjective: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Duration / Length</label>
                                            <input
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 bg-white text-sm"
                                                placeholder="e.g. 30 sec, 2 min, 1 page"
                                                value={formData.briefDuration}
                                                onChange={(e) => setFormData({ ...formData, briefDuration: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Tone & Style</label>
                                            <input
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 bg-white text-sm"
                                                placeholder="e.g. Professional, Hype, Minimal"
                                                value={formData.briefTone}
                                                onChange={(e) => setFormData({ ...formData, briefTone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Must-Include Elements</label>
                                        <textarea
                                            rows={2}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 bg-white text-sm"
                                            placeholder="Logo, event date, speaker names, specific footage..."
                                            value={formData.briefMustHaves}
                                            onChange={(e) => setFormData({ ...formData, briefMustHaves: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Call-to-Action (CTA)</label>
                                        <input
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 bg-white text-sm"
                                            placeholder="e.g. Register Now, Visit Website, DM Us"
                                            value={formData.briefCta}
                                            onChange={(e) => setFormData({ ...formData, briefCta: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Script / Working Copy */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 mr-1.5 text-orange-500" />
                                    Script & Copy (Working Draft)
                                </label>
                                <textarea
                                    rows={5}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 hover:bg-white text-sm font-mono transition-colors"
                                    placeholder="Type the script, captions, or full post copy here..."
                                    value={formData.script}
                                    onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                                />
                            </div>

                            {/* Reference Links (read only display) */}
                            {item.referenceLinks?.length > 0 && (
                                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-sky-800 mb-2 flex items-center">
                                        <Link2 className="w-3.5 h-3.5 mr-1" /> Reference Links
                                    </h4>
                                    <div className="space-y-1">
                                        {item.referenceLinks.map((link: string, i: number) => (
                                            <a key={i} href={link} target="_blank" rel="noreferrer" className="block text-sm text-blue-600 hover:underline truncate">{link}</a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quality Checklist (for Editors) */}
                            {isEditorAssigned && (item.status === 'editing' || item.status === 'revision') && (
                                <div className={`border rounded-xl p-4 transition-all ${showQualityGate && !QUALITY_CHECKS.every(c => qualityChecks[c.id]) ? 'bg-red-50 border-red-300 ring-2 ring-red-200' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                        <ClipboardCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                                        Quality Checklist
                                        {showQualityGate && !QUALITY_CHECKS.every(c => qualityChecks[c.id]) && (
                                            <span className="ml-2 text-xs text-red-600 font-medium">⚠ Complete all checks to submit</span>
                                        )}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {QUALITY_CHECKS.map(check => (
                                            <label key={check.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/60 p-1.5 rounded-lg transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={qualityChecks[check.id] || false}
                                                    onChange={(e) => setQualityChecks({ ...qualityChecks, [check.id]: e.target.checked })}
                                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span className={qualityChecks[check.id] ? 'text-gray-500 line-through' : 'text-gray-800'}>{check.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </form>
                    )}

                    {/* ===== ACTIVITY TAB ===== */}
                    {activeTab === 'activity' && (
                        <div className="space-y-5">
                            {/* Comment Type Filter Chips */}
                            <div className="flex flex-wrap gap-2">
                                {COMMENT_TYPES.map(ct => {
                                    const Icon = ct.icon;
                                    const count = getCommentsByType(ct.id).length;
                                    return (
                                        <span key={ct.id} className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full font-medium border ${ct.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            ct.color === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                ct.color === 'orange' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            <Icon className="w-3 h-3 mr-1" />
                                            {ct.label} ({count})
                                        </span>
                                    );
                                })}
                            </div>

                            {/* All Comments Stream */}
                            <div className="space-y-3">
                                {comments.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic text-center py-8">No activity yet. Start a conversation below.</p>
                                ) : (
                                    comments.map((c: any, i: number) => {
                                        const cType = COMMENT_TYPES.find(ct => ct.id === (c.type || 'general')) || COMMENT_TYPES[0];
                                        const CIcon = cType.icon;
                                        return (
                                            <div key={i} className="flex gap-3 text-sm">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-xs ${cType.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                    cType.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                                        cType.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-green-100 text-green-700'
                                                    }`}>
                                                    {c.userId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 bg-white border border-gray-100 rounded-xl rounded-tl-none p-3 shadow-sm">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900">{c.userId?.name || 'Unknown'}</span>
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] rounded font-medium ${cType.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                                                cType.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                                                    cType.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                                                        'bg-green-50 text-green-600'
                                                                }`}>
                                                                <CIcon className="w-2.5 h-2.5 mr-0.5" />
                                                                {cType.label}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Comment Input with Type Selector */}
                            <div className="bg-gray-50 rounded-xl border p-4 space-y-3">
                                <div className="flex gap-2">
                                    <select
                                        value={commentType}
                                        onChange={(e) => setCommentType(e.target.value)}
                                        className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        {COMMENT_TYPES.map(ct => (
                                            <option key={ct.id} value={ct.id}>{ct.label}</option>
                                        ))}
                                    </select>
                                    {isEditorAssigned && (
                                        <button
                                            type="button"
                                            onClick={() => { setCommentType('clarification'); setNewComment(''); }}
                                            className="px-3 py-2 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors flex items-center"
                                        >
                                            <HelpCircle className="w-3.5 h-3.5 mr-1" />
                                            Request Clarification
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <textarea
                                        rows={2}
                                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                        placeholder={
                                            commentType === 'clarification' ? 'Describe what needs clarification (missing assets, unclear script, deadline concern)...' :
                                                commentType === 'feedback' ? 'Provide specific feedback on the content...' :
                                                    commentType === 'note' ? 'Add production notes, branding guidelines, or references...' :
                                                        'Leave an update, question, or link...'
                                        }
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        disabled={isLoading || !newComment.trim()}
                                        onClick={handleAddComment}
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 flex flex-col items-center justify-center transition-colors disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== VERSIONS TAB ===== */}
                    {activeTab === 'versions' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-900">Revision History</h3>
                                <span className="text-xs text-gray-500">{versions.length} version(s)</span>
                            </div>

                            {/* Version Timeline */}
                            <div className="space-y-4">
                                {versions.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 border border-dashed rounded-xl">
                                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No versions uploaded yet.</p>
                                    </div>
                                ) : (
                                    versions.map((v: any, i: number) => (
                                        <div key={v._id || i} className={`border rounded-xl p-4 ${v.status === 'approved' ? 'bg-green-50 border-green-200' :
                                            v.status === 'rejected' ? 'bg-red-50 border-red-200' :
                                                'bg-white border-gray-200'
                                            }`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-gray-200 text-gray-700">V{v.versionNumber}</span>
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded capitalize ${v.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        v.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>{v.status}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    <Clock className="w-3 h-3 inline mr-0.5" />
                                                    {new Date(v.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <a href={v.assetUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">{v.assetUrl}</a>
                                            <p className="text-xs text-gray-500 mt-1">By: {v.submittedById?.name || 'Unknown'}</p>

                                            {v.feedback && (
                                                <div className="mt-3 bg-white/80 border rounded-lg p-3">
                                                    <p className="text-xs font-semibold text-gray-600 mb-1">Strategist Feedback:</p>
                                                    <p className="text-sm text-gray-800">{v.feedback}</p>
                                                </div>
                                            )}

                                            {/* Feedback Actions (for Strategist/CEO) */}
                                            {isStrategistOrCEO && v.status === 'pending' && (
                                                <div className="mt-3 pt-3 border-t space-y-2">
                                                    {feedbackVersionId === v._id ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                rows={2}
                                                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                                                placeholder="Provide feedback on this version..."
                                                                value={feedbackText}
                                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleVersionFeedback(v._id, 'approved')}
                                                                    disabled={isLoading}
                                                                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleVersionFeedback(v._id, 'rejected')}
                                                                    disabled={isLoading}
                                                                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> Request Revision
                                                                </button>
                                                                <button
                                                                    onClick={() => { setFeedbackVersionId(null); setFeedbackText(""); }}
                                                                    className="px-3 py-2 text-xs text-gray-500 border rounded-lg hover:bg-gray-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setFeedbackVersionId(v._id)}
                                                            className="text-xs font-medium text-purple-700 hover:text-purple-900 transition-colors"
                                                        >
                                                            Review this version →
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Upload New Version (Editor) */}
                            {isEditorAssigned && (item.status === 'editing' || item.status === 'revision') && (
                                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center">
                                        <Upload className="w-4 h-4 mr-1.5" /> Upload New Version
                                    </h4>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500"
                                            placeholder="Paste Google Drive, Dropbox, or direct link to asset..."
                                            value={newVersionUrl}
                                            onChange={(e) => setNewVersionUrl(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleUploadVersion}
                                            disabled={isLoading || !newVersionUrl.trim()}
                                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t bg-white flex justify-between gap-3">
                    <div>
                        {isEditorAssigned && (item.status === 'editing' || item.status === 'revision') && (
                            <button
                                type="button"
                                onClick={handleSubmitForReview}
                                disabled={isLoading}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl flex items-center shadow-sm transition-colors disabled:opacity-50"
                                title="Ready for the Strategist to review"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Submit for Review
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-xl transition-colors"
                        >
                            Close
                        </button>
                        {activeTab === 'brief' && (
                            <button
                                type="submit"
                                form="idea-form"
                                disabled={isLoading}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-xl flex items-center shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Brief
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
