import { connectDB } from './mongodb';

const AIRCRAFT = {
  syberJet: { name: 'SyberJet SJ30i', capacity: 6, price: 2500 },
  cirrus1: { name: 'Cirrus SF50', capacity: 4, price: 1500 },
  cirrus2: { name: 'Cirrus SF50', capacity: 4, price: 1500 },
  honda1: { name: 'HondaJet Elite', capacity: 5, price: 2000 },
  honda2: { name: 'HondaJet Elite', capacity: 5, price: 2000 },
};

// 定义每次出发的模板（每周重复）
const weeklyRoutes = [
  // 1. 悉尼 prestige 服务 (SyberJet)
  {
    flightNumber: 'DF101',
    aircraft: AIRCRAFT.syberJet,
    origin: 'NZNE',
    destination: 'YSSY',
    dayOfWeek: 5, // Friday
    departureTime: '10:30',
    departureTimezone: 'Pacific/Auckland',
    arrivalTime: '14:30', // 飞行约 4h（西向更短，但这里简化）
    arrivalTimezone: 'Australia/Sydney',
  },
  {
    flightNumber: 'DF102',
    aircraft: AIRCRAFT.syberJet,
    origin: 'YSSY',
    destination: 'NZNE',
    dayOfWeek: 0, // Sunday (出发日)
    departureTime: '15:00',
    departureTimezone: 'Australia/Sydney',
    arrivalTime: '20:00', // 飞行约 4h（东向略长）
    arrivalTimezone: 'Pacific/Auckland',
  },
  // 2. Rotorua shuttle (Cirrus 1) – 每天两班，周一至周五
  ...[1,2,3,4,5].flatMap(day => [
    {
      flightNumber: 'DF201',
      aircraft: AIRCRAFT.cirrus1,
      origin: 'NZNE',
      destination: 'NZRO',
      dayOfWeek: day,
      departureTime: '07:00',
      departureTimezone: 'Pacific/Auckland',
      arrivalTime: '08:15', // ~1h15min
      arrivalTimezone: 'Pacific/Auckland',
    },
    {
      flightNumber: 'DF202',
      aircraft: AIRCRAFT.cirrus1,
      origin: 'NZRO',
      destination: 'NZNE',
      dayOfWeek: day,
      departureTime: '08:45',
      departureTimezone: 'Pacific/Auckland',
      arrivalTime: '10:00',
      arrivalTimezone: 'Pacific/Auckland',
    },
    {
      flightNumber: 'DF203',
      aircraft: AIRCRAFT.cirrus1,
      origin: 'NZNE',
      destination: 'NZRO',
      dayOfWeek: day,
      departureTime: '17:00',
      departureTimezone: 'Pacific/Auckland',
      arrivalTime: '18:15',
      arrivalTimezone: 'Pacific/Auckland',
    },
    {
      flightNumber: 'DF204',
      aircraft: AIRCRAFT.cirrus1,
      origin: 'NZRO',
      destination: 'NZNE',
      dayOfWeek: day,
      departureTime: '18:45',
      departureTimezone: 'Pacific/Auckland',
      arrivalTime: '20:00',
      arrivalTimezone: 'Pacific/Auckland',
    },
  ]),
  // 3. Great Barrier Island (Cirrus 2) – 每周一三五出发，二四六返回
  ...[1,3,5].flatMap(day => [
    {
      flightNumber: 'DF301',
      aircraft: AIRCRAFT.cirrus2,
      origin: 'NZNE',
      destination: 'NZGB',
      dayOfWeek: day,
      departureTime: '09:00',
      departureTimezone: 'Pacific/Auckland',
      arrivalTime: '10:15',
      arrivalTimezone: 'Pacific/Auckland',
    },
  ]),
  ...[2,4,6].flatMap(day => [
    {
      flightNumber: 'DF302',
      aircraft: AIRCRAFT.cirrus2,
      origin: 'NZGB',
      destination: 'NZNE',
      dayOfWeek: day,
      departureTime: '10:45',
      departureTimezone: 'Pacific/Auckland',
      arrivalTime: '12:00',
      arrivalTimezone: 'Pacific/Auckland',
    },
  ]),
  // 4. Chatham Islands (Honda 1) – 周二/五出发，周三/六返回
  ...[2,5].flatMap(day => [
    {
      flightNumber: 'DF401',
      aircraft: AIRCRAFT.honda1,
      origin: 'NZNE',
      destination: 'NZCI',
      dayOfWeek: day,
      departureTime: '08:00',
      departureTimezone: 'Pacific/Auckland',
      arrivalTime: '11:00', // 约 3h（实际注意时区差）
      arrivalTimezone: 'Pacific/Chatham',
    },
  ]),
  ...[3,6].flatMap(day => [
    {
      flightNumber: 'DF402',
      aircraft: AIRCRAFT.honda1,
      origin: 'NZCI',
      destination: 'NZNE',
      dayOfWeek: day,
      departureTime: '12:00',
      departureTimezone: 'Pacific/Chatham',
      arrivalTime: '15:00',
      arrivalTimezone: 'Pacific/Auckland',
    },
  ]),
  // 5. Lake Tekapo (Honda 2) – 周一出发，周二返回
  {
    flightNumber: 'DF501',
    aircraft: AIRCRAFT.honda2,
    origin: 'NZNE',
    destination: 'NZTL',
    dayOfWeek: 1,
    departureTime: '07:00',
    departureTimezone: 'Pacific/Auckland',
    arrivalTime: '09:00',
    arrivalTimezone: 'Pacific/Auckland',
  },
  {
    flightNumber: 'DF502',
    aircraft: AIRCRAFT.honda2,
    origin: 'NZTL',
    destination: 'NZNE',
    dayOfWeek: 2,
    departureTime: '10:00',
    departureTimezone: 'Pacific/Auckland',
    arrivalTime: '12:00',
    arrivalTimezone: 'Pacific/Auckland',
  },
];

// 生成未来 4 周的航班实例
export async function initSchedules() {
  const db = await connectDB();
  const schedulesCol = db.collection('schedules');
  // 先清空（开发用）
  await schedulesCol.deleteMany({});

  const start = new Date();  // 从今天起
  const end = new Date();
  end.setDate(end.getDate() + 28); // 未来 28 天

  const toInsert: any[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const dateStr = d.toISOString().split('T')[0]; // "2026-07-17"

    for (const route of weeklyRoutes) {
      if (route.dayOfWeek === dayOfWeek) {
        // 生成 departureDate 和 arrivalDate （考虑跨日）
        const depDate = dateStr;
        // 简化到达日期：如果到达时间小于出发时间，认为跨日（同一天不变）
        const depHours = parseInt(route.departureTime.split(':')[0]);
        const arrHours = parseInt(route.arrivalTime.split(':')[0]);
        const arrDate = (arrHours < depHours) 
          ? new Date(d.getTime() + 86400000).toISOString().split('T')[0]
          : dateStr;

        toInsert.push({
          flightNumber: route.flightNumber,
          aircraft: route.aircraft.name,
          capacity: route.aircraft.capacity,
          origin: route.origin,
          destination: route.destination,
          departureDate: depDate,
          departureTime: route.departureTime,
          departureTimezone: route.departureTimezone,
          arrivalDate: arrDate,
          arrivalTime: route.arrivalTime,
          arrivalTimezone: route.arrivalTimezone,
          price: route.aircraft.price,
          passengers: [],  // 初始无乘客
        });
      }
    }
  }

  if (toInsert.length > 0) {
    await schedulesCol.insertMany(toInsert);
    console.log(`Inserted ${toInsert.length} schedules.`);
  }
}