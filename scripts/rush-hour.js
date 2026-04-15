/**
 * Rush Hour Stress Test
 * Simulates 50 tickets in 1 minute to test the autonomous expeditor
 */

import http from 'http';

const SERVER_URL = 'http://localhost:3001';
const TICKET_COUNT = 50;
const DURATION_MS = 60000; // 1 minute

console.log('🔥 RUSH HOUR STRESS TEST');
console.log(`📊 Target: ${TICKET_COUNT} tickets in ${DURATION_MS / 1000} seconds`);
console.log(`⏱️  Starting in 3 seconds...\n`);

setTimeout(() => {
  console.log('🚀 STRESS TEST STARTED\n');

  const startTime = Date.now();
  let ticketsAdded = 0;

  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;

    if (elapsed >= DURATION_MS || ticketsAdded >= TICKET_COUNT) {
      clearInterval(interval);
      console.log(`\n✅ STRESS TEST COMPLETED`);
      console.log(`📈 Total tickets added: ${ticketsAdded}`);
      console.log(`⏱️  Duration: ${(elapsed / 1000).toFixed(1)}s`);
      console.log(`\n📊 Check the dashboard to see how Kitchen-Pulse handled the chaos!`);
      return;
    }

    // Add ticket via API
    http
      .get(`${SERVER_URL}/api/stress-test?count=1`, (res) => {
        ticketsAdded++;
        process.stdout.write(`\r🎫 Tickets added: ${ticketsAdded}/${TICKET_COUNT}`);
      })
      .on('error', (err) => {
        console.error(`\n❌ Error: ${err.message}`);
      });
  }, DURATION_MS / TICKET_COUNT);
}, 3000);
