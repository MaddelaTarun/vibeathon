/**
 * Advanced Rush Hour Stress Test
 * Simulates realistic rush hour with burst patterns
 */

import chalk from 'chalk';

const SERVER_URL = 'http://localhost:3001';

async function testConnection() {
  try {
    const response = await fetch(`${SERVER_URL}/api/menu`);
    if (!response.ok) throw new Error('Server not responding');
    console.log(chalk.green('✓ Server connection verified'));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Cannot connect to server at ${SERVER_URL}`));
    console.error(chalk.yellow('💡 Make sure to run: npm run server'));
    process.exit(1);
  }
}

async function startStressTest(ticketsPerMinute = 50, durationMinutes = 1) {
  console.log(chalk.red.bold('\n🔥 ADVANCED STRESS TEST'));
  console.log(chalk.cyan(`📊 Configuration:`));
  console.log(chalk.white(`   - Tickets per minute: ${ticketsPerMinute}`));
  console.log(chalk.white(`   - Duration: ${durationMinutes} minute(s)`));
  console.log(chalk.white(`   - Total tickets: ${ticketsPerMinute * durationMinutes}\n`));

  try {
    const response = await fetch(`${SERVER_URL}/api/stress-test/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketsPerMinute })
    });

    if (!response.ok) throw new Error('Failed to start stress test');

    console.log(chalk.green.bold('🚀 STRESS TEST ACTIVATED\n'));
    console.log(chalk.yellow('📈 Monitor the dashboard at http://localhost:3000'));
    console.log(chalk.magenta('⚡ Watch for autonomous labor reallocations'));
    console.log(chalk.red('🚨 Look for Auto-86 margin protection triggers\n'));

    // Monitor for duration
    const startTime = Date.now();
    const totalDuration = durationMinutes * 60 * 1000;

    const monitorInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalDuration - elapsed);
      const progress = Math.floor((elapsed / totalDuration) * 30);
      const bar = '█'.repeat(progress) + '░'.repeat(30 - progress);
      
      process.stdout.write(
        `\r${chalk.yellow('⏱️')}  [${bar}] ${Math.floor(remaining / 1000)}s remaining`
      );

      if (remaining <= 0) {
        clearInterval(monitorInterval);
        stopStressTest();
      }
    }, 1000);

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

async function stopStressTest() {
  try {
    await fetch(`${SERVER_URL}/api/stress-test/stop`, { method: 'POST' });
    console.log(chalk.green.bold('\n\n✅ STRESS TEST COMPLETED'));
    console.log(chalk.cyan('📊 Check the Manager Dashboard for results:'));
    console.log(chalk.white('   - Total autonomous actions taken'));
    console.log(chalk.white('   - Labor reallocations executed'));
    console.log(chalk.white('   - Auto-86 margin protections'));
    console.log(chalk.white('   - Average delay times'));
    console.log(chalk.white('   - Profit at risk metrics\n'));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red(`\n❌ Error stopping test: ${error.message}`));
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const ticketsPerMinute = parseInt(args[0]) || 50;
const durationMinutes = parseInt(args[1]) || 1;

// Run test
await testConnection();
await startStressTest(ticketsPerMinute, durationMinutes);
