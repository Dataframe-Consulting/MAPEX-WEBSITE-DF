'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatCurrency, FREE_DELIVERY_THRESHOLD } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getDeliveryFee, getTotal } = useCartStore();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-black text-gray-900">
            Mi <span className="gradient-text">Carrito</span>
          </h1>
          {items.length > 0 && (
            <p className="text-gray-500 mt-1">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingCart className="h-20 w-20 text-gray-200 mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-400 mb-8">Explora nuestro catálogo y agrega los productos que necesitas</p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/productos">Ver catálogo <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free delivery banner */}
              {remaining > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="h-5 w-5 text-amber-600" />
                    <p className="text-sm text-amber-700 font-medium">
                      Agrega <strong>{formatCurrency(remaining)}</strong> más para obtener envío gratis
                    </p>
                  </div>
                  <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-700 font-bold">¡Envío gratis aplicado en tu pedido!</p>
                </div>
              )}

              {items.map((item) => (
                <div key={item.variant_id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.product_name} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/productos/${item.slug}`} className="font-bold text-gray-900 hover:text-[#E8462A] transition-colors">
                          {item.product_name}
                        </Link>
                        <p className="text-sm text-gray-500">{item.variant_name}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variant_id)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="h-8 w-8 flex items-center justify-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#E8462A]">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(item.price)} c/u</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                <h3 className="text-lg font-black text-gray-900 mb-5">Resumen del pedido</h3>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : 'text-gray-900'}>
                      {deliveryFee === 0 ? 'Gratis' : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-lg">
                    <span>Total</span>
                    <span className="text-[#E8462A]">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button variant="primary" size="lg" className="w-full mb-3" asChild>
                  <Link href="/checkout">
                    Proceder al pago <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="md" className="w-full text-gray-500" asChild>
                  <Link href="/productos">Seguir comprando</Link>
                </Button>

                <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                  {['Pago 100% seguro', 'Productos originales garantizados', 'Envío en 24-48 horas'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
