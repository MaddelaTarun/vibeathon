import { z } from 'zod';

export const StationTypeSchema = z.enum(['GRILL', 'SAUTE', 'SALAD', 'PREP']);
export type StationType = z.infer<typeof StationTypeSchema>;

export const StationSchema = z.object({
  id: z.string(),
  type: StationTypeSchema,
  capacity: z.number().min(1), // items per cook per hour
  laborCount: z.number().min(0),
  currentLoad: z.number().min(0),
  baseProcessingTime: z.number(), // minutes
});
export type Station = z.infer<typeof StationSchema>;

export const OrderItemSchema = z.object({
  name: z.string(),
  station: StationTypeSchema,
  processingTime: z.number(),
  profit: z.number(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  items: z.array(OrderItemSchema),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED']),
  timestamp: z.number(),
});
export type Order = z.infer<typeof OrderSchema>;

export interface KitchenState {
  stations: Record<StationType, Station>;
  activeOrders: Order[];
  totalProfit: number;
  profitAtRisk: number;
}

export interface Decision {
  reason: string;
  action: string;
  impact: string;
  timestamp: number;
}
