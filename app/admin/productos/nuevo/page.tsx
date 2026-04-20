'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Trash2, Save, Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Category, Brand } from '@/types';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

interface VariantForm {
  name: string;
  price: string;
  compare_price: string;
  stock: string;
  sku: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [variants, setVariants] = useState<VariantForm[]>([
    { name: '1L', price: '', compare_price: '', stock: '0', sku: '' },
    { name: '4L', price: '', compare_price: '', stock: '0', sku: '' },
  ]);

  const [form, setForm] = useState({
    name: '', slug: '', sku: '', description: '', short_description: '',
    category_id: '', brand_id: '', base_price: '', image_url: '',
    finish: '', base_type: '', coverage_sqm_per_liter: '', dry_time_hours: '',
    coats_required: '', is_featured: false, is_active: true, tags: '',
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []));
    supabase.from('brands').select('*').order('name').then(({ data }) => setBrands(data || []));
  }, []);

  const handleNameChange = (name: string) => {
    setForm(p => ({ ...p, name, slug: slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const { data: product, error } = await supabase.from('products').insert({
      name: form.name,
      slug: form.slug,
      sku: form.sku || null,
      description: form.description || null,
      short_description: form.short_description || null,
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      base_price: parseFloat(form.base_price),
      image_url: form.image_url || null,
      finish: form.finish || null,
      base_type: form.base_type || null,
      coverage_sqm_per_liter: form.coverage_sqm_per_liter ? parseFloat(form.coverage_sqm_per_liter) : null,
      dry_time_hours: form.dry_time_hours ? parseFloat(form.dry_time_hours) : null,
      coats_required: form.coats_required ? parseInt(form.coats_required) : null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : null,
    }).select().single();

    if (error) {
      showToast(`Error: ${error.message}`, 'error');
      setLoading(false);
      return;
    }

    const activeVariants = variants.filter(v => v.name && v.price);
    if (activeVariants.length > 0) {
      await supabase.from('product_variants').insert(
        activeVariants.map((v, i) => ({
          product_id: product.id,
          name: v.name,
          price: parseFloat(v.price),
          compare_price: v.compare_price ? parseFloat(v.compare_price) : null,
          stock: parseInt(v.stock) || 0,
          sku: v.sku || null,
          is_active: true,
        }))
      );
    }

    showToast('Producto creado correctamente', 'success');
    router.push('/admin/productos');
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('productos').upload(path, file, { upsert: false });
    if (error) {
      showToast(`Error al subir imagen: ${error.message}`, 'error');
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('productos').getPublicUrl(path);
    setForm(p => ({ ...p, image_url: data.publicUrl }));
    setUploading(false);
  };

  const addVariant = () => {
    setVariants(p => [...p, { name: '', price: '', compare_price: '', stock: '0', sku: '' }]);
  };

  const removeVariant = (i: number) => {
    setVariants(p => p.filter((_, idx) => idx !== i));
  };

  const updateVariant = (i: number, field: keyof VariantForm, value: string) => {
    setVariants(p => p.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/productos" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-black text-gray-900">Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 mb-5">Información básica</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombre del producto *" placeholder="Ej: Pintura Interior Duration" value={form.name}
                onChange={e => handleNameChange(e.target.value)} required />
              <Input label="SKU" placeholder="Ej: SW-DUR-INT-1L" value={form.sku}
                onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
            </div>
            <Input label="Slug (URL)" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              placeholder="se-genera-automaticamente" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción corta</label>
              <input type="text" value={form.short_description} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))}
                placeholder="Resumen en 1-2 líneas" className="w-full h-10 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción completa</label>
              <textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descripción detallada del producto..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
                <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] bg-white">
                  <option value="">Seleccionar categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Marca</label>
                <select value={form.brand_id} onChange={e => setForm(p => ({ ...p, brand_id: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] bg-white">
                  <option value="">Seleccionar marca</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <Input label="Precio base *" type="number" step="0.01" placeholder="0.00" value={form.base_price}
              onChange={e => setForm(p => ({ ...p, base_price: e.target.value }))} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen principal</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              {form.image_url ? (
                <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                  <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                    className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="flex flex-col items-center justify-center w-40 h-40 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#E8462A] hover:bg-red-50 transition-colors text-gray-400 hover:text-[#E8462A]">
                  <Upload className="h-7 w-7 mb-2" />
                  <span className="text-xs font-medium">{uploading ? 'Subiendo...' : 'Subir imagen'}</span>
                  <span className="text-xs mt-0.5">JPG, PNG, WEBP</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Paint specs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 mb-5">Especificaciones técnicas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Acabado</label>
              <select value={form.finish} onChange={e => setForm(p => ({ ...p, finish: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] bg-white">
                <option value="">— Ninguno —</option>
                {['flat','matte','eggshell','satin','semi-gloss','gloss','high-gloss'].map(f =>
                  <option key={f} value={f}>{f}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Base</label>
              <select value={form.base_type} onChange={e => setForm(p => ({ ...p, base_type: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] bg-white">
                <option value="">— Ninguna —</option>
                <option value="water">Al agua</option>
                <option value="oil">Al aceite</option>
                <option value="epoxy">Epóxico</option>
              </select>
            </div>
            <Input label="Rendimiento (m²/L)" type="number" step="0.1" placeholder="Ej: 10.5" value={form.coverage_sqm_per_liter}
              onChange={e => setForm(p => ({ ...p, coverage_sqm_per_liter: e.target.value }))} />
            <Input label="Secado (horas)" type="number" step="0.5" placeholder="Ej: 2" value={form.dry_time_hours}
              onChange={e => setForm(p => ({ ...p, dry_time_hours: e.target.value }))} />
          </div>
          <div className="mt-4">
            <Input label="Etiquetas (separadas por coma)" placeholder="Ej: interior, lavable, premium" value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>
          <div className="mt-4 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                className="w-4 h-4 accent-[#E8462A]" />
              <span className="text-sm font-medium text-gray-700">Producto destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="w-4 h-4 accent-[#E8462A]" />
              <span className="text-sm font-medium text-gray-700">Publicado / Activo</span>
            </label>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-gray-900">Variantes (presentaciones)</h2>
            <button type="button" onClick={addVariant}
              className="flex items-center gap-1.5 text-sm text-[#E8462A] hover:underline font-semibold">
              <Plus className="h-4 w-4" /> Agregar variante
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-5 gap-3 items-end">
                <Input label={i === 0 ? 'Nombre' : ''} placeholder="Ej: 1L, 4L, 19L" value={v.name}
                  onChange={e => updateVariant(i, 'name', e.target.value)} />
                <Input label={i === 0 ? 'Precio *' : ''} type="number" step="0.01" placeholder="0.00" value={v.price}
                  onChange={e => updateVariant(i, 'price', e.target.value)} />
                <Input label={i === 0 ? 'Precio original' : ''} type="number" step="0.01" placeholder="0.00" value={v.compare_price}
                  onChange={e => updateVariant(i, 'compare_price', e.target.value)} />
                <Input label={i === 0 ? 'Stock' : ''} type="number" placeholder="0" value={v.stock}
                  onChange={e => updateVariant(i, 'stock', e.target.value)} />
                <button type="button" onClick={() => removeVariant(i)}
                  className="h-10 w-10 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 self-end">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="lg" loading={loading}>
            <Save className="h-4 w-4" /> Guardar producto
          </Button>
          <Button type="button" variant="ghost" size="lg" asChild>
            <Link href="/admin/productos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
