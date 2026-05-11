import { getExams } from "@/lib/exams";
import ExamViewerClient from "@/components/ExamViewerClient";

// Switch to Catch-all mapping allows natural folder path static params
export async function generateStaticParams() {
  const exams = await getExams();
  return exams.map((exam) => ({
    id: exam.filename.split('/').map(segment => encodeURIComponent(segment)), 
  }));
}

export default async function ExamPage({ params }: { params: Promise<{ id: string[] }> }) {
  const resolvedParams = await params;
  // Decode each segment back to normal string and reassemble path
  const fullId = resolvedParams.id.map(segment => decodeURIComponent(segment)).join('/'); 
  return <ExamViewerClient examId={fullId} />;
}
