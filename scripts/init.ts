import { initSchedules } from '../lib/initData';

initSchedules().then(() => {
  console.log('Database initialized successfully.');
  process.exit(0);
}).catch(err => {
  console.error('Initialization failed:', err);
  process.exit(1);
});