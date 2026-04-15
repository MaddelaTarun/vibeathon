/**
 * Architect Agent - Makes strategic labor reallocation decisions
 * Inspired by oh-my-claudecode architect agent
 */

import { Station, Ticket, LaborReallocation, StationType } from '../models/types';

export class ArchitectAgent {
  private readonly CRITICAL_THRESHOLD = 85;
  private readonly REALLOCATION_DURATION = 15; // minutes

  /**
   * Analyze and recommend labor reallocations
   */
  recommendReallocations(
    stations: Station[],
    _tickets: Ticket[]
  ): LaborReallocation[] {
    const reallocations: LaborReallocation[] = [];

    // Find critical stations
    const criticalStations = stations.filter(
      (s) => s.stress_level > this.CRITICAL_THRESHOLD
    );

    // Find underutilized stations
    const underutilizedStations = stations.filter(
      (s) => s.stress_level < 50 && s.assigned_staff.length > 0
    );

    // Create reallocation recommendations
    criticalStations.forEach((critical) => {
      underutilizedStations.forEach((underutilized) => {
        if (underutilized.assigned_staff.length > 0) {
          const staffMember = underutilized.assigned_staff[0];

          reallocations.push({
            id: `realloc-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            staff_member: staffMember.name,
            from_station: underutilized.name,
            to_station: critical.name,
            duration_minutes: this.REALLOCATION_DURATION,
            reason: `${critical.name} at ${critical.stress_level}% capacity, ${underutilized.name} at ${underutilized.stress_level}%`,
          });
        }
      });
    });

    return reallocations;
  }

  /**
   * Identify tasks that can be downgraded or paused
   */
  identifyDowngradableTasks(tickets: Ticket[], criticalStation: StationType): Ticket[] {
    return tickets
      .filter((ticket) => {
        // Find tickets with items for the critical station
        const hasStationItems = ticket.items.some((item) => item.station === criticalStation);
        // Low margin tickets are candidates for downgrade
        return hasStationItems && ticket.margin_value < 20;
      })
      .sort((a, b) => a.margin_value - b.margin_value); // Lowest margin first
  }

  /**
   * Calculate optimal staff distribution
   */
  calculateOptimalDistribution(stations: Station[]): Map<StationType, number> {
    const totalStaff = stations.reduce((sum, s) => sum + s.assigned_staff.length, 0);
    const totalStress = stations.reduce((sum, s) => sum + s.stress_level, 0);

    const distribution = new Map<StationType, number>();

    stations.forEach((station) => {
      // Allocate staff proportional to stress level
      const proportion = station.stress_level / totalStress;
      const optimalStaff = Math.ceil(proportion * totalStaff);
      distribution.set(station.name, optimalStaff);
    });

    return distribution;
  }

  /**
   * Assess reallocation impact
   */
  assessReallocationImpact(
    reallocation: LaborReallocation,
    stations: Station[]
  ): {
    fromStationImpact: number;
    toStationImpact: number;
    netBenefit: number;
  } {
    const fromStation = stations.find((s) => s.name === reallocation.from_station);
    const toStation = stations.find((s) => s.name === reallocation.to_station);

    if (!fromStation || !toStation) {
      return { fromStationImpact: 0, toStationImpact: 0, netBenefit: 0 };
    }

    // Losing staff increases stress
    const fromStationImpact = (fromStation.stress_level * 0.1) / fromStation.assigned_staff.length;

    // Gaining staff decreases stress
    const toStationImpact =
      -(toStation.stress_level * 0.15) / (toStation.assigned_staff.length + 1);

    const netBenefit = toStationImpact + fromStationImpact;

    return { fromStationImpact, toStationImpact, netBenefit };
  }

  /**
   * Determine if auto-86 is needed
   */
  shouldAuto86(ticket: Ticket, currentIngredientCosts: Map<string, number>): boolean {
    // Check if labor cost (due to delays) exceeds sale price
    const laborCostPerMinute = 0.5; // $0.50 per minute
    const laborCost = ticket.delay_minutes * laborCostPerMinute;

    const totalSalePrice = ticket.items.reduce((sum, item) => sum + item.sale_price, 0);

    // Check if ingredient costs have spiked
    const currentIngredientCost = ticket.items.reduce((sum, item) => {
      const currentCost = currentIngredientCosts.get(item.name) || item.ingredient_cost;
      return sum + currentCost;
    }, 0);

    const totalCost = laborCost + currentIngredientCost;

    // Auto-86 if cost exceeds price
    return totalCost > totalSalePrice;
  }
}
