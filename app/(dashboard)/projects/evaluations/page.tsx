export default function EvaluationsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Pending Reviews & Evaluations</h1>
                <p className="text-gray-500">Tasks requiring approval and team performance reviews.</p>
            </div>
            <div className="bg-white p-12 text-center border rounded-lg border-dashed">
                <p className="text-gray-500">No pending evaluations found.</p>
            </div>
        </div>
    );
}
