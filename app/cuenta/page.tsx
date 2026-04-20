import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Package, MapPin, LogOut, Settings, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mi Cuenta' };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/cuenta');

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'En preparación',
    delivering: 'En camino', delivered: 'Entregado', cancelled: 'Cancelado',
  };
  const ORDER_STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800', delivering: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-black text-gray-900">
            Mi <span className="gradient-text">Cuenta</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Hola, <strong>{profile?.full_name || user.email}</strong>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: '/cuenta/pedidos', icon: Package, label: 'Mis Pedidos', color: 'bg-blue-50 text-blue-600' },
            { href: '/cuenta/direcciones', icon: MapPin, label: 'Mis Direcciones', color: 'bg-green-50 text-green-600' },
            { href: '/cuenta/perfil', icon: Settings, label: 'Mi Perfil', color: 'bg-purple-50 text-purple-600' },
            { href: '/api/auth/logout', icon: LogOut, label: 'Cerrar sesión', color: 'bg-red-50 text-red-600' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link
              key={label}
              href={href}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-0.5 group"
            >
              <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-gray-900">{label}</span>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-900">Pedidos recientes</h2>
            <Link href="/cuenta/pedidos" className="text-sm text-[#E8462A] font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!orders || orders.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No tienes pedidos aún</p>
              <Link href="/productos" className="text-[#E8462A] text-sm hover:underline mt-2 inline-block">
                Explorar productos →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(order.created_at))}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className="font-black text-[#E8462A] text-sm">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-[#E8462A]" /> Información de la cuenta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Correo electrónico</p>
              <p className="font-semibold text-gray-900">{user.email}</p>
            </div>
            {profile?.full_name && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Nombre</p>
                <p className="font-semibold text-gray-900">{profile.full_name}</p>
              </div>
            )}
            {profile?.phone && (
              <div>
                <p className="text-gray-400 text-xs mb-1">Teléfono</p>
                <p className="font-semibold text-gray-900">{profile.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
