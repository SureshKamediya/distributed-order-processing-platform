"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { OrderDTO } from "@/lib/api";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderDetailPage({ params }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setOrderNumber(resolvedParams.orderNumber);
    };

    void loadParams();
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status !== "authenticated" || !orderNumber) {
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
        if (!response.ok) {
          throw new Error("Unable to load this order.");
        }

        const payload = (await response.json()) as OrderDTO;
        setOrder(payload);
      } catch (err) {
        console.error(err);
        setError("Unable to load this order.");
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [orderNumber, router, status]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Order details</h1>
            <p className="mt-2 text-slate-600">Review the items, customer details, and delivery address for this order.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/orders" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
              Back to orders
            </Link>
            <Link href="/products" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              Continue shopping
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">Loading order…</div>
        ) : error ? (
          <div className="rounded-3xl bg-rose-50 p-10 text-center text-rose-700 shadow-sm">{error}</div>
        ) : order ? (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{order.orderNumber}</h2>
                  <p className="mt-2 text-sm text-slate-500">Created {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {order.status}
                </span>
              </div>

              <div className="mt-8 space-y-4">
                {order.items.map((item) => (
                  <div key={`${item.code}-${item.quantity}`} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">Code: {item.code}</p>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>Qty: {item.quantity}</p>
                        <p>Price: ${Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Customer</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-900">Name:</span> {order.customer?.name ?? "—"}</p>
                  <p><span className="font-medium text-slate-900">Email:</span> {order.customer?.email ?? "—"}</p>
                  <p><span className="font-medium text-slate-900">Phone:</span> {order.customer?.phone ?? "—"}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Delivery address</h3>
                <div className="mt-4 space-y-1 text-sm text-slate-600">
                  <p>{order.deliveryAddress?.addressLine1 ?? "—"}</p>
                  {order.deliveryAddress?.addressLine2 ? <p>{order.deliveryAddress.addressLine2}</p> : null}
                  <p>{[order.deliveryAddress?.city, order.deliveryAddress?.state, order.deliveryAddress?.zipCode].filter(Boolean).join(", ")}</p>
                  <p>{order.deliveryAddress?.country ?? "—"}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-900">Items:</span> {order.items.length}</p>
                  <p><span className="font-medium text-slate-900">Total:</span> ${Number(order.totalAmount ?? 0).toFixed(2)}</p>
                  {order.comments ? <p><span className="font-medium text-slate-900">Comments:</span> {order.comments}</p> : null}
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
