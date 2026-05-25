import { connectDB, getClient } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { scheduleId, passengerEmail, passengerName, title } = body;

  if (!scheduleId || !passengerEmail || !passengerName || !title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = await connectDB();
  const schedules = db.collection('schedules');

  // 查找航班
  const schedule = await schedules.findOne({ _id: new ObjectId(scheduleId) });
  if (!schedule) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
  }

  // 检查是否已满
  if (schedule.passengers.length >= schedule.capacity) {
    return NextResponse.json({ error: 'Flight is full' }, { status: 400 });
  }

  // 检查重复预订（同一 email 不能重复预订同一航班）
  const alreadyBooked = schedule.passengers.some((p: any) => p.email === passengerEmail);
  if (alreadyBooked) {
    return NextResponse.json({ error: 'You already have a booking on this flight' }, { status: 409 });
  }

  // 生成唯一预订引用
  const bookingReference = 'DF-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  // 添加乘客到 schedules
  await schedules.updateOne(
    { _id: new ObjectId(scheduleId) },
    { $push: { passengers: { email: passengerEmail, name: passengerName, title, bookingReference } } }
  );

  // 同时维护 bookings 集合（可选但推荐）
  // const bookings = db.collection('bookings');
  // await bookings.insertOne({
  //   bookingReference,
  //   passengerEmail,
  //   passengerName,
  //   title,
  //   scheduleId: new ObjectId(scheduleId),
  //   flightNumber: schedule.flightNumber,
  //   origin: schedule.origin,
  //   destination: schedule.destination,
  //   departureDate: schedule.departureDate,
  //   departureTime: schedule.departureTime,
  //   arrivalDate: schedule.arrivalDate,
  //   arrivalTime: schedule.arrivalTime,
  //   price: schedule.price,
  // });

  // 同时维护 bookings 集合
  const bookings = db.collection('bookings');

  console.log("Writing booking:", {
    bookingReference,
    passengerEmail,
    passengerName
  });

  await bookings.insertOne({
    bookingReference,
    passengerEmail,
    passengerName,
    title,
    scheduleId: new ObjectId(scheduleId),
    flightNumber: schedule.flightNumber,
    origin: schedule.origin,
    destination: schedule.destination,
    departureDate: schedule.departureDate,
    departureTime: schedule.departureTime,
    arrivalDate: schedule.arrivalDate,
    arrivalTime: schedule.arrivalTime,
    price: schedule.price,
  });

  console.log("Booking inserted");

  // 返回发票信息
  return NextResponse.json({
    success: true,
    bookingReference,
    schedule: {
      flightNumber: schedule.flightNumber,
      origin: schedule.origin,
      destination: schedule.destination,
      departureDate: schedule.departureDate,
      departureTime: schedule.departureTime,
      arrivalDate: schedule.arrivalDate,
      arrivalTime: schedule.arrivalTime,
      price: schedule.price,
    },
    passenger: { email: passengerEmail, name: passengerName, title },
  });
}