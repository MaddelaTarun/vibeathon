/**
 * Expeditor Engine - The Autonomous Decision Engine
 * Implements the agentic approach from oh-my-claudecode
 */

export class ExpeditorEngine {
  constructor() {
    this.stations = this.initializeStations();
    this.tickets = [];
    this.actions = [];
    this.metrics = {
      total_tickets: 0,
      completed_tickets: 0,
      average_delay: 0,
      total_profit_at_risk: 0,
      autonomous_actions: 0,
      labor_reallocations: 0,
      auto_86_count: 0,
    };
    this.orderCounter = 1;
  }

  initializeStations() {
    return [
      {
        id: 'grill',
        name: 'Grill',
        stress_level: 45,
        capacity: 100,
        current_load: 45,
        assigned_staff: ['Cook-G1', 'Cook-G2'],
      },
      {
        id: 'saute',
        name: 'Sauté',
        stress_level: 60,
        capacity: 100,
        current_load: 60,
        assigned_staff: ['Cook-S1', 'Cook-S2'],
      },
      {
        id: 'prep',
        name: 'Prep',
        stress_level: 30,
        capacity: 100,
        current_load: 30,
        assigned_staff: ['Prep-1', 'Prep-2', 'Prep-3'],
      },
      {
        id: 'dish',
        name: 'Dish',
        stress_level: 50,
        capacity: 100,
        current_load: 50,
        assigned_staff: ['Dish-1'],
      },
    ];
  }

  getStations() {
    return this.stations;
  }

  getTickets() {
    return this.tickets;
  }

  getMetrics() {
    return this.metrics;
  }

  /**
   * Analyst Agent - Analyze current state
   */
  analyze() {
    const actions = [];

    // Check for station bottlenecks
    this.stations.forEach((station) => {
      if (station.stress_level > 85) {
        actions.push({
          id: `bottleneck-${station.id}-${Date.now()}`,
          timestamp: Date.now(),
          type: 'labor_reallocation',
          severity: station.stress_level > 90 ? 'critical' : 'warning',
          description: `${station.name} Station bottleneck at ${station.stress_level}%`,
          station: station.id,
          impact: `Recommend labor reallocation`,
        });

        // Execute labor reallocation
        this.reallocateLabor(station);
      }
    });

    // Check for delayed tickets
    this.tickets.forEach((ticket) => {
      if (ticket.status === 'in_progress' && ticket.delay_minutes > 10) {
        actions.push({
          id: `delay-${ticket.id}-${Date.now()}`,
          timestamp: Date.now(),
          type: 'margin_flag',
          severity: ticket.delay_minutes > 15 ? 'critical' : 'warning',
          description: `Ticket #${ticket.order_number} delayed ${ticket.delay_minutes} minutes`,
          ticket_id: ticket.id,
          impact: `$${ticket.margin_value.toFixed(2)} profit at risk`,
        });
      }
    });

    // Check for overload
    const overloadedStations = this.stations.filter((s) => s.stress_level > 90);
    const pendingTickets = this.tickets.filter((t) => t.status === 'pending');

    if (overloadedStations.length > 0 && pendingTickets.length > 5) {
      actions.push({
        id: `overload-${Date.now()}`,
        timestamp: Date.now(),
        type: 'task_downgrade',
        severity: 'critical',
        description: `System overload: ${overloadedStations.length} stations critical`,
        impact: 'Downgrading low-margin tasks',
      });

      // Downgrade low-margin tasks
      this.downgradeTasks();
    }

    this.metrics.autonomous_actions += actions.length;
    return actions;
  }

  /**
   * Architect Agent - Labor reallocation
   */
  reallocateLabor(criticalStation) {
    // Find underutilized station
    const underutilized = this.stations.find(
      (s) => s.stress_level < 50 && s.assigned_staff.length > 1 && s.id !== criticalStation.id
    );

    if (underutilized) {
      const staffMember = underutilized.assigned_staff.pop();
      criticalStation.assigned_staff.push(staffMember);

      // Adjust stress levels
      criticalStation.stress_level = Math.max(0, criticalStation.stress_level - 15);
      underutilized.stress_level = Math.min(100, underutilized.stress_level + 5);

      this.metrics.labor_reallocations++;

      console.log(
        `🔄 Labor reallocation: ${staffMember} from ${underutilized.name} to ${criticalStation.name}`
      );
    }
  }

  /**
   * Downgrade low-margin tasks
   */
  downgradeTasks() {
    const lowMarginTickets = this.tickets
      .filter((t) => t.status === 'pending' && t.margin_value < 15)
      .sort((a, b) => a.margin_value - b.margin_value);

    if (lowMarginTickets.length > 0) {
      const ticket = lowMarginTickets[0];
      ticket.status = 'cancelled';
      this.metrics.auto_86_count++;
      console.log(`🚫 Auto-86: Ticket #${ticket.order_number} (low margin: $${ticket.margin_value})`);
    }
  }

