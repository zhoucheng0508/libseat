// 自习室数据
export const studyRooms = [
  {
    id: '1',
    name: '图书馆A区',
    location: '图书馆',
    openTime: '8:00',
    closeTime: '22:00',
    totalSeats: 100,
    availableSeats: 30,
    status: 'open',
    description: '位于图书馆一楼，环境安静，配备空调和WiFi'
  },
  {
    id: '2',
    name: '教学楼B区',
    location: '教学楼',
    openTime: '8:00',
    closeTime: '21:00',
    totalSeats: 80,
    availableSeats: 0,
    status: 'full',
    description: '位于教学楼二楼，采光良好，适合小组讨论'
  },
  {
    id: '3',
    name: '实验楼C区',
    location: '实验楼',
    openTime: '9:00',
    closeTime: '20:00',
    totalSeats: 50,
    availableSeats: 15,
    status: 'open',
    description: '位于实验楼三楼，配备独立电源插座'
  }
]

// 座位数据
export const seats = {
  '1': [
    { id: '1-1', number: 'A1-1', status: 'available', area: 'A区', hasPower: true, hasWindow: true },
    { id: '1-2', number: 'A1-2', status: 'reserved', area: 'A区', hasPower: true, hasWindow: true },
    { id: '1-3', number: 'A1-3', status: 'available', area: 'A区', hasPower: true, hasWindow: false },
    { id: '1-4', number: 'A1-4', status: 'unavailable', area: 'A区', hasPower: false, hasWindow: false },
    { id: '2-1', number: 'A2-1', status: 'available', area: 'A区', hasPower: true, hasWindow: true },
    { id: '2-2', number: 'A2-2', status: 'available', area: 'A区', hasPower: true, hasWindow: true },
    { id: '2-3', number: 'A2-3', status: 'reserved', area: 'A区', hasPower: true, hasWindow: false },
    { id: '2-4', number: 'A2-4', status: 'available', area: 'A区', hasPower: true, hasWindow: false },
    { id: '3-1', number: 'A3-1', status: 'unavailable', area: 'A区', hasPower: false, hasWindow: true },
    { id: '3-2', number: 'A3-2', status: 'available', area: 'A区', hasPower: true, hasWindow: true },
    { id: '3-3', number: 'A3-3', status: 'available', area: 'A区', hasPower: true, hasWindow: false },
    { id: '3-4', number: 'A3-4', status: 'available', area: 'A区', hasPower: true, hasWindow: false }
  ],
  '2': [
    { id: '1-1', number: 'B1-1', status: 'available', area: 'B区', hasPower: true, hasWindow: true },
    { id: '1-2', number: 'B1-2', status: 'available', area: 'B区', hasPower: true, hasWindow: true },
    { id: '1-3', number: 'B1-3', status: 'available', area: 'B区', hasPower: true, hasWindow: false },
    { id: '1-4', number: 'B1-4', status: 'available', area: 'B区', hasPower: true, hasWindow: false },
    { id: '2-1', number: 'B2-1', status: 'available', area: 'B区', hasPower: true, hasWindow: true },
    { id: '2-2', number: 'B2-2', status: 'available', area: 'B区', hasPower: true, hasWindow: true },
    { id: '2-3', number: 'B2-3', status: 'available', area: 'B区', hasPower: true, hasWindow: false },
    { id: '2-4', number: 'B2-4', status: 'available', area: 'B区', hasPower: true, hasWindow: false }
  ],
  '3': [
    { id: '1-1', number: 'C1-1', status: 'available', area: 'C区', hasPower: true, hasWindow: true },
    { id: '1-2', number: 'C1-2', status: 'reserved', area: 'C区', hasPower: true, hasWindow: true },
    { id: '1-3', number: 'C1-3', status: 'available', area: 'C区', hasPower: true, hasWindow: false },
    { id: '1-4', number: 'C1-4', status: 'unavailable', area: 'C区', hasPower: false, hasWindow: false },
    { id: '2-1', number: 'C2-1', status: 'available', area: 'C区', hasPower: true, hasWindow: true },
    { id: '2-2', number: 'C2-2', status: 'available', area: 'C区', hasPower: true, hasWindow: true },
    { id: '2-3', number: 'C2-3', status: 'reserved', area: 'C区', hasPower: true, hasWindow: false },
    { id: '2-4', number: 'C2-4', status: 'available', area: 'C区', hasPower: true, hasWindow: false }
  ]
}

// 预约时间段
export const timeSlots = [
  { start: '8:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
  { start: '19:00', end: '21:00' }
] 