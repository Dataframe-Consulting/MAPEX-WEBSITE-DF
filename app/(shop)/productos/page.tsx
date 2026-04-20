import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductFilter } from '@/components/shop/ProductFilter';
import { Product } from '@/types';
import { Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tienda Mapex',
  description: 'Explora toda nuestra línea de pinturas, esmaltes, impermeabilizantes y accesorios Sherwin Williams y Boden.',
};

interface PageProps {
  searchParams: Promise<{
    buscar?: string;
    categoria?: string;
    marca?: string;
    acabado?: string;
    orden?: string;
    pagina?: string;
  }>;
}

async function getProducts(searchParams: Awaited<PageProps['searchParams']>): Promise<{ products: Product[]; total: number }> {
  try {
    const supabase = await createClient();
    const page = parseInt(searchParams.pagina || '1');
    const limit = 24;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        brand:brands(id, name, slug),
        variants:product_variants(id, name, price, compare_price, stock, is_active),
        images:product_images(id, url, alt, is_primary, sort_order)
      `, { count: 'exact' })
      .eq('is_active', true);

    if (searchParams.buscar) {
      query = query.ilike('name', `%${searchParams.buscar}%`);
    }
    if (searchParams.categoria) {
      query = query.eq('categories.slug', searchParams.categoria);
    }
    if (searchParams.marca) {
      query = query.eq('brands.slug', searchParams.marca);
    }
    if (searchParams.acabado) {
      query = query.eq('finish', searchParams.acabado);
    }

    const sort = searchParams.orden || 'featured';
    switch (sort) {
      case 'price_asc': query = query.order('base_price', { ascending: true }); break;
      case 'price_desc': query = query.order('base_price', { ascending: false }); break;
      case 'name_asc': query = query.order('name', { ascending: true }); break;
      case 'newest': query = query.order('created_at', { ascending: false }); break;
      default: query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data, count } = await query.range(offset, offset + limit - 1);
    return { products: (data as Product[]) || [], total: count || 0 };
  } catch {
    return { products: [], total: 0 };
  }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { products, total } = await getProducts(params);
  const page = parseInt(params.pagina || '1');
  const totalPages = Math.ceil(total / 24);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            Tienda <span className="gradient-text">Mapex</span>
          </h1>
          <p className="text-gray-500">
            {total > 0 ? `${total} productos disponibles` : 'Explora nuestra colección'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter */}
        <div className="mb-8">
          <Suspense>
            <ProductFilter />
          </Suspense>
        </div>

        {/* Results */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="h-16 w-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No se encontraron productos</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              Intenta con otros filtros o términos de búsqueda. También puedes explorar todas las categorías.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`?${new URLSearchParams({ ...params, pagina: String(p) })}`}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors ${
                      p === page
                        ? 'bg-[#E8462A] text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#E8462A] hover:text-[#E8462A]'
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