  /**
   * Apply autonomous action
   */
  applyAction(action) {
    // Actions are already applied in analyze()
    // This is for logging and tracking
    this.actions.push(action);
  }

  /**
   * Update tickets (simulate progress)
   */
  updateTickets() {
    this.tickets.forEach((ticket) => {
      if (ticket.status === 'pending') {
        // Start ticket if capacity available
        const canStart = this.stations.every((station) => {
          const stationItems = ticket.items.filter((item) => item.station === station.name);
          return stationItems.length === 0 || station.stress_level < 95;
        });

        if (canStart) {
          ticket.status = 'in_progress';
          ticket.started_at = Date.now();

          // Update station loads
          ticket.items.forEach((item) => {
            const station = this.stations.find((s) => s.name === item.station);
            if (station) {
              station.current_load += item.prep_time_minutes;
              station.stress_level = Math.min(
                100,
                (station.current_load / station.capacity) * 100
              );
            }
          });
        }
      } else if (ticket.status === 'in_progress') {
        // Update delay
        const elapsedMinutes = (Date.now() - ticket.started_at) / 60000; // actual minutes
        ticket.delay_minutes = Math.floor(elapsedMinutes);

        // Calculate total prep time in seconds for the simulation
        // Scale: 1 minute of real prep = 3 seconds of simulation time
        const totalPrepMinutes = ticket.items.reduce((sum, item) => sum + item.prep_time_minutes, 0);
        const requiredSimulationSeconds = totalPrepMinutes * 3;
        const elapsedSimulationSeconds = (Date.now() - ticket.started_at) / 1000;

        // Complete ticket if enough simulation time has passed
        if (elapsedSimulationSeconds >= requiredSimulationSeconds) {
          ticket.status = 'completed';
          ticket.completed_at = Date.now();
          this.metrics.completed_tickets++;

          // Release station capacity
          ticket.items.forEach((item) => {
            const station = this.stations.find((s) => s.name === item.station);
            if (station) {
              station.current_load = Math.max(0, station.current_load - item.prep_time_minutes);
              station.stress_level = Math.min(
                100,
                (station.current_load / station.capacity) * 100
              );
            }
          });
        }
      }
    });

    // Update metrics
    this.updateMetrics();
  }

  /**
   * Update system metrics
   */
  updateMetrics() {
    const activeTickets = this.tickets.filter(
      (t) => t.status !== 'completed' && t.status !== 'cancelled'
    );

    this.metrics.total_profit_at_risk = activeTickets.reduce(
      (sum, t) => sum + t.margin_value,
      0
    );

    const delayedTickets = this.tickets.filter((t) => t.delay_minutes > 0);
    this.metrics.average_delay =
      delayedTickets.length > 0
        ? delayedTickets.reduce((sum, t) => sum + t.delay_minutes, 0) / delayedTickets.length
        : 0;
  }

  /**
   * Add a random ticket (for simulation)
   */
  addRandomTicket() {
    const menuItems = [
      { name: 'Steak', station: 'Grill', prep_time_minutes: 12, ingredient_cost: 15, sale_price: 45 },
      { name: 'Salmon', station: 'Grill', prep_time_minutes: 10, ingredient_cost: 12, sale_price: 38 },
      { name: 'Pasta', station: 'Sauté', prep_time_minutes: 8, ingredient_cost: 5, sale_price: 22 },
      { name: 'Risotto', station: 'Sauté', prep_time_minutes: 15, ingredient_cost: 6, sale_price: 26 },
      { name: 'Salad', station: 'Prep', prep_time_minutes: 3, ingredient_cost: 3, sale_price: 12 },
      { name: 'Soup', station: 'Prep', prep_time_minutes: 5, ingredient_cost: 2, sale_price: 10 },
    ];

    // Random 1-3 items
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      items.push(menuItems[Math.floor(Math.random() * menuItems.length)]);
    }

    const margin_value = items.reduce((sum, item) => sum + (item.sale_price - item.ingredient_cost), 0);
    const complexity = Math.min(10, Math.ceil(items.length + items.reduce((sum, item) => sum + item.prep_time_minutes, 0) / 10));

    const ticket = {
      id: `ticket-${this.orderCounter}-${Date.now()}`,
      order_number: this.orderCounter++,
      items,
      margin_value,
      complexity,
      status: 'pending',
      delay_minutes: 0,
      created_at: Date.now(),
    };

    this.tickets.push(ticket);
    this.metrics.total_tickets++;

    return ticket;
  }
}
