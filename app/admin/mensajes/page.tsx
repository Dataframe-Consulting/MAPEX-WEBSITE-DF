import { createClient } from '@/lib/supabase/server';
import { MessageSquare, Mail, Phone, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mensajes de contacto' };

export default async function MensajesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Mensajes de contacto</h1>
        <p className="text-gray-500 mt-1">{messages?.length || 0} mensajes recibidos</p>
      </div>

      <div className="space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No hay mensajes aún.</p>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg.id} className={`bg-white rounded-2xl border p-5 ${!msg.read ? 'border-[#E8462A] bg-red-50/30' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-gray-900">{msg.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <a href={`mailto:${msg.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#E8462A]">
                      <Mail className="h-3 w-3" /> {msg.email}
                    </a>
                    {msg.phone && (
                      <a href={`tel:${msg.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#E8462A]">
                        <Phone className="h-3 w-3" /> {msg.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!msg.read && <span className="text-xs font-bold bg-[#E8462A] text-white px-2 py-0.5 rounded-full">Nuevo</span>}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(msg.created_at))}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
