import { getExams } from "@/lib/exams";
import TeacherDashboardClient from "@/components/TeacherDashboardClient";

export const dynamic = 'force-dynamic';

export default async function TeacherPage() {
  const allExams = await getExams();
  
  return <TeacherDashboardClient initialExams={allExams} />;
}
