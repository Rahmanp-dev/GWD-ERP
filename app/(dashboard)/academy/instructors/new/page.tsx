import { getPotentialInstructors } from "@/lib/actions/academy";
import NewInstructorForm from "@/components/academy/new-instructor-form";

export const dynamic = 'force-dynamic';

export default async function NewInstructorPage() {
    const users = await getPotentialInstructors();
    return <NewInstructorForm users={users} />;
}
