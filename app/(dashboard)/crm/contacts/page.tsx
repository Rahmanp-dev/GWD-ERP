import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Contact from "@/lib/models/Contact";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
    const session = await auth();
    await dbConnect();

    let contacts = [];
    try {
        contacts = await Contact.find({}).sort({ createdAt: -1 });
    } catch (e) {
        console.error("Failed to fetch contacts", e);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
                <Link href="/crm/contacts/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Add Contact
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {contacts.map((contact: any) => (
                            <tr key={contact._id.toString()}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.position}</td>
                            </tr>
                        ))}
                        {contacts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No contacts found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
