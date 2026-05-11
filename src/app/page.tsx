import { getExams } from "@/lib/exams";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = 'force-static';

export default async function Page() {
  // This logic executes at Build Time now, resulting in pre-populated metadata!
  const allExams = await getExams();
  
  return <DashboardClient initialExams={allExams} />;
}
