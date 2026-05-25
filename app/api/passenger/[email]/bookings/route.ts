import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const { email } = await params;

  const db = await connectDB();
  const bookings = db.collection('bookings');

  const result = await bookings
    .find({ passengerEmail: email })
    .toArray();

  return NextResponse.json(result);
}