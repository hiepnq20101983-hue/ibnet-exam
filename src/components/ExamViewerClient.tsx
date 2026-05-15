'use client';

import Link from "next/link";
import { ChevronLeft, RotateCcw, Maximize2, User, Sparkles, Trophy, Lock, AlertTriangle, Loader2, Clock } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from "next/navigation";

export default function ExamViewerClient({ 
  examId, 
  initialTitle 
}: { 
  examId: string;
  initialTitle?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [student, setStudent] = useState<{ name: string; className: string } | null>(null);
  const [scoreText, setScoreText] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [basePath, setBasePath] = useState('');
  const pathname = usePathname();
  const [isCheckingLock, setIsCheckingLock] = useState(true);
  const [lockStatus, setLockStatus] = useState<{ isLocked: boolean; reason: string }>({ isLocked: false, reason: '' });
  const [displayTitle, setDisplayTitle] = useState(initialTitle || examId);

  // Dynamically resolve the basePath in browser by comparing browser path vs app path
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname) {
      const fullPath = window.location.pathname;
      if (fullPath.endsWith(pathname)) {
        setBasePath(fullPath.substring(0, fullPath.length - pathname.length));
      }
    }
  }, [pathname]);

  useEffect(() => {
    const rawSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
    const sheetUrl = rawSheetUrl ? rawSheetUrl.trim().replace(/^["']|["']$/g, '') : '';
    if (!sheetUrl) {
      setIsCheckingLock(false);
      return;
    }

    fetch(`${sheetUrl}?action=get_data`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.examConfigs) {
          const config = data.examConfigs.find((c: any) => c.examId === examId);
          if (config) {
            const now = new Date();
            if (config.status === 'Ẩn') {
              setLockStatus({ isLocked: true, reason: 'Bài thi này hiện đang tạm ẩn theo yêu cầu của Giáo viên.' });
            } else if (config.status === 'Hẹn giờ') {
              const start = config.startTime ? new Date(config.startTime) : null;
              const end = config.endTime ? new Date(config.endTime) : null;
              if (start && now < start) {
                setLockStatus({ 
                  isLocked: true, 
                  reason: `Bài thi chưa bắt đầu thời gian làm bài. Lịch mở thi dự kiến: ${start.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}.` 
                });
              } else if (end && now > end) {
                setLockStatus({ 
                  isLocked: true, 
                  reason: `Thời gian làm bài thi này đã kết thúc vào lúc: ${end.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}.` 
                });
              }
            }
          }
        }
      })
      .catch(err => console.error("Không thể tải cấu hình chặn truy cập:", err))
      .finally(() => {
        setIsCheckingLock(false);
        // Also fetch fresh exam list to update title if missing
        fetch('/api/exams', { cache: 'no-store' })
          .then(res => res.ok ? res.json() : [])
          .then(exams => {
             const ex = exams.find((e: any) => e.id === examId);
             if (ex && ex.title) setDisplayTitle(ex.title);
          })
          .catch(() => {});
      });
  }, [examId]);

  useEffect(() => {
    const savedUser = localStorage.getItem('exam_user');
    if (savedUser) {
      setStudent(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let savedToHistory = false;

    const checkIframe = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        const iframeWin = iframe.contentWindow as any;
        if (!iframeDoc || !iframeWin) return;

        // 1. OVERRIDE EXAM CONSTRAINTS FOR INSTANT SUBMIT 
        if (iframeWin.MIN_SUBMIT_TIME > 0) {
          iframeWin.MIN_SUBMIT_TIME = 0; // Disable waiting timer restriction
          if (typeof iframeWin.updateSubmitState === 'function') {
            iframeWin.updateSubmitState(); // Force enable button immediately
          }
        }

        // 2. Auto-fill Student Info if input exist
        if (student) {
          const inputs = iframeDoc.querySelectorAll('.sheet-info-row input[type="text"]');
          if (inputs && inputs.length >= 1) {
            const nameInput = inputs[0] as HTMLInputElement;
            if (nameInput && !nameInput.value) nameInput.value = student.name;
            if (inputs.length >= 2) {
              const classInput = inputs[1] as HTMLInputElement;
              if (classInput && !classInput.value) classInput.value = student.className;
            }
          }
        }

        const scoreEl = iframeDoc.getElementById('total-score');
        if (scoreEl && scoreEl.textContent && scoreEl.textContent.includes('/')) {
            const currentScore = scoreEl.textContent.replace('Điểm:', '').trim();
            setScoreText(currentScore);
            setIsCompleted(true);

            if (!savedToHistory) {
              saveHistory(currentScore);
              savedToHistory = true;
            }
        }
      } catch (err) {
        // catch block
      }
    };

    const saveHistory = async (finalScore: string) => {
      const rawHistory = localStorage.getItem('exam_history');
      const history = rawHistory ? JSON.parse(rawHistory) : [];
      
      const record = {
        examId: examId,
        title: examId.replace('_conv.html', '').replace(/_/g, ' '),
        score: finalScore,
        date: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
      };
      
      history.push(record);
      localStorage.setItem('exam_history', JSON.stringify(history));

      // Automatically sync submission to Google Sheet if configured
      const rawSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
      const sheetUrl = rawSheetUrl ? rawSheetUrl.trim().replace(/^["']|["']$/g, '') : '';
      if (sheetUrl && student) {
        try {
          await fetch('/api/sheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'add_submission',
              studentName: student.name.trim(),
              className: student.className.trim(),
              examId: examId,
              examTitle: record.title,
              score: finalScore
            })
          });
        } catch (err) {
          console.error("Failed to sync to central Google Sheet:", err);
        }
      }
    };

    const interval = setInterval(checkIframe, 2000);
    return () => clearInterval(interval);
  }, [student, examId]);

  const handleReset = () => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setScoreText(null);
      setIsCompleted(false);
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = currentSrc;
      }, 100);
    }
  };

  const handleFullScreen = () => {
     if (iframeRef.current?.requestFullscreen) iframeRef.current.requestFullscreen();
  };

  // Check if loading from dynamic Google Drive (prefixed with 'drive-') or local static asset path
  const isDriveExam = examId.startsWith('drive-');
  const resolvedSrc = isDriveExam 
    ? `/api/exams/${examId.replace('drive-', '')}` 
    : `${basePath}/assets/exams/${examId.split('/').map(encodeURIComponent).join('/')}.html`;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0B0F17] overflow-hidden z-50 h-screen">
      <header className="bg-[#111827] border-b border-slate-800 px-4 h-16 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white px-3 py-2 text-sm shrink-0 flex items-center">
            <ChevronLeft className="h-4 w-4" /> Thoát
          </Link>
          <div className="truncate">
             <h1 className="text-white font-bold truncate flex items-center gap-2">
               <Sparkles className="h-4 w-4 text-indigo-400" /> {displayTitle.replace('_conv.html', '').replace(/_/g, ' ')}
             </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {isCompleted && scoreText && (
             <div className="flex bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400">
               <Trophy className="h-4 w-4 mr-1" /> {scoreText}
             </div>
           )}
           <button onClick={handleReset} className="px-3 py-2 text-slate-400 rounded-xl text-sm font-bold"><RotateCcw className="h-4 w-4"/></button>
           <button onClick={handleFullScreen} className="p-2 text-indigo-400 rounded-xl border border-indigo-500/30"><Maximize2 className="h-4 w-4"/></button>
        </div>
      </header>

      <main className="flex-1 relative w-full bg-[#F3F4F6] overflow-hidden">
        {isCheckingLock ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F17] text-slate-400 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-xs font-black tracking-wider uppercase">Đang kiểm tra bảo mật đề thi...</p>
          </div>
        ) : lockStatus.isLocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F17] p-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-[#111827] border border-slate-800 p-8 max-w-md rounded-3xl flex flex-col items-center shadow-2xl shadow-indigo-500/5">
              <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-black text-white mb-3">TRUY CẬP BỊ GIỚI HẠN</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-8 bg-slate-950 p-4 rounded-2xl border border-slate-850 select-none font-medium">
                {lockStatus.reason}
              </p>
              
              <Link href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95">
                <ChevronLeft className="h-4 w-4" /> Trở về Trang chủ
              </Link>
            </div>
          </div>
        ) : (
          <iframe 
             ref={iframeRef}
             src={resolvedSrc}
             className="absolute inset-0 w-full h-full border-none bg-white"
             sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
          />
        )}
      </main>
    </div>
  );
}
