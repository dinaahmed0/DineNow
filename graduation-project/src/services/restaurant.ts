import { apiGet, apiPost, apiPatch, apiDelete } from './api/client';
import type { 
  AddRestaurantCommand, 
  UpdateRestaurantCommand, 
  ReturnRestaurantQuery, 
  ReturnRestaurantQueryPagination,
  AddReviewCommand,
  GetReviewQuery,
  GetReviewQueryPagination
} from '../types/restaurant';

const USE_MOCK_MODE = false;

// Restaurant CRUD operations
export async function getAllRestaurants(page = 1, pageSize = 10): Promise<ReturnRestaurantQueryPagination> {
  if (USE_MOCK_MODE) {
    // Mock restaurants data
    const mockRestaurants: ReturnRestaurantQuery[] = [
      {
        id: 1,
        name: "The Gourmet Kitchen",
        description: "Fine dining Italian restaurant with authentic pasta and wood-fired pizzas. Our chefs use only the freshest ingredients imported directly from Italy.",
        cuisine: "Italian",
        address: "123 Culinary Ave, Downtown",
        phone: "(555) 123-4567",
        email: "info@gourmetkitchen.com",
        website: "www.gourmetkitchen.com",
        rating: 4.8,
        reviewCount: 342,
        priceRange: "$$$",
        location: "Downtown",
        hours: "11:00 AM - 10:00 PM",
        features: ["Outdoor Seating", "Wine Bar", "Private Events"],
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
        isActive: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z"
      },
      {
        id: 2,
        name: "Sushi Master",
        description: "Fresh sushi and traditional Japanese dishes. Experience the art of omakase from our master chefs with 20+ years of experience.",
        cuisine: "Japanese",
        address: "456 Sushi Lane, Midtown",
        phone: "(555) 234-5678",
        email: "hello@sushimaster.com",
        website: "www.sushimaster.com",
        rating: 4.9,
        reviewCount: 528,
        priceRange: "$$$",
        location: "Midtown",
        hours: "12:00 PM - 9:30 PM",
        features: ["Omakase", "Sake Bar", "Private Rooms"],
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop",
        isActive: true,
        createdAt: "2024-01-10T14:20:00Z",
        updatedAt: "2024-01-10T14:20:00Z"
      },
      {
        id: 3,
        name: "Café Parisien",
        description: "Authentic French café with freshly baked pastries, artisanal coffee, and a cozy atmosphere perfect for work or relaxation.",
        cuisine: "French",
        address: "789 Rue de Café, Old Town",
        phone: "(555) 345-6789",
        email: "bonjour@cafe-parisien.com",
        website: "www.cafe-parisien.com",
        rating: 4.6,
        reviewCount: 215,
        priceRange: "$$",
        location: "Old Town",
        hours: "7:00 AM - 8:00 PM",
        features: ["Free WiFi", "Pet Friendly", "Outdoor Seating"],
        image: "https://images.unsplash.com/photo-1521016432594-fa92b084ffde?w=600&h=400&fit=crop",
        isActive: true,
        createdAt: "2024-01-08T09:15:00Z",
        updatedAt: "2024-01-08T09:15:00Z"
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      restaurants: mockRestaurants,
      totalCount: mockRestaurants.length,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(mockRestaurants.length / pageSize)
    };
  }

  return apiGet<ReturnRestaurantQueryPagination>(`/api/Restaurant?page=${page}&pageSize=${pageSize}`);
}

export async function getRestaurantById(id: number): Promise<ReturnRestaurantQuery> {
  if (USE_MOCK_MODE) {
    const mockRestaurant: ReturnRestaurantQuery = {
      id: id,
      name: "The Gourmet Kitchen",
      description: "Fine dining Italian restaurant with authentic pasta and wood-fired pizzas. Our chefs use only the freshest ingredients imported directly from Italy. We offer an intimate dining experience with a focus on traditional Italian flavors and modern culinary techniques.",
      cuisine: "Italian",
      address: "123 Culinary Ave, Downtown",
      phone: "(555) 123-4567",
      email: "info@gourmetkitchen.com",
      website: "www.gourmetkitchen.com",
      rating: 4.8,
      reviewCount: 342,
      priceRange: "$$$",
      location: "Downtown",
      hours: "11:00 AM - 10:00 PM",
      features: ["Outdoor Seating", "Wine Bar", "Private Events", "Live Music", "Valet Parking"],
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
      isActive: true,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRestaurant;
  }

  return apiGet<ReturnRestaurantQuery>(`/api/Restaurant/${id}`);
}

export async function addRestaurant(restaurantData: AddRestaurantCommand): Promise<ReturnRestaurantQuery> {
  if (USE_MOCK_MODE) {
    console.log('MOCK MODE: Adding restaurant:', restaurantData);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRestaurant: ReturnRestaurantQuery = {
      id: Math.floor(Math.random() * 1000) + 100,
      ...restaurantData,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return newRestaurant;
  }

  return apiPost<ReturnRestaurantQuery>('/api/Restaurant', restaurantData);
}

export async function updateRestaurant(restaurantData: UpdateRestaurantCommand): Promise<ReturnRestaurantQuery> {
  if (USE_MOCK_MODE) {
    console.log('MOCK MODE: Updating restaurant:', restaurantData);
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedRestaurant: ReturnRestaurantQuery = {
      id: restaurantData.id!,
      name: restaurantData.name || "Updated Restaurant",
      description: restaurantData.description || "Updated description",
      cuisine: restaurantData.cuisine || "Mixed",
      address: restaurantData.address || "Updated address",
      phone: restaurantData.phone || "(555) 000-0000",
      email: restaurantData.email,
      website: restaurantData.website,
      rating: 4.5,
      reviewCount: 100,
      priceRange: restaurantData.priceRange || "$$",
      location: restaurantData.location || "Updated location",
      hours: restaurantData.hours || "9:00 AM - 10:00 PM",
      features: restaurantData.features || [],
      image: restaurantData.image,
      isActive: restaurantData.isActive ?? true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString()
    };

    return updatedRestaurant;
  }

  return apiPatch<ReturnRestaurantQuery>('/api/Restaurant/Update', restaurantData);
}

export async function deleteRestaurant(id: number): Promise<void> {
  if (USE_MOCK_MODE) {
    console.log('MOCK MODE: Deleting restaurant with ID:', id);
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }

  return apiDelete<void>(`/api/Restaurant/${id}`);
}

// Review operations
export async function addReview(reviewData: AddReviewCommand): Promise<GetReviewQuery> {
  if (USE_MOCK_MODE) {
    console.log('MOCK MODE: Adding review:', reviewData);
    await new Promise(resolve => setTimeout(resolve, 800));

    const newReview: GetReviewQuery = {
      id: Math.floor(Math.random() * 1000) + 100,
      restaurantId: reviewData.restaurantId,
      userId: reviewData.userId || 1,
      userName: "Test User",
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString()
    };

    return newReview;
  }

  return apiPost<GetReviewQuery>('/api/Restaurant/add-review', reviewData);
}

export async function getRestaurantReviews(restaurantId: number, page = 1, pageSize = 10): Promise<GetReviewQueryPagination> {
  if (USE_MOCK_MODE) {
    const mockReviews: GetReviewQuery[] = [
      {
        id: 1,
        restaurantId: restaurantId,
        userId: 1,
        userName: "John Doe",
        rating: 5,
        comment: "Amazing food and excellent service! Will definitely come back. The pasta was perfectly cooked and the wine selection was impressive.",
        createdAt: "2024-01-20T18:30:00Z"
      },
      {
        id: 2,
        restaurantId: restaurantId,
        userId: 2,
        userName: "Jane Smith",
        rating: 4,
        comment: "Great atmosphere and delicious pasta. A bit pricey but worth it for special occasions. The tiramisu was exceptional!",
        createdAt: "2024-01-18T19:15:00Z"
      },
      {
        id: 3,
        restaurantId: restaurantId,
        userId: 3,
        userName: "Mike Johnson",
        rating: 5,
        comment: "Best Italian restaurant in town! The wood-fired pizzas are incredible and the service is always attentive.",
        createdAt: "2024-01-15T20:00:00Z"
      },
      {
        id: 4,
        restaurantId: restaurantId,
        userId: 4,
        userName: "Sarah Wilson",
        rating: 4,
        comment: "Lovely evening with great food. The outdoor seating area is beautiful in summer. Would recommend for date nights.",
        createdAt: "2024-01-12T17:45:00Z"
      },
      {
        id: 5,
        restaurantId: restaurantId,
        userId: 5,
        userName: "David Brown",
        rating: 5,
        comment: "Exceptional dining experience! Every dish was perfectly prepared and presented. The sommelier's recommendations were spot on.",
        createdAt: "2024-01-10T19:30:00Z"
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 600));

    const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;

    return {
      reviews: mockReviews,
      totalCount: mockReviews.length,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(mockReviews.length / pageSize),
      averageRating: Math.round(averageRating * 10) / 10
    };
  }

  return apiGet<GetReviewQueryPagination>(`/api/Restaurant/get-reviews?restaurantId=${restaurantId}&page=${page}&pageSize=${pageSize}`);
}
