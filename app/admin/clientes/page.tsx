import { createClient } from '@/lib/supabase/server';
import { Users, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Clientes' };

export default async function ClientesPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone, created_at, role')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  const ids = profiles?.map(p => p.id) || [];

  const { data: orderCounts } = ids.length > 0
    ? await supabase.from('orders').select('user_id').in('user_id', ids)
    : { data: [] };

  const countMap: Record<string, number> = {};
  (orderCounts || []).forEach(o => { countMap[o.user_id] = (countMap[o.user_id] || 0) + 1; });


  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Clientes</h1>
        <p className="text-gray-500 mt-1">{profiles?.length || 0} clientes registrados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{profiles?.length || 0}</p>
              <p className="text-xs text-gray-500">Total clientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{Object.values(countMap).reduce((a, b) => a + b, 0)}</p>
              <p className="text-xs text-gray-500">Total pedidos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {profiles ? profiles.filter(p => countMap[p.id] > 0).length : 0}
              </p>
              <p className="text-xs text-gray-500">Con pedidos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {!profiles || profiles.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No hay clientes registrados aún.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Teléfono</th>
                <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Pedidos</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profiles.map(profile => (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{profile.full_name || 'Sin nombre'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{profile.phone || '—'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${(countMap[profile.id] || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {countMap[profile.id] || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(profile.created_at))}
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
