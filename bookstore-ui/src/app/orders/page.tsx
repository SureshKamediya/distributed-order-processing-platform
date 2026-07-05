"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { OrderSummary } from "@/lib/api";

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Unable to load your orders.");
        }

        const payload = (await response.json()) as OrderSummary[];
        setOrders(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, [router, status]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Your orders</h1>
            <p className="mt-2 text-slate-600">Track the orders you have placed with the bookstore.</p>
          </div>
          <Link
            href="/products"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Continue shopping
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">Loading orders…</div>
        ) : error ? (
          <div className="rounded-3xl bg-rose-50 p-10 text-center text-rose-700 shadow-sm">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <div key={order.orderNumber} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">{order.orderNumber}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {order.status}
                  </span>
                </div>
                <p className="mt-4 text-slate-600">View the full order details and delivery information.</p>
                <Link
                  href={`/orders/${encodeURIComponent(order.orderNumber)}`}
                  className="mt-6 inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                >
                  View details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
