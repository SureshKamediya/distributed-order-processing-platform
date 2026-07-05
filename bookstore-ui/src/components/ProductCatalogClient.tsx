"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import type { PagedResult, Product } from "@/lib/api";

interface ProductCatalogClientProps {
  initialProducts: Product[];
  initialPageCount: number;
}

export default function ProductCatalogClient({
  initialProducts,
  initialPageCount,
}: ProductCatalogClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addItem, totalItems } = useCart();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(initialPageCount);

  useEffect(() => {
    if (page === 0) {
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products?page=${page + 1}&size=10`);
        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const json = (await response.json()) as PagedResult<Product>;
        setProducts(json.data ?? []);
        setPageCount(json.totalPages || Math.max(1, Math.ceil((json.totalElements || 0) / 10)));
      } catch (err) {
        console.error(err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [initialPageCount, initialProducts, page]);

  const handleAddToCart = (product: Product) => {
    if (!session) {
      router.push("/login");
      return;
    }

    addItem(product);
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
            <p className="mt-2 text-slate-600">
              Browse the catalog and add products to your cart. Login is required to place an order.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              View cart ({totalItems})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">Loading products…</div>
        ) : error ? (
          <div className="rounded-3xl bg-rose-50 p-10 text-center text-rose-700 shadow-sm">{error}</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div key={product.code} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="relative mb-5 h-48 overflow-hidden rounded-3xl bg-slate-100 text-slate-500">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm uppercase tracking-[.2em]">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">Code: {product.code}</p>
                  </div>
                  <p className="text-slate-600">{product.description}</p>
                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-lg font-semibold text-slate-900">${product.price.toFixed(2)}</span>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <a
                        href={`/products/${encodeURIComponent(product.code)}`}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
                      >
                        View details
                      </a>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((current) => Math.min(current + 1, pageCount - 1))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
