import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mis Pedidos' };

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock, confirmed: Package, preparing: Package,
  delivering: Truck, delivered: CheckCircle, cancelled: XCircle,
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/cuenta/pedidos');

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      address:addresses(street, colonia, city),
      items:order_items(id, product_name, variant_name, quantity, unit_price, total)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/cuenta" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E8462A] mb-3">
            <ArrowLeft className="h-4 w-4" /> Mi cuenta
          </Link>
          <h1 className="text-3xl font-black text-gray-900">Mis Pedidos</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100">
            <Package className="h-16 w-16 text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">No tienes pedidos</h2>
            <p className="text-gray-400 mb-6 text-sm">Realiza tu primer compra y aparecerá aquí</p>
            <Link href="/productos" className="inline-flex items-center gap-2 bg-[#E8462A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#c73820] transition-colors">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {(orders as Order[]).map((order) => {
              const StatusIcon = STATUS_ICONS[order.status] || Package;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {/* Order header */}
                  <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <StatusIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">
                          {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(order.created_at))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <span className="font-black text-[#E8462A]">
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="px-6 py-4">
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{item.product_name}</p>
                            <p className="text-gray-400 text-xs">{item.variant_name} × {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-gray-900">${Number(item.total).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery info */}
                    {order.address && (
                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500">
                        <Truck className="h-3.5 w-3.5" />
                        <span>
                          {(order.address as any).street}, {(order.address as any).colonia}, {(order.address as any).city}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <div className="space-x-3">
                      <span>Subtotal: ${Number(order.subtotal).toFixed(2)}</span>
                      <span>Envío: {order.delivery_fee === 0 ? 'Gratis' : `$${Number(order.delivery_fee).toFixed(2)}`}</span>
                    </div>
                    {order.status === 'pending' && (
                      <span className="text-orange-600 font-medium">Esperando confirmación</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
