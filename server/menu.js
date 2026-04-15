/**
 * Menu Manager
 * Grouped menu items by cuisine.
 */

export default class MenuManager {
  constructor() {
    this.menu = [
      { id: 'm1', name: 'Dry-Aged Ribeye', cuisine: 'grill', station: 'Grill', price: 65, cost: 22, time: 18, desc: '45-day dry-aged, sea salt, rosemary.' },
      { id: 'm2', name: 'Wagyu Burger', cuisine: 'grill', station: 'Grill', price: 32, cost: 14, time: 12, desc: 'A5 wagyu, caramelized onion, truffle aioli.' },
      { id: 'm3', name: 'Pan-Seared Scallops', cuisine: 'italian', station: 'Sauté', price: 48, cost: 16, time: 10, desc: 'Hokkaido scallops, lemon butter, pea purée.' },
      { id: 'm4', name: 'Mushroom Risotto', cuisine: 'italian', station: 'Sauté', price: 28, cost: 8, time: 20, desc: 'Wild porcini, parmesan, truffle zest.' },
      { id: 'm5', name: 'Beef Tartare', cuisine: 'french', station: 'Pantry', price: 24, cost: 12, time: 8, desc: 'Hand-cut tenderloin, quail egg, capers.' },
      { id: 'm6', name: 'Burrata & Tomato', cuisine: 'italian', station: 'Pantry', price: 19, cost: 7, time: 6, desc: 'Creamy burrata, heirloom tomatoes, basil.' },
      { id: 'm7', name: 'Crispy Calamari', cuisine: 'italian', station: 'Fryer', price: 21, cost: 6, time: 7, desc: 'Lightly battered, spicy marinara, lemon.' },
      { id: 'm8', name: 'Truffle Fries', cuisine: 'grill', station: 'Fryer', price: 14, cost: 4, time: 5, desc: 'Double fried, truffle oil, parmesan.' },
      { id: 'm9', name: 'Crème Brûlée', cuisine: 'french', station: 'Pastry', price: 15, cost: 3, time: 5, desc: 'Vanilla bean, caramelized sugar crust.' },
      { id: 'm10', name: 'Chocolate Fondant', cuisine: 'french', station: 'Pastry', price: 16, cost: 4, time: 15, desc: 'Lava cake, Madagascar vanilla gelato.' },
      { id: 'm11', name: 'Lobster Bisque', cuisine: 'french', station: 'Sauté', price: 22, cost: 9, time: 12, desc: 'Creamy lobster soup, brandy, chive oil.' },
      { id: 'm12', name: 'Duck Confit', cuisine: 'french', station: 'Grill', price: 42, cost: 18, time: 25, desc: 'Slow-cooked duck leg, cherry gastrique.' },
      { id: 'm13', name: 'Uni Pasta', cuisine: 'japanese', station: 'Sauté', price: 55, cost: 25, time: 15, desc: 'Fresh sea urchin, handmade tagliatelle.' },
      { id: 'm14', name: 'Black Cod Miso', cuisine: 'japanese', station: 'Grill', price: 58, cost: 24, time: 20, desc: 'Marinated in sake and miso, charcoal grilled.' },
      { id: 'm15', name: 'Hamachi Crudo', cuisine: 'japanese', station: 'Pantry', price: 26, cost: 11, time: 8, desc: 'Yellowtail, yuzu kosho, micro cilantro.' },
      { id: 'm16', name: 'Truffle Edamame', cuisine: 'japanese', station: 'Pantry', price: 10, cost: 2, time: 4, desc: 'Steamed soy beans, sea salt, truffle oil.' },
      { id: 'm17', name: 'Osso Buco', cuisine: 'italian', station: 'Grill', price: 45, cost: 19, time: 30, desc: 'Braised veal shank, saffron risotto.' },
      { id: 'm18', name: 'Fettuccine Alfredo', cuisine: 'italian', station: 'Sauté', price: 26, cost: 7, time: 12, desc: 'Fresh fettuccine, parmigiano reggiano.' },
      { id: 'm19', name: 'Rack of Lamb', cuisine: 'french', station: 'Grill', price: 52, cost: 21, time: 22, desc: 'Herb-crusted lamb, port wine reduction.' },
      { id: 'm20', name: 'Salmon Tataki', cuisine: 'japanese', station: 'Pantry', price: 24, cost: 10, time: 6, desc: 'Seared salmon, ponzu, ginger, scallion.' },
      { id: 'm21', name: 'Escargot', cuisine: 'french', station: 'Sauté', price: 18, cost: 7, time: 10, desc: 'Burgundy snails, garlic butter, parsley.' },
      { id: 'm22', name: 'Tempura Prawns', cuisine: 'japanese', station: 'Fryer', price: 24, cost: 8, time: 8, desc: 'Tiger prawns, tentsuyu dipping sauce.' },
      { id: 'm23', name: 'Margherita Pizza', cuisine: 'italian', station: 'Grill', price: 18, cost: 5, time: 10, desc: 'San Marzano, fior di latte, basil.' },
      { id: 'm24', name: 'Matcha Tiramisu', cuisine: 'japanese', station: 'Pastry', price: 14, cost: 4, time: 10, desc: 'Green tea mascarpone, ladyfingers.' }
    ];
  }

  getMenu() {
    return this.menu;
  }

  getMenuGrouped() {
    const grouped = {};
    this.menu.forEach(item => {
      if (!grouped[item.cuisine]) grouped[item.cuisine] = [];
      grouped[item.cuisine].push(item);
    });
    return grouped;
  }

  getItemById(id) {
    return this.menu.find(m => m.id === id);
  }
}
