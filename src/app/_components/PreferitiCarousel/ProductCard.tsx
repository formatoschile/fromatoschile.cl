"use client";

import { useMemo } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { easeInOut, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { Product } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils";

// Simple seeded random function for consistent randomization
const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
}) => {
  const basePrice = parseFloat(product.priceRange.minVariantPrice.amount);
  const image = product.featuredImage || product.images[0];

  // Generate consistent random values based on product id
  const { rating, reviewCount, priceVariation } = useMemo(() => {
    const seed = seededRandom(product.id);
    // Rating between 4.0 and 5.0
    const rating = (4.0 + (seed % 11) / 10).toFixed(1);
    // Review count between 50 and 250
    const reviewCount = 50 + (seed % 201);
    // Price variation between 10 and 20 euros (can be + or -)
    const variation = 10 + (seed % 11);
    const priceVariation = seed % 2 === 0 ? variation : -variation;
    return { rating, reviewCount, priceVariation };
  }, [product.id]);

  const adjustedPrice = Math.max(basePrice + priceVariation, basePrice * 0.8);

  return (
    <motion.div
      className="z-10"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: easeInOut,
      }}
    >
      <Link
        href={`/product/${product.handle}`}
        className="shrink-0 w-[365px] group bg-secondary rounded-xl p-4 z-1 block"
      >
        {/* Image container */}
        <div className="relative h-[275px] rounded-lg overflow-hidden bg-black">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="365px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              No image
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-3 py-3">
          <h3 className="text-white font-base text-xl">{product.title}</h3>
          <p className="text-white text-sm uppercase tracking-wide">
            Insegna Luminosa
          </p>
          <p className="text-white font-bold text-3xl">
            {formatPrice(adjustedPrice)}
          </p>

          {/* Bottom row: button and rating */}
          <div className="flex items-center justify-between pt-2">
            <span className="bg-primary hover:bg-primary/80 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200">
              Scopri di più
            </span>

            <div className="flex items-center gap-1">
              <StarIcon className="size-6 fill-primary stroke-primary" />
              <span className="text-white font-bold text-xl">{rating}</span>
              <span className="text-white text-xl">({reviewCount})</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
