import ProductCatalogClient from "@/components/ProductCatalogClient";
import type { PagedResult, Product } from "@/lib/api";
import { gatewayBaseUrl } from "@/lib/api";

async function getInitialProductsPage(): Promise<{ products: Product[]; pageCount: number }> {
  try {
    const response = await fetch(`${gatewayBaseUrl}/catalog/api/products?page=1&size=10`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { products: [], pageCount: 0 };
    }

    const json = (await response.json()) as PagedResult<Product>;
    return {
      products: json.data ?? [],
      pageCount: json.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching initial products page:", error);
    return { products: [], pageCount: 0 };
  }
}

export default async function ProductsPage() {
  const { products, pageCount } = await getInitialProductsPage();

  return <ProductCatalogClient initialProducts={products} initialPageCount={pageCount} />;
}
