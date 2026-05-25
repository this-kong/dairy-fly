import { initSchedules } from '@/lib/initData';
import { NextResponse } from 'next/server';

export async function GET() {
  await initSchedules();
  return NextResponse.json({ message: 'Database initialized.' });
}