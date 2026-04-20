import { createClient } from '@/lib/supabase/server';
import { ShoppingBag, Package, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard | MAPEX' };

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('id, status, total, created_at, user_id').order('created_at', { ascending: false }).limit(8),
  ]);

  const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'En preparación',
    delivering: 'En camino', delivered: 'Entregado', cancelled: 'Cancelado',
  };
  const ORDER_STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800', delivering: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
  };

  const stats = [
    { label: 'Total Pedidos', value: totalOrders ?? 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', href: '/admin/pedidos' },
    { label: 'Pedidos Pendientes', value: pendingOrders ?? 0, icon: Clock, color: 'bg-yellow-50 text-yellow-600', href: '/admin/pedidos?status=pending' },
    { label: 'Productos Activos', value: totalProducts ?? 0, icon: Package, color: 'bg-green-50 text-green-600', href: '/admin/productos' },
    { label: 'Clientes', value: totalCustomers ?? 0, icon: Users, color: 'bg-purple-50 text-purple-600', href: '/admin/clientes' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          {new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-gray-300" />
            </div>
            <p className="text-3xl font-black text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-black text-gray-900">Pedidos Recientes</h2>
            <Link href="/admin/pedidos" className="text-sm text-[#E8462A] hover:underline">Ver todos</Link>
          </div>
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">No hay pedidos aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">
                      {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(order.created_at))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className="font-black text-gray-900 text-sm">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-black text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="space-y-3">
            {[
              { href: '/admin/productos/nuevo', label: 'Agregar producto', icon: Package, color: 'text-green-600 bg-green-50' },
              { href: '/admin/pedidos?status=pending', label: 'Ver pendientes', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
              { href: '/admin/pedidos?status=delivering', label: 'En camino', icon: ShoppingBag, color: 'text-purple-600 bg-purple-50' },
              { href: '/admin/clientes', label: 'Ver clientes', icon: Users, color: 'text-blue-600 bg-blue-50' },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-semibold text-gray-900">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
