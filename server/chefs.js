/**
 * Chef Manager
 * Handles chef data, cuisine categories, and automated assignment.
 */

export default class ChefManager {
  constructor() {
    this.cuisineLabels = {
      'italian': 'Cucina Italiana',
      'french': 'Haute Cuisine',
      'japanese': 'Nippon Gastronomy',
      'grill': 'Steakhouse & Grill'
    };

    this.chefs = [
      { id: 'c1', name: 'Chef Marco', cuisine: 'italian', rating: 4.9, activeOrders: 0, maxLoad: 3, bio: 'Pasta specialist from Tuscany.' },
      { id: 'c2', name: 'Chef Elena', cuisine: 'italian', rating: 4.7, activeOrders: 0, maxLoad: 4, bio: 'Risotto and seafood expert.' },
      { id: 'c3', name: 'Chef Luc', cuisine: 'french', rating: 5.0, activeOrders: 0, maxLoad: 2, bio: 'Saucier and pastry master.' },
      { id: 'c4', name: 'Chef Sarah', cuisine: 'french', rating: 4.8, activeOrders: 0, maxLoad: 3, bio: 'Modern French technique expert.' },
      { id: 'c5', name: 'Chef Hiro', cuisine: 'japanese', rating: 4.9, activeOrders: 0, maxLoad: 5, bio: 'Sushi and Sashimi sensei.' },
      { id: 'c6', name: 'Chef Yumi', cuisine: 'japanese', rating: 4.6, activeOrders: 0, maxLoad: 4, bio: 'Tempura and Ramen specialist.' },
      { id: 'c7', name: 'Chef Andre', cuisine: 'grill', rating: 4.7, activeOrders: 0, maxLoad: 3, bio: 'Dry-aged meat specialist.' },
      { id: 'c8', name: 'Chef Mia', cuisine: 'grill', rating: 4.5, activeOrders: 0, maxLoad: 4, bio: 'Barbecue and char-grill expert.' },
      { id: 'c9', name: 'Chef Leo', cuisine: 'italian', rating: 4.4, activeOrders: 0, maxLoad: 5, bio: 'Junior Italian chef.' },
      { id: 'c10', name: 'Chef John', cuisine: 'grill', rating: 4.3, activeOrders: 0, maxLoad: 5, bio: 'Line cook veteran.' }
    ];
  }

  getChefs() {
    return this.chefs;
  }

  getChefsGrouped() {
    const grouped = {};
    Object.keys(this.cuisineLabels).forEach(c => {
      grouped[c] = this.chefs.filter(chef => chef.cuisine === c).sort((a, b) => b.rating - a.rating);
    });
    return grouped;
  }

  getCuisineLabels() {
    return this.cuisineLabels;
  }

  getChefById(id) {
    return this.chefs.find(c => c.id === id);
  }

  updateChefRating(chefId, newRating) {
    const chef = this.getChefById(chefId);
    if (chef) {
      // Simple rolling average mock
      chef.rating = Number(((chef.rating * 0.9) + (newRating * 0.1)).toFixed(1));
    }
  }

  assignOrder(chefId) {
    const chef = this.getChefById(chefId);
    if (chef) chef.activeOrders++;
  }

  completeOrder(chefId) {
    const chef = this.getChefById(chefId);
    if (chef && chef.activeOrders > 0) chef.activeOrders--;
  }

  autoSelectChef(cuisine) {
    const available = this.chefs
      .filter(c => c.cuisine === cuisine && c.activeOrders < c.maxLoad)
      .sort((a, b) => b.rating - a.rating);
    
    return available.length > 0 ? available[0].id : null;
  }
}
