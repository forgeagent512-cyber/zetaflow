"use client";

import { useParams, notFound } from "next/navigation";
import { PageTransition } from "@/components/animations";
import { ProductDetails } from "@/components/cms";
import { useProductsStore } from "@/store/use-products-store";
import { useWishlistStore } from "@/store/use-wishlist-store";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = useProductsStore((s) => s.getProductBySlug(slug));
  const addRecentlyViewed = useWishlistStore((s) => s.addRecentlyViewed);

  if (!product) notFound();

  if (product) addRecentlyViewed(product.id);

  return (
    <PageTransition>
      <ProductDetails product={product} />
    </PageTransition>
  );
}
