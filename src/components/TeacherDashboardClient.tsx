'use client';

import { Exam } from "@/lib/exams";
import Link from "next/link";
import { 
  Users, School, Calendar, ArrowLeft, Lock, KeyRound, Loader2, 
  RefreshCw, Search, CheckCircle2, XCircle, GraduationCap, 
  BookOpen, Trophy, PieChart, ArrowRight, Download, Filter, AlertCircle
} from "lucide-react";
import React, { useEffect, useState, useMemo } from 'react';
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
}

export default function TeacherDashboardClient({ initialExams }: { initialExams: Exam[] }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [roster, setRoster] = useState<StudentRoster[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedClass, setSelectedClass] = useState("Tất cả");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  
  const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
  const requiredPin = process.env.NEXT_PUBLIC_TEACHER_PIN || "123456";

  // Check authorization on load
  useEffect(() => {
    const authStatus = sessionStorage.getItem('teacher_auth');
    if (authStatus === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === requiredPin) {
      setIsAuthorized(true);
      sessionStorage.setItem('teacher_auth', 'true');
      setPinError("");
    } else {
      setPinError("Mã bảo mật không chính xác. Vui lòng thử lại!");
    }
  };

  const fetchData = async () => {
    if (!sheetUrl) {
      setError("Chưa cấu hình API Google Sheet. Vui lòng đặt biến NEXT_PUBLIC_GOOGLE_SHEET_URL trong Vercel/môi trường.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${sheetUrl}?action=get_data`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Network error fetching sheet data");
      const json = await res.json();
      setSubmissions(json.submissions || []);
      setRoster(json.roster || []);
    } catch (err: any) {
      setError(`Không thể tải dữ liệu: ${err.message || "Lỗi không xác định"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch once authorized
  useEffect(() => {
    if (isAuthorized && sheetUrl) {
      fetchData();
    }
  }, [isAuthorized, sheetUrl]);

  // Dynamic options
  const availableClasses = useMemo(() => {
    const fromRoster = roster.map(r => r.className);
    const fromSubs = submissions.map(s => s.className);
    const combined = Array.from(new Set([...fromRoster, ...fromSubs])).filter(Boolean);
    return combined.sort();
  }, [roster, submissions]);

  // Update selected class if "Tất cả" but we have options
  useEffect(() => {
    if (selectedClass === "Tất cả" && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses]);

  // Process status of each student in the selected class for the selected exam
  const classRoster = useMemo(() => {
    if (selectedClass === "Tất cả") return roster;
    return roster.filter(r => r.className === selectedClass);
  }, [roster, selectedClass]);

  // Filter submissions relevant to selected class and exam
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchesClass = selectedClass === "Tất cả" || sub.className === selectedClass;
      const matchesExam = selectedExam === "all" || sub.examId === selectedExam;
      return matchesClass && matchesExam;
    });
  }, [submissions, selectedClass, selectedExam]);

  // Create combined view mapping every roster student to a submission
  const studentAnalysis = useMemo(() => {
    if (selectedExam === "all") return []; // Only analyze for a specific exam
    
    return classRoster.map(student => {
      // Find latest submission of this student for this exam
      const sub = submissions
        .filter(s => s.className === student.className && s.studentName.toLowerCase() === student.studentName.toLowerCase() && s.examId === selectedExam)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
      return {
        name: student.studentName,
        className: student.className,
        isCompleted: !!sub,
        score: sub ? sub.score : null,
        timestamp: sub ? sub.timestamp : null
      };
    }).sort((a, b) => {
       // Sort: Uncompleted first, then alphabetically
       if (a.isCompleted === b.isCompleted) return a.name.localeCompare(b.name);
       return a.isCompleted ? 1 : -1; 
    });
  }, [classRoster, submissions, selectedExam]);

  // Calculate summary stats
  const currentExamStats = useMemo(() => {
    const totalRoster = studentAnalysis.length;
    if (totalRoster === 0) return { done: 0, pending: 0, pct: 0, avgScore: "N/A" };
    
    const done = studentAnalysis.filter(s => s.isCompleted).length;
    const pending = totalRoster - done;
    const pct = Math.round((done / totalRoster) * 100);
    
    // Parse average score
    const scores = studentAnalysis
      .filter(s => s.isCompleted && s.score)
      .map(s => {
        const match = String(s.score).match(/([\d\.]+)\s*\//);
        return match ? parseFloat(match[1]) : parseFloat(s.score!) || 0;
      });
    
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : "N/A";
    
    return { done, pending, pct, avgScore: avg };
  }, [studentAnalysis]);

  const chartData = useMemo(() => {
    return [
      { name: 'Đã hoàn thành', value: currentExamStats.done, color: '#10B981' },
      { name: 'Chưa hoàn thành', value: currentExamStats.pending, color: '#374151' },
    ];
  }, [currentExamStats]);

  // Roster is empty check
  const isRosterEmpty = roster.length === 0;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center px-6 relative font-sans text-slate-100 overflow-hidden">
        {/* Backglows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>
        
        <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 text-sm bg-slate-800/30 border border-slate-800 px-4 py-2 rounded-xl backdrop-blur-sm">
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>

        <div className="w-full max-w-md bg-[#111827]/80 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl mb-4 text-white shadow-lg shadow-indigo-500/20">
              <KeyRound className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black">Khu vực Giáo viên</h1>
            <p className="text-slate-400 text-sm mt-2">Vui lòng nhập mã pin bảo mật của bạn để truy cập bảng thống kê.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
                <input 
                  type="password" 
                  required 
                  placeholder="Nhập mã PIN" 
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white px-12 py-4 rounded-2xl text-lg focus:ring-2 ring-indigo-500/30 outline-none transition-all text-center tracking-[0.5em]" 
                />
              </div>
              {pinError && <p className="text-red-400 text-xs mt-2 text-center font-bold">{pinError}</p>}
            </div>
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Xác nhận truy cập <ArrowRight className="h-5 w-5" />
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gợi ý: Mã pin mặc định là `123456`</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 overflow-x-hidden font-sans relative">
      {/* Top glow decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[50%] bg-purple-600/10 blur-[150px]"></div>
      </div>

      {/* Header Bar */}
      <nav className="sticky top-0 z-40 w-full bg-[#0B0F17]/80 backdrop-blur-xl border-b border-slate-800/50 h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm py-1 px-2 bg-slate-800/20 border border-slate-800/50 rounded-lg">
              <ArrowLeft className="h-4 w-4"/> Trở về
            </Link>
            <div className="h-4 w-[1px] bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-indigo-400" />
              <span className="text-base font-black">Teacher Board Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {sheetUrl ? (
              <button 
                onClick={fetchData} 
                disabled={isLoading}
                className="flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Làm mới dữ liệu
              </button>
            ) : (
              <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Chưa kết nối Google Sheets
              </span>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Setup Warning if no URL configured */}
        {!sheetUrl && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-red-400 flex items-center gap-2"><AlertCircle className="h-5 w-5"/> Chưa cài đặt Cổng Google Sheets!</h3>
              <p className="text-slate-400 text-sm mt-1">Bạn cần sao chép mã script Google Sheets và đặt link API vào biến môi trường `NEXT_PUBLIC_GOOGLE_SHEET_URL` trên Vercel.</p>
            </div>
            <a href="https://vercel.com" target="_blank" rel="noreferrer" className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black shrink-0 text-center hover:bg-red-600 transition-colors">Cấu hình trên Vercel ngay</a>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4 mb-8 text-sm flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {/* Global Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng lượt nộp bài</span>
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="text-3xl font-black text-white">{submissions.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">Tất cả các đề, mọi thời điểm</p>
          </div>
          
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng số học sinh</span>
              <Users className="h-4 w-4" />
            </div>
            <div className="text-3xl font-black text-white">{roster.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">Trong danh sách sĩ số lớp</p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Số Lớp học</span>
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="text-3xl font-black text-indigo-400">{availableClasses.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">{availableClasses.join(', ') || 'Chưa xác định'}</p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Số lượng Đề thi</span>
              <Calendar className="h-4 w-4" />
            </div>
            <div className="text-3xl font-black text-purple-400">{initialExams.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">Đang được mở công khai</p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-1/4">
              <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-wider">Chọn Lớp Học</label>
              <div className="relative">
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 appearance-none focus:ring-1 ring-indigo-500 outline-none"
                >
                  {availableClasses.length === 0 && <option value="Tất cả">Không có lớp</option>}
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>Lớp {cls}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="w-full md:w-2/4">
              <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-wider">Chọn Đề Thi Theo Dõi</label>
              <div className="relative">
                <select 
                  value={selectedExam} 
                  onChange={e => setSelectedExam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 appearance-none focus:ring-1 ring-indigo-500 outline-none"
                >
                  <option value="all">-- Xem lịch sử làm bài tổng hợp (Tất cả các đề) --</option>
                  {initialExams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title} ({ex.examClass})</option>
                  ))}
                </select>
                <BookOpen className="absolute right-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="w-full md:w-1/4 self-end">
               <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Tìm tên học sinh..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:ring-1 ring-indigo-500"
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedExam === "all" ? (
          /* COMPREHENSIVE HISTORY LOG VIEW */
          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
             <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h2 className="text-lg font-bold">Lịch sử làm bài gần đây</h2>
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">{filteredSubmissions.length} bản ghi</span>
             </div>
             <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                {filteredSubmissions.length === 0 ? (
                   <div className="text-center py-20 text-slate-500 font-medium">Chưa có dữ liệu nộp bài nào phù hợp với lớp đã chọn.</div>
                ) : (
                   <table className="w-full text-left border-collapse text-sm">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider sticky top-0">
                         <tr>
                            <th className="px-6 py-4">Thời gian</th>
                            <th className="px-6 py-4">Lớp</th>
                            <th className="px-6 py-4">Học sinh</th>
                            <th className="px-6 py-4">Đề thi</th>
                            <th className="px-6 py-4 text-right">Kết quả</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                         {filteredSubmissions
                           .filter(s => s.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
                           .map((sub, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                               <td className="px-6 py-4 text-slate-400 font-mono text-xs whitespace-nowrap">{sub.timestamp}</td>
                               <td className="px-6 py-4"><span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-xs font-bold">Lớp {sub.className}</span></td>
                               <td className="px-6 py-4 font-bold text-white">{sub.studentName}</td>
                               <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{sub.examTitle}</td>
                               <td className="px-6 py-4 text-right"><span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg font-bold">{sub.score}</span></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                )}
             </div>
          </div>
        ) : (
          /* DETAILED EXAM ANALYSIS AND COMPLETION STATUS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* LEFT SIDE: Chart & Metrics */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 flex flex-col h-fit shadow-xl">
                   <h3 className="text-sm font-black text-slate-300 mb-6 uppercase tracking-wide flex items-center gap-2"><PieChart className="h-4 w-4 text-indigo-400"/> Trạng thái Hoàn thành</h3>
                   
                   {isRosterEmpty ? (
                     <div className="py-10 text-center border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500 leading-relaxed">
                       <AlertCircle className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                       Cần danh sách học sinh ở sheet <b>"Students"</b> mới có thể phân tích tỉ lệ hoàn thành.
                     </div>
                   ) : (
                     <>
                        <div className="w-full h-[180px] relative flex items-center justify-center">
                           <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                 <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                                    {chartData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                 </Pie>
                              </RechartsPieChart>
                           </ResponsiveContainer>
                           <div className="absolute text-center">
                              <div className="text-3xl font-black text-white">{currentExamStats.pct}%</div>
                              <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">Hoàn thành</div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-slate-800">
                           <div className="text-center">
                              <div className="text-2xl font-black text-emerald-400">{currentExamStats.done}</div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase">Đã làm bài</div>
                           </div>
                           <div className="text-center">
                              <div className="text-2xl font-black text-slate-400">{currentExamStats.pending}</div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase">Chưa làm bài</div>
                           </div>
                        </div>

                        <div className="mt-6 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-4 flex items-center justify-between">
                           <div className="flex items-center gap-2 text-indigo-300 text-sm font-bold"><Trophy className="h-4 w-4" /> Điểm TB Lớp:</div>
                           <span className="text-xl font-black text-white">{currentExamStats.avgScore}</span>
                        </div>
                     </>
                   )}
                </div>
             </div>

             {/* RIGHT SIDE: Full student checklist */}
             <div className="lg:col-span-8">
                <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                   <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                      <div>
                         <h2 className="text-base font-bold flex items-center gap-2">Bảng kiểm diện và điểm số</h2>
                         <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Đề: {initialExams.find(e => e.id === selectedExam)?.title}</p>
                      </div>
                      <span className="text-xs bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded">Lớp {selectedClass}</span>
                   </div>

                   <div className="overflow-x-auto custom-scrollbar" style={{maxHeight: '550px'}}>
                      {isRosterEmpty ? (
                         <div className="py-20 px-6 text-center">
                           <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-3 animate-pulse" />
                           <h4 className="text-white font-bold mb-2">Thiếu Danh Sách Lớp</h4>
                           <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                             Để xem danh sách ai chưa làm, hãy tạo Sheet tên <b>"Students"</b> trong file Google Sheet của bạn, gồm cột 1 là <b>"Lớp"</b> và cột 2 là <b>"Họ và Tên"</b>.
                           </p>
                         </div>
                      ) : (
                         <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider sticky top-0 z-10">
                               <tr>
                                  <th className="px-6 py-4 w-12 text-center">STT</th>
                                  <th className="px-6 py-4">Học sinh</th>
                                  <th className="px-6 py-4 text-center">Trạng thái</th>
                                  <th className="px-6 py-4">Kết quả</th>
                                  <th className="px-6 py-4">Thời điểm làm bài</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                               {studentAnalysis
                                 .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                 .map((stud, index) => (
                                  <tr key={index} className={`transition-colors ${stud.isCompleted ? 'hover:bg-emerald-500/5' : 'bg-slate-900/30 hover:bg-red-500/5'}`}>
                                     <td className="px-6 py-4 text-center text-slate-500 font-mono text-xs">{index + 1}</td>
                                     <td className={`px-6 py-4 font-bold ${stud.isCompleted ? 'text-white' : 'text-slate-400'}`}>
                                        {stud.name}
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                        {stud.isCompleted ? (
                                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase">
                                            <CheckCircle2 className="h-3 w-3" /> Hoàn thành
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase">
                                            <XCircle className="h-3 w-3" /> Chưa làm
                                          </span>
                                        )}
                                     </td>
                                     <td className="px-6 py-4 font-mono">
                                        {stud.isCompleted ? (
                                          <span className="text-emerald-400 font-bold text-base">{stud.score}</span>
                                        ) : (
                                          <span className="text-slate-600 font-medium text-xs">-- / --</span>
                                        )}
                                     </td>
                                     <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                                        {stud.timestamp ? new Date(stud.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '-'}
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      )}
                   </div>
                </div>
             </div>

          </div>
        )}

      </div>
    </main>
  );
}
