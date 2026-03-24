import { useMutation } from "@tanstack/react-query";
import { createOrder, type OrderCreate, type OrderRead } from "@/api/orders";

export function useCreateOrder() {
  return useMutation<OrderRead, Error, OrderCreate>({
    mutationFn: createOrder,
  });
}
