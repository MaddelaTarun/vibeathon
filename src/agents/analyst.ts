/**
 * Analyst Agent - Monitors telemetry and identifies bottlenecks
 * Inspired by oh-my-claudecode analyst agent
 */

import { Station, Ticket, Telemetry, AutonomousAction } from '../models/types';

export class AnalystAgent {
  private readonly STRESS_THRESHOLD = 80;
  private readonly DELAY_THRESHOLD = 10; // minutes
  private readonly MARGIN_RISK_THRESHOLD = 50; // dollars

  /**
   * Analyze current kitchen state and identify issues
   */
  analyze(
    stations: Station[],
    tickets: Ticket[],
    telemetry: Telemetry
  ): AutonomousAction[] {
    const actions: AutonomousAction[] = [];

    // Check for station bottlenecks
    const bottlenecks = this.identifyBottlenecks(stations);
    actions.push(...bottlenecks);

    // Check for delayed tickets
    const delayedTickets = this.identifyDelayedTickets(tickets);
    actions.push(...delayedTickets);

    // Check for margin leakage
    const marginAlerts = this.identifyMarginLeakage(tickets);
    actions.push(...marginAlerts);

    // Check for overload conditions
    const overloadAlerts = this.identifyOverload(stations, tickets);
    actions.push(...overloadAlerts);

    return actions;
  }

  /**
   * Identify station bottlenecks
   */
  private identifyBottlenecks(stations: Station[]): AutonomousAction[] {
    return stations
      .filter((station) => station.stress_level > this.STRESS_THRESHOLD)
      .map((station) => ({
        id: `bottleneck-${station.id}-${Date.now()}`,
        timestamp: Date.now(),
        type: 'labor_reallocation' as const,
        severity: station.stress_level > 90 ? ('critical' as const) : ('warning' as const),
        description: `${station.name} Station bottleneck detected at ${station.stress_level}% capacity`,
        station: station.id,
        impact: `${Math.floor((station.stress_level - this.STRESS_THRESHOLD) / 10)} tickets at risk`,
      }));
  }

  /**
   * Identify delayed tickets
   */
  private identifyDelayedTickets(tickets: Ticket[]): AutonomousAction[] {
    return tickets
      .filter(
        (ticket) =>
          ticket.status === 'in_progress' && ticket.delay_minutes > this.DELAY_THRESHOLD
      )
      .map((ticket) => ({
        id: `delay-${ticket.id}-${Date.now()}`,
        timestamp: Date.now(),
        type: 'margin_flag' as const,
        severity: ticket.delay_minutes > 15 ? ('critical' as const) : ('warning' as const),
        description: `Ticket #${ticket.order_number} delayed ${ticket.delay_minutes} minutes`,
        ticket_id: ticket.id,
        impact: `$${ticket.margin_value.toFixed(2)} profit at risk`,
      }));
  }

  /**
   * Identify margin leakage
   */
  private identifyMarginLeakage(tickets: Ticket[]): AutonomousAction[] {
    const atRiskTickets = tickets.filter(
      (ticket) =>
        ticket.status !== 'completed' &&
        ticket.status !== 'cancelled' &&
        ticket.margin_value > this.MARGIN_RISK_THRESHOLD
    );

    if (atRiskTickets.length === 0) return [];

    const totalAtRisk = atRiskTickets.reduce((sum, t) => sum + t.margin_value, 0);

    return [
      {
        id: `margin-${Date.now()}`,
        timestamp: Date.now(),
        type: 'margin_flag' as const,
        severity: totalAtRisk > 200 ? ('critical' as const) : ('warning' as const),
        description: `${atRiskTickets.length} high-margin tickets in progress`,
        impact: `$${totalAtRisk.toFixed(2)} total profit at risk`,
      },
    ];
  }

  /**
   * Identify overload conditions
   */
  private identifyOverload(stations: Station[], tickets: Ticket[]): AutonomousAction[] {
    const overloadedStations = stations.filter((s) => s.stress_level > 90);
    const pendingTickets = tickets.filter((t) => t.status === 'pending');

    if (overloadedStations.length > 0 && pendingTickets.length > 5) {
      return [
        {
          id: `overload-${Date.now()}`,
          timestamp: Date.now(),
          type: 'task_downgrade' as const,
          severity: 'critical' as const,
          description: `System overload: ${overloadedStations.length} stations critical, ${pendingTickets.length} tickets pending`,
          impact: 'Recommend pausing low-margin prep tasks',
        },
      ];
    }

    return [];
  }

  /**
   * Calculate profit at risk
   */
  calculateProfitAtRisk(tickets: Ticket[]): number {
    return tickets
      .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
      .reduce((sum, t) => sum + t.margin_value, 0);
  }

  /**
   * Calculate average delay
   */
  calculateAverageDelay(tickets: Ticket[]): number {
    const delayedTickets = tickets.filter((t) => t.delay_minutes > 0);
    if (delayedTickets.length === 0) return 0;

    const totalDelay = delayedTickets.reduce((sum, t) => sum + t.delay_minutes, 0);
    return totalDelay / delayedTickets.length;
  }
}
