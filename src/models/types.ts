/**
 * Core data models for Kitchen-Pulse
 */

export type StationType = 'Grill' | 'Sauté' | 'Prep' | 'Dish';

export interface Station {
  id: string;
  name: StationType;
  stress_level: number; // 0-100
  capacity: number;
  current_load: number;
  assigned_staff: string[];
}

export interface OrderItem {
  name: string;
  station: StationType;
  prep_time_minutes: number;
  ingredient_cost: number;
  sale_price: number;
}

export interface Ticket {
  id: string;
  order_number: number;
  items: OrderItem[];
  margin_value: number; // Total profit
  complexity: number; // 1-10
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  delay_minutes: number;
  created_at: number;
  started_at?: number;
  completed_at?: number;
}

export interface Telemetry {
  timestamp: number;
  station_stress: Record<string, number>;
  profit_at_risk: number;
  active_tickets: number;
  labor_utilization: number;
  throughput_per_hour: number;
}

export interface AutonomousAction {
  id: string;
  timestamp: number;
  type: 'labor_reallocation' | 'task_downgrade' | 'margin_flag' | 'auto_86';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  station?: string;
  ticket_id?: string;
  impact: string;
}

export interface LaborReallocation {
  id: string;
  timestamp: number;
  staff_member: string;
  from_station: StationType;
  to_station: StationType;
  duration_minutes: number;
  reason: string;
}

export interface MarginAlert {
  id: string;
  timestamp: number;
  ticket_id: string;
  delay_minutes: number;
  profit_at_risk: number;
  reason: string;
}

export interface SystemMetrics {
  total_tickets: number;
  completed_tickets: number;
  average_delay: number;
  total_profit_at_risk: number;
  autonomous_actions: number;
  labor_reallocations: number;
  auto_86_count: number;
}
