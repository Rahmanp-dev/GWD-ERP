import { getCandidates } from "@/lib/actions/hr";
import RecruitmentBoard from "@/components/hr/recruitment-board";
import { Plus } from "lucide-react";

export default async function RecruitmentPage() {
    const candidates = await getCandidates();

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center mb-6 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h1>
                    <p className="text-sm text-gray-500">Manage candidates and hiring process</p>
                </div>
                {/* Board Component will handle the 'Add' modal internally or we pass a trigger here */}
            </div>

            <RecruitmentBoard initialCandidates={candidates} />
        </div>
    );
}
