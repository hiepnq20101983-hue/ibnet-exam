import { NextRequest, NextResponse } from 'next/server';
import { getExams } from '@/lib/exams';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const exams = await getExams();
    return NextResponse.json(exams, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Internal server error while fetching exams",
      message: error.message
    }, { status: 500 });
  }
}
