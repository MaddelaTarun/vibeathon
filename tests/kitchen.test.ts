import { describe, it, expect } from 'vitest';
import { KitchenEngine } from '../src/engine.js';
import { AgentBrain } from '../src/brain.ts';
import { Order } from '../src/types/index.js';

describe('Kitchen Smart Traffic Controller', () => {
  it('should reallocate labor when stress is high', () => {
    const engine = new KitchenEngine();
    const brain = new AgentBrain(engine);

    // 1. Initially 1 staff at Grill
    expect(engine.getState().stations.GRILL.laborCount).toBe(1);

    // 2. Add many grill orders to increase stress
    const heavyOrder: Order = {
      id: 'TEST-1',
      timestamp: Date.now(),
      status: 'PENDING',
      items: Array(20).fill({ name: 'Steak', station: 'GRILL', processingTime: 10, profit: 50 })
    };
    engine.addOrder(heavyOrder);

    const stressBefore = engine.getStationStress('GRILL');
    expect(stressBefore).toBeGreaterThan(0.85);

    // 3. Run brain optimization
    brain.analyzeAndOptimize();

    // 4. Verify labor moved from a donor (like PREP or SALAD) to GRILL
    expect(engine.getState().stations.GRILL.laborCount).toBe(2);
    expect(engine.getDecisions().length).toBe(1);
    expect(engine.getDecisions()[0].action).toContain('Moved 1 staff from');
  });

  it('should calculate profit at risk correctly', () => {
    const engine = new KitchenEngine();
    const highProfitOrder: Order = {
      id: 'PROFIT-1',
      timestamp: Date.now(),
      status: 'PENDING',
      items: Array(10).fill({ name: 'Steak', station: 'GRILL', processingTime: 10, profit: 100 })
    };
    
    engine.addOrder(highProfitOrder);
    expect(engine.getState().profitAtRisk).toBeGreaterThan(0);
    expect(engine.getState().profitAtRisk).toBe(1000);
  });
});
