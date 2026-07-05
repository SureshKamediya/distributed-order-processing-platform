"use client";

import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { CartItem, Product } from "@/lib/api";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Product) => void;
  removeItem: (code: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  updateQuantity: (code: string, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "bookstore-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.code === product.code);
      if (existing) {
        return current.map((item) =>
          item.code === product.code
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (code: string) => {
    setItems((current) => current.filter((item) => item.code !== code));
  };

  const updateQuantity = (code: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.code === code
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = useMemo(
    () => ({ items, addItem, removeItem, clearCart, totalItems, totalAmount, updateQuantity }),
    [items, totalItems, totalAmount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
