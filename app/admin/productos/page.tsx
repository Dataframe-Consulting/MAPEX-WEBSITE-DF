'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Package, Eye, EyeOff, Star, Upload, CheckSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        brand:brands(name),
        variants:product_variants(id, price, stock)
      `)
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    showToast(`Producto ${!current ? 'activado' : 'desactivado'}`, 'success');
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from('products').update({ is_featured: !current }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured: !current } : p));
    showToast(`Producto ${!current ? 'marcado como' : 'removido de'} destacados`, 'success');
  };

  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every(p => selected.has(p.id));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => {
        const next = new Set(prev);
        filteredProducts.forEach(p => next.delete(p.id));
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        filteredProducts.forEach(p => next.add(p.id));
        return next;
      });
    }
  };

  const bulkSetActive = async (active: boolean) => {
    const ids = [...selected];
    setBulkLoading(true);
    const supabase = createClient();
    await supabase.from('products').update({ is_active: active }).in('id', ids);
    setProducts(prev => prev.map(p => selected.has(p.id) ? { ...p, is_active: active } : p));
    setSelected(new Set());
    setBulkLoading(false);
    showToast(`${ids.length} producto(s) ${active ? 'activados' : 'desactivados'}`, 'success');
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) return;
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Producto eliminado', 'success');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Productos</h1>
          <p className="text-gray-500">{products.length} productos en catálogo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/productos/carga-masiva">
              <Upload className="h-4 w-4" /> Carga masiva
            </Link>
          </Button>
          <Button variant="primary" asChild>
            <Link href="/admin/productos/nuevo">
              <Plus className="h-4 w-4" /> Agregar producto
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="w-full pl-9 pr-4 h-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] bg-white"
        />
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-[#E8462A] text-white px-5 py-3 rounded-2xl">
          <CheckSquare className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-bold flex-1">{selected.size} producto(s) seleccionado(s)</span>
          <button
            onClick={() => bulkSetActive(true)}
            disabled={bulkLoading}
            className="text-sm font-bold bg-white text-green-700 px-3 py-1.5 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            Activar
          </button>
          <button
            onClick={() => bulkSetActive(false)}
            disabled={bulkLoading}
            className="text-sm font-bold bg-white text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Desactivar
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            <div className="h-8 w-8 border-2 border-[#E8462A] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No se encontraron productos</p>
            <Button variant="primary" asChild>
              <Link href="/admin/productos/nuevo"><Plus className="h-4 w-4" /> Agregar el primer producto</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 accent-[#E8462A] cursor-pointer"
                    />
                  </th>
                  {['Producto', 'Categoría', 'Precio base', 'Variantes', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => {
                  const stock = product.variants?.reduce((s, v) => s + (v.stock || 0), 0) ?? 0;
                  return (
                    <tr key={product.id} className={`transition-colors ${selected.has(product.id) ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          checked={selected.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-[#E8462A] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            {product.image_url ? (
                              <Image src={product.image_url} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                            {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                            <p className="text-xs text-gray-400">Stock: {stock} unidades</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <p>{(product.category as any)?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{(product.brand as any)?.name || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-[#E8462A]">
                        {formatCurrency(product.base_price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.variants?.length || 0} variante(s)
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {product.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                          {product.is_featured && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 w-fit flex items-center gap-1">
                              <Star className="h-2.5 w-2.5" /> Destacado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/productos/${product.id}/editar`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button onClick={() => toggleFeatured(product.id, product.is_featured)}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Destacar">
                            <Star className={`h-4 w-4 ${product.is_featured ? 'fill-yellow-400' : ''}`} />
                          </button>
                          <button onClick={() => toggleActive(product.id, product.is_active)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title={product.is_active ? 'Desactivar' : 'Activar'}>
                            {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button onClick={() => deleteProduct(product.id, product.name)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
