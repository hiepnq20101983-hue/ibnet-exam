'use client';

import { Exam } from "@/lib/exams";
import Link from "next/link";
import { 
  Users, School, Calendar, ArrowLeft, Lock, KeyRound, Loader2, 
  RefreshCw, Search, CheckCircle2, XCircle, GraduationCap, 
  BookOpen, Trophy, PieChart, ArrowRight, Download, Filter, AlertCircle,
  Copy, Activity, Plus, Edit, X, UserPlus, CalendarRange, Upload, 
  Settings, Trash2, ChevronLeft, ChevronRight, Check, Clock, Eye, EyeOff, CheckSquare
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

interface ExamConfig {
  examId: string;
  status: string; // 'Công khai' | 'Ẩn' | 'Hẹn giờ'
  startTime: string;
  endTime: string;
}

function ExamConfigItem({ 
  exam, 
  config, 
  onSave, 
  isSaving,
  isSelected,
  onToggleSelect
}: { 
  exam: Exam; 
  config?: ExamConfig; 
  onSave: (examId: string, status: string, start: string, end: string) => Promise<void>;
  isSaving: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const [status, setStatus] = useState(config?.status || 'Công khai');
  const [startTime, setStartTime] = useState(config?.startTime || '');
  const [endTime, setEndTime] = useState(config?.endTime || '');

  useEffect(() => {
    if (config) {
      setStatus(config.status);
      setStartTime(config.startTime);
      setEndTime(config.endTime);
    }
  }, [config]);

  const hasChanges = status !== (config?.status || 'Công khai') || 
                     startTime !== (config?.startTime || '') || 
                     endTime !== (config?.endTime || '');

  return (
    <tr className="hover:bg-slate-800/10 transition-colors group border-b border-slate-800">
      <td className="px-6 py-5 text-center">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 accent-indigo-600 cursor-pointer focus:ring-indigo-500"
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700">
              Lớp {exam.examClass}
            </span>
            {exam.source === 'google-drive' ? (
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Google Drive
              </span>
            ) : (
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                Github
              </span>
            )}
            {config?.status === 'Ẩn' && (
              <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-lg">
                <EyeOff className="h-3 w-3" /> Đang Ẩn
              </span>
            )}
            {config?.status === 'Hẹn giờ' && (
              <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg animate-pulse">
                <Clock className="h-3 w-3" /> Lên lịch
              </span>
            )}
          </div>
          <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors mt-1">{exam.title}</h4>
          <span className="text-[10px] text-slate-600 font-mono truncate max-w-xs">ID: {exam.id}</span>
          {exam.summary && (
            <div className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg mt-2 font-medium max-w-md whitespace-pre-line shadow-inner">
              {exam.summary}
            </div>
          )}
        </div>
      </td>
      
      <td className="px-6 py-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 w-fit">
            {[
              { val: 'Công khai', label: 'Hiện', icon: Eye, color: 'text-emerald-400' },
              { val: 'Ẩn', label: 'Ẩn', icon: EyeOff, color: 'text-rose-400' },
              { val: 'Hẹn giờ', label: 'Hẹn giờ', icon: Clock, color: 'text-amber-400' }
            ].map(opt => {
              const Icon = opt.icon;
              const active = status === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setStatus(opt.val)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black transition-all ${
                    active 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : opt.color}`} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {status === 'Hẹn giờ' && (
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl animate-in slide-in-from-top-2 duration-200 shadow-inner">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <span className="text-[9px] font-black text-slate-500 uppercase">Bắt đầu</span>
                <input 
                  type="datetime-local" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-white text-[11px] font-bold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 ring-indigo-500 font-mono"
                />
              </div>
              <div className="text-slate-700 text-xs font-black shrink-0 mt-4 sm:mt-0">→</div>
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <span className="text-[9px] font-black text-slate-500 uppercase">Kết thúc</span>
                <input 
                  type="datetime-local" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-white text-[11px] font-bold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 ring-indigo-500 font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        <button
          onClick={() => onSave(exam.id, status, startTime, endTime)}
          disabled={isSaving || !hasChanges}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            !hasChanges 
              ? 'bg-slate-800/40 text-slate-600 cursor-default opacity-50'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Lưu...
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              Cập nhật
            </>
          )}
        </button>
      </td>
    </tr>
  );
}

export default function TeacherDashboardClient({ initialExams }: { initialExams: Exam[] }) {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [isExamsSyncing, setIsExamsSyncing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [roster, setRoster] = useState<StudentRoster[]>([]);
  const [behavior, setBehavior] = useState<BehaviorLog[]>([]);
  const [examConfigs, setExamConfigs] = useState<ExamConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'exams' | 'roster' | 'schedule' | 'manage-exams'>('exams');
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [isBatchSavingConfig, setIsBatchSavingConfig] = useState(false);
  const [batchStatus, setBatchStatus] = useState<string>('Công khai');
  const [batchStartTime, setBatchStartTime] = useState<string>('');
  const [batchEndTime, setBatchEndTime] = useState<string>('');
  const [copiedStudent, setCopiedStudent] = useState<string | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'google-drive' | 'github'>('all');
  
  // States cho Lịch học bận & Khung giờ cấu hình
  const [timeSlots, setTimeSlots] = useState<string[]>(['7h-8h30', '9h-10h30', '13h-14h30', '15h-16h30']);
  const [isEditingSlots, setIsEditingSlots] = useState(false);
  const [newSlotVal, setNewSlotVal] = useState("");
  
  // Calendar states
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(new Date().getDate());

  // Real-time Apps Script Diagnostics states
  const [testUrl, setTestUrl] = useState("");
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<{success?: boolean, message?: string, details?: string} | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // CSV Import States
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvParsedStudents, setCsvParsedStudents] = useState<StudentRoster[]>([]);
  const [isSubmittingCsv, setIsSubmittingCsv] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyRosterInStats, setOnlyRosterInStats] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState("Tất cả");
  const [selectedExam, setSelectedExam] = useState<string>("all");

  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", className: "", schedule: "", tuition: "", tuitionStatus: "Chưa đóng" });
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  
  const [editingStudent, setEditingStudent] = useState<StudentRoster | null>(null);
  const [editForm, setEditForm] = useState({ schedule: "", tuition: "", tuitionStatus: "" });
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);

  const openAddStudent = () => {
    setNewStudent({
      name: "",
      className: selectedClass !== "Tất cả" ? selectedClass : "",
      schedule: "",
      tuition: "",
      tuitionStatus: "Chưa đóng"
    });
    setIsAddingStudent(true);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.className.trim() || !sheetUrl) return;
    setIsSubmittingStudent(true);
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_student',
          studentName: newStudent.name.trim(),
          className: newStudent.className.trim(),
          schedule: newStudent.schedule.trim(),
          tuition: newStudent.tuition.trim(),
          tuitionStatus: newStudent.tuitionStatus.trim()
        })
      });
      setIsAddingStudent(false);
      setTimeout(() => {
        fetchData();
      }, 800);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleEditStudent = (student: StudentRoster) => {
    setEditingStudent(student);
    setEditForm({
      schedule: student.schedule || "",
      tuition: student.tuition || "",
      tuitionStatus: student.tuitionStatus || "Chưa đóng"
    });
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !sheetUrl) return;
    setIsUpdatingStudent(true);
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_student',
          studentName: editingStudent.studentName,
          className: editingStudent.className,
          schedule: editForm.schedule.trim(),
          tuition: editForm.tuition.trim(),
          tuitionStatus: editForm.tuitionStatus.trim()
        })
      });
      setEditingStudent(null);
      setTimeout(() => {
        fetchData();
      }, 800);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsUpdatingStudent(false);
    }
  };
  
  const [selectedStudentNames, setSelectedStudentNames] = useState<string[]>([]);
  const [isBatchScheduling, setIsBatchScheduling] = useState(false);
  const [batchForm, setBatchForm] = useState({ targetType: 'class' as 'class' | 'students', schedule: "" });
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // Clear checked students when changing class
  useEffect(() => {
    setSelectedStudentNames([]);
  }, [selectedClass]);

  const openBatchScheduling = () => {
    setBatchForm({
      targetType: selectedStudentNames.length > 0 ? 'students' : 'class',
      schedule: ""
    });
    setIsBatchScheduling(true);
  };

  const toggleStudentSelection = (name: string) => {
    setSelectedStudentNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleBatchSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl || selectedClass === "Tất cả") return;
    
    if (batchForm.targetType === 'students' && selectedStudentNames.length === 0) {
      alert("Vui lòng chọn ít nhất một học sinh!");
      return;
    }
    
    setIsSubmittingBatch(true);
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_schedule_batch',
          className: selectedClass,
          targetType: batchForm.targetType,
          studentNames: batchForm.targetType === 'students' ? selectedStudentNames : [],
          schedule: batchForm.schedule.trim()
        })
      });
      
      setIsBatchScheduling(false);
      setSelectedStudentNames([]);
      setTimeout(() => {
        fetchData();
      }, 800);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleCopyLink = (studentName: string, className: string) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/parent?class=${encodeURIComponent(className)}&name=${encodeURIComponent(studentName)}`;
    navigator.clipboard.writeText(fullUrl);
    
    const key = `${className}-${studentName}`;
    setCopiedStudent(key);
    setTimeout(() => setCopiedStudent(null), 2000);
  };
  
  const rawSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
  const sheetUrl = rawSheetUrl ? rawSheetUrl.trim().replace(/^["']|["']$/g, '') : '';
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

  const handleTestApi = async () => {
    if (!testUrl) {
      alert("Vui lòng dán link Web App để test!");
      return;
    }
    setIsTestingApi(true);
    setTestResult(null);
    try {
      const cleanUrl = testUrl.trim().replace(/^["']|["']$/g, '');
      // Add random cache breaker and get_data action
      const separator = cleanUrl.includes('?') ? '&' : '?';
      const finalUrl = `${cleanUrl}${separator}action=get_data&_cb=${Date.now()}`;
      
      const res = await fetch(finalUrl, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && data.result === 'error') {
            setTestResult({
              success: false,
              message: 'Cảnh báo: Google Script đã phản hồi nhưng báo lỗi nội bộ!',
              details: `Thông điệp lỗi từ Google: "${data.error || data.message}"\n\nHướng xử lý: Copy ID trang tính (dãy chữ dài trên thanh địa chỉ trang tính) và điền vào SPREADSHEET_ID ở dòng 5 trong script, sau đó Deploy bản mới!`
            });
          } else {
            setTestResult({
              success: true,
              message: '🎉 KẾT NỐI THÀNH CÔNG RỰC RỠ!',
              details: `Hệ thống đã đọc trực tiếp được:\n- ${data.submissions?.length || 0} lượt nộp bài\n- ${data.roster?.length || 0} học sinh đã lưu\n- ${data.behavior?.length || 0} nhật ký ý thức\n- ${data.examConfigs?.length || 0} cấu hình đề thi\n\nLink này hoạt động 100%! Đang tự động cập nhật bảng dữ liệu cho bạn...`
            });
            // Automatically trigger dashboard rehydration with this live connection
            fetchData();
          }
        } catch (parseErr) {
          if (text.includes("Exam API Is Running Successfully")) {
            setTestResult({
              success: false,
              message: 'Chú ý: Link chạy được nhưng đang trả về trang mặc định!',
              details: `Lý do: Có thể bạn chưa dán bản code mới nhất chứa hàm doGet() hoặc chưa chuyển sang Version mới nhất khi Deploy.`
            });
          } else {
            setTestResult({
              success: false,
              message: 'Không thể phân tích dữ liệu dạng JSON!',
              details: `Kết quả trả về không phải JSON hợp lệ:\n${text.substring(0, 300)}...`
            });
          }
        }
      } else {
        setTestResult({
          success: false,
          message: `Lỗi kết nối HTTP ${res.status}`,
          details: 'Không thể kết nối đến URL này. Hãy chắc chắn bạn đã Deploy đúng dưới dạng Web App!'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: '🚨 LỖI "FAILED TO FETCH" (Bị chặn kết nối)!',
        details: `Nguyên nhân chính: Google Apps Script bị sập nội bộ ở phía Server (thường do không tìm thấy trang tính, sai ID, hoặc xung đột tài khoản).\n\nHướng xử lý khẩn cấp:\n1. Hãy chắc chắn đã copy ID trang tính dán vào dòng 5 của Google Script.\n2. Đảm bảo khi Deploy đã chọn Truy cập cho "Bất kỳ ai".\n3. Chi tiết kỹ thuật: ${err.message || 'Trình duyệt chặn phản hồi CORS'}`
      });
    } finally {
      setIsTestingApi(false);
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
      // Add explicit cache buster timestamp to bypass aggressive browser caching of previous CORS errors
      const finalUrl = `${sheetUrl}${sheetUrl.includes('?') ? '&' : '?'}action=get_data&_cb=${Date.now()}`;
      const res = await fetch(finalUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error("Network error fetching sheet data");
      const json = await res.json();
      setSubmissions(json.submissions || []);
      setRoster(json.roster || []);
      setBehavior(json.behavior || []);
      setExamConfigs(json.examConfigs || []);

      // Background sync fresh dynamic exams roster from API proxy
      setIsExamsSyncing(true);
      try {
        const examsRes = await fetch('/api/exams', { cache: 'no-store' });
        if (examsRes.ok) {
          const freshExams = await examsRes.json();
          if (Array.isArray(freshExams)) {
            setExams(freshExams);
          }
        }
      } catch (examErr) {
        console.error("Background exam sync failed:", examErr);
      } finally {
        setIsExamsSyncing(false);
      }
    } catch (err: any) {
      setError(`Không thể tải dữ liệu: ${err.message || "Lỗi kết nối (Failed to fetch)"}. Link API được cấu hình: [${sheetUrl || 'Chưa cấu hình'}]`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveExamConfig = async (examId: string, status: string, startTime: string, endTime: string) => {
    if (!sheetUrl) return;
    
    setIsSavingConfig(examId);
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_exam_config',
          examId,
          status,
          startTime,
          endTime
        })
      });
      
      setExamConfigs(prev => {
        const existing = prev.find(c => c.examId === examId);
        if (existing) {
          return prev.map(c => c.examId === examId ? { ...c, status, startTime, endTime } : c);
        } else {
          return [...prev, { examId, status, startTime, endTime }];
        }
      });
    } catch (err: any) {
      alert("Lỗi lưu cấu hình: " + err.message);
    } finally {
      setIsSavingConfig(null);
    }
  };

  const handleBatchSaveExamConfig = async (status: string, startTime = "", endTime = "") => {
    if (!sheetUrl || selectedExamIds.length === 0) return;
    
    setIsBatchSavingConfig(true);
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_exam_config_batch',
          examIds: selectedExamIds,
          status: status,
          startTime: startTime,
          endTime: endTime
        })
      });
      
      setExamConfigs(prev => {
        const next = [...prev];
        selectedExamIds.forEach(id => {
          const idx = next.findIndex(c => c.examId === id);
          const cleanStart = status === 'Hẹn giờ' ? startTime : "";
          const cleanEnd = status === 'Hẹn giờ' ? endTime : "";
          
          if (idx !== -1) {
            next[idx] = { ...next[idx], status, startTime: cleanStart, endTime: cleanEnd };
          } else {
            next.push({ examId: id, status, startTime: cleanStart, endTime: cleanEnd });
          }
        });
        return next;
      });
      
      setSelectedExamIds([]);
    } catch (err: any) {
      alert("Lỗi lưu cấu hình hàng loạt: " + err.message);
    } finally {
      setIsBatchSavingConfig(false);
    }
  };

  // Trigger fetch once authorized
  useEffect(() => {
    if (isAuthorized && sheetUrl) {
      fetchData();
    }
  }, [isAuthorized, sheetUrl]);

  const filteredExamsToManage = useMemo(() => {
    return exams.filter(ex => {
      const matchesSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSource = sourceFilter === 'all' || ex.source === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [exams, searchTerm, sourceFilter]);

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
      
      if (!matchesClass || !matchesExam) return false;
      
      // Optional logic: exclude free students not present in Roster
      if (onlyRosterInStats) {
        const inRoster = roster.some(r => 
          String(r.className).trim().toLowerCase() === String(sub.className).trim().toLowerCase() &&
          String(r.studentName).trim().toLowerCase() === String(sub.studentName).trim().toLowerCase()
        );
        return inRoster;
      }
      
      return true;
    });
  }, [submissions, selectedClass, selectedExam, onlyRosterInStats, roster]);

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

  // Sinh màu tương phản độc đáo cho từng lớp dạy (dark mode optimized)
  const getClassColor = (className: string) => {
    if (!className) return 'bg-slate-800 border-slate-700 text-slate-400';
    const colors = [
      'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
      'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
      'bg-amber-600/20 border-amber-500/40 text-amber-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
      'bg-rose-600/20 border-rose-500/40 text-rose-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
      'bg-purple-600/20 border-purple-500/40 text-purple-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
      'bg-cyan-600/20 border-cyan-500/40 text-cyan-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
      'bg-orange-600/20 border-orange-500/40 text-orange-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
      'bg-pink-600/20 border-pink-500/40 text-pink-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
    ];
    let hash = 0;
    for (let i = 0; i < className.length; i++) {
      hash = className.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Phân tích lịch học của toàn bộ danh sách học sinh thành ma trận lịch biểu tuần
  const scheduleMap = useMemo(() => {
    const map: Record<string, Record<string, string[]>> = {};
    const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    
    weekDays.forEach(d => {
      map[d] = {};
      timeSlots.forEach(slot => {
        map[d][slot] = [];
      });
    });
    
    roster.forEach(student => {
      if (!student.schedule || !student.className) return;
      const schedStr = student.schedule.toLowerCase();
      
      const matchedDays: string[] = [];
      if (schedStr.includes('thứ 2') || schedStr.includes('t2')) matchedDays.push('Thứ 2');
      if (schedStr.includes('thứ 3') || schedStr.includes('t3')) matchedDays.push('Thứ 3');
      if (schedStr.includes('thứ 4') || schedStr.includes('t4')) matchedDays.push('Thứ 4');
      if (schedStr.includes('thứ 5') || schedStr.includes('t5')) matchedDays.push('Thứ 5');
      if (schedStr.includes('thứ 6') || schedStr.includes('t6')) matchedDays.push('Thứ 6');
      if (schedStr.includes('thứ 7') || schedStr.includes('t7')) matchedDays.push('Thứ 7');
      if (schedStr.includes('chủ nhật') || schedStr.includes('cn')) matchedDays.push('Chủ Nhật');
      
      const matchedSlots: string[] = [];
      timeSlots.forEach(slot => {
        const normSlot = slot.replace(/\s+/g, '').replace(':', 'h').toLowerCase(); 
        const normSched = schedStr.replace(/\s+/g, '').replace(':', 'h').toLowerCase();
        
        if (normSched.includes(normSlot)) {
          matchedSlots.push(slot);
        }
      });
      
      matchedDays.forEach(day => {
        matchedSlots.forEach(slot => {
          if (map[day] && map[day][slot] && !map[day][slot].includes(student.className)) {
            map[day][slot].push(student.className);
          }
        });
      });
    });
    
    return map;
  }, [roster, timeSlots]);

  // Calendar utility helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    let day = d.getDay(); // 0 = CN, 1 = T2...
    return day === 0 ? 6 : day - 1; // Đổi 0 thành Thứ 2, 6 thành Chủ Nhật
  };
  
  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
    setSelectedCalDay(null);
  };
  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
    setSelectedCalDay(null);
  };

  // Trả về các slot bận của một ngày lịch nhất định dựa vào thứ tương ứng
  const getClassesForCalendarDay = (dayNum: number) => {
    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayNum);
    const dayOfWeek = d.getDay(); 
    const dayNamesMap = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayStr = dayNamesMap[dayOfWeek];
    
    const dailyClasses: { slot: string, classes: string[] }[] = [];
    timeSlots.forEach(slot => {
      const clss = scheduleMap[dayStr]?.[slot] || [];
      if (clss.length > 0) {
        dailyClasses.push({ slot, classes: clss });
      }
    });
    return { dayStr, dailyClasses };
  };

  // Xử lý upload file CSV
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length < 2) {
        alert("File CSV không hợp lệ hoặc trống.");
        return;
      }
      
      const headerLine = lines[0];
      const delimiter = headerLine.includes(';') ? ';' : ',';
      const headers = headerLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      
      let classIdx = headers.findIndex(h => h.toLowerCase().includes('lớp') || h.toLowerCase().includes('lop'));
      let nameIdx = headers.findIndex(h => h.toLowerCase().includes('tên') || h.toLowerCase().includes('ten') || h.toLowerCase().includes('họ') || h.toLowerCase().includes('ho'));
      let scheduleIdx = headers.findIndex(h => h.toLowerCase().includes('lịch') || h.toLowerCase().includes('lich'));
      let tuitionIdx = headers.findIndex(h => h.toLowerCase().includes('phí') || h.toLowerCase().includes('phi'));
      let statusIdx = headers.findIndex(h => h.toLowerCase().includes('trạng') || h.toLowerCase().includes('trang') || h.toLowerCase().includes('thái') || h.toLowerCase().includes('thai'));
      
      if (classIdx === -1) classIdx = 0;
      if (nameIdx === -1) nameIdx = 1;
      
      const parsed: StudentRoster[] = [];
      for (let i = 1; i < lines.length; i++) {
        const matches = lines[i].match(/(".*?"|[^",\s;]+)(?=\s*[,;]|\s*$)/g) || lines[i].split(delimiter);
        if (!matches) continue;
        const values = matches.map(v => v.trim().replace(/^["']|["']$/g, ''));
        
        if (values.length > Math.max(classIdx, nameIdx) && values[nameIdx]) {
          parsed.push({
            className: values[classIdx] || (selectedClass !== "Tất cả" ? selectedClass : "Chưa rõ"),
            studentName: values[nameIdx],
            schedule: scheduleIdx !== -1 && values[scheduleIdx] ? values[scheduleIdx] : '',
            tuition: tuitionIdx !== -1 && values[tuitionIdx] ? values[tuitionIdx] : '',
            tuitionStatus: statusIdx !== -1 && values[statusIdx] ? values[statusIdx] : 'Chưa đóng',
          });
        }
      }
      
      if (parsed.length === 0) {
        alert("Không thể phân tích học sinh nào từ file CSV. Kiểm tra định dạng các cột: Lớp, Tên học sinh...");
      } else {
        setCsvParsedStudents(parsed);
        setIsImportingCsv(true);
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = ''; 
  };

  // Gửi danh sách học sinh import hàng loạt lên API Google sheet
  const handleSubmitCsvImport = async () => {
    if (!sheetUrl || csvParsedStudents.length === 0) return;
    setIsSubmittingCsv(true);
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_students_batch',
          students: csvParsedStudents
        })
      });
      setIsImportingCsv(false);
      setCsvParsedStudents([]);
      alert(`Đã gửi lệnh thêm ${csvParsedStudents.length} học sinh lên Sheet! Chờ nạp lại...`);
      setTimeout(() => {
        fetchData();
      }, 800);
    } catch (err: any) {
      alert("Lỗi import: " + err.message);
    } finally {
      setIsSubmittingCsv(false);
    }
  };

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
        
        {/* Công cụ Chẩn Đoán Real-time API */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl mb-8 overflow-hidden shadow-xl">
          <button 
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-850/50 transition-all border-b border-slate-800/50"
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${showDiagnostics ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                <Search className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Công cụ Thử Nghiệm & Chẩn Đoán Link API (Không cần Re-Deploy)</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Kiểm tra ngay link Google Apps Script vừa tạo xem có chạy được không trước khi dán lên Vercel!</p>
              </div>
            </div>
            <span className="text-xs font-black text-indigo-400 bg-indigo-600/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              {showDiagnostics ? 'Đóng công cụ ▲' : 'Mở công cụ chẩn đoán ▼'}
            </span>
          </button>

          {showDiagnostics && (
            <div className="p-6 bg-slate-950/40 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Dán URL Web App mới của bạn vào đây để Test:
                  </label>
                  <div className="flex gap-3">
                    <input 
                      type="text"
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/XXXXXX/exec"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs outline-none focus:ring-1 ring-indigo-500"
                    />
                    <button 
                      onClick={handleTestApi}
                      disabled={isTestingApi}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 shrink-0"
                    >
                      {isTestingApi ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang Test...
                        </>
                      ) : (
                        <>Chạy Thử Lệnh Connect</>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 italic">
                    Lưu ý: Chỉ cần dán link của bạn và nhấn nút. Chúng tôi sẽ giả lập kết nối trực tiếp từ trình duyệt của bạn ngay lập tức.
                  </p>
                </div>

                <div className="md:col-span-4">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 h-full flex flex-col justify-center">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-1">HƯỚNG DẪN NHANH:</h4>
                    <ul className="text-[10px] text-slate-400 space-y-1 leading-relaxed list-disc pl-3">
                      <li>Nếu link Test báo <b>"FAILED TO FETCH"</b> &rarr; Bạn đang bị lỗi Google File (Tệp không tồn tại).</li>
                      <li>Để sửa: Hãy dán <b>ID Trang tính</b> của bạn vào biến <b>SPREADSHEET_ID</b> ở <b>Dòng 5</b> của mã Google Script!</li>
                    </ul>
                  </div>
                </div>
              </div>

              {testResult && (
                <div className={`mt-6 rounded-xl border p-4 animate-in fade-in duration-300 ${
                  testResult.success 
                    ? 'bg-emerald-600/10 border-emerald-500/30' 
                    : 'bg-red-600/10 border-red-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    {testResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`text-xs font-black uppercase ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {testResult.message}
                      </h4>
                      <pre className="mt-2 text-[10px] font-mono bg-black/30 rounded-lg p-3 overflow-x-auto text-slate-300 leading-relaxed border border-slate-800/50 whitespace-pre-wrap">
                        {testResult.details}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
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
            <div className="text-3xl font-black text-purple-400">{exams.length}</div>
            <p className="text-[10px] text-slate-500 mt-1">Đang được mở công khai</p>
          </div>
        </div>

        {/* Class Selection Tabs */}
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <label className="block text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-wider flex items-center gap-1.5">
            <School className="h-3.5 w-3.5" /> Danh sách Lớp dạy
          </label>
          <div className="flex flex-wrap gap-2">
            {availableClasses.length === 0 ? (
              <div className="text-slate-500 text-xs font-medium bg-[#111827] border border-slate-800 px-4 py-3 rounded-2xl">
                Chưa phát hiện lớp nào từ hệ thống
              </div>
            ) : (
              availableClasses.map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-5 py-3.5 rounded-2xl text-sm font-black flex items-center gap-2 transition-all border ${
                    selectedClass === cls
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 border-transparent scale-[1.02]'
                      : 'bg-[#111827] hover:bg-[#1b2537] text-slate-400 border-slate-800/80 hover:text-white hover:border-indigo-500/30'
                  }`}
                >
                  <GraduationCap className={`h-4.5 w-4.5 ${selectedClass === cls ? 'text-white' : 'text-indigo-400'}`} />
                  Lớp {cls}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-2/3">
              <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-wider">Chọn Đề Thi Theo Dõi</label>
              <div className="relative">
                <select 
                  value={selectedExam} 
                  onChange={e => setSelectedExam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 appearance-none focus:ring-1 ring-indigo-500 outline-none"
                >
                  <option value="all">-- Xem lịch sử làm bài tổng hợp (Tất cả các đề) --</option>
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title} ({ex.examClass})</option>
                  ))}
                </select>
                <BookOpen className="absolute right-3 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="w-full md:w-1/3 self-end">
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
            
            <div className="w-full flex items-center justify-between mt-4 pt-4 border-t border-slate-800/60 flex-wrap gap-3">
               <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                 <div className="relative">
                   <input 
                     type="checkbox"
                     checked={onlyRosterInStats}
                     onChange={(e) => setOnlyRosterInStats(e.target.checked)}
                     className="sr-only peer"
                   />
                   <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 relative transition-colors"></div>
                 </div>
                 <span className="text-[11px] font-black tracking-wide uppercase text-slate-400 group-hover:text-slate-200 transition-colors flex items-center gap-1.5">
                   <Users className="h-3.5 w-3.5 text-indigo-400"/>
                   Chỉ thống kê học sinh trong Danh sách
                 </span>
               </label>
               <span className="text-[10px] font-bold bg-slate-900 text-indigo-400 border border-indigo-500/10 px-2.5 py-1 rounded-lg italic">
                 {onlyRosterInStats ? "🔒 Đang lọc bỏ học sinh tự do" : "🌍 Đang đếm cả học sinh tự do"}
               </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6 w-fit">
          <button 
            onClick={() => setActiveTab('exams')} 
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            <Trophy className="h-4 w-4" /> Thống kê làm bài
          </button>
          <button 
            onClick={() => setActiveTab('roster')} 
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'roster' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            <Users className="h-4 w-4" /> Theo dõi Phụ huynh & Lịch học
          </button>
          <button 
            onClick={() => setActiveTab('schedule')} 
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            <CalendarRange className="h-4 w-4" /> Lịch dạy & Lịch bận
          </button>
          <button 
            onClick={() => setActiveTab('manage-exams')} 
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'manage-exams' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
          >
            <Settings className="h-4 w-4" /> Cài đặt đề thi
          </button>
        </div>

        {/* Main Content */}
        {activeTab === 'manage-exams' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
                 <div>
                   <h2 className="text-lg font-bold flex items-center gap-2"><Settings className="h-5 w-5 text-indigo-400"/> Cài đặt Đề Thi & Chế độ Hiển thị</h2>
                   <p className="text-xs text-slate-500 font-medium mt-1">Cấu hình ẩn/hiện hoặc đặt lịch hẹn tự động mở đề thi cho Học sinh theo dõi.</p>
                 </div>
                 
                 <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl gap-1 flex-wrap">
                   <button
                     onClick={() => { setSourceFilter('all'); setSelectedExamIds([]); }}
                     className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all flex items-center gap-1 ${sourceFilter === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     Tất cả
                   </button>
                   <button
                     onClick={() => { setSourceFilter('google-drive'); setSelectedExamIds([]); }}
                     className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all flex items-center gap-1 ${sourceFilter === 'google-drive' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                     Google Drive
                   </button>
                   <button
                     onClick={() => { setSourceFilter('github'); setSelectedExamIds([]); }}
                     className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all flex items-center gap-1 ${sourceFilter === 'github' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                     Github
                   </button>
                 </div>

                 {selectedExamIds.length > 0 ? (
                    <div className="flex items-center gap-3 flex-wrap p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl animate-in slide-in-from-right-2 duration-300">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-indigo-300 font-black font-mono bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                          ĐÃ CHỌN: {selectedExamIds.length}
                        </span>
                      </div>
                      
                      <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

                      <div className="flex items-center gap-2.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                        <select 
                          value={batchStatus}
                          onChange={(e) => setBatchStatus(e.target.value)}
                          className="bg-transparent border-none text-white text-xs font-bold outline-none px-2 cursor-pointer"
                        >
                          <option value="Công khai" className="bg-slate-900 text-white">Công khai</option>
                          <option value="Ẩn" className="bg-slate-900 text-white">Ẩn đề</option>
                          <option value="Hẹn giờ" className="bg-slate-900 text-white">Hẹn giờ mở</option>
                        </select>
                      </div>

                      {batchStatus === 'Hẹn giờ' && (
                        <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200 flex-wrap">
                          <input
                            type="datetime-local"
                            value={batchStartTime}
                            onChange={(e) => setBatchStartTime(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-white text-[11px] font-bold rounded-xl px-3 py-2 outline-none focus:ring-1 ring-indigo-500 font-mono"
                          />
                          <span className="text-slate-600 text-xs font-bold">đến</span>
                          <input
                            type="datetime-local"
                            value={batchEndTime}
                            onChange={(e) => setBatchEndTime(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-white text-[11px] font-bold rounded-xl px-3 py-2 outline-none focus:ring-1 ring-indigo-500 font-mono"
                          />
                        </div>
                      )}

                      <button
                        onClick={() => handleBatchSaveExamConfig(batchStatus, batchStartTime, batchEndTime)}
                        disabled={isBatchSavingConfig || (batchStatus === 'Hẹn giờ' && (!batchStartTime || !batchEndTime))}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-indigo-600/20 select-none"
                      >
                        {isBatchSavingConfig ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin"/>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <CheckSquare className="h-3.5 w-3.5"/>
                            Cập nhật hàng loạt
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => setSelectedExamIds([])}
                        className="text-[10px] text-slate-500 hover:text-rose-400 font-bold underline px-2 transition-colors cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  ) : (
                   <div className="flex items-center gap-2.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-xl font-black text-xs">
                     TỔNG SỐ: {filteredExamsToManage.length} ĐỀ THI
                   </div>
                 )}
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 w-16 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 accent-indigo-600 cursor-pointer focus:ring-indigo-500"
                          checked={filteredExamsToManage.length > 0 && selectedExamIds.length === filteredExamsToManage.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExamIds(filteredExamsToManage.map(ex => ex.id));
                            } else {
                              setSelectedExamIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-4 min-w-[280px]">Thông tin Đề Thi</th>
                      <th className="px-6 py-4 min-w-[320px]">Cấu hình Trạng thái</th>
                      <th className="px-6 py-4 w-36 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredExamsToManage.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-600 text-sm italic font-medium">
                          Không tìm thấy bất kỳ đề thi nào khớp với tìm kiếm!
                        </td>
                      </tr>
                    ) : (
                      filteredExamsToManage.map(exam => {
                        const config = examConfigs.find(c => c.examId === exam.id);
                        return (
                          <ExamConfigItem
                            key={exam.id}
                            exam={exam}
                            config={config}
                            onSave={handleSaveExamConfig}
                            isSaving={isSavingConfig === exam.id}
                            isSelected={selectedExamIds.includes(exam.id)}
                            onToggleSelect={() => {
                              setSelectedExamIds(prev => 
                                prev.includes(exam.id) 
                                  ? prev.filter(id => id !== exam.id) 
                                  : [...prev, exam.id]
                              );
                            }}
                          />
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'schedule' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
            
            {/* TIMETABLE (WEEKLY SCHEDULE) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#111827] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
                  <h2 className="text-lg font-bold flex items-center gap-2"><CalendarRange className="h-5 w-5 text-indigo-400"/> Thời khóa biểu & Lịch bận Tuần</h2>
                  
                  <button 
                    onClick={() => setIsEditingSlots(!isEditingSlots)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
                  >
                    <Settings className="h-3.5 w-3.5"/> Tùy chỉnh Khung giờ
                  </button>
                </div>

                {/* SLOT CONFIGURATOR PANEL */}
                {isEditingSlots && (
                  <div className="p-6 bg-slate-950/50 border-b border-slate-800/80 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Settings className="h-4 w-4" /> Thiết lập khung giờ dạy
                      </h4>
                      <span className="text-[10px] text-slate-500 font-semibold italic">(Hệ thống sẽ tự động ánh xạ lịch của Học sinh có chứa chuỗi này)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {timeSlots.map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 px-3 py-1.5 rounded-xl text-sm font-black text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                          <span className="font-mono text-xs">{slot}</span>
                          <button 
                            onClick={() => setTimeSlots(timeSlots.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 ml-1 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 max-w-md">
                      <input 
                        type="text" 
                        placeholder="Thêm khung giờ (ví dụ: 17h30-19h)" 
                        value={newSlotVal}
                        onChange={e => setNewSlotVal(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-1 ring-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSlotVal.trim()) {
                            if (!timeSlots.includes(newSlotVal.trim())) {
                              setTimeSlots([...timeSlots, newSlotVal.trim()]);
                              setNewSlotVal("");
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (newSlotVal.trim() && !timeSlots.includes(newSlotVal.trim())) {
                            setTimeSlots([...timeSlots, newSlotVal.trim()]);
                            setNewSlotVal("");
                          }
                        }}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white font-black text-xs rounded-xl transition-all flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5"/> Thêm
                      </button>
                    </div>
                  </div>
                )}

                {/* TIMETABLE GRID */}
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full border-collapse table-fixed min-w-[850px]">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800">
                        <th className="w-36 px-4 py-4 text-xs font-black text-slate-400 text-center uppercase tracking-wider border-r border-slate-800 bg-slate-950/80 sticky left-0 z-20">Khung giờ</th>
                        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(d => (
                          <th key={d} className="px-2 py-4 text-xs font-black text-slate-200 text-center uppercase tracking-wider border-r last:border-r-0 border-slate-800">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {timeSlots.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-20 text-center text-slate-500 italic text-sm">
                            <AlertCircle className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                            Chưa có khung giờ nào được thiết lập. Nhấn "Tùy chỉnh" ở góc trên để tạo!
                          </td>
                        </tr>
                      ) : (
                        timeSlots.map(slot => (
                          <tr key={slot} className="hover:bg-slate-800/10 transition-all group">
                            <td className="px-4 py-6 text-xs font-black text-indigo-400 bg-slate-950/80 text-center font-mono border-r border-slate-800 sticky left-0 z-10 group-hover:text-indigo-300 shadow-lg backdrop-blur-md">
                              {slot}
                            </td>
                            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(day => {
                              const classes = scheduleMap[day]?.[slot] || [];
                              return (
                                <td key={day} className="p-2.5 border-r last:border-r-0 border-slate-800 align-middle">
                                  <div className="flex flex-col gap-1.5">
                                    {classes.length > 0 ? (
                                      classes.map(cls => (
                                        <div 
                                          key={cls} 
                                          className={`px-2.5 py-2.5 rounded-xl border text-[10px] font-black text-center uppercase tracking-wider transition-all transform hover:scale-[1.03] hover:shadow-lg ${getClassColor(cls)}`}
                                        >
                                          Lớp {cls}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-[10px] text-slate-800 text-center font-semibold py-3 italic group-hover:text-slate-700/50 select-none transition-colors">- Trống -</div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Quick Note */}
              <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-3xl text-xs text-slate-400 leading-relaxed flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <b className="text-slate-200 block mb-1">Hướng dẫn ánh xạ lịch tự động:</b>
                  Khi điền thông tin học sinh ở sheet <b>"Students"</b> (hoặc form thêm mới), ô <b>"Lịch học"</b> chỉ cần có chứa thứ (ví dụ: <i>Thứ 2, T2...</i>) và từ khóa khung giờ tương ứng (ví dụ: <i>7h-8h30</i>). Hệ thống sẽ quét và xếp danh sách các lớp vào bảng bên trên, mỗi lớp sở hữu màu nền tương phản dễ quan sát riêng biệt!
                </div>
              </div>
            </div>

            {/* CALENDAR COMPONENT */}
            <div className="lg:col-span-4 space-y-6">
              {/* MONTHLY CALENDAR */}
              <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-fit">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/50">
                  <h3 className="text-sm font-black text-slate-300 uppercase tracking-wide flex items-center gap-2"><Calendar className="h-4 w-4 text-indigo-400"/> Lịch Theo Dõi</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-1.5 bg-slate-800/60 hover:bg-slate-700 hover:text-white text-slate-400 border border-slate-700 rounded-xl transition-all">
                      <ChevronLeft className="h-4 w-4"/>
                    </button>
                    <span className="text-xs font-black text-white font-mono min-w-[80px] text-center px-1 bg-slate-950 border border-slate-800 py-1 rounded-lg">
                      {calendarDate.toLocaleString('vi-VN', { month: '2-digit', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-1.5 bg-slate-800/60 hover:bg-slate-700 hover:text-white text-slate-400 border border-slate-700 rounded-xl transition-all">
                      <ChevronRight className="h-4 w-4"/>
                    </button>
                  </div>
                </div>

                {/* Calendar Days Headings */}
                <div className="grid grid-cols-7 gap-1.5 mb-2">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase py-1 tracking-wider">{d}</div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Padding for empty first days of week */}
                  {Array.from({ length: getFirstDayOfMonth(calendarDate) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  
                  {/* Month Days */}
                  {Array.from({ length: getDaysInMonth(calendarDate) }).map((_, i) => {
                    const dayNum = i + 1;
                    const isToday = dayNum === new Date().getDate() && 
                                    calendarDate.getMonth() === new Date().getMonth() && 
                                    calendarDate.getFullYear() === new Date().getFullYear();
                    const isSelected = selectedCalDay === dayNum;
                    
                    const { dailyClasses } = getClassesForCalendarDay(dayNum);
                    const hasClasses = dailyClasses.length > 0;
                    
                    return (
                      <button
                        key={dayNum}
                        onClick={() => setSelectedCalDay(dayNum)}
                        className={`aspect-square flex flex-col items-center justify-center p-1 rounded-xl border transition-all relative ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-500 text-white font-bold z-10 shadow-lg shadow-indigo-600/30 scale-[1.05]' 
                            : isToday 
                              ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 font-black' 
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold font-mono">{dayNum}</span>
                        {hasClasses && !isSelected && (
                          <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DAY SCHEDULE VIEW DETAILED SIDEBAR */}
              {selectedCalDay && (
                <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-3 duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider">Lịch học chi tiết</h4>
                    <span className="text-[10px] bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-black text-slate-300 font-mono">
                      {selectedCalDay}/{calendarDate.getMonth()+1} ({getClassesForCalendarDay(selectedCalDay).dayStr})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {getClassesForCalendarDay(selectedCalDay).dailyClasses.length === 0 ? (
                      <div className="text-center py-10 text-slate-600 text-xs font-medium italic flex flex-col items-center gap-2 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl">
                        <span>Không ghi nhận lớp bận vào ngày này</span>
                        <span className="text-[10px] text-emerald-400/80 font-sans non-italic">🎉 Nghỉ dạy!</span>
                      </div>
                    ) : (
                      getClassesForCalendarDay(selectedCalDay).dailyClasses.map((dc, idx) => (
                        <div key={idx} className="bg-slate-950/50 border border-slate-800/60 hover:border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 transition-all">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Khung Giờ</span>
                            <span className="text-sm font-black text-indigo-300 font-mono">{dc.slot}</span>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-[50%]">
                            {dc.classes.map(c => (
                              <span key={c} className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase shadow-sm border ${getClassColor(c)}`}>
                                Lớp {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'roster' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Student Details Table */}
            <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
                 <h2 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="h-5 w-5 text-indigo-400"/> Quản lý Lớp & Học phí</h2>
                 <div className="flex items-center gap-3">
                   <span className="text-xs bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1.5 rounded-lg font-black">Lớp {selectedClass}</span>
                   
                   <input 
                     type="file" 
                     id="csv-upload" 
                     accept=".csv" 
                     className="hidden" 
                     onChange={handleCsvUpload} 
                   />
                   <label 
                     htmlFor="csv-upload"
                     className="cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 transition-all"
                   >
                     <Upload className="h-3.5 w-3.5"/> Nhập từ CSV
                   </label>

                   <button 
                     onClick={openBatchScheduling}
                     className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 transition-all"
                   >
                     <Calendar className="h-3.5 w-3.5"/> Xếp Lịch Nhóm/Lớp
                   </button>
                   <button 
                     onClick={openAddStudent}
                     className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white shadow-lg shadow-indigo-600/20 transition-all"
                   >
                     <Plus className="h-3.5 w-3.5"/> Thêm Học Sinh
                   </button>
                 </div>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                 {classRoster.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 font-medium">
                      <AlertCircle className="h-10 w-10 text-slate-600 mx-auto mb-2"/>
                      Chưa có danh sách học sinh ở sheet <b>"Students"</b>.
                    </div>
                 ) : (
                    <table className="w-full text-left border-collapse text-sm">
                       <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider sticky top-0 z-10">
                          <tr>
                             <th className="px-4 py-4 w-10 text-center">
                               <input 
                                 type="checkbox" 
                                 checked={classRoster.length > 0 && selectedStudentNames.length === classRoster.length}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     setSelectedStudentNames(classRoster.map(r => r.studentName));
                                   } else {
                                     setSelectedStudentNames([]);
                                   }
                                 }}
                                 className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950 h-4 w-4 cursor-pointer"
                               />
                             </th>
                             <th className="px-6 py-4 w-12 text-center">STT</th>
                             <th className="px-6 py-4">Họ và Tên</th>
                             <th className="px-6 py-4">Lịch học</th>
                             <th className="px-6 py-4">Học phí</th>
                             <th className="px-6 py-4">Trạng thái</th>
                             <th className="px-6 py-4 text-center">Thao tác</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                          {classRoster
                            .filter(s => s.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((stud, idx) => {
                              const isCopied = copiedStudent === `${stud.className}-${stud.studentName}`;
                              return (
                                <tr key={idx} className={`hover:bg-slate-800/30 transition-colors ${selectedStudentNames.includes(stud.studentName) ? 'bg-indigo-600/5' : ''}`}>
                                   <td className="px-4 py-4 text-center">
                                     <input 
                                       type="checkbox" 
                                       checked={selectedStudentNames.includes(stud.studentName)}
                                       onChange={() => toggleStudentSelection(stud.studentName)}
                                       className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950 h-4 w-4 cursor-pointer"
                                     />
                                   </td>
                                   <td className="px-6 py-4 text-center text-slate-500 font-mono text-xs">{idx + 1}</td>
                                   <td className="px-6 py-4 font-bold text-white">{stud.studentName}</td>
                                   <td className="px-6 py-4 text-slate-300 font-medium">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-slate-500"/>
                                        {stud.schedule || <span className="text-slate-600 text-xs italic">Chưa nhập</span>}
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-indigo-300 font-bold">
                                      {stud.tuition || <span className="text-slate-600 text-xs font-medium font-sans italic">Chưa nhập</span>}
                                   </td>
                                   <td className="px-6 py-4">
                                      {stud.tuitionStatus ? (
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                                          stud.tuitionStatus.toLowerCase().includes('đã') || stud.tuitionStatus.toLowerCase().includes('ok') || stud.tuitionStatus.toLowerCase().includes('rồi') || stud.tuitionStatus.toLowerCase().includes('xong')
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                        }`}>
                                          {stud.tuitionStatus}
                                        </span>
                                      ) : (
                                        <span className="text-slate-600 text-xs italic">Chưa nhập</span>
                                      )}
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="flex items-center justify-center gap-2">
                                        <button 
                                          onClick={() => handleEditStudent(stud)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 transition-all duration-300"
                                        >
                                          <Edit className="h-3.5 w-3.5"/> Sắp lịch/Sửa
                                        </button>
                                        <button 
                                          onClick={() => handleCopyLink(stud.studentName, stud.className)}
                                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                            isCopied 
                                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border-emerald-500' 
                                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500/50'
                                          } border`}
                                        >
                                          {isCopied ? <CheckCircle2 className="h-3.5 w-3.5"/> : <Copy className="h-3.5 w-3.5"/>}
                                          {isCopied ? 'Link' : 'Link PH'}
                                        </button>
                                      </div>
                                   </td>
                                </tr>
                              )
                            })}
                       </tbody>
                    </table>
                 )}
              </div>
            </div>

            {/* Behavior / Observation Logs */}
            <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                 <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="h-5 w-5 text-purple-400"/> Nhật ký học tập & Ý thức lớp</h2>
                 <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded">Dữ liệu từ Sheet "Behavior"</span>
              </div>
              <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                 {behavior.filter(b => selectedClass === "Tất cả" || b.className === selectedClass).length === 0 ? (
                    <div className="text-center py-16 text-slate-500 font-medium">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                      Chưa có nhật ký học tập nào được ghi nhận trong lớp này.
                    </div>
                 ) : (
                    <table className="w-full text-left border-collapse text-sm">
                       <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-black tracking-wider sticky top-0 z-10">
                          <tr>
                             <th className="px-6 py-4">Thời gian</th>
                             <th className="px-6 py-4">Học sinh</th>
                             <th className="px-6 py-4">Trạng thái</th>
                             <th className="px-6 py-4">Nhận xét chi tiết</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800">
                          {behavior
                            .filter(b => selectedClass === "Tất cả" || b.className === selectedClass)
                            .filter(b => b.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
                            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((log, index) => (
                              <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                                 <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                   {log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                                 </td>
                                 <td className="px-6 py-4 font-bold text-white">{log.studentName}</td>
                                 <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                      log.status?.toLowerCase().includes('tốt') || log.status?.toLowerCase().includes('ngoan') || log.status?.toLowerCase().includes('chăm') || log.status?.toLowerCase().includes('giỏi')
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : log.status?.toLowerCase().includes('nghịch') || log.status?.toLowerCase().includes('hư') || log.status?.toLowerCase().includes('lười') || log.status?.toLowerCase().includes('muộn')
                                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    }`}>
                                      {log.status || 'Chưa rõ'}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-slate-300 italic">"{log.note}"</td>
                              </tr>
                            ))}
                       </tbody>
                    </table>
                 )}
              </div>
            </div>
          </div>
        ) : (
          selectedExam === "all" ? (
            /* COMPREHENSIVE HISTORY LOG VIEW */
            <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-in fade-in duration-300">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
               
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
                           <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Đề: {exams.find(e => e.id === selectedExam)?.title}</p>
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
          )
        )}

      </div>

      {/* ADD STUDENT MODAL */}
      {isAddingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button onClick={() => setIsAddingStudent(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5"/>
            </button>
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-400"/> Thêm học sinh mới
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tên lớp *</label>
                <input 
                  type="text" required placeholder="Ví dụ: 9A, 12B1..."
                  value={newStudent.className} 
                  onChange={e => setNewStudent({...newStudent, className: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Họ và tên *</label>
                <input 
                  type="text" required placeholder="Họ tên học sinh"
                  value={newStudent.name} 
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Lịch học thêm</label>
                <input 
                  type="text" placeholder="Ví dụ: Thứ 2, Thứ 6 (17:30 - 19:00)"
                  value={newStudent.schedule} 
                  onChange={e => setNewStudent({...newStudent, schedule: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Học phí</label>
                  <input 
                    type="text" placeholder="Ví dụ: 500.000"
                    value={newStudent.tuition} 
                    onChange={e => setNewStudent({...newStudent, tuition: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Trạng thái</label>
                  <select 
                    value={newStudent.tuitionStatus} 
                    onChange={e => setNewStudent({...newStudent, tuitionStatus: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 ring-indigo-500"
                  >
                    <option value="Chưa đóng">Chưa đóng</option>
                    <option value="Đã đóng">Đã đóng</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddingStudent(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={isSubmittingStudent} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {isSubmittingStudent ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Lưu học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button onClick={() => setEditingStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5"/>
            </button>
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <Edit className="h-5 w-5 text-indigo-400"/> Sắp lịch & Thông tin học phí
            </h3>
            <p className="text-sm text-slate-400 mb-6 font-medium">
              Học sinh: <span className="text-white font-bold">{editingStudent.studentName}</span> (Lớp {editingStudent.className})
            </p>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5"/> Lịch học thêm
                </label>
                <input 
                  type="text" placeholder="Ví dụ: Thứ 3, Thứ 7 (18:00 - 19:30)"
                  value={editForm.schedule} 
                  onChange={e => setEditForm({...editForm, schedule: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Học phí</label>
                  <input 
                    type="text" placeholder="Ví dụ: 600.000"
                    value={editForm.tuition} 
                    onChange={e => setEditForm({...editForm, tuition: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Trạng thái</label>
                  <select 
                    value={editForm.tuitionStatus} 
                    onChange={e => setEditForm({...editForm, tuitionStatus: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-1 ring-indigo-500"
                  >
                    <option value="Chưa đóng">Chưa đóng</option>
                    <option value="Đã đóng">Đã đóng</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingStudent(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={isUpdatingStudent} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {isUpdatingStudent ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* BATCH SCHEDULING MODAL */}
      {isBatchScheduling && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button onClick={() => setIsBatchScheduling(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5"/>
            </button>
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400"/> Xếp Lịch Nhóm & Lớp
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Cập nhật lịch học thêm cho hàng loạt học sinh trong Lớp <span className="text-indigo-400 font-black">{selectedClass}</span>.
            </p>
            
            <form onSubmit={handleBatchSchedule} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-wider">Đối tượng áp dụng</label>
                <div className="grid grid-cols-1 gap-3">
                  <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${batchForm.targetType === 'class' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" name="targetType" value="class" 
                        checked={batchForm.targetType === 'class'}
                        onChange={() => setBatchForm({...batchForm, targetType: 'class'})}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-sm font-bold">Toàn bộ Lớp {selectedClass}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Tất cả học sinh hiện có trong lớp này</p>
                      </div>
                    </div>
                    <span className="bg-indigo-600/20 text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded-full">{classRoster.length} HS</span>
                  </label>

                  <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${batchForm.targetType === 'students' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'} ${selectedStudentNames.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" name="targetType" value="students" 
                        checked={batchForm.targetType === 'students'}
                        disabled={selectedStudentNames.length === 0}
                        onChange={() => setBatchForm({...batchForm, targetType: 'students'})}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="text-sm font-bold">Danh sách học sinh được chọn</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {selectedStudentNames.length > 0 
                            ? `Đang chọn: ${selectedStudentNames.slice(0, 3).join(', ')}${selectedStudentNames.length > 3 ? '...' : ''}` 
                            : 'Cần tick chọn học sinh ở bảng danh sách trước'}
                        </p>
                      </div>
                    </div>
                    <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2.5 py-0.5 rounded-full">{selectedStudentNames.length} HS</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-wider">Nhập lịch học thêm mới</label>
                <input 
                  type="text" required placeholder="Ví dụ: Thứ 3, Thứ 7 (18:00 - 19:30)"
                  value={batchForm.schedule} 
                  onChange={e => setBatchForm({...batchForm, schedule: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 outline-none focus:ring-1 ring-indigo-500 font-medium"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsBatchScheduling(false)} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-sm transition-all">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={isSubmittingBatch} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                  {isSubmittingBatch ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Xác nhận Xếp lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CSV IMPORT PREVIEW MODAL */}
      {isImportingCsv && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-2xl p-6 relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button onClick={() => setIsImportingCsv(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5"/>
            </button>
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-400"/> Xem trước & Nhập danh sách từ CSV
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Phát hiện <span className="text-emerald-400 font-black">{csvParsedStudents.length} học sinh</span> trong tệp của bạn. Vui lòng rà soát kỹ dữ liệu bên dưới trước khi tiến hành đồng bộ hóa.
            </p>

            <div className="overflow-x-auto max-h-[320px] border border-slate-800 rounded-2xl custom-scrollbar bg-slate-950/50 mb-6 shadow-inner">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-widest sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Lớp</th>
                    <th className="px-4 py-3">Họ và Tên</th>
                    <th className="px-4 py-3">Lịch học</th>
                    <th className="px-4 py-3">Học phí</th>
                    <th className="px-4 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {csvParsedStudents.map((std, i) => (
                    <tr key={i} className="hover:bg-slate-800/20 transition-all">
                      <td className="px-4 py-2.5 font-black text-[10px]"><span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">{std.className}</span></td>
                      <td className="px-4 py-2.5 text-white font-bold text-sm">{std.studentName}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-400">{std.schedule || <i className="text-slate-600 font-sans">Chưa rõ</i>}</td>
                      <td className="px-4 py-2.5 text-indigo-300 font-bold font-mono">{std.tuition || '-'}</td>
                      <td className="px-4 py-2.5 text-[10px]">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-black uppercase ${std.tuitionStatus?.toLowerCase().includes('đã') || std.tuitionStatus?.toLowerCase().includes('ok') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                          {std.tuitionStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsImportingCsv(false)} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-all border border-slate-700">
                Hủy bỏ
              </button>
              <button 
                onClick={handleSubmitCsvImport}
                disabled={isSubmittingCsv} 
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isSubmittingCsv ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />} 
                {isSubmittingCsv ? 'Đang đồng bộ hóa...' : `Đồng ý thêm ${csvParsedStudents.length} học sinh`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
