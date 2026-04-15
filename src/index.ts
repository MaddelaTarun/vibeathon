import chalk from 'chalk';
import { KitchenEngine } from './engine.js';
import { AgentBrain } from './brain.ts';
import { Order, OrderItem, StationType } from './types/index.js';

const engine = new KitchenEngine();
const brain = new AgentBrain(engine);

function createRandomOrder(id: number): Order {
  const menu: OrderItem[] = [
    { name: 'Ribeye Steak', station: 'GRILL', processingTime: 12, profit: 45 },
    { name: 'Filet Mignon', station: 'GRILL', processingTime: 10, profit: 55 },
    { name: 'Shrimp Scampi', station: 'SAUTE', processingTime: 8, profit: 28 },
    { name: 'Chicken Alfredo', station: 'SAUTE', processingTime: 9, profit: 24 },
    { name: 'Caesar Salad', station: 'SALAD', processingTime: 4, profit: 12 },
    { name: 'Garden Salad', station: 'SALAD', processingTime: 3, profit: 10 },
    { name: 'Chopped Veggies', station: 'PREP', processingTime: 5, profit: 5 },
  ];

  const itemsCount = Math.floor(Math.random() * 3) + 1;
  const items = Array.from({ length: itemsCount }, () => menu[Math.floor(Math.random() * menu.length)]);

  return {
    id: `ORD-${id}`,
    items,
    status: 'PENDING',
    timestamp: Date.now(),
  };
}

function drawProgressBar(value: number, color: (s: string) => string) {
  const width = 20;
  const filled = Math.min(width, Math.floor(value * width));
  const empty = width - filled;
  return `[${color('█'.repeat(filled))}${'.'.repeat(empty)}] ${Math.round(value * 100)}%`;
}

let orderCounter = 0;
console.clear();

setInterval(() => {
  // 1. Tick engine
  engine.tick();

  // 2. Chance of new orders (Rush Hour simulation)
  if (Math.random() > 0.6) {
    engine.addOrder(createRandomOrder(++orderCounter));
  }

  // 3. Brain analyzes and optimizes
  brain.analyzeAndOptimize();

  // 4. Update Dashboard
  const state = engine.getState();
  console.clear();
  console.log(chalk.bold.bgBlue(' 👨‍🍳 KITCHEN SMART TRAFFIC CONTROLLER (AI-DRIVEN) '));
  console.log(chalk.gray(`Time: ${new Date().toLocaleTimeString()}\n`));

  console.log(chalk.bold('--- Station Stress Levels ---'));
  Object.values(state.stations).forEach(station => {
    const stress = engine.getStationStress(station.type);
    let color = chalk.green;
    if (stress > 0.85) color = chalk.red;
    else if (stress > 0.6) color = chalk.yellow;

    console.log(
      `${station.type.padEnd(8)} | Staff: ${station.laborCount} | ${drawProgressBar(stress, color)}`
    );
  });

  console.log(`\n${chalk.bold('--- Profit Metrics ---')}`);
  console.log(`${chalk.green('Total Realized Profit: ')} $${state.totalProfit.toFixed(2)}`);
  console.log(`${chalk.red('Current Profit-at-Risk:')} $${state.profitAtRisk.toFixed(2)}`);
  console.log(`${chalk.cyan('Total AI Profit Saved: ')} $${engine.getTotalProfitSaved().toFixed(2)}`);

  console.log(`\n${chalk.bold('--- Recent AI Decisions ---')}`);
  const decisions = engine.getDecisions().slice(-3).reverse();
  if (decisions.length === 0) console.log(chalk.italic.gray('Brain monitoring system... no adjustments needed.'));
  decisions.forEach(d => {
    console.log(`${chalk.yellow('●')} ${chalk.bold(d.action)}`);
    console.log(`  ${chalk.gray(d.reason)}`);
  });

  console.log(`\n${chalk.dim('Active Orders: ' + state.activeOrders.length)}`);
}, 1000);
