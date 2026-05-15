import { getExams } from "@/lib/exams";
import ExamViewerClient from "@/components/ExamViewerClient";

// Switch to Catch-all mapping allows natural folder path static params
export async function generateStaticParams() {
  const exams = await getExams();
  return exams.map((exam) => ({
    id: exam.id.split('/'), 
  }));
}

export const dynamic = 'force-dynamic';

export default async function ExamPage({ params }: { params: Promise<{ id: string[] }> }) {
  const resolvedParams = await params;
  const fullId = resolvedParams.id.map(segment => decodeURIComponent(segment)).join('/'); 
  
  // Fetch fresh exams (uses server-side cache)
  const allExams = await getExams();
  const currentExam = allExams.find(e => e.id === fullId);
  
  return <ExamViewerClient 
    examId={fullId} 
    initialTitle={currentExam?.title || fullId.replace('_conv.html', '').replace(/_/g, ' ')} 
  />;
}
