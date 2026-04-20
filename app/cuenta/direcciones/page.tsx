'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Trash2, Star, Edit2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import type { Address } from '@/types';

interface AddressForm {
  full_name: string; phone: string; street: string; colonia: string;
  city: string; state: string; zip: string; address_notes: string;
}

const EMPTY_FORM: AddressForm = {
  full_name: '', phone: '', street: '', colonia: '',
  city: 'Hermosillo', state: 'Sonora', zip: '', address_notes: '',
};

export default function DireccionesPage() {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false });
    setAddresses((data as Address[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (addr: Address) => {
    setForm({ full_name: addr.full_name, phone: addr.phone, street: addr.street, colonia: addr.colonia, city: addr.city, state: addr.state, zip: addr.zip, address_notes: (addr as any).address_notes || '' });
    setEditId(addr.id); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (editId) {
      await supabase.from('addresses').update({ ...form, address_notes: form.address_notes || null }).eq('id', editId);
    } else {
      await supabase.from('addresses').insert({ ...form, address_notes: form.address_notes || null, user_id: user.id, is_default: addresses.length === 0 });
    }
    await load();
    setShowForm(false);
    showToast(editId ? 'Dirección actualizada' : 'Dirección agregada', 'success');
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(p => p.filter(a => a.id !== id));
    showToast('Dirección eliminada', 'success');
  };

  const handleSetDefault = async (id: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    await load();
    showToast('Dirección predeterminada actualizada', 'success');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/cuenta" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E8462A] mb-3">
            <ArrowLeft className="h-4 w-4" /> Mi cuenta
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-gray-900">Mis <span className="gradient-text">Direcciones</span></h1>
            <Button variant="primary" size="sm" onClick={openNew}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {showForm && (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border-2 border-[#E8462A] p-6">
            <h2 className="font-black text-gray-900 mb-4">{editId ? 'Editar dirección' : 'Nueva dirección'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nombre completo *" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
                <Input label="Teléfono *" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
              </div>
              <Input label="Calle y número *" value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} required />
              <div className="grid grid-cols-3 gap-4">
                <Input label="Colonia *" value={form.colonia} onChange={e => setForm(p => ({ ...p, colonia: e.target.value }))} required />
                <Input label="Ciudad *" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
                <Input label="C.P. *" value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Referencias</label>
                <textarea rows={2} value={form.address_notes} onChange={e => setForm(p => ({ ...p, address_notes: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button type="submit" variant="primary" size="md" loading={saving}>Guardar</Button>
              <Button type="button" variant="ghost" size="md" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-1">No tienes direcciones guardadas</p>
            <p className="text-gray-400 text-sm mb-4">Agrega una para agilizar tus compras</p>
            <Button variant="primary" size="sm" onClick={openNew}><Plus className="h-4 w-4" /> Agregar dirección</Button>
          </div>
        ) : (
          addresses.map(addr => (
            <div key={addr.id} className={`bg-white rounded-2xl border p-5 ${addr.is_default ? 'border-[#E8462A]' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#E8462A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-4.5 w-4.5 text-[#E8462A]" />
                  </div>
                  <div>
                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E8462A] mb-1">
                        <Star className="h-3 w-3 fill-current" /> Predeterminada
                      </span>
                    )}
                    <p className="font-bold text-gray-900 text-sm">{addr.full_name} · {addr.phone}</p>
                    <p className="text-sm text-gray-600">{addr.street}</p>
                    <p className="text-sm text-gray-600">{addr.colonia}, {addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr.id)}
                      className="h-8 w-8 rounded-lg hover:bg-yellow-50 flex items-center justify-center text-gray-400 hover:text-yellow-500" title="Hacer predeterminada">
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => openEdit(addr)}
                    className="h-8 w-8 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(addr.id)}
                    className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
