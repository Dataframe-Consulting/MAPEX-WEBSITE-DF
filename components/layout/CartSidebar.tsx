'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingCart, Trash2, Plus, Minus, Package } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatCurrency, FREE_DELIVERY_THRESHOLD } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function CartSidebar() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    getSubtotal, getDeliveryFee, getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#E8462A]" />
            <h2 className="text-lg font-bold text-gray-900">
              Mi Carrito
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free delivery progress */}
        {remaining > 0 && items.length > 0 && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
            <p className="text-xs text-amber-700 mb-1.5">
              Agrega <strong>{formatCurrency(remaining)}</strong> más para envío gratis
            </p>
            <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {remaining === 0 && items.length > 0 && (
          <div className="px-6 py-2 bg-green-50 border-b border-green-100 text-center">
            <p className="text-xs text-green-700 font-medium">¡Envío gratis aplicado!</p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <Package className="h-16 w-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-1">Tu carrito está vacío</h3>
              <p className="text-sm text-gray-400 mb-6">Agrega productos para comenzar</p>
              <Button onClick={closeCart} variant="outline" asChild>
                <Link href="/productos">Ver productos</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variant_id} className="flex gap-3">
                {/* Image placeholder */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/productos/${item.slug}`}
                    onClick={closeCart}
                    className="text-sm font-semibold text-gray-900 hover:text-[#E8462A] truncate block"
                  >
                    {item.product_name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{item.variant_name}</p>
                  <p className="text-sm font-bold text-[#E8462A] mt-1">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                      className="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#E8462A] hover:text-[#E8462A] transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                      className="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#E8462A] hover:text-[#E8462A] transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.variant_id)}
                      className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === 0 ? 'Gratis' : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[#E8462A]">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              asChild
              onClick={closeCart}
            >
              <Link href="/checkout">Proceder al Pago</Link>
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="w-full text-gray-600"
              asChild
              onClick={closeCart}
            >
              <Link href="/carrito">Ver carrito completo</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
