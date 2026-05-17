import { apiGet, apiPost, apiPut } from './api/client';
import { API } from '../constants/api';
import { buildQueryWithArray } from '../lib/api-helpers';
import type {
  CreateReservationCommand,
  ReservationActionResponse,
  ReservationCreateResponse,
  ReservationIdCommand,
  ReservationStaffDetailsResponse,
  ReservationStaffListResponse,
  ReservationSuggestionsResponse,
  ReservationUserDetailsResponse,
  ReservationUserListResponse,
  UserReservationsFilters,
} from '../types/reservation';

function buildReservationQueryString(filters?: UserReservationsFilters): string {
  return buildQueryWithArray(
    {
      RestaurantId: filters?.restaurantId,
      Date: filters?.date,
      From: filters?.from,
      To: filters?.to,
      PageIndex: filters?.pageIndex,
      PageSize: filters?.pageSize,
      UserId: undefined,
    },
    { Status: filters?.status }
  );
}

export async function createReservation(
  command: CreateReservationCommand
): Promise<ReservationCreateResponse> {
  return apiPost<ReservationCreateResponse>(API.reservation.create, command);
}

export async function getUserReservationById(
  reservationId: number
): Promise<ReservationUserDetailsResponse> {
  return apiGet<ReservationUserDetailsResponse>(API.reservation.userById(reservationId));
}

export async function getAllUserReservations(
  filters?: UserReservationsFilters
): Promise<ReservationUserListResponse> {
  return apiGet<ReservationUserListResponse>(
    `${API.reservation.userList}${buildReservationQueryString(filters)}`
  );
}

export async function getStaffReservationById(
  reservationId: number
): Promise<ReservationStaffDetailsResponse> {
  return apiGet<ReservationStaffDetailsResponse>(API.reservation.staffById(reservationId));
}

export async function getAllStaffReservations(
  filters?: UserReservationsFilters & { userId?: string }
): Promise<ReservationStaffListResponse> {
  const qs = buildQueryWithArray(
    {
      UserId: filters?.userId,
      Date: filters?.date,
      From: filters?.from,
      To: filters?.to,
      PageIndex: filters?.pageIndex,
      PageSize: filters?.pageSize,
    },
    { Status: filters?.status }
  );
  return apiGet<ReservationStaffListResponse>(`${API.reservation.staffList}${qs}`);
}

export async function cancelReservation(
  reservationId: number
): Promise<ReservationActionResponse> {
  const body: ReservationIdCommand = { reservationId };
  return apiPut<ReservationActionResponse>(API.reservation.cancel, body);
}

export async function approveReservation(
  reservationId: number
): Promise<ReservationStaffDetailsResponse> {
  const body: ReservationIdCommand = { reservationId };
  return apiPut<ReservationStaffDetailsResponse>(API.reservation.approve, body);
}

export async function rejectReservation(
  reservationId: number
): Promise<ReservationActionResponse> {
  const body: ReservationIdCommand = { reservationId };
  return apiPut<ReservationActionResponse>(API.reservation.reject, body);
}

export async function completeReservation(
  reservationId: number
): Promise<ReservationActionResponse> {
  const body: ReservationIdCommand = { reservationId };
  return apiPut<ReservationActionResponse>(API.reservation.complete, body);
}

export async function updateReservationTime(
  id: number,
  startDateTime: string,
  endDateTime: string
): Promise<ReservationUserDetailsResponse> {
  return apiPut<ReservationUserDetailsResponse>(API.reservation.updateTime, {
    id,
    startDateTime,
    endDateTime,
  });
}

export async function getReservationSuggestions(
  reservationId: number
): Promise<ReservationSuggestionsResponse> {
  return apiGet<ReservationSuggestionsResponse>(API.reservation.suggestions(reservationId));
}
