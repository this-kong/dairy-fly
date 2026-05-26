import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const { bookingReference, passengerEmail } = body;

    if (!bookingReference || !passengerEmail) {
      return NextResponse.json(
        { error: 'Missing booking reference or email' },
        { status: 400 }
      );
    }

    const db = await connectDB();

    //const schedules = db.collection('schedules');
    const schedules = db.collection<any>('schedules');
    //const bookings = db.collection('bookings');
    const bookings = db.collection<any>('bookings');

    // 确认订单存在
    const booking = await bookings.findOne({
      bookingReference,
      passengerEmail
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // 删除 booking 集合里的记录
    await bookings.deleteOne({
      bookingReference,
      passengerEmail
    });

    // 删除 schedule.passengers 里的记录
await schedules.updateOne(
  {
    'passengers.bookingReference': bookingReference
  },
  {
    $pull: {
      passengers: {
        bookingReference: bookingReference
      }
    }
  } as any
);

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}