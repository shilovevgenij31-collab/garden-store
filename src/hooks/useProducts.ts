import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type ProductFilter, type PaginatedResponse, type ProductRead } from "@/api/products";

export function useProducts(filters: ProductFilter = {}) {
  return useQuery<PaginatedResponse<ProductRead>>({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
  });
}
