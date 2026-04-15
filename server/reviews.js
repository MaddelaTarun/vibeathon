/**
 * Review Manager
 * Handles customer reviews and updates chef ratings.
 */

export default class ReviewManager {
  constructor(chefManager) {
    this.chefManager = chefManager;
    this.reviews = []; // { orderId, chefId, ratings: { skill, hospitality, speed, overall }, comment, timestamp }
  }

  createReview(orderId, chefId, ratings, comment) {
    // Deduplication check
    if (this.reviews.some(r => r.orderId === orderId)) {
      return null;
    }

    const review = {
      orderId,
      chefId,
      ratings,
      comment,
      timestamp: Date.now()
    };

    this.reviews.push(review);

    // Update chef rating based on overall rating
    if (chefId && ratings.overall) {
      this.chefManager.updateChefRating(chefId, ratings.overall);
    }

    return review;
  }

  getReviewsByChef(chefId) {
    return this.reviews.filter(r => r.chefId === chefId);
  }

  getAverageRatings() {
    // Mock implementation for global stats
    return {
      skill: 4.8,
      hospitality: 4.9,
      speed: 4.5,
      overall: 4.7
    };
  }
}
