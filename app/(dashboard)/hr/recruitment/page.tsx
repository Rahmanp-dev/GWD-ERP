import CandidateBoard from "@/components/hr/candidate-board";
import Link from "next/link";

export default function RecruitmentPage() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h1>
                <Link href="/hr/recruitment/new" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                    Add Candidate
                </Link>
            </div>
            <div className="flex-1 overflow-hidden">
                <CandidateBoard />
            </div>
        </div>
    );
}
