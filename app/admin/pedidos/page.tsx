'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  async function loadOrders() {
    const supabase = createClient();
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(id, product_name, variant_name, quantity, unit_price, total),
        address:addresses(full_name, phone, street, colonia, city, state, zip, references)
      `)
      .order('created_at', { ascending: false });

    if (filterStatus) query = query.eq('status', filterStatus);
    const { data } = await query;
    setOrders((data as Order[]) || []);
    setLoading(false);
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const supabase = createClient();
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showToast(`Pedido actualizado a: ${ORDER_STATUS_LABELS[status]}`, 'success');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Pedidos</h1>
          <p className="text-gray-500">{orders.length} pedidos</p>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-10 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] bg-white">
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-2 border-[#E8462A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">No hay pedidos {filterStatus ? `con estado "${ORDER_STATUS_LABELS[filterStatus as OrderStatus]}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Order header */}
              <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-black text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-500">
                    {(order.address as any)?.full_name || '—'} · {(order.address as any)?.phone || '—'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-[#E8462A]">{formatCurrency(order.total)}</span>

                  {/* Status selector */}
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-bold border-0 focus:outline-none focus:ring-2 focus:ring-[#E8462A] cursor-pointer ${ORDER_STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                  </div>

                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 animate-slide-down">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Productos</p>
                      <div className="space-y-2">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div>
                              <p className="font-semibold text-gray-900">{item.product_name}</p>
                              <p className="text-xs text-gray-400">{item.variant_name} × {item.quantity}</p>
                            </div>
                            <span className="font-semibold">{formatCurrency(item.total)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Envío</span>
                          <span>{order.delivery_fee === 0 ? 'Gratis' : formatCurrency(order.delivery_fee)}</span>
                        </div>
                        <div className="flex justify-between font-black">
                          <span>Total</span><span className="text-[#E8462A]">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Dirección de entrega</p>
                      {order.address ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-bold text-gray-900">{(order.address as any).full_name}</p>
                          <p>{(order.address as any).phone}</p>
                          <p>{(order.address as any).street}</p>
                          <p>{(order.address as any).colonia}, {(order.address as any).city}, {(order.address as any).state}</p>
                          {(order.address as any).references && (
                            <p className="text-xs text-gray-400 italic">Ref: {(order.address as any).references}</p>
                          )}
                        </div>
                      ) : <p className="text-sm text-gray-400">Sin dirección registrada</p>}

                      {order.notes && (
                        <div className="mt-4">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Notas</p>
                          <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
