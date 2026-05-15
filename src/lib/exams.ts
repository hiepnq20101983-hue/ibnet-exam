import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

export interface Exam {
  id: string;
  filename: string;
  title: string;
  duration: string;
  summary: string;
  examClass: string;
  examTopic: string;
  questionsCount?: number;
  source?: 'google-drive' | 'github';
}

// Helper for recursive read
function getAllFiles(dirPath: string, arrayOfFiles: string[] = [], rootPath?: string): string[] {
  const files = fs.readdirSync(dirPath);
  const base = rootPath || dirPath;

  files.forEach(file => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles, base);
    } else {
      // Only capture .html files
      if (file.endsWith('.html')) {
        arrayOfFiles.push(path.relative(base, path.join(dirPath, file)));
      }
    }
  });

  return arrayOfFiles;
}

// Simple in-memory cache to prevent redundant slow fetches
let examsCache: { data: Exam[], timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function getExams(): Promise<Exam[]> {
  // Return cached data if valid
  const now = Date.now();
  if (examsCache && (now - examsCache.timestamp < CACHE_TTL)) {
    return examsCache.data;
  }

  const rawDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const driveFolderId = rawDriveFolderId ? rawDriveFolderId.trim().replace(/^["']|["']$/g, '') : '';
  
  const rawSheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
  const sheetUrl = rawSheetUrl ? rawSheetUrl.trim().replace(/^["']|["']$/g, '') : '';

  let driveExams: Exam[] = [];
  let localExams: Exam[] = [];

  // 1. Dynamic Loading from Google Drive
  if (driveFolderId && sheetUrl) {
    try {
      const targetUrl = `${sheetUrl}${sheetUrl.includes('?') ? '&' : '?'}action=get_drive_exams&folderId=${driveFolderId}&_cb=${Date.now()}`;
      const res = await fetch(targetUrl, {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const responseText = await res.text();
        try {
          const data = JSON.parse(responseText);
          if (Array.isArray(data)) {
            // Return the pre-parsed metadata from Apps Script!
            // Inject a unique prefix 'drive-' into the ID to ensure infallible client-side routing
            driveExams = data.map(item => ({
              id: `drive-${item.id}`,
              filename: item.filename,
              title: item.title,
              duration: item.duration,
              summary: item.summary,
              examClass: item.examClass,
              examTopic: item.examTopic,
              source: 'google-drive'
            }));
          } else if (data && data.result === 'error') {
            console.error("Google Apps Script returned error:", data.message || data.error);
          }
        } catch (parseErr) {
          if (responseText.includes("Exam API Is Running Successfully")) {
            console.error("⚠️ Cảnh báo: Google Apps Script chưa được cập nhật hoặc Deploy bản mới nhất trên Google Drive (Script hiện trả về thông báo mặc định thay vì dữ liệu JSON).");
          } else {
            console.error("⚠️ Lỗi phân tích dữ liệu Google Drive. Kết quả nhận được từ Apps Script:", responseText);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch dynamic exams from Google Drive:", err);
    }
  }

  // 2. Local System Scanning (Github/Assets)
  const rawDisableGit = process.env.DISABLE_GIT_EXAMS || process.env.NEXT_PUBLIC_DISABLE_GIT_EXAMS;
  const disableGitExams = rawDisableGit ? rawDisableGit.trim().replace(/^["']|["']$/g, '').toLowerCase() === 'true' : false;
  
  const examsDir = path.join(process.cwd(), 'public');
  
  if (!disableGitExams && fs.existsSync(examsDir)) {
    // Scan all files recursively to get relative paths
    const relativePaths = getAllFiles(examsDir);
    
    localExams = relativePaths.map(relPath => {
      const fullPath = path.join(examsDir, relPath);
      const normalizedPath = relPath.replace(/\\/g, '/'); // Normalise for URL consistency
      
      // Determine hierarchical categorization based on folder depth
      const pathSegments = normalizedPath.split('/');
      
      let examClass = 'Chung';
      let examTopic = 'Tổng hợp';

      if (pathSegments.length === 2) {
        // e.g. "Lớp 12/file.html" or "Chuyên đề/file.html"
        const seg = pathSegments[0];
        if (seg.toLowerCase().includes('lớp') || seg.toLowerCase().includes('lop')) {
          examClass = seg;
        } else {
          examTopic = seg;
        }
      } else if (pathSegments.length >= 3) {
        // e.g. "Lớp 12/Đạo hàm/file.html"
        examClass = pathSegments[0];
        examTopic = pathSegments[1];
      }
      
      // Only read the first 50KB to optimize performance
      const fd = fs.openSync(fullPath, 'r');
      const buffer = Buffer.alloc(50000);
      const bytesRead = fs.readSync(fd, buffer, 0, 50000, 0);
      fs.closeSync(fd);
      
      const partialContent = buffer.toString('utf-8', 0, bytesRead);
      const $ = cheerio.load(partialContent + '</body></html>');
      
      const title = $('title').text().trim() || path.basename(relPath).replace('_conv.html', '');
      const duration = $('.exam-meta').text().trim() || 'Không rõ thời gian';
      const summary = $('.score-summary').text().trim() || '';
      
      // Create unified, clean ID by stripping the .html extension for local files
      const unifiedId = normalizedPath.replace(/\.html$/i, '');

      return {
        id: unifiedId,
        filename: normalizedPath,
        title: title,
        examClass: examClass,
        examTopic: examTopic,
        duration: duration.replace('Thời gian: ', ''),
        summary: summary.substring(0, 150) + '...',
        source: 'github'
      };
    });
  }
  
  // Combine both Drive and local exams
  const combinedExams = [...driveExams, ...localExams];
  
  // Update cache
  examsCache = {
    data: combinedExams,
    timestamp: Date.now()
  };

  return combinedExams;
}
