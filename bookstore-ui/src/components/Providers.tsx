"use client";

import type { PropsWithChildren } from "react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/cart-context";
import Navbar from "./Navbar"

export default function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <CartProvider>
        <Navbar />
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
