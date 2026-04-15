import { KitchenEngine } from './engine.js';
import { StationType } from './types/index.js';

export class AgentBrain {
  constructor(private engine: KitchenEngine) {}

  analyzeAndOptimize() {
    const state = this.engine.getState();
    const stationTypes: StationType[] = ['GRILL', 'SAUTE', 'SALAD', 'PREP'];
    
    // 1. Identify bottlenecks
    const bottlenecks = stationTypes.filter(type => this.engine.getStationStress(type) > 0.85);
    
    // 2. Identify donor stations (low stress)
    const donors = stationTypes.filter(type => 
      this.engine.getStationStress(type) < 0.3 && state.stations[type].laborCount > 0
    );

    // 3. Reallocate labor to save profit
    if (bottlenecks.length > 0 && donors.length > 0) {
      const target = bottlenecks[0];
      const donor = donors[0];
      
      this.engine.moveLabor(
        donor, 
        target, 
        1, 
        `CRITICAL: ${target} bottleneck detected (Stress > 85%). Reallocating labor from ${donor} to protect high-profit orders.`
      );
    }
  }
}
