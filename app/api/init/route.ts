// import { initSchedules } from '@/lib/initData';
// import { NextResponse } from 'next/server';

// export async function GET() {
//   await initSchedules();
//   return NextResponse.json({ message: 'Database initialized.' });
// }

import { initSchedules } from '@/lib/initData';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await initSchedules();
    return NextResponse.json({ ok: true, message: 'Initialized' });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}