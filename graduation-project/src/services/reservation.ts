import { apiGet, apiPost, apiPut } from './api/client';
import type {
  CreateReservationCommand,
  ReservationActionResponse,
  ReservationCreateResponse,
  ReservationUserDetailsResponse,
  ReservationUserListResponse,
  UserReservationsFilters,
} from '../types/reservation';

const buildQueryString = (filters?: UserReservationsFilters): string => {
  if (!filters) return '';

  const params = new URLSearchParams();

  filters.status?.forEach((status) => params.append('Status', String(status)));
  if (filters.restaurantId !== undefined) params.append('RestaurantId', String(filters.restaurantId));
  if (filters.date) params.append('Date', filters.date);
  if (filters.from) params.append('From', filters.from);
  if (filters.to) params.append('To', filters.to);
  if (filters.pageIndex !== undefined) params.append('PageIndex', String(filters.pageIndex));
  if (filters.pageSize !== undefined) params.append('PageSize', String(filters.pageSize));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export async function createReservation(command: CreateReservationCommand): Promise<ReservationCreateResponse> {
  return apiPost<ReservationCreateResponse>('/api/Reservation/Create', command);
}

export async function getUserReservationById(reservationId: number): Promise<ReservationUserDetailsResponse> {
  return apiGet<ReservationUserDetailsResponse>(`/api/Reservation/User/${reservationId}`);
}

export async function getAllUserReservations(filters?: UserReservationsFilters): Promise<ReservationUserListResponse> {
  return apiGet<ReservationUserListResponse>(`/api/Reservation/User/GetAllReservation${buildQueryString(filters)}`);
}

export async function cancelReservation(reservationId: number): Promise<ReservationActionResponse> {
  return apiPut<ReservationActionResponse>('/api/Reservation/Cancel', { reservationId });
}

export async function updateReservationTime(id: number, startDateTime: string, endDateTime: string): Promise<ReservationUserDetailsResponse> {
  return apiPut<ReservationUserDetailsResponse>('/api/Reservation/Update-Time', { id, startDateTime, endDateTime });
}

