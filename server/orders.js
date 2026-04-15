/**
 * Order Manager
 * Handles order creation, chef assignment, and synchronization with the ExpeditorEngine.
 */

export default class OrderManager {
  constructor(expeditor, chefManager) {
    this.expeditor = expeditor;
    this.chefManager = chefManager;
    this.orders = []; // id -> { tableCode, items, chefId, status, eta, ticketId }
    this.orderCounter = 1001;
  }

  createOrder(tableCode, items, chefId = null) {
    const orderId = `ORD-${this.orderCounter++}`;
    
    // Auto-select chef if none provided
    if (!chefId && items.length > 0) {
      const cuisine = items[0].cuisine;
      chefId = this.chefManager.autoSelectChef(cuisine);
    }

    if (chefId) {
      this.chefManager.assignOrder(chefId);
    }

    // Map items to what the expeditor expects
    const ticketItems = items.map(item => ({
      name: item.name,
      station: item.station,
      prep_time_minutes: item.time,
      ingredient_cost: item.cost,
      sale_price: item.price
    }));

    // Create ticket in expeditor engine
    const ticket = this.expeditor.addRealOrder(ticketItems, orderId);

    const order = {
      id: orderId,
      tableCode,
      items,
      chefId,
      status: 'placed',
      eta: items.reduce((max, item) => Math.max(max, item.time), 0),
      ticketId: ticket.id,
      timestamp: Date.now()
    };

    this.orders.push(order);
    return order;
  }

  getOrdersByTableCode(tableCode) {
    return this.orders.filter(o => o.tableCode === tableCode);
  }

  getAllOrders() {
    return this.orders.sort((a, b) => b.timestamp - a.timestamp);
  }

  syncWithExpeditor() {
    const expTickets = this.expeditor.getTickets();
    
    this.orders.forEach(order => {
      const ticket = expTickets.find(t => t.id === order.ticketId);
      if (ticket) {
        // Sync status
        if (ticket.status === 'in_progress' && order.status === 'placed') {
          order.status = 'preparing';
        } else if (ticket.status === 'completed' && (order.status === 'preparing' || order.status === 'placed')) {
          order.status = 'ready';
          if (order.chefId) this.chefManager.completeOrder(order.chefId);
        } else if (ticket.status === 'cancelled') {
          order.status = 'cancelled';
          if (order.chefId) this.chefManager.completeOrder(order.chefId);
        }
        
        // Dynamic ETA update based on expeditor's delay tracking
        if (order.status === 'preparing') {
           // Basic ETA countdown logic would go here
        }
      }
    });
    
    // Broadcast order updates to all connected clients
    return this.orders;
  }

  serveOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'ready') {
      order.status = 'served';
      return true;
    }
    return false;
  }
}
