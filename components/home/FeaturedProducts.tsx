import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        brand:brands(id, name, slug, logo_url),
        variants:product_variants(id, name, price, compare_price, stock, is_active),
        images:product_images(id, url, alt, is_primary, sort_order)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8);

    return (data as Product[]) || [];
  } catch {
    return [];
  }
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
              Productos <span className="gradient-text">Destacados</span>
            </h2>
            <p className="text-gray-500">Los más vendidos y mejor calificados</p>
          </div>
          <Button variant="outline" size="md" asChild className="hidden sm:flex">
            <Link href="/productos">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 rounded-2xl aspect-square mb-3" />
                  <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-gray-100 rounded mb-3 w-1/2" />
                  <div className="h-8 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
            <p className="text-gray-400 mt-8 text-sm">
              Los productos aparecerán aquí una vez que los agregues desde el panel de administración.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="flex justify-center mt-8 sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/productos">Ver todos los productos <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
