'use client';

import { Exam } from "@/lib/exams";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  GraduationCap, School, Calendar, AlertCircle, Loader2, CheckCircle2, 
  XCircle, Trophy, CreditCard, BookOpen, Activity, ClipboardList, Heart, 
  ShieldAlert, MessageSquare, Clock
} from "lucide-react";
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie } from 'recharts';

interface Submission {
  timestamp: string;
  studentName: string;
  className: string;
  examId: string;
  examTitle: string;
  score: string;
}

interface StudentRoster {
  className: string;
  studentName: string;
  schedule?: string;
  tuition?: string;
  tuitionStatus?: string;
}

interface BehaviorLog {
  timestamp: string;
  className: string;
  studentName: string;
  note: string;
  status: string;
}

function ParentPortalContent({ initialExams }: { initialExams: Exam[] }) {
  const searchParams = useSearchParams();
  const targetClass = searchParams.get('class') || '';
  const targetName = searchParams.get('name') || '';

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [roster, setRoster] = useState<StudentRoster[]>([]);
  const [behavior, setBehavior] = useState<BehaviorLog[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!sheetUrl) {
        setError("Chưa cấu hình Cổng Dữ Liệu. Vui lòng thông báo cho quản trị viên!");
        setIsLoading(false);
        return;
      }
      if (!targetClass || !targetName) {
        setError("Thiếu thông tin học sinh. Vui lòng click vào đúng link phụ huynh được cung cấp!");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`${sheetUrl}?action=get_data`, { cache: 'no-store' });
        if (!res.ok) throw new Error("Không thể kết nối đến máy chủ dữ liệu.");
        
        const json = await res.json();
        setSubmissions(json.submissions || []);
        setRoster(json.roster || []);
        setBehavior(json.behavior || []);
      } catch (err: any) {
        setError(`Không thể tải dữ liệu: ${err.message || "Lỗi không xác định"}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sheetUrl, targetClass, targetName]);

  // 1. Find specific student details from roster
  const studentInfo = useMemo(() => {
    return roster.find(
      r => r.className === targetClass && r.studentName.toLowerCase() === targetName.toLowerCase()
    );
  }, [roster, targetClass, targetName]);

  // 2. Get academic progress & submission records
  const studentSubmissions = useMemo(() => {
    return submissions.filter(
      s => s.className === targetClass && s.studentName.toLowerCase() === targetName.toLowerCase()
    );
  }, [submissions, targetClass, targetName]);

  // Calculate statistics for all available exams in this class
  const relevantExams = useMemo(() => {
    // Show exams assigned to their class, or common exams
    return initialExams.filter(
      ex => ex.examClass === targetClass || ex.examClass.toLowerCase() === 'chung'
    );
  }, [initialExams, targetClass]);

  const examStatus = useMemo(() => {
    if (relevantExams.length === 0) return { done: 0, pending: 0, pct: 0, list: [] };

    const list = relevantExams.map(exam => {
      // Check if submitted
      const sub = studentSubmissions
        .filter(s => s.examId === exam.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      return {
        examId: exam.id,
        title: exam.title,
        duration: exam.duration,
        isCompleted: !!sub,
        score: sub ? sub.score : null,
        timestamp: sub ? sub.timestamp : null
      };
    });

    const done = list.filter(e => e.isCompleted).length;
    const pending = list.length - done;
    const pct = Math.round((done / list.length) * 100);

    return { done, pending, pct, list };
  }, [relevantExams, studentSubmissions]);

  // Charts for completion
  const chartData = useMemo(() => {
    return [
      { name: 'Đã hoàn thành', value: examStatus.done || 0, color: '#10B981' },
      { name: 'Chưa hoàn thành', value: examStatus.pending || (relevantExams.length === 0 ? 1 : 0), color: '#374151' },
    ];
  }, [examStatus, relevantExams]);

  // 3. Filter behavior logs
  const studentLogs = useMemo(() => {
    return behavior
      .filter(b => b.className === targetClass && b.studentName.toLowerCase() === targetName.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [behavior, targetClass, targetName]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center px-6 text-slate-100 font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] -z-10"></div>
        <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm animate-pulse font-medium">Đang tải kết quả học tập của con...</p>
      </div>
    );
  }

  // Error state
  if (error || (!isLoading && roster.length > 0 && !studentInfo)) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center px-6 relative font-sans text-slate-100">
        <div className="w-full max-w-md bg-[#111827]/80 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-4 text-amber-400 inline-block mx-auto shadow-lg">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-black mb-3">Thông báo</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error || `Không tìm thấy học sinh "${targetName}" trong Lớp "${targetClass}" ở hệ thống.`}
          </p>
          <Link href="/" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-colors shadow-xl shadow-indigo-600/20">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = studentInfo?.tuitionStatus?.toLowerCase().includes('đã') || 
                 studentInfo?.tuitionStatus?.toLowerCase().includes('ok') || 
                 studentInfo?.tuitionStatus?.toLowerCase().includes('rồi') ||
                 studentInfo?.tuitionStatus?.toLowerCase().includes('xong');

  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 overflow-x-hidden font-sans relative pb-20">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[150px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px]"></div>
      </div>

      {/* Page Header Banner */}
      <div className="bg-[#111827] border-b border-slate-800/50 pt-8 pb-10 px-6 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl shadow-xl shadow-indigo-600/20 shrink-0">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Cổng thông tin Phụ huynh
                </span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">{targetName}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-1"><School className="h-4 w-4 text-indigo-400"/> Lớp {targetClass}</span>
                <span className="h-3 w-[1px] bg-slate-800 hidden sm:inline"></span>
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-4 w-4"/> Kết nối Google Sheet chính thức</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/50 px-5 py-4 rounded-2xl flex flex-col justify-center backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" /> Lịch Học Cố Định
            </div>
            <div className="text-slate-200 font-bold text-base">
              {studentInfo?.schedule || <span className="text-slate-600 italic text-sm">Chưa được đặt</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Overview Stat Summary Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Block 1: Tuition Status */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute -right-4 -bottom-4 text-indigo-600/10">
              <CreditCard className="h-28 w-28" />
            </div>
            <div className="flex items-center justify-between text-slate-400 mb-3 font-bold uppercase text-[10px] tracking-wider">
              <span>Học phí & Tài chính</span>
              <CreditCard className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mb-1">{studentInfo?.tuition || "Chưa cập nhật"}</div>
            <div>
              {studentInfo?.tuitionStatus ? (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase ${
                  isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                } border`}>
                  {isPaid ? <CheckCircle2 className="h-3.5 w-3.5"/> : <Clock className="h-3.5 w-3.5" />}
                  {studentInfo.tuitionStatus}
                </span>
              ) : (
                <span className="text-xs text-slate-500 italic">Liên hệ giáo viên để cập nhật</span>
              )}
            </div>
          </div>

          {/* Block 2: Completion Exam Percentage */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute -right-4 -bottom-4 text-emerald-600/10">
              <ClipboardList className="h-28 w-28" />
            </div>
            <div className="flex items-center justify-between text-slate-400 mb-3 font-bold uppercase text-[10px] tracking-wider">
              <span>Tiến độ làm bài đầy đủ</span>
              <ClipboardList className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mb-1">{examStatus.pct}% <span className="text-xs font-medium text-slate-500">({examStatus.done}/{relevantExams.length})</span></div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{width: `${examStatus.pct}%`}}></div>
              </div>
            </div>
          </div>

          {/* Block 3: Attitude / Behavior Overall */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute -right-4 -bottom-4 text-purple-600/10">
              <Heart className="h-28 w-28" />
            </div>
            <div className="flex items-center justify-between text-slate-400 mb-3 font-bold uppercase text-[10px] tracking-wider">
              <span>Ý thức lớp & Nhận xét</span>
              <Activity className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white mb-1">
              {studentLogs.length > 0 ? studentLogs[0].status || 'Bình thường' : 'Ngoan, tốt'}
            </div>
            <span className="text-xs text-slate-400 font-medium inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-xl">
              {studentLogs.length} lượt đánh giá từ GV
            </span>
          </div>
        </div>

        {/* Grid Layout for Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Study Results & Detailed Scoreboard */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-400"/> Kết quả & Bảng kiểm diện làm bài</h2>
                <span className="text-xs text-slate-400 font-bold">{examStatus.list.length} đề được giao</span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                {examStatus.list.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 italic">
                    Chưa có đề thi nào được phân công công khai cho lớp này.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider sticky top-0">
                      <tr>
                        <th className="px-6 py-4">Tên đề thi / Nhiệm vụ</th>
                        <th className="px-6 py-4 text-center">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Điểm / Nhận xét</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {examStatus.list.map((exam, index) => (
                        <tr key={index} className={`hover:bg-slate-800/30 transition-colors ${exam.isCompleted ? '' : 'bg-slate-900/20'}`}>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-200">{exam.title}</div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3">
                              <span className="flex items-center gap-1"><BookOpen className="h-3 w-3"/> {exam.duration} phút</span>
                              {exam.timestamp && (
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {new Date(exam.timestamp).toLocaleString('vi-VN', {day: '2-digit', month: '2-digit'})}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {exam.isCompleted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black tracking-wide uppercase">
                                <CheckCircle2 className="h-3 w-3"/> Đã nộp bài
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[10px] font-black tracking-wide uppercase animate-pulse">
                                <XCircle className="h-3 w-3"/> Chưa làm bài
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {exam.isCompleted ? (
                              <div className="text-base font-black text-white bg-indigo-600/10 border border-indigo-500/20 px-3 py-1 rounded-lg inline-block font-mono">{exam.score}</div>
                            ) : (
                              <span className="text-slate-600 text-xs font-medium italic">Đang chờ con làm</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Behavior Logs & Timeline */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Overall Graph */}
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-black text-slate-300 mb-6 uppercase tracking-wide flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400"/> Biểu đồ hoàn thành
              </h3>
              <div className="relative flex items-center justify-center h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={chartData} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <div className="text-3xl font-black text-white">{examStatus.pct}%</div>
                  <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">Tỷ lệ làm bài</div>
                </div>
              </div>
            </div>

            {/* Observation Diary Timeline */}
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-black text-slate-300 mb-5 uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-400"/> Nhật ký của Thầy/Cô
              </h3>

              <div className="space-y-5">
                {studentLogs.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center">
                    <ShieldAlert className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 leading-relaxed">Hiện tại chưa ghi nhận trường hợp ý thức đặc biệt nào. Con đi học ngoan và ổn định.</p>
                  </div>
                ) : (
                  studentLogs.map((log, index) => {
                    const isGood = log.status?.toLowerCase().includes('tốt') || 
                                   log.status?.toLowerCase().includes('ngoan') || 
                                   log.status?.toLowerCase().includes('chăm') ||
                                   log.status?.toLowerCase().includes('giỏi');
                    return (
                      <div key={index} className="relative pl-6 border-l border-slate-800 last:pb-0 pb-2">
                        <div className={`absolute left-0 -translate-x-1/2 top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                          isGood ? 'bg-emerald-500 border-emerald-500/20' : 'bg-rose-500 border-rose-500/20'
                        }`} />
                        
                        <div className="text-[10px] text-slate-500 font-mono mb-1">
                          {log.timestamp ? new Date(log.timestamp).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}
                        </div>
                        
                        <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-3 mt-1 text-sm relative">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[9px] font-black tracking-wider uppercase px-1.5 rounded-md ${
                              isGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {log.status || 'Ý thức'}
                            </span>
                          </div>
                          <p className="text-slate-300 font-medium italic leading-relaxed">"{log.note}"</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}

export default function ParentPortal({ initialExams }: { initialExams: Exam[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center text-slate-100 font-sans">
        <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Đang thiết lập dữ liệu...</p>
      </div>
    }>
      <ParentPortalContent initialExams={initialExams} />
    </Suspense>
  );
}
