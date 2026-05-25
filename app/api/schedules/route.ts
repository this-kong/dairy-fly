import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date1 = url.searchParams.get('date1');
  const date2 = url.searchParams.get('date2');
  const orig = url.searchParams.get('orig');
  const dest = url.searchParams.get('dest');

  const db = await connectDB();
  const schedules = db.collection('schedules');

  // 构建查询条件
  const query: any = {};
  if (date1 && date2) {
    query.departureDate = { $gte: date1, $lte: date2 };
  }
  if (orig) query.origin = orig.toUpperCase();
  if (dest) query.destination = dest.toUpperCase();

  const results = await schedules.find(query).sort({ departureDate: 1, departureTime: 1 }).toArray();
  return NextResponse.json(results);
}