/**
 * Telemetry Simulator - Generates realistic kitchen chaos data
 */

export class TelemetrySimulator {
  constructor() {
    this.lastUpdate = Date.now();
  }

  /**
   * Generate telemetry data
   */
  generateTelemetry(stations, tickets) {
    const now = Date.now();
    const elapsed = (now - this.lastUpdate) / 1000; // seconds
    this.lastUpdate = now;

    // Calculate station stress
    const station_stress = {};
    stations.forEach((station) => {
      // Add subtle random fluctuation
      const fluctuation = (Math.random() - 0.5) * 3;
      station.stress_level = Math.max(
        0,
        Math.min(100, station.stress_level + fluctuation)
      );
      station_stress[station.id] = station.stress_level;
    });

    // Calculate profit at risk
    const profit_at_risk = tickets
      .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
      .reduce((sum, t) => sum + t.margin_value, 0);

    // Calculate active tickets
    const active_tickets = tickets.filter(
      (t) => t.status === 'in_progress' || t.status === 'pending'
    ).length;

    // Calculate labor utilization
    const totalStaff = stations.reduce((sum, s) => sum + s.assigned_staff.length, 0);
    const busyStations = stations.filter((s) => s.stress_level > 50).length;
    const labor_utilization = (busyStations / stations.length) * 100;

    // Calculate throughput
    const completedInLastHour = tickets.filter((t) => {
      return (
        t.status === 'completed' &&
        t.completed_at &&
        now - t.completed_at < 3600000
      );
    }).length;
    const throughput_per_hour = completedInLastHour;

    return {
      timestamp: now,
      station_stress,
      profit_at_risk,
      active_tickets,
      labor_utilization,
      throughput_per_hour,
    };
  }

  /**
   * Simulate a stress spike
   */
  simulateStressSpike(stations, stationId) {
    const station = stations.find((s) => s.id === stationId);
    if (station) {
      station.stress_level = Math.min(100, station.stress_level + 30);
      console.log(`⚠️  Stress spike: ${station.name} now at ${station.stress_level}%`);
    }
  }

  /**
   * Simulate ingredient cost spike
   */
  simulateIngredientSpike() {
    const items = ['Steak', 'Salmon', 'Pasta'];
    const item = items[Math.floor(Math.random() * items.length)];
    const spike = Math.random() * 5 + 2; // $2-7 increase

    console.log(`💰 Ingredient spike: ${item} cost increased by $${spike.toFixed(2)}`);

    return { item, spike };
  }
}
