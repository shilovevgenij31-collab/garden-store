import { request } from "./client";

/* ── Types (matching backend schemas) ── */

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  notes?: string;
  items: OrderItemCreate[];
}

export interface OrderItemRead {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderRead {
  id: number;
  public_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  status: string;
  total_amount: number;
  notes: string | null;
  items: OrderItemRead[];
  created_at: string;
}

/* ── API calls ── */

export function createOrder(data: OrderCreate): Promise<OrderRead> {
  return request<OrderRead>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchOrder(publicId: string): Promise<OrderRead> {
  return request<OrderRead>(`/orders/${publicId}`);
}

export function fetchOrdersByContact(
  email?: string,
  phone?: string
): Promise<OrderRead[]> {
  const params = new URLSearchParams();
  if (email) params.set("email", email);
  if (phone) params.set("phone", phone);
  return request<OrderRead[]>(`/orders/by-contact?${params}`);
}
