'use client';

import { Exam } from "@/lib/exams";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, School, User, Trophy, Calendar, Trash2, Play, Search, TrendingUp, TrendingDown, BarChart3, Activity, Layers, GraduationCap, Lock, Hourglass, Loader2, EyeOff } from "lucide-react";
import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ExamConfig {
  examId: string;
  status: string; // 'Công khai' | 'Ẩn' | 'Hẹn giờ'
  startTime: string;
  endTime: string;
}

export default function DashboardClient({ initialExams }: { initialExams: Exam[] }) {
  const [exams] = useState<Exam[]>(initialExams);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeClass, setActiveClass] = useState('Tất cả');
  const [activeTopic, setActiveTopic] = useState('Tất cả');
  const [user, setUser] = useState<{ name: string; className: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempClass, setTempClass] = useState('');
  const [examConfigs, setExamConfigs] = useState<ExamConfig[]>([]);
  const [isConfigsLoading, setIsConfigsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Derive distinct filter options
  const classOptions = useMemo(() => {
    const raw = Array.from(new Set(exams.map(e => e.examClass)));
    return ['Tất cả', ...raw];
  }, [exams]);

  const topicOptions = useMemo(() => {
    const raw = Array.from(new Set(exams.map(e => e.examTopic)));
    return ['Tất cả', ...raw];
  }, [exams]);

  const userMatchedClass = useMemo(() => {
    if (!user || !user.className || classOptions.length <= 1) return null;
    const studentClassStr = user.className.trim();
    const numberMatch = studentClassStr.match(/\d+/);
    if (numberMatch) {
      const gradeNum = numberMatch[0];
      return classOptions.find(opt => opt !== 'Tất cả' && opt.includes(gradeNum)) || null;
    }
    return classOptions.find(opt => opt !== 'Tất cả' && (opt.toLowerCase().includes(studentClassStr.toLowerCase()) || studentClassStr.toLowerCase().includes(opt.toLowerCase()))) || null;
  }, [user, classOptions]);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem('exam_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    else setShowUserModal(true);

    const savedHistory = localStorage.getItem('exam_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
    if (sheetUrl) {
      fetch(`${sheetUrl}?action=get_data`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data && data.examConfigs) {
            setExamConfigs(data.examConfigs);
          }
        })
        .catch(err => console.error("Lỗi tải cấu hình:", err))
        .finally(() => setIsConfigsLoading(false));
    } else {
      setIsConfigsLoading(false);
    }
  }, []);

  // Automatically filter content based on the student's registered class
  useEffect(() => {
    if (user && user.className && classOptions.length > 1 && activeClass === 'Tất cả') {
      const studentClassStr = user.className.trim();
      const numberMatch = studentClassStr.match(/\d+/);
      
      if (numberMatch) {
        const gradeNumber = numberMatch[0]; // Extract "12" from "12A1"
        // Look for a matching exam category (e.g., "Lớp 12" or "Khối 12")
        const matchedCategory = classOptions.find(
          opt => opt !== 'Tất cả' && opt.includes(gradeNumber)
        );
        if (matchedCategory) {
          setActiveClass(matchedCategory);
        }
      } else {
        // Handle textual matching (e.g., "Chung", "Tập sự")
        const matchedCategory = classOptions.find(
          opt => opt !== 'Tất cả' && 
          (opt.toLowerCase().includes(studentClassStr.toLowerCase()) || 
           studentClassStr.toLowerCase().includes(opt.toLowerCase()))
        );
        if (matchedCategory) {
          setActiveClass(matchedCategory);
        }
      }
    }
  }, [user, classOptions, activeClass]);

  const stats = useMemo(() => {
    if (history.length === 0) return { avg: "0", trend: "0", total: 0, chartData: [] };
    const numericScores = history.map(item => {
      const match = String(item.score).match(/([\d\.]+)\s*\//);
      return match ? parseFloat(match[1]) : parseFloat(item.score) || 0;
    });
    const total = numericScores.length;
    const avg = numericScores.reduce((a, b) => a + b, 0) / total;
    let trend = 0;
    if (total >= 2) trend = numericScores[total - 1] - numericScores[total - 2];
    const chartData = history.slice(-10).map((item, index) => {
      const val = String(item.score).match(/([\d\.]+)\s*\//);
      return { name: `Lần ${index + 1}`, score: val ? parseFloat(val[1]) : 0 };
    });
    return { avg: avg.toFixed(2), trend: trend.toFixed(2), total, chartData };
  }, [history]);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim() && tempClass.trim()) {
      const newUser = { name: tempName, className: tempClass };
      localStorage.setItem('exam_user', JSON.stringify(newUser));
      setUser(newUser);
      setShowUserModal(false);
    }
  };

  const clearHistory = () => {
    if(confirm("Xoá toàn bộ lịch sử?")) {
      localStorage.removeItem('exam_history');
      setHistory([]);
    }
  };

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = activeClass === 'Tất cả' || e.examClass === activeClass;
    const matchesTopic = activeTopic === 'Tất cả' || e.examTopic === activeTopic;
    return matchesSearch && matchesClass && matchesTopic;
  });

  const visibleExams = useMemo(() => {
    const now = new Date();
    
    return filteredExams.map(exam => {
      const config = examConfigs.find(c => c.examId === exam.id);
      let isHidden = false;
      let isLocked = false;
      let unlockReason = "";

      if (config) {
        if (config.status === 'Ẩn') {
          isHidden = true;
        } else if (config.status === 'Hẹn giờ') {
          const start = config.startTime ? new Date(config.startTime) : null;
          const end = config.endTime ? new Date(config.endTime) : null;
          
          if (start && now < start) {
            isLocked = true;
            unlockReason = `Mở vào ${start.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}`;
          } else if (end && now > end) {
            isLocked = true;
            unlockReason = `Đã kết thúc lúc ${end.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}`;
          }
        }
      }

      return {
        ...exam,
        isHidden,
        isLocked,
        unlockReason
      };
    }).filter(e => !e.isHidden);
  }, [filteredExams, examConfigs]);

  const reversedHistory = [...history].reverse().slice(0, 5);

  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 overflow-x-hidden font-sans relative">
      {/* Glowing background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[50%] bg-blue-600/20 blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-[#0B0F17]/80 backdrop-blur-xl border-b border-slate-800/50 h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl"><School className="h-5 w-5 text-white" /></div>
            <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ExamPortal Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/teacher" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 border border-slate-800 hover:border-indigo-500/30 rounded-xl hover:bg-indigo-500/5 transition-all mr-2">
              <Lock className="h-3 w-3 text-indigo-400" /> Khu vực Giáo viên
            </Link>
            {user && (
              <div className="flex items-center gap-3 px-3 py-1 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-right hidden sm:block"><p className="text-xs font-bold">{user.name}</p><p className="text-[10px] text-indigo-400">Lớp {user.className}</p></div>
                <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center"><User className="h-4 w-4" /></div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* TOP ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-[#111827] border border-slate-800 rounded-3xl p-8 relative shadow-xl">
              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400 mb-4">
                   <Activity className="h-3 w-3 animate-pulse" /> ĐANG HOẠT ĐỘNG
                 </div>
                 <h1 className="text-3xl md:text-4xl font-black mb-4">Luyện thi thông minh</h1>
                 <div className="relative w-full max-w-md">
                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                   <input type="text" placeholder="Tìm tên đề..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 ring-indigo-500/10"/>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bài đã nộp</p>
                <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
              </div>
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Điểm TB</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">{stats.avg}</p>
              </div>
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tiến độ</p>
                <div className={`flex items-center gap-1 text-xl font-black mt-1 ${parseFloat(stats.trend) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {parseFloat(stats.trend) > 0 ? '+' : ''}{stats.trend}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
             <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 shadow-xl flex-1 min-h-[220px]">
                <p className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-indigo-400"/> Biểu đồ tiến bộ</p>
                <div className="w-full h-[160px] relative">
                  {isMounted && history.length >= 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData} margin={{ top: 0, right: 0, left: -35, bottom: 0 }}>
                        <defs><linearGradient id="colScr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="name" stroke="#4b5563" fontSize={9} />
                        <YAxis domain={[0, 10]} stroke="#4b5563" fontSize={9} />
                        <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                        <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} fill="url(#colScr)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl">Làm thêm đề để vẽ biểu đồ.</div>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* DUAL FILTER SECTION & GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR FILTERS */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sticky top-24">
               
               {/* Filter by Class */}
               <div className="mb-6">
                 <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3 uppercase tracking-wide">
                   <GraduationCap className="h-4 w-4 text-indigo-500" /> Theo Khối Lớp
                 </h3>
                 <div className="space-y-1.5">
                    {classOptions.map(c => (
                      <button key={c} onClick={() => setActiveClass(c)} 
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between ${activeClass === c ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                         <span className="flex items-center gap-1.5">
                           {c}
                           {userMatchedClass === c && (
                             <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black tracking-wider uppercase border ${activeClass === c ? 'bg-indigo-700 border-indigo-500 text-indigo-100' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>Lớp Bạn</span>
                           )}
                         </span>
                         {activeClass === c && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                    ))}
                 </div>
               </div>

               <div className="border-t border-slate-800 my-5"></div>

               {/* Filter by Topic */}
               <div>
                 <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3 uppercase tracking-wide">
                   <Layers className="h-4 w-4 text-violet-500" /> Chuyên đề
                 </h3>
                 <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {topicOptions.map(t => (
                      <button key={t} onClick={() => setActiveTopic(t)} 
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between ${activeTopic === t ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                         <span className="truncate pr-2">{t}</span>
                      </button>
                    ))}
                 </div>
               </div>

             </div>
          </div>

          {/* RIGHT CONTENT GRID */}
          <div className="lg:col-span-9">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-black flex items-center gap-3">
                 Bộ sưu tập đề thi
                 {!isConfigsLoading && (
                   <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-lg">{visibleExams.length}</span>
                 )}
               </h2>
             </div>

             {isConfigsLoading ? (
               <div className="py-32 flex flex-col items-center justify-center text-slate-500 gap-3 bg-slate-950/30 border border-slate-850 rounded-3xl border-dashed">
                 <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                 <span className="text-xs font-bold tracking-wider uppercase">Đang đồng bộ danh sách đề thi...</span>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {visibleExams.map(exam => (
                   <div key={exam.id} className={`bg-[#111827] border rounded-2xl p-5 transition-all group relative overflow-hidden shadow-lg ${
                     exam.isLocked 
                       ? 'opacity-65 grayscale-[35%] border-slate-850 shadow-none' 
                       : 'hover:-translate-y-1 hover:border-indigo-500/30 border-slate-800'
                   }`}>
                     {!exam.isLocked && (
                       <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                     )}
                     
                     <div className="flex items-center justify-between gap-2 mb-3">
                       <div className="flex items-center gap-2 flex-wrap">
                         <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[9px] font-black tracking-wider uppercase border border-indigo-500/10">{exam.examClass}</span>
                         <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-md text-[9px] font-black tracking-wider uppercase border border-violet-500/10">{exam.examTopic}</span>
                       </div>
                       {exam.isLocked && (
                         <span className="text-[9px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shrink-0 font-sans">
                           <Lock className="h-2.5 w-2.5" /> Khóa
                         </span>
                       )}
                     </div>
                     
                     <h3 className={`font-bold line-clamp-2 min-h-[3rem] transition-colors ${
                       exam.isLocked 
                         ? 'text-slate-400' 
                         : 'text-white group-hover:text-indigo-300'
                     }`}>
                       {exam.title}
                     </h3>
                     
                     <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3">
                       {exam.isLocked && (
                         <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-[10px] text-amber-400/90 font-bold animate-in fade-in duration-300">
                           <Hourglass className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-pulse" />
                           <span>{exam.unlockReason}</span>
                         </div>
                       )}
                       
                       <div className="flex items-center justify-between w-full">
                         <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold"><Clock className="h-3 w-3"/> {exam.duration || '45 Phút'}</div>
                         
                         {exam.isLocked ? (
                           <div className="px-4 py-2 bg-slate-800/50 text-slate-500 border border-slate-800 rounded-xl text-xs font-black flex items-center gap-1 select-none">
                             Chưa mở
                           </div>
                         ) : (
                           <Link href={`/exams/${exam.id}`} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md shadow-indigo-900/20 hover:bg-indigo-500 transform active:scale-95 transition-all cursor-pointer">
                             Vào thi <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                           </Link>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
                 
                 {visibleExams.length === 0 && (
                   <div className="col-span-full py-24 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-950/20 flex flex-col items-center justify-center">
                     <EyeOff className="h-10 w-10 text-slate-700 mb-3" />
                     <div className="text-slate-500 font-bold">Hiện tại chưa có đề thi nào khả dụng trong mục này.</div>
                   </div>
                 )}
               </div>
             )}
          </div>

        </div>
      </div>

      {/* Setup Modal (Minimal fallback) */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-black text-center mb-6">Thiết lập hồ sơ</h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <input required placeholder="Họ tên" value={tempName} onChange={e=>setTempName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl" />
              <input required placeholder="Lớp" value={tempClass} onChange={e=>setTempClass(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl" />
              <button className="w-full bg-indigo-600 py-3.5 rounded-xl font-bold shadow-lg mt-2">Lưu thông tin</button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
