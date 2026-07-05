import Image from "next/image";
import { notFound } from "next/navigation";
import type { Product } from "@/lib/api";
import ProductDetailActions from "@/components/ProductDetailActions";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{
    code: string;
  }>;
}

async function fetchProduct(code: string): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(code)}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Product not found");
  }

  return res.json();
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { code } = await params;
  let product: Product;

  try {
    product = await fetchProduct(code);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="relative h-96 overflow-hidden rounded-3xl bg-slate-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm uppercase tracking-[.2em] text-slate-500">
                  No image available
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-slate-900">{product.name}</h1>
              <p className="text-slate-600">Code: {product.code}</p>
              <p className="text-lg text-slate-900">${product.price.toFixed(2)}</p>
              <p className="text-slate-600">{product.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <ProductDetailActions product={product} />
            <Link
              href="/products"
              className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-slate-400"
            >
              Back to products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
