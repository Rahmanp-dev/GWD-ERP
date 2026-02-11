import dbConnect from "@/lib/db";
import AcademyCourse from "@/lib/models/AcademyCourse";
import { getInstructors } from "@/lib/actions/academy";
import NewBatchPage from "@/components/academy/new-batch-form";

export const dynamic = 'force-dynamic';

export default async function CreateBatchPage() {
    await dbConnect();
    const courses = await AcademyCourse.find({ status: { $in: ['Live', 'Building'] } }).select('title').lean();
    const instructors = await getInstructors();

    return (
        <NewBatchPage
            courses={courses.map((c: any) => ({ ...c, _id: c._id.toString() }))}
            instructors={instructors}
        />
    );
}
