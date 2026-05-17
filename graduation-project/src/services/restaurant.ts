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
// NOTE: reviews are implemented in `services/reviewService.ts`.
// This file keeps compatibility exports for components that still import from `services/restaurant`.
import { reviewService } from './reviewService';

export async function addReview(reviewData: AddReviewCommand): Promise<any> {
  return reviewService.addReview(reviewData.restaurantId, reviewData.rating, reviewData.comment);
}

export async function getRestaurantReviews(
  restaurantId: number,
  page = 1,
  pageSize = 10
): Promise<any> {
  // Backend reviews endpoint does not include restaurantId filtering in the provided schema,
  // so we ignore restaurantId for now and rely on backend behavior.
  return reviewService.getReviews({ pageIndex: page - 1, pageSize });
}


