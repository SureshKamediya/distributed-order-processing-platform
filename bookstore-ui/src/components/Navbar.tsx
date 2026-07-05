"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-xl font-semibold text-slate-900">
            Bookstore
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-600">
            <Link href="/products" className="transition hover:text-slate-900">
              Products
            </Link>
            <Link href="/cart" className="transition hover:text-slate-900">
              Cart
            </Link>
            <Link href="/orders" className="transition hover:text-slate-900">
              Orders
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {status === "loading" ? (
            <span className="text-slate-500">Checking auth…</span>
          ) : session?.user ? (
            <>
              <span className="hidden sm:inline text-slate-600">{session.user.email}</span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/products" })}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => signIn("keycloak", { callbackUrl: "/cart" })}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
