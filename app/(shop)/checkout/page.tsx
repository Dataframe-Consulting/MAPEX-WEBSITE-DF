'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, CreditCard, Package, CheckCircle, Truck, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AddressForm {
  full_name: string;
  phone: string;
  street: string;
  colonia: string;
  city: string;
  state: string;
  zip: string;
  address_notes: string;
}

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Efectivo contra entrega', icon: '💵', desc: 'Paga cuando recibas tu pedido' },
  { id: 'transfer', label: 'Transferencia bancaria', icon: '🏦', desc: 'Te enviaremos los datos por WhatsApp' },
  { id: 'card', label: 'Tarjeta de crédito / débito', icon: '💳', desc: 'Pago seguro con Stripe' },
];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#1C1C2E',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#E8462A' },
  },
};

function StripeCardForm({ total, onSuccess }: { total: number; onSuccess: (intentId: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total }),
    });
    const { clientSecret, error: apiError } = await res.json();
    if (apiError) { setError(apiError); setLoading(false); return; }

    const cardEl = elements.getElement(CardElement);
    if (!cardEl) { setLoading(false); return; }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardEl },
    });

    if (stripeError) {
      setError(stripeError.message || 'Error al procesar el pago');
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Lock className="h-3.5 w-3.5" />
        <span>Pago cifrado y seguro con Stripe</span>
      </div>
      <Button variant="primary" size="xl" className="w-full" onClick={handlePay} loading={loading} disabled={!stripe}>
        Pagar {formatCurrency(total)}
      </Button>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const { showToast } = useToast();
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState<AddressForm>({
    full_name: '', phone: '', street: '', colonia: '',
    city: 'Hermosillo', state: 'Sonora', zip: '', address_notes: '',
  });

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const createOrder = async (paymentIntentId?: string) => {
    const supabase = createClient();

    const { data: address } = await supabase.from('addresses').insert({
      user_id: null,
      full_name: form.full_name,
      phone: form.phone,
      street: form.street,
      colonia: form.colonia,
      city: form.city,
      state: form.state,
      zip: form.zip,
      address_notes: form.address_notes || null,
    }).select().single();

    const orderNotes = [
      `Método de pago: ${paymentMethod}`,
      paymentIntentId ? `Stripe ID: ${paymentIntentId}` : '',
      notes,
    ].filter(Boolean).join('. ');

    const { data: order } = await supabase.from('orders').insert({
      user_id: null,
      status: 'pending',
      subtotal,
      delivery_fee: deliveryFee,
      total,
      address_id: address?.id,
      notes: orderNotes,
    }).select().single();

    if (order) {
      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: order.id,
          product_name: item.product_name,
          variant_name: item.variant_name,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.price * item.quantity,
        }))
      );
      setOrderId(order.id.slice(0, 8).toUpperCase());
      clearCart();
      setStep('success');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      await createOrder();
    } catch {
      showToast('Hubo un error al procesar tu pedido. Intenta de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
        <Package className="h-16 w-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-400 mb-2">Tu carrito está vacío</h2>
        <Button variant="primary" asChild><Link href="/productos">Ver catálogo</Link></Button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">¡Pedido confirmado!</h2>
          <p className="text-gray-500 mb-4">
            Tu pedido <strong>#{orderId}</strong> ha sido recibido. Te contactaremos pronto para confirmar la entrega.
          </p>
          <div className="bg-[#F8F8F8] rounded-2xl p-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-[#E8462A]" />
              <p className="font-semibold">Entrega estimada: 24-48 horas</p>
            </div>
            <p>Recibirás una llamada de confirmación al número que proporcionaste.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="primary" asChild><Link href="/cuenta/pedidos">Ver mis pedidos</Link></Button>
            <Button variant="ghost" asChild><Link href="/productos">Seguir comprando</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/carrito" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E8462A] mb-3">
            <ArrowLeft className="h-4 w-4" /> Volver al carrito
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Finalizar Compra</h1>
          <div className="flex items-center gap-3 mt-4">
            {(['address', 'payment'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 text-sm font-semibold ${step === s ? 'text-[#E8462A]' : step === 'payment' && s === 'address' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-[#E8462A] text-white' : step === 'payment' && s === 'address' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {step === 'payment' && s === 'address' ? '✓' : i + 1}
                  </div>
                  {s === 'address' ? 'Dirección' : 'Pago'}
                </div>
                {i < 1 && <div className="h-px w-8 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === 'address' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#E8462A]" /> Dirección de entrega
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nombre completo *" placeholder="Juan Pérez" value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
                  <Input label="Teléfono *" type="tel" placeholder="(662) 000-0000" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                </div>
                <Input label="Calle y número *" placeholder="Ej: Av. Rosales #456, Int. 3" value={form.street}
                  onChange={e => setForm(p => ({ ...p, street: e.target.value }))} required />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Colonia *" placeholder="Ej: Centro" value={form.colonia}
                    onChange={e => setForm(p => ({ ...p, colonia: e.target.value }))} required />
                  <Input label="Ciudad *" value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
                  <Input label="C.P. *" placeholder="83000" value={form.zip}
                    onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Referencias (opcional)</label>
                  <textarea rows={2} placeholder="Ej: Casa color azul, portón negro, entre calles..."
                    value={form.address_notes} onChange={e => setForm(p => ({ ...p, address_notes: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] resize-none" />
                </div>
              </div>
              <Button variant="primary" size="lg" className="mt-6 w-full"
                onClick={() => setStep('payment')}
                disabled={!form.full_name || !form.phone || !form.street || !form.colonia || !form.zip}>
                Continuar al pago
              </Button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-5">
              <button onClick={() => setStep('address')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#E8462A]">
                <ArrowLeft className="h-4 w-4" /> Editar dirección
              </button>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-[#E8462A]" />
                  <p className="text-sm font-bold text-gray-900">Entrega en:</p>
                </div>
                <p className="text-sm text-gray-600">
                  {form.full_name} · {form.phone}<br />
                  {form.street}, {form.colonia}, {form.city}, {form.state}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#E8462A]" /> Método de pago
                </h2>
                <div className="space-y-3 mb-5">
                  {PAYMENT_METHODS.map(method => (
                    <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-[#E8462A] bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)} className="accent-[#E8462A]" />
                      <span className="text-xl">{method.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'transfer' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-sm">
                    <p className="font-bold text-blue-900 mb-1">Datos bancarios:</p>
                    <p className="text-blue-800">Banco: BBVA</p>
                    <p className="text-blue-800">CLABE: 012345678901234567</p>
                    <p className="text-blue-800">Beneficiario: MAPEX Pinturas</p>
                    <p className="text-xs text-blue-600 mt-2">Envía tu comprobante por WhatsApp al (662) 123-4567</p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <Elements stripe={stripePromise}>
                    <StripeCardForm total={total} onSuccess={async (intentId) => {
                      try {
                        await createOrder(intentId);
                      } catch {
                        showToast('Error al crear el pedido. Contacta soporte.', 'error');
                      }
                    }} />
                  </Elements>
                )}
              </div>

              {paymentMethod !== 'card' && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Notas adicionales (opcional)</label>
                    <textarea rows={3} placeholder="Instrucciones especiales para tu pedido..."
                      value={notes} onChange={e => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8462A] resize-none" />
                  </div>
                  <Button variant="primary" size="xl" className="w-full" onClick={handlePlaceOrder} loading={loading}>
                    Confirmar pedido — {formatCurrency(total)}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Al confirmar aceptas nuestros <Link href="/terminos" className="underline hover:text-[#E8462A]">términos y condiciones</Link>.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <h3 className="font-black text-gray-900 mb-4">Tu pedido</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.variant_id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-36">{item.product_name}</p>
                    <p className="text-gray-400 text-xs">{item.variant_name} × {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-900 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                  {deliveryFee === 0 ? 'Gratis' : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-black text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[#E8462A]">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              <span>Compra 100% segura</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <CheckoutContent />;
}
