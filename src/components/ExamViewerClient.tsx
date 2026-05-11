'use client';

import Link from "next/link";
import { ChevronLeft, RotateCcw, Maximize2, User, Sparkles, Trophy } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from "next/navigation";

export default function ExamViewerClient({ examId }: { examId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [student, setStudent] = useState<{ name: string; className: string } | null>(null);
  const [scoreText, setScoreText] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [basePath, setBasePath] = useState('');
  const pathname = usePathname();

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

    const saveHistory = (finalScore: string) => {
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

  // URL encode each segment independently to ensure browser maps space/% correctly
  const encodedExamId = examId.split('/').map(encodeURIComponent).join('/');
  const resolvedSrc = `${basePath}/assets/exams/${encodedExamId}`;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0B0F17] overflow-hidden z-50 h-screen">
      <header className="bg-[#111827] border-b border-slate-800 px-4 h-16 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white px-3 py-2 text-sm shrink-0 flex items-center">
            <ChevronLeft className="h-4 w-4" /> Thoát
          </Link>
          <div className="truncate">
             <h1 className="text-white font-bold truncate flex items-center gap-2">
               <Sparkles className="h-4 w-4 text-indigo-400" /> {examId.replace('_conv.html', '').replace(/_/g, ' ')}
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

      <main className="flex-1 relative w-full bg-[#F3F4F6]">
        <iframe 
           ref={iframeRef}
           src={resolvedSrc}
           className="absolute inset-0 w-full h-full border-none bg-white"
           sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
        />
      </main>
    </div>
  );
}
