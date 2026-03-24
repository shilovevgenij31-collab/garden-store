import { request, ApiError } from "./client";
import type { ProductRead, PaginatedResponse } from "./products";
import type { OrderRead } from "./orders";

/* ── Types (matching backend admin schemas) ── */

export interface ProductCreateData {
  name: string;
  price: number;
  category_id: number;
  description?: string;
  old_price?: number | null;
  image_url?: string;
  badge?: string | null;
  in_stock?: boolean;
  is_active?: boolean;
  season?: string | null;
  care_instructions?: string | null;
}

export interface ProductUpdateData {
  name?: string;
  price?: number;
  category_id?: number;
  description?: string | null;
  old_price?: number | null;
  image_url?: string;
  badge?: string | null;
  in_stock?: boolean;
  is_active?: boolean;
  season?: string | null;
  care_instructions?: string | null;
}

export interface UploadResponse {
  url: string;
}

export interface OrderStatusUpdateData {
  status: string;
}

/* ── Helpers ── */

const TOKEN_KEY = "admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function adminHeaders(): Record<string, string> {
  const token = getAdminToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/* ── Auth ── */

export function adminLogin(
  password: string
): Promise<{ status: string; token: string }> {
  return request<{ status: string; token: string }>("/admin/login", {
    method: "POST",
    headers: { "X-Admin-Password": password },
  });
}

/* ── Products ── */

export function getAdminProducts(
  page = 1,
  limit = 50
): Promise<PaginatedResponse<ProductRead>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  return request<PaginatedResponse<ProductRead>>(`/admin/products?${params}`, {
    headers: adminHeaders(),
  });
}

export function createProduct(data: ProductCreateData): Promise<ProductRead> {
  return request<ProductRead>("/admin/products", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export function updateProduct(
  id: number,
  data: ProductUpdateData
): Promise<ProductRead> {
  return request<ProductRead>(`/admin/products/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: number): Promise<ProductRead> {
  return request<ProductRead>(`/admin/products/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}

/* ── Image Upload ── */

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: adminHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    if (res.status === 401) {
      window.dispatchEvent(new Event('admin-session-expired'));
    }
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }

  return res.json();
}

/* ── Orders ── */

export function getOrders(
  page = 1,
  limit = 20,
  status?: string
): Promise<PaginatedResponse<OrderRead>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (status) params.set("status", status);
  return request<PaginatedResponse<OrderRead>>(`/admin/orders?${params}`, {
    headers: adminHeaders(),
  });
}

export function updateOrderStatus(
  id: number,
  status: string
): Promise<OrderRead> {
  return request<OrderRead>(`/admin/orders/${id}/status`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ status }),
  });
}
