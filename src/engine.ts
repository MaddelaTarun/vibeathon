import { KitchenState, StationType, Order, Station, Decision } from './types/index.js';

export class KitchenEngine {
  private state: KitchenState;
  private decisions: Decision[] = [];
  private totalProfitSaved: number = 0;

  constructor() {
    this.state = {
      stations: {
        GRILL: { id: 's1', type: 'GRILL', capacity: 10, laborCount: 1, currentLoad: 0, baseProcessingTime: 10 },
        SAUTE: { id: 's2', type: 'SAUTE', capacity: 15, laborCount: 1, currentLoad: 0, baseProcessingTime: 8 },
        SALAD: { id: 's3', type: 'SALAD', capacity: 30, laborCount: 1, currentLoad: 0, baseProcessingTime: 3 },
        PREP: { id: 's4', type: 'PREP', capacity: 50, laborCount: 1, currentLoad: 0, baseProcessingTime: 2 },
      },
      activeOrders: [],
      totalProfit: 0,
      profitAtRisk: 0,
    };
  }

  getState(): KitchenState {
    return this.state;
  }

  addOrder(order: Order) {
    this.state.activeOrders.push(order);
    order.items.forEach(item => {
      this.state.stations[item.station].currentLoad += 1;
    });
    this.calculateProfitAtRisk();
  }

  moveLabor(from: StationType, to: StationType, count: number, reason: string) {
    if (this.state.stations[from].laborCount >= count) {
      this.state.stations[from].laborCount -= count;
      this.state.stations[to].laborCount += count;
      
      const impact = `Reduced stress on ${to} by increasing capacity. Saved high-profit orders at risk.`;
      this.recordDecision(reason, `Moved ${count} staff from ${from} to ${to}`, impact);
      this.totalProfitSaved += 50; // Mock calculation for demo
    }
  }

  private recordDecision(reason: string, action: string, impact: string) {
    this.decisions.push({
      reason,
      action,
      impact,
      timestamp: Date.now(),
    });
  }

  getDecisions() {
    return this.decisions;
  }

  getTotalProfitSaved() {
    return this.totalProfitSaved;
  }

  private calculateProfitAtRisk() {
    let risk = 0;
    Object.values(this.state.stations).forEach(station => {
      const stress = this.getStationStress(station.type);
      if (stress > 0.8) {
        // Find orders using this station
        const stationOrders = this.state.activeOrders.filter(o => 
          o.items.some(i => i.station === station.type)
        );
        risk += stationOrders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.profit, 0), 0);
      }
    });
    this.state.profitAtRisk = risk;
  }

  getStationStress(type: StationType): number {
    const s = this.state.stations[type];
    if (s.laborCount === 0) return s.currentLoad > 0 ? 2 : 0;
    return s.currentLoad / (s.laborCount * s.capacity);
  }

  tick() {
    // Simulate completion of items over time
    Object.values(this.state.stations).forEach(station => {
      if (station.currentLoad > 0 && station.laborCount > 0) {
        const processed = Math.min(station.currentLoad, (station.laborCount * station.capacity) / 60); // items per minute
        station.currentLoad = Math.max(0, station.currentLoad - processed);
      }
    });

    // Update orders: if all items done, remove order and add profit
    this.state.activeOrders = this.state.activeOrders.filter(order => {
      const isDone = order.items.every(item => this.state.stations[item.station].currentLoad < 0.1);
      if (isDone) {
        this.state.totalProfit += order.items.reduce((sum, i) => sum + i.profit, 0);
        return false;
      }
      return true;
    });
    
    this.calculateProfitAtRisk();
  }
}
