/**
 * Expeditor Engine - The Autonomous Decision Engine
 * Implements the agentic approach from oh-my-claudecode
 * Upgraded to: Realistic Professional Kitchen Logic with Skill-Based Reallocation
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
    
    // Skill Matrix configuration
    this.skillRequirements = {
      'grill': 'culinary_advanced',
      'saute': 'culinary_advanced',
      'pantry': 'culinary_basic',
      'pastry': 'pastry_specialist',
      'fryer': 'culinary_basic',
      'pass': 'expeditor',
      'dish': 'general'
    };
  }

  initializeStations() {
    return [
      {
        id: 'grill',
        name: 'Grill',
        stress_level: 45,
        capacity: 100,
        current_load: 45,
        assigned_staff: [
          { name: 'Chef Marco', skills: ['culinary_advanced', 'culinary_basic', 'expeditor'] },
          { name: 'Cook Andre', skills: ['culinary_advanced', 'culinary_basic'] }
        ],
      },
      {
        id: 'saute',
        name: 'Sauté',
        stress_level: 60,
        capacity: 100,
        current_load: 60,
        assigned_staff: [
          { name: 'Chef Elena', skills: ['culinary_advanced', 'culinary_basic'] },
          { name: 'Cook Sarah', skills: ['culinary_advanced', 'culinary_basic'] }
        ],
      },
      {
        id: 'pantry',
        name: 'Pantry',
        stress_level: 30,
        capacity: 100,
        current_load: 30,
        assigned_staff: [
          { name: 'Prep Leo', skills: ['culinary_basic', 'general'] },
          { name: 'Prep Mia', skills: ['culinary_basic', 'general'] }
        ],
      },
      {
        id: 'fryer',
        name: 'Fryer',
        stress_level: 25,
        capacity: 100,
        current_load: 25,
        assigned_staff: [
          { name: 'Junior Sam', skills: ['culinary_basic', 'general'] }
        ],
      },
      {
        id: 'pastry',
        name: 'Pastry',
        stress_level: 20,
        capacity: 80,
        current_load: 16,
        assigned_staff: [
          { name: 'Pâtissier Luc', skills: ['pastry_specialist', 'culinary_basic'] }
        ],
      },
      {
        id: 'pass',
        name: 'Pass',
        stress_level: 10,
        capacity: 200,
        current_load: 20,
        assigned_staff: [
          { name: 'Maitre D’ David', skills: ['expeditor', 'general'] }
        ],
      },
      {
        id: 'dish',
        name: 'Dish',
        stress_level: 50,
        capacity: 150,
        current_load: 75,
        assigned_staff: [
          { name: 'Porter John', skills: ['general'] }
        ],
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
          severity: station.stress_level > 92 ? 'critical' : 'warning',
          description: `${station.name} Station bottleneck at ${station.stress_level.toFixed(0)}%`,
          station: station.id,
          impact: `High stress detected. Checking for qualified cross-trained staff.`,
        });

        // Execute skill-based labor reallocation
        this.reallocateLabor(station);
      }
    });

    // Check for delayed tickets
    this.tickets.forEach((ticket) => {
      if (ticket.status === 'in_progress' && ticket.delay_minutes > 12) {
        actions.push({
          id: `delay-${ticket.id}-${Date.now()}`,
          timestamp: Date.now(),
          type: 'margin_flag',
          severity: ticket.delay_minutes > 18 ? 'critical' : 'warning',
          description: `Ticket #${ticket.order_number} delayed ${ticket.delay_minutes} minutes`,
          ticket_id: ticket.id,
          impact: `$${ticket.margin_value.toFixed(2)} margin at risk. Expediting requested.`,
        });
      }
    });

    // Check for total system overload
    const criticalStations = this.stations.filter((s) => s.stress_level > 90);
    const pendingTickets = this.tickets.filter((t) => t.status === 'pending');

    if (criticalStations.length >= 2 && pendingTickets.length > 8) {
      actions.push({
        id: `overload-${Date.now()}`,
        timestamp: Date.now(),
        type: 'task_downgrade',
        severity: 'critical',
        description: `Critical overload across ${criticalStations.length} stations`,
        impact: 'Implementing autonomous Auto-86 for low-margin orders.',
      });

      this.downgradeTasks();
    }

    this.metrics.autonomous_actions += actions.length;
    return actions;
  }

  /**
   * Architect Agent - Skill-based Labor reallocation
   */
  reallocateLabor(criticalStation) {
    const requiredSkill = this.skillRequirements[criticalStation.id];

    // Find a qualified staff member at an underutilized station (< 60% stress)
    const donorStation = this.stations.find((s) => {
      if (s.id === criticalStation.id || s.stress_level > 60 || s.assigned_staff.length <= 1) return false;
      return s.assigned_staff.some(staff => staff.skills.includes(requiredSkill));
    });

    if (donorStation) {
      const staffIndex = donorStation.assigned_staff.findIndex(staff => staff.skills.includes(requiredSkill));
      const staffMember = donorStation.assigned_staff.splice(staffIndex, 1)[0];
      criticalStation.assigned_staff.push(staffMember);

      // Systemic impact of reallocation
      criticalStation.stress_level = Math.max(0, criticalStation.stress_level - 20);
      donorStation.stress_level = Math.min(100, donorStation.stress_level + 10);

      this.metrics.labor_reallocations++;

      console.log(
        `🔄 Labor Reallocation: ${staffMember.name} (qualified for ${criticalStation.name}) moved from ${donorStation.name} to mitigate bottleneck.`
      );
    }
  }

  /**
   * Downgrade low-margin tasks
   */
  downgradeTasks() {
    const lowMarginTickets = this.tickets
      .filter((t) => t.status === 'pending' && t.margin_value < 12)
      .sort((a, b) => a.margin_value - b.margin_value);

    if (lowMarginTickets.length > 0) {
      const ticket = lowMarginTickets[0];
      ticket.status = 'cancelled';
      this.metrics.auto_86_count++;
      console.log(`🚫 Auto-86 (Margin Protection): Cancelled Order #${ticket.order_number} (Margin: $${ticket.margin_value.toFixed(2)}) due to station saturation.`);
    }
  }

  /**
   * Apply autonomous action
   */
  applyAction(action) {
    this.actions.push(action);
    if (this.actions.length > 50) this.actions.shift(); // Keep log manageable
  }

  /**
   * Update tickets (simulate progress)
   */
  updateTickets() {
    this.tickets.forEach((ticket) => {
      if (ticket.status === 'pending') {
        const canStart = this.stations.every((station) => {
          const stationItems = ticket.items.filter((item) => item.station === station.name);
          return stationItems.length === 0 || station.stress_level < 98;
        });

        if (canStart) {
          ticket.status = 'in_progress';
          ticket.started_at = Date.now();

          ticket.items.forEach((item) => {
            const station = this.stations.find((s) => s.name === item.station);
            if (station) {
              station.current_load += item.prep_time_minutes;
              station.stress_level = Math.min(100, (station.current_load / station.capacity) * 100);
            }
          });
        }
      } else if (ticket.status === 'in_progress') {
        const elapsedMinutes = (Date.now() - ticket.started_at) / 60000;
        ticket.delay_minutes = Math.floor(elapsedMinutes);

        const totalPrepMinutes = ticket.items.reduce((sum, item) => sum + item.prep_time_minutes, 0);
        const requiredSimulationSeconds = totalPrepMinutes * 2.5; // Slightly faster simulation
        const elapsedSimulationSeconds = (Date.now() - ticket.started_at) / 1000;

        if (elapsedSimulationSeconds >= requiredSimulationSeconds) {
          ticket.status = 'completed';
          ticket.completed_at = Date.now();
          this.metrics.completed_tickets++;

          ticket.items.forEach((item) => {
            const station = this.stations.find((s) => s.name === item.station);
            if (station) {
              station.current_load = Math.max(0, station.current_load - item.prep_time_minutes);
              station.stress_level = Math.min(100, (station.current_load / station.capacity) * 100);
            }
          });
        }
      }
    });

    this.updateMetrics();
  }

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
   * Add a random ticket (Professional Menu)
   */
  addRandomTicket() {
    const menuItems = [
      { name: 'Dry-Aged Ribeye', station: 'Grill', prep_time_minutes: 18, ingredient_cost: 22, sale_price: 65 },
      { name: 'Wagyu Burger', station: 'Grill', prep_time_minutes: 12, ingredient_cost: 14, sale_price: 32 },
      { name: 'Pan-Seared Scallops', station: 'Sauté', prep_time_minutes: 10, ingredient_cost: 16, sale_price: 48 },
      { name: 'Wild Mushroom Risotto', station: 'Sauté', prep_time_minutes: 20, ingredient_cost: 8, sale_price: 28 },
      { name: 'Beef Tartare', station: 'Pantry', prep_time_minutes: 8, ingredient_cost: 12, sale_price: 24 },
      { name: 'Burrata & Heirloom Tomato', station: 'Pantry', prep_time_minutes: 6, ingredient_cost: 7, sale_price: 19 },
      { name: 'Crispy Calamari', station: 'Fryer', prep_time_minutes: 7, ingredient_cost: 6, sale_price: 21 },
      { name: 'Truffle Fries', station: 'Fryer', prep_time_minutes: 5, ingredient_cost: 4, sale_price: 14 },
      { name: 'Crème Brûlée', station: 'Pastry', prep_time_minutes: 5, ingredient_cost: 3, sale_price: 15 },
      { name: 'Chocolate Fondant', station: 'Pastry', prep_time_minutes: 15, ingredient_cost: 4, sale_price: 16 },
    ];

    const itemCount = Math.floor(Math.random() * 4) + 1;
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      items.push(menuItems[Math.floor(Math.random() * menuItems.length)]);
    }

    const margin_value = items.reduce((sum, item) => sum + (item.sale_price - item.ingredient_cost), 0);
    const complexity = Math.min(10, Math.ceil(items.length * 1.5 + items.reduce((sum, item) => sum + item.prep_time_minutes, 0) / 12));

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
