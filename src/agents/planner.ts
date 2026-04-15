/**
 * Planner Agent - Decomposes orders into station-level work units
 * Inspired by oh-my-claudecode planner agent
 */

import { OrderItem, Ticket, Station, StationType } from '../models/types';

export class PlannerAgent {
  /**
   * Decompose an order into station-specific work units
   */
  decomposeOrder(orderNumber: number, items: OrderItem[]): Ticket {
    // Calculate total margin
    const margin_value = items.reduce(
      (sum, item) => sum + (item.sale_price - item.ingredient_cost),
      0
    );

    // Calculate complexity (based on number of items and prep time)
    const totalPrepTime = items.reduce((sum, item) => sum + item.prep_time_minutes, 0);
    const complexity = Math.min(10, Math.ceil(items.length + totalPrepTime / 10));

    return {
      id: `ticket-${orderNumber}-${Date.now()}`,
      order_number: orderNumber,
      items,
      margin_value,
      complexity,
      status: 'pending',
      delay_minutes: 0,
      created_at: Date.now(),
    };
  }

  /**
   * Calculate optimal station assignment based on current load
   */
  calculateStationLoad(ticket: Ticket, _stations: Station[]): Map<StationType, number> {
    const loadMap = new Map<StationType, number>();

    ticket.items.forEach((item) => {
      const currentLoad = loadMap.get(item.station) || 0;
      loadMap.set(item.station, currentLoad + item.prep_time_minutes);
    });

    return loadMap;
  }

  /**
   * Identify task dependencies
   */
  identifyDependencies(ticket: Ticket): Array<{ station: StationType; startTime: number }> {
    const timeline: Array<{ station: StationType; startTime: number }> = [];
    let currentTime = 0;

    // Group items by station
    const stationGroups = new Map<StationType, OrderItem[]>();
    ticket.items.forEach((item) => {
      const items = stationGroups.get(item.station) || [];
      items.push(item);
      stationGroups.set(item.station, items);
    });

    // Calculate start times (sequential for now, could be optimized for parallel)
    stationGroups.forEach((items, station) => {
      timeline.push({ station, startTime: currentTime });
      const totalTime = items.reduce((sum, item) => sum + item.prep_time_minutes, 0);
      currentTime += totalTime;
    });

    return timeline;
  }

  /**
   * Prioritize tickets based on margin and complexity
   */
  prioritizeTickets(tickets: Ticket[]): Ticket[] {
    return [...tickets].sort((a, b) => {
      // High margin, low complexity = highest priority
      const scoreA = a.margin_value / Math.max(1, a.complexity);
      const scoreB = b.margin_value / Math.max(1, b.complexity);
      return scoreB - scoreA;
    });
  }

  /**
   * Estimate completion time for a ticket
   */
  estimateCompletionTime(ticket: Ticket, stations: Station[]): number {
    const loadMap = this.calculateStationLoad(ticket, stations);
    let maxTime = 0;

    loadMap.forEach((load, stationType) => {
      const station = stations.find((s) => s.name === stationType);
      if (station) {
        // Factor in current station stress
        const stressFactor = 1 + station.stress_level / 100;
        const estimatedTime = load * stressFactor;
        maxTime = Math.max(maxTime, estimatedTime);
      }
    });

    return maxTime;
  }
}
