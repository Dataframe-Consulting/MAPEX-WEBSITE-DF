'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tags, Save, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { slugify } from '@/lib/utils';
import type { Category } from '@/types';

interface CatForm { name: string; slug: string; description: string; sort_order: string; }
const EMPTY: CatForm = { name: '', slug: '', description: '', sort_order: '0' };

export default function CategoriasPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CatForm>(EMPTY);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
    setCategories((data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, slug: c.slug, description: c.description || '', sort_order: String(c.sort_order) });
    setEditId(c.id); setShowForm(true);
  };
  const handleNameChange = (name: string) => setForm(p => ({ ...p, name, slug: slugify(name) }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const payload = { name: form.name.trim(), slug: form.slug || slugify(form.name), description: form.description || null, sort_order: parseInt(form.sort_order) || 0 };
    if (editId) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editId);
      if (error) showToast('Error al actualizar', 'error');
      else showToast('Categoría actualizada', 'success');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) showToast('Error: ' + error.message, 'error');
      else showToast('Categoría creada', 'success');
    }
    await load(); setShowForm(false); setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"? Los productos asociados quedarán sin categoría.`)) return;
    setDeleting(id);
    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) showToast('No se puede eliminar: tiene productos asociados', 'error');
    else { setCategories(p => p.filter(c => c.id !== id)); showToast('Categoría eliminada', 'success'); }
    setDeleting(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Categorías</h1>
          <p className="text-gray-500 mt-1">{categories.length} categorías registradas</p>
        </div>
        <Button variant="primary" onClick={openNew}><Plus className="h-4 w-4" /> Nueva categoría</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border-2 border-[#E8462A] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-900">{editId ? 'Editar categoría' : 'Nueva categoría'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre *" placeholder="Ej: Pinturas Interior" value={form.name}
              onChange={e => handleNameChange(e.target.value)} required />
            <Input label="Slug (URL)" placeholder="pinturas-interior" value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
            <Input label="Descripción" placeholder="Descripción breve..." value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <Input label="Orden" type="number" value={form.sort_order}
              onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button type="submit" variant="primary" size="md" loading={saving}><Save className="h-4 w-4" /> Guardar</Button>
            <Button type="button" variant="ghost" size="md" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center">
            <Tags className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No hay categorías. Crea la primera.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Slug</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Descripción</th>
                <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Orden</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{cat.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">{cat.sort_order}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="h-8 w-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} disabled={deleting === cat.id}
                        className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
