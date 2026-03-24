import { request } from "./client";

/* ── Types (matching backend schemas) ── */

export interface CategoryRead {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: number | null;
  sort_order: number;
  product_count: number;
}

export interface ProductRead {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string;
  badge: string | null;
  in_stock: boolean;
  is_active: boolean;
  season: string | null;
  care_instructions: string | null;
  category_id: number;
  category: CategoryRead;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProductFilter {
  category?: string;
  min_price?: number;
  max_price?: number;
  season?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/* ── API calls ── */

export function fetchProducts(
  filters: ProductFilter = {}
): Promise<PaginatedResponse<ProductRead>> {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.min_price != null) params.set("min_price", String(filters.min_price));
  if (filters.max_price != null) params.set("max_price", String(filters.max_price));
  if (filters.season) params.set("season", filters.season);
  if (filters.search) params.set("search", filters.search);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.limit != null) params.set("limit", String(filters.limit));

  const qs = params.toString();
  return request<PaginatedResponse<ProductRead>>(
    `/products${qs ? `?${qs}` : ""}`
  );
}

export function fetchProduct(productId: number): Promise<ProductRead> {
  return request<ProductRead>(`/products/${productId}`);
}

export function fetchProductBySlug(slug: string): Promise<ProductRead> {
  return request<ProductRead>(`/products/slug/${slug}`);
}

export function fetchCategories(): Promise<CategoryRead[]> {
  return request<CategoryRead[]>("/categories");
}
