"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import type { CreateOrderRequest } from "@/lib/api";

export default function CartPage() {
  const { status } = useSession();
  const router = useRouter();
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) {
      setMessage("Please add items to your cart before placing an order.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const orderRequest: CreateOrderRequest = {
      items: items.map((item) => ({
        code: item.code,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
      },
      deliveryAddress: {
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
      },
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      });

      const rawText = await response.text();
      let result: Record<string, unknown> = {};

      if (rawText) {
        try {
          result = JSON.parse(rawText) as Record<string, unknown>;
        } catch {
          result = { message: rawText };
        }
      }

      if (!response.ok) {
        const errorMessage = (result.error as string | undefined) || (result.message as string | undefined) || "Unable to place order.";
        setMessage(`Order failed: ${errorMessage}`);
      } else {
        const orderNumber = (result.orderNumber as string | undefined) ?? "N/A";
        clearCart();
        router.push(`/orders/${encodeURIComponent(orderNumber)}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("Order failed: unable to reach the gateway.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Your Cart</h1>
            <p className="mt-2 text-slate-600">
              Complete your order. If you are not signed in, you will be redirected to login.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Continue shopping
          </button>
        </div>

        {message ? (
          <div className="mb-6 rounded-3xl bg-white p-5 text-slate-800 shadow-sm">
            {message}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Order items</h2>
            {hasItems ? (
              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={item.code} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">Code: {item.code}</p>
                        <p className="mt-2 text-slate-600">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-700">Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.code, Number(event.target.value))}
                          className="w-20 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.code)}
                          className="rounded-2xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
                Your cart is empty. Add products from the catalog first.
              </div>
            )}
          </section>

          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Order details</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Items</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">${totalAmount.toFixed(2)}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="space-y-3 rounded-3xl bg-slate-50 p-4">
                  <legend className="text-base font-semibold text-slate-900">Customer</legend>
                  {[
                    { label: "Name", name: "name", type: "text" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Phone", name: "phone", type: "tel" },
                  ].map((field) => (
                    <label key={field.name} className="block text-sm text-slate-700">
                      <span className="mb-1 block font-medium">{field.label}</span>
                      <input
                        type={field.type}
                        value={form[field.name as keyof typeof form]}
                        onChange={(event) => handleChange(field.name as keyof typeof form, event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                        required
                      />
                    </label>
                  ))}
                </fieldset>

                <fieldset className="space-y-3 rounded-3xl bg-slate-50 p-4">
                  <legend className="text-base font-semibold text-slate-900">Delivery address</legend>
                  {[
                    { label: "Street address", name: "addressLine1" },
                    { label: "Address line 2", name: "addressLine2", optional: true },
                    { label: "City", name: "city" },
                    { label: "State", name: "state" },
                    { label: "Zip code", name: "zipCode" },
                    { label: "Country", name: "country" },
                  ].map((field) => (
                    <label key={field.name} className="block text-sm text-slate-700">
                      <span className="mb-1 block font-medium">
                        {field.label}
                        {field.optional ? " (optional)" : ""}
                      </span>
                      <input
                        type="text"
                        value={form[field.name as keyof typeof form]}
                        onChange={(event) => handleChange(field.name as keyof typeof form, event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
                        required={!field.optional}
                      />
                    </label>
                  ))}
                </fieldset>

                <button
                  type="submit"
                  disabled={!hasItems || submitting}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Placing order…" : "Place order"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
