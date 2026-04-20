'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Package, Star, Tag } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { showToast } = useToast();

  const primaryImage = product.images?.find(i => i.is_primary) ?? product.images?.[0];
  const imageUrl = primaryImage?.url ?? product.image_url;

  const activeVariants = product.variants?.filter(v => v.is_active) ?? [];
  const defaultVariant = activeVariants.find(v => v.stock > 0) ?? activeVariants[0];
  const displayPrice = defaultVariant?.price ?? product.base_price;
  const comparePrice = defaultVariant?.compare_price;
  const discount = calculateDiscount(displayPrice, comparePrice);
  const inStock = activeVariants.some(v => v.stock > 0);

  const handleAddToCart = async () => {
    if (!defaultVariant || !inStock) return;
    setAdding(true);
    await new Promise(r => setTimeout(r, 400));
    addItem({
      variant_id: defaultVariant.id,
      quantity: 1,
      product_name: product.name,
      variant_name: defaultVariant.name,
      price: defaultVariant.price,
      image_url: imageUrl,
      slug: product.slug,
    });
    setAdding(false);
    showToast(`"${product.name}" agregado al carrito`, 'success');
    openCart();
  };

  return (
    <div className="product-card bg-white rounded-2xl border border-gray-100 overflow-hidden group">
      {/* Image */}
      <Link href={`/productos/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-gray-50 relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <Package className="h-12 w-12 mb-2" />
              <span className="text-xs">Sin imagen</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <span className="bg-[#F5A623] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-current" /> Destacado
              </span>
            )}
            {discount && discount > 0 && (
              <span className="bg-[#E8462A] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Tag className="h-2.5 w-2.5" /> -{discount}%
              </span>
            )}
            {!inStock && (
              <span className="bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Agotado
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <Link href={`/productos/${product.slug}`}>
          <h3 className="text-sm font-bold text-gray-900 leading-tight hover:text-[#E8462A] transition-colors line-clamp-2 mb-1.5">
            {product.name}
          </h3>
        </Link>

        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-400 mb-2">{product.category.name}</p>
        )}

        {/* Finish badge */}
        {product.finish && (
          <Badge variant="default" className="text-xs mb-2">
            {product.finish}
          </Badge>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-black text-[#E8462A]">
            {formatCurrency(displayPrice)}
          </span>
          {comparePrice && comparePrice > displayPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(comparePrice)}
            </span>
          )}
        </div>

        {/* Variants count */}
        {activeVariants.length > 1 && (
          <p className="text-xs text-gray-400 mb-3">
            {activeVariants.length} presentaciones disponibles
          </p>
        )}

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || adding || !defaultVariant}
          className={`w-full flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
            !inStock || !defaultVariant
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : adding
              ? 'bg-green-600 text-white'
              : 'bg-[#E8462A] text-white hover:bg-[#c73820] active:scale-95'
          }`}
        >
          {adding ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Agregando...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {inStock ? 'Agregar al carrito' : 'Sin stock'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
