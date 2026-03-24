import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { ProductRead } from "@/api/products";

/* ── Types ── */

export interface CartItem {
  product: ProductRead;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addToCart: (product: ProductRead, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  changeQty: (productId: number, delta: number) => void;
  clearCart: () => void;
}

/* ── Persistence ── */

const CART_KEY = "vsevSad_cart";

function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  if (typeof obj.qty !== "number" || obj.qty < 1) return false;
  if (typeof obj.product !== "object" || obj.product === null) return false;
  const prod = obj.product as Record<string, unknown>;
  return typeof prod.id === "number" && prod.price != null;
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(isValidCartItem);
    }
  } catch { /* corrupted data — start fresh */ }
  return [];
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch { /* quota exceeded — silent */ }
}

/* ── Context ── */

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = useCallback((product: ProductRead, amount: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + amount } : i
        );
      }
      return [...prev, { product, qty: amount }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const changeQty = useCallback((productId: number, delta: number) => {
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.product.id === productId ? { ...i, qty: i.qty + delta } : i
      );
      return updated.filter((i) => i.qty > 0);
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, totalCount, totalPrice, addToCart, removeFromCart, changeQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
