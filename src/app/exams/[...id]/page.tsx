import { getExams } from "@/lib/exams";
import ExamViewerClient from "@/components/ExamViewerClient";

// Switch to Catch-all mapping allows natural folder path static params
export async function generateStaticParams() {
  const exams = await getExams();
  return exams.map((exam) => ({
    id: exam.id.split('/'), 
  }));
}

export default async function ExamPage({ params }: { params: Promise<{ id: string[] }> }) {
  const resolvedParams = await params;
  const fullId = resolvedParams.id.map(segment => decodeURIComponent(segment)).join('/'); 
  return <ExamViewerClient examId={fullId} />;
}
