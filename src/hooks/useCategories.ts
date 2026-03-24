import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type CategoryRead } from "@/api/products";

export function useCategories() {
  return useQuery<CategoryRead[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}
