import { CheckCircle2, Circle, Clock } from "lucide-react";

export default function ApprovalStrip({ approvals, status }: { approvals: any[], status: string }) {

    // Simplistic timeline interpretation
    const l1Status = approvals.find(a => a.level === 'level_1') ? 'approved' : (status === 'in_review_l1' ? 'pending' : 'draft');
    const l2Status = approvals.find(a => a.level === 'level_2') ? 'approved' : (status === 'in_review_l2' ? 'pending' : 'draft');

    const renderNode = (label: string, state: string) => {
        return (
            <div className="flex flex-col items-center">
                {state === 'approved' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                ) : state === 'pending' ? (
                    <Clock className="w-5 h-5 text-blue-500 mb-1" />
                ) : (
                    <Circle className="w-5 h-5 text-gray-200 mb-1" />
                )}
                <span className={`text-[10px] ${state === 'approved' ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div className="flex items-center space-x-2 py-1 bg-gray-50 rounded-lg px-3 justify-between">
            {renderNode('Draft', 'approved')}
            <div className={`h-px flex-1 ${l1Status === 'approved' ? 'bg-green-500' : 'bg-gray-200'}`} />

            {renderNode('L1 Check', l1Status)}

            <div className={`h-px flex-1 ${(l1Status === 'approved' && ['approved_l2', 'scheduled', 'published'].includes(status) || l2Status === 'approved') ? 'bg-green-500' : 'bg-gray-200'}`} />

            {renderNode('CEO', l2Status === 'draft' && ['approved_l1', 'scheduled'].includes(status) ? 'approved' : l2Status)}
        </div>
    );
}
