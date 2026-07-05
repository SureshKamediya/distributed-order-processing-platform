"use client";

import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/lib/api";

export default function ProductDetailActions({ product }: { product: Product }) {
  const { data: session, status } = useSession();
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!session) {
      signIn("keycloak", { callbackUrl: `/products/${encodeURIComponent(product.code)}` });
      return;
    }

    addItem(product);
    router.push("/cart");
  };

  return (
    <div className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        {status === "authenticated" ? "Add to cart" : "Sign in to add to cart"}
      </button>
      {status === "authenticated" && (
        <p className="text-sm text-slate-600">
          You are signed in as <span className="font-medium">{session.user?.email}</span>.
        </p>
      )}
      {status === "unauthenticated" && (
        <button
          type="button"
          onClick={() => signIn("keycloak", { callbackUrl: `/products/${encodeURIComponent(product.code)}` })}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
        >
          Login now
        </button>
      )}
    </div>
  );
}
