import ContentRequestClient from "./client";

export const dynamic = 'force-dynamic';

export default function ContentRequestPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Request Content</h1>
                <p className="text-gray-500">Submit a brief to the Content Production team.</p>
            </div>
            <ContentRequestClient />
        </div>
    );
}
