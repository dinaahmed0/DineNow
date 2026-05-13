import type { ApiResponse } from './common';

export interface CreateReservationCommand {
  restaurantId: number;
  startDateTime: string;
  endDateTime: string;
  numberOfGuests: number;
  notes: string;
}

export interface ReservationUserItem {
  id: number;
  userName: string;
  restaurantName: string;
  tableNumber: number;
  startDateTime: string;
  endDateTime: string;
  numberOfGuests: number;
  bookNumber: number;
  status: string;
  notes: string;
  createdAt: string;
}

export interface PaginationData<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface UserReservationsFilters {
  status?: number[];
  restaurantId?: number;
  date?: string;
  from?: string;
  to?: string;
  pageIndex?: number;
  pageSize?: number;
}

export type ReservationCreateResponse = ApiResponse<CreateReservationCommand>;
export type ReservationUserDetailsResponse = ApiResponse<ReservationUserItem>;
export type ReservationUserListResponse = ApiResponse<PaginationData<ReservationUserItem>>;
export type ReservationActionResponse = ApiResponse<string>;

