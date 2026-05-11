import { getExams } from './src/lib/exams.ts';

async function debug() {
  const exams = await getExams();
  const params = exams.map((exam) => ({
    id: exam.filename.split('/'), 
  }));
  console.log(JSON.stringify(params, null, 2));
}

debug().catch(console.error);
