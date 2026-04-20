'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Package, ArrowLeft, Check, ChevronRight, Droplets, Clock, Layers, Ruler } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Product, ProductVariant, FINISH_LABELS } from '@/types';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          brand:brands(id, name, slug, logo_url),
          variants:product_variants(id, name, price, compare_price, stock, is_active),
          images:product_images(id, url, alt, is_primary, sort_order)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (data) {
        const p = data as Product;
        setProduct(p);
        const active = p.variants?.filter(v => v.is_active) ?? [];
        const def = active.find(v => v.stock > 0) ?? active[0] ?? null;
        setSelectedVariant(def);
        const primary = p.images?.find(i => i.is_primary)?.url ?? p.images?.[0]?.url ?? p.image_url;
        setSelectedImage(primary);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;
    setAdding(true);
    await new Promise(r => setTimeout(r, 400));
    addItem({
      variant_id: selectedVariant.id,
      quantity,
      product_name: product.name,
      variant_name: selectedVariant.name,
      price: selectedVariant.price,
      image_url: selectedImage,
      slug: product.slug,
    });
    setAdding(false);
    showToast(`"${product.name}" agregado al carrito`, 'success');
    openCart();
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-square bg-gray-100 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-6 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
      <Package className="h-16 w-16 text-gray-200 mb-4" />
      <h2 className="text-xl font-bold text-gray-400 mb-2">Producto no encontrado</h2>
      <Button variant="primary" asChild>
        <Link href="/productos">Ver catálogo</Link>
      </Button>
    </div>
  );

  const activeVariants = product.variants?.filter(v => v.is_active) ?? [];
  const displayPrice = selectedVariant?.price ?? product.base_price;
  const comparePrice = selectedVariant?.compare_price;
  const discount = calculateDiscount(displayPrice, comparePrice ?? null);
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#E8462A] transition-colors">Inicio</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/productos" className="hover:text-[#E8462A] transition-colors">Productos</Link>
            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/productos?categoria=${product.category.slug}`} className="hover:text-[#E8462A] transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900 font-medium truncate max-w-48">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/productos" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E8462A] transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-300">
                  <Package className="h-20 w-20 mx-auto mb-3" />
                  {/*
                    IMAGEN PRINCIPAL DEL PRODUCTO
                    Sube las imágenes de cada producto desde el panel de administración
                    o directamente en Supabase Storage.
                  */}
                  <p className="text-sm">Imagen del producto</p>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === img.url ? 'border-[#E8462A]' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt || product.name} width={80} height={80} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{product.brand.name}</Badge>
                {product.is_featured && <Badge variant="primary">⭐ Destacado</Badge>}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{product.name}</h1>

            {product.category && (
              <p className="text-sm text-gray-500">
                Categoría:{' '}
                <Link href={`/productos?categoria=${product.category.slug}`} className="text-[#E8462A] hover:underline">
                  {product.category.name}
                </Link>
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-[#E8462A]">{formatCurrency(displayPrice)}</span>
              {comparePrice && comparePrice > displayPrice && (
                <div>
                  <span className="text-xl text-gray-400 line-through block">{formatCurrency(comparePrice)}</span>
                  {discount && <span className="text-sm text-green-600 font-bold">Ahorras {discount}%</span>}
                </div>
              )}
            </div>

            {/* Specs */}
            {(product.finish || product.base_type || product.coverage_sqm_per_liter || product.dry_time_hours) && (
              <div className="grid grid-cols-2 gap-3">
                {product.finish && (
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#E8462A]" />
                    <div>
                      <p className="text-xs text-gray-400">Acabado</p>
                      <p className="text-sm font-semibold text-gray-900">{FINISH_LABELS[product.finish] || product.finish}</p>
                    </div>
                  </div>
                )}
                {product.base_type && (
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-400">Base</p>
                      <p className="text-sm font-semibold text-gray-900">{product.base_type === 'water' ? 'Al agua' : 'Al aceite'}</p>
                    </div>
                  </div>
                )}
                {product.coverage_sqm_per_liter && (
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-400">Rendimiento</p>
                      <p className="text-sm font-semibold text-gray-900">{product.coverage_sqm_per_liter} m²/L</p>
                    </div>
                  </div>
                )}
                {product.dry_time_hours && (
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-400">Tiempo de secado</p>
                      <p className="text-sm font-semibold text-gray-900">{product.dry_time_hours}h</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Variants */}
            {activeVariants.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Presentación / Tamaño:</p>
                <div className="flex flex-wrap gap-2">
                  {activeVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-[#E8462A] bg-red-50 text-[#E8462A]'
                          : variant.stock === 0
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                          : 'border-gray-200 text-gray-700 hover:border-[#E8462A] hover:text-[#E8462A]'
                      }`}
                    >
                      {variant.name}
                      {variant.stock === 0 && <span className="ml-1 text-xs">(Agotado)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className={`flex items-center gap-2 text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
              <div className={`h-2 w-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-400'}`} />
              {inStock
                ? `Disponible (${selectedVariant?.stock} en existencia)`
                : 'Sin existencia'}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="h-12 w-12 flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="h-12 w-12 flex items-center justify-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(selectedVariant?.stock ?? 99, q + 1))}
                  className="h-12 w-12 flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>

              <Button
                variant="primary"
                size="xl"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!inStock || !selectedVariant || adding}
                loading={adding}
              >
                {!adding && <ShoppingCart className="h-5 w-5" />}
                {inStock ? 'Agregar al carrito' : 'Sin existencia'}
              </Button>
            </div>

            {/* Description */}
            {(product.description || product.short_description) && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción del producto</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description || product.short_description}
                </p>
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-gray-400">SKU: {product.sku}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
