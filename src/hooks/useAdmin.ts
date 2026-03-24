import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminLogin,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getOrders,
  updateOrderStatus,
  type ProductCreateData,
  type ProductUpdateData,
} from "@/api/admin";

/* ── Auth ── */

export function useAdminLogin() {
  return useMutation({
    mutationFn: adminLogin,
  });
}

/* ── Products ── */

export function useAdminProducts(page = 1, limit = 50) {
  return useQuery({
    queryKey: ["admin-products", page, limit],
    queryFn: () => getAdminProducts(page, limit),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreateData) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdateData }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/* ── Image Upload ── */

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadImage(file),
  });
}

/* ── Orders ── */

export function useAdminOrders(page = 1, limit = 20, status?: string) {
  return useQuery({
    queryKey: ["admin-orders", page, limit, status],
    queryFn: () => getOrders(page, limit, status),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}
