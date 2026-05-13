import { API_BASE_URL } from '../config';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
}

export interface ReviewResponse {
  statusCode: number;
  meta: string;
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Review;
}

export interface ReviewsListResponse {
  statusCode: number;
  meta: string;
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Review[];
  };
}

export const reviewService = {
  async addReview(restaurantId: number, rating: number, comment: string): Promise<ReviewResponse> {
    const response = await fetch(`${API_BASE_URL}/api/Restaurant/add-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        restaurantId,
        rating,
        comment,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add review: ${response.statusText}`);
    }

    return response.json();
  },

  async getReviews(filters?: any): Promise<ReviewsListResponse> {
    const params = new URLSearchParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/api/Restaurant/get-reviews?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }

    return response.json();
  },
};