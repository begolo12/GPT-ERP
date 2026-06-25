import type { UserRole, DivisionCode, ApprovalStatus, DocType, AccountType, ItemStatus, ApprovalAction, NotificationType } from "./enums";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  companyCode: string;
  divisionCode: DivisionCode | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export type {
  UserRole,
  DivisionCode,
  ApprovalStatus,
  DocType,
  AccountType,
  ItemStatus,
  ApprovalAction,
  NotificationType,
};
