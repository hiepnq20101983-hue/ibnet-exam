import { getExams } from "@/lib/exams";
import ParentPortal from "./ParentPortal";

// Support static site generation export
export const dynamic = 'force-static';

export const metadata = {
  title: "Cổng Thông Tin Phụ Huynh - Theo Dõi Học Tập",
  description: "Xem kết quả học tập, lịch học, ý thức lớp và tình hình học phí của học sinh tại cổng kết nối Google Sheets chính thức."
};

export default async function ParentPage() {
  const exams = await getExams();
  
  return <ParentPortal initialExams={exams} />;
}
