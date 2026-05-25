'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [schedules, setSchedules] = useState([]);
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [orig, setOrig] = useState('NZNE');
  const [dest, setDest] = useState('');
  const [bookModal, setBookModal] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Mr');
  const [myEmail, setMyEmail] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [cancelModal, setCancelModal] = useState<any>(null);

  useEffect(() => {
    if (myEmail) {
      fetch(`/api/passenger/${encodeURIComponent(myEmail)}/bookings`)
        .then(res => res.json())
        .then(setMyBookings);
    }
  }, [myEmail]);

  const searchFlights = async () => {
    const params = new URLSearchParams();
    if (date1) params.set('date1', date1);
    if (date2) params.set('date2', date2);
    if (orig) params.set('orig', orig);
    if (dest) params.set('dest', dest);
    const res = await fetch(`/api/schedules?${params}`);
    const data = await res.json();
    setSchedules(data);
  };

  // const bookFlight = async (scheduleId: string) => {
  //   const res = await fetch('/api/book', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ scheduleId, passengerEmail: email, passengerName: name, title }),
  //   });
  //   const data = await res.json();
  //   if (res.ok) {
  //     alert(`Booking successful! Reference: ${data.bookingReference}`);
  //     setBookModal(null);
  //     searchFlights(); // refresh
  //   } else {
  //     alert(data.error);
  //   }
  // };

  const bookFlight = async (scheduleId: string) => {
  const res = await fetch('/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scheduleId,
      passengerEmail: email,
      passengerName: name,
      title,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    setInvoice(data);
    setBookModal(null);
    searchFlights();
  } else {
    alert(data.error);
  }
};

  const cancelBooking = async (ref: string) => {
  const res = await fetch('/api/cancel', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bookingReference: ref,
      passengerEmail: myEmail
    }),
  });

  if (res.ok) {

    setMyBookings(
      prev => prev.filter(
        (b:any)=>b.bookingReference!==ref
      )
    );

    setCancelModal(null);

  } else {
    const data=await res.json();
    alert(data.error);
  }
};

  // 新增邮箱识别
  const loadBookings = async () => {
    if (!myEmail) return;

    const res = await fetch(
      `/api/passenger/${encodeURIComponent(myEmail)}/bookings`
    );

    const data = await res.json();

    setMyBookings(data);
    setShowMyBookings(true);
  };

  // return (
  //   <main className="max-w-6xl mx-auto p-4">
  //     <h1 className="text-3xl font-bold mb-4">✈ Dairy Fly</h1>
      
  return (
  <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-blue-50">

    {/* Hero section */}
    <div className="relative h-[280px] flex items-center justify-center overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-sky-500"></div>

      <div className="relative text-center text-white z-10">

        <h1 className="text-5xl font-extrabold mb-4">
          ✈ Dairy Fly
        </h1>

        <p className="text-xl">
          Luxury regional flights from Dairy Flat Airport
        </p>

        <p className="mt-2 text-blue-100">
          Sydney • Rotorua • Great Barrier • Chatham Islands • Lake Tekapo
        </p>

      </div>
    </div>

    <div className="max-w-6xl mx-auto p-6">

      {/* 搜索表单 */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
      {/* <div className="bg-white shadow-md rounded p-6 mb-8"> */}
        <h2 className="text-xl font-semibold mb-2">Search Flights</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label>Origin</label>
            {/* <input type="text" value={orig} onChange={e => setOrig(e.target.value)} className="w-full border p-2 rounded" /> */}
            <select
              value={orig}
              onChange={e => setOrig(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="NZNE">Dairy Flat (NZNE)</option>
              <option value="YSSY">Sydney (YSSY)</option>
              <option value="NZRO">Rotorua (NZRO)</option>
              <option value="NZGB">Great Barrier Island (NZGB)</option>
              <option value="NZCI">Chatham Islands (NZCI)</option>
              <option value="NZTL">Lake Tekapo (NZTL)</option>
            </select>
          </div>
          <div>
            <label>Destination</label>
            {/* <input type="text" value={dest} onChange={e => setDest(e.target.value)} className="w-full border p-2 rounded" /> */}
            <select
              value={dest}
              onChange={e => setDest(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Any</option>
              <option value="NZNE">Dairy Flat (NZNE)</option>
              <option value="YSSY">Sydney (YSSY)</option>
              <option value="NZRO">Rotorua (NZRO)</option>
              <option value="NZGB">Great Barrier Island (NZGB)</option>
              <option value="NZCI">Chatham Islands (NZCI)</option>
              <option value="NZTL">Lake Tekapo (NZTL)</option>
            </select>
          </div>
          <div>
            <label>From date</label>
            <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label>To date</label>
            <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>
        <button
          onClick={searchFlights}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:scale-105 duration-200 hover:bg-blue-700"
          >
          Search Flights
          </button>
        {/* <button onClick={searchFlights} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Search</button> */}
      </div>

      {/* 搜索结果 */}
      <div className="grid gap-4">
        {schedules.map((s: any) => (
          <div key={s._id} className="bg-white rounded-3xl shadow-lg p-6 flex justify-between items-center hover:shadow-2xl duration-300">
            <div>
              <p className="font-bold">{s.flightNumber} – {s.origin} → {s.destination}</p>
              <p>{s.departureDate} {s.departureTime} ({s.departureTimezone})</p>
              <p>Arrival: {s.arrivalDate} {s.arrivalTime} ({s.arrivalTimezone})</p>
              <p>Aircraft: {s.aircraft} (Capacity: {s.capacity - s.passengers.length} seats left)</p>
              <p className="text-2xl font-bold text-blue-600">${s.price}</p>
            </div>
            <button
              onClick={() => setBookModal(s)}
              // className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              className="bg-green-600 hover:bg-green-700 hover:scale-105 duration-200 text-white px-5 py-3 rounded-xl"
              disabled={s.passengers.length >= s.capacity}
            >
              {s.passengers.length >= s.capacity ? 'Full' : 'Book'}
            </button>
          </div>
        ))}
      </div>

      {/* 预订弹窗 */}
      {bookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-xl w-96">
            <h3 className="text-xl mb-4">Book {bookModal.flightNumber}</h3>
            <div className="space-y-2">
              <div>
                <label>Title</label>
                <select value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded">
                  <option>Mr</option>
                  <option>Mrs</option>
                  <option>Ms</option>
                  <option>Miss</option>
                </select>
              </div>
              <div>
                <label>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setBookModal(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={() => bookFlight(bookModal._id)} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm Booking</button>
            </div>
          </div>
        </div>
      )}

      {/* 查看我的预订 */}
      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">My Bookings</h2>
        <div className="flex gap-2 mb-2">
          <input type="email" placeholder="Enter your email" value={myEmail} onChange={e => setMyEmail(e.target.value)} className="border p-2 rounded flex-1" />
          {/* //<button onClick={() => setShowMyBookings(true)} className="bg-indigo-600 text-white px-4 py-2 rounded">Show</button> */}
          <button onClick={loadBookings} className="bg-indigo-600 text-white px-4 py-2 rounded">
  Show
</button>
        </div>
        {showMyBookings && (
          <div className="space-y-2">
            {myBookings.map((b: any) => (
              // <div key={b.bookingReference} className="border p-3 rounded flex justify-between items-center">
              //   <div>
              //     <p className="font-bold">{b.flightNumber}: {b.origin} → {b.destination}</p>
              //     <p>{b.departureDate} {b.departureTime}</p>
              //     <p>Reference: {b.bookingReference}</p>
              //   </div>
              //   <button onClick={() => cancelBooking(b.bookingReference)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Cancel</button>
              // </div>

              <div key={b.bookingReference} className="bg-white rounded-2xl shadow-lg p-5 flex justify-between items-center">

                <div>

                  <div className="flex gap-2 items-center mb-2">

                    <span className="font-bold text-lg">
                      {b.flightNumber}
                    </span>

                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                      {b.origin} → {b.destination}
                    </span>

                  </div>

                  <p className="text-gray-600">
                    Departure:
                    {" "}
                    {b.departureDate}
                    {" "}
                    {b.departureTime}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Booking Ref: {b.bookingReference}
                  </p>

                </div>

                <button onClick={() => setCancelModal(b)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl">
                Cancel
                </button>

              </div>

            ))}
            {myBookings.length === 0 && <p>No bookings found.</p>}
          </div>
        )}
      </div>

          {cancelModal && (

            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">

            <div className="border-b pb-4 mb-4">

            <h2 className="text-2xl font-bold text-red-600">
            Cancel Booking
            </h2>

            <p className="text-sm text-gray-500">
            Confirm cancellation request
            </p>

            </div>


            <div className="space-y-3">

            <div>
            <p className="text-sm text-gray-500">
            Flight
            </p>

            <p className="font-semibold">
            {cancelModal.flightNumber}
            </p>
            </div>


            <div>
            <p className="text-sm text-gray-500">
            Route
            </p>

            <p>
            {cancelModal.origin}
            {" → "}
            {cancelModal.destination}
            </p>
            </div>


            <div>
            <p className="text-sm text-gray-500">
            Departure
            </p>

            <p>
            {cancelModal.departureDate}
            {" "}
            {cancelModal.departureTime}
            </p>
            </div>


            <div>
            <p className="text-sm text-gray-500">
            Booking Reference
            </p>

            <p className="font-semibold">
            {cancelModal.bookingReference}
            </p>
            </div>

            </div>


            <div className="flex gap-3 mt-6">

            <button
            onClick={() => setCancelModal(null)}
            className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
            >
            Keep Booking
            </button>


            <button
            onClick={() =>
            cancelBooking(
            cancelModal.bookingReference
            )}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
            Confirm Cancel
            </button>

            </div>

            </div>

            </div>

            )}

          {invoice && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6">

      {/* Header */}
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-green-600">
          ✓ Booking Confirmed
        </h2>
        <p className="text-sm text-gray-500">
          Reference: {invoice.bookingReference}
        </p>
      </div>

      {/* Passenger */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">Passenger</p>
        <p className="text-lg font-semibold">
          {invoice.passenger.title} {invoice.passenger.name}
        </p>
      </div>

      {/* Flight */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Flight</p>
          <p className="font-semibold">{invoice.schedule.flightNumber}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Price</p>
          <p className="font-semibold text-blue-600">
            ${invoice.schedule.price}
          </p>
        </div>
      </div>

      {/* Route */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">Route</p>
        <p className="text-lg font-semibold">
          {invoice.schedule.origin} → {invoice.schedule.destination}
        </p>
      </div>

      {/* Times */}
      <div className="space-y-2 mb-6">
        <div>
          <p className="text-sm text-gray-500">Departure</p>
          <p>
            {invoice.schedule.departureDate} {invoice.schedule.departureTime}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Arrival</p>
          <p>
            {invoice.schedule.arrivalDate} {invoice.schedule.arrivalTime}
          </p>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={() => setInvoice(null)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
      >
        Back to Search
      </button>

    </div>
  </div>
)}

    </div>
    </main>
  );
}