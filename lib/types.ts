// lib/types.ts

export interface Passenger {
  email: string;
  name: string;
  title: string;
  bookingReference: string;
}

export interface Schedule {
  _id?: string;
  flightNumber: string;
  aircraft: string;
  capacity: number;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  departureTimezone: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalTimezone: string;
  price: number;
  passengers: Passenger[];
}

export interface Booking {
  bookingReference: string;
  passengerEmail: string;
  passengerName: string;
  title: string;
  scheduleId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: number;
}