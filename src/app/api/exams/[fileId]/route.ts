import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;

  if (!sheetUrl) {
    return new NextResponse("Cấu hình hệ thống lỗi: Thiếu URL Google Apps Script (NEXT_PUBLIC_GOOGLE_SHEET_URL).", { status: 500 });
  }

  try {
    // Forward to Apps Script to load actual HTML string from Google Drive
    const response = await fetch(`${sheetUrl}?action=get_exam_content&fileId=${fileId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Apps Script trả lỗi: ${response.statusText}`);
    }
    
    const htmlContent = await response.text();
    
    // Serve with 'text/html' to the iframe, fully Same-Origin!
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (err: any) {
    console.error(`Error serving exam ${fileId}:`, err);
    return new NextResponse(`Lỗi hệ thống khi tải dữ liệu đề thi: ${err.message}`, { status: 500 });
  }
}
