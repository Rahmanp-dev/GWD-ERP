import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
            <h1 className="text-4xl font-bold mb-4">403 - Unauthorized</h1>
            <p className="mb-8 text-lg">You do not have permission to access this page.</p>
            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Return to Dashboard
            </Link>
        </div>
    );
}
