import { apiGet, apiPost } from './api/client';

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
    return apiPost<ReviewResponse>('/api/Restaurant/add-review', {
      restaurantId,
      rating,
      comment,
    });
  },

  async getReviews(filters?: { pageIndex?: number; pageSize?: number }): Promise<ReviewsListResponse> {
    const params = new URLSearchParams();
    if (filters?.pageIndex !== undefined) params.set('pageIndex', String(filters.pageIndex));
    if (filters?.pageSize !== undefined) params.set('pageSize', String(filters.pageSize));

    const qs = params.toString();
    const path = `/api/Restaurant/get-reviews${qs ? `?${qs}` : ''}`;
    return apiGet<ReviewsListResponse>(path);
  },
};


