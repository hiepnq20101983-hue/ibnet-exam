import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;

  if (!sheetUrl) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_GOOGLE_SHEET_URL" }, { status: 500 });
  }

  try {
    const body = await request.json();
    
    // Forward to Apps Script with actual response handling
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Since Google Apps Script returns 200 even for some errors, we try to parse it
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (e) {
      // If not JSON, return as is (could be success message or error)
      return new NextResponse(text, { status: response.status });
    }
  } catch (error: any) {
    console.error("Sheet Proxy Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error in Sheet Proxy",
      message: error.message 
    }, { status: 500 });
  }
}
