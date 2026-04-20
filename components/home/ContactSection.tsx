'use client';

import { useState } from 'react';
import { MapPin, Phone, Clock, Mail, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      phone: form.phone || null,
      email: form.email,
      message: form.message,
    });
    if (error) {
      alert('Hubo un error al enviar el mensaje. Intenta de nuevo.');
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <section id="contacto" className="py-20 bg-[#1C1C2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Contáctanos
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            ¿Tienes preguntas sobre algún producto? ¿Necesitas asesoría de color?
            Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#E8462A] flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Ubicación</h4>
                <p className="text-gray-400 text-sm">
                  Nayarit #116 Int. 2, esquina con Reyes<br />
                  Hermosillo, Sonora, México
                </p>
                <a
                  href="https://maps.google.com/?q=Nayarit+116+Hermosillo+Sonora"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F5A623] text-xs hover:underline mt-1 inline-block"
                >
                  Ver en Google Maps →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#E8462A] flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Teléfono</h4>
                <a href="tel:+526621234567" className="text-gray-400 text-sm hover:text-[#F5A623] transition-colors">
                  (662) 123-4567
                </a>
                <div className="mt-2">
                  <a
                    href="https://wa.me/526621234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#E8462A] flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Correo</h4>
                <a href="mailto:contacto@mapex.mx" className="text-gray-400 text-sm hover:text-[#F5A623] transition-colors">
                  contacto@mapex.mx
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#E8462A] flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Horarios</h4>
                <div className="text-gray-400 text-sm space-y-1">
                  <p>Lunes – Viernes: 8:00am – 6:00pm</p>
                  <p>Sábado: 8:00am – 2:00pm</p>
                  <p className="text-gray-500">Domingo: Cerrado</p>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            {/*
              MAPA EMBEBIDO
              Inserta aquí el iframe de Google Maps con la ubicación de MAPEX:
              Nayarit #116 Int. 2, esq. con Reyes, Hermosillo, Sonora
              <iframe src="https://www.google.com/maps/embed?..." />
            */}
            <div className="h-48 rounded-2xl bg-gray-700 border-2 border-dashed border-gray-600 flex items-center justify-center mt-4">
              <div className="text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">Mapa Google Maps</p>
                <p className="text-xs mt-1">Nayarit #116 Int. 2, Hermosillo</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h3>

            {sent ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">¡Mensaje enviado!</h4>
                <p className="text-gray-500 text-sm">
                  Te contactaremos a la brevedad. Gracias por contactar a MAPEX.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Teléfono"
                    type="tel"
                    placeholder="(662) 000-0000"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  />
                  <Input
                    label="Correo electrónico"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    placeholder="¿En qué podemos ayudarte? Cuéntanos sobre tu proyecto..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#E8462A] focus:border-transparent placeholder:text-gray-400"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                  <Send className="h-4 w-4" />
                  Enviar mensaje
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
