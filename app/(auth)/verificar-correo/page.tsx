'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Mail, RefreshCw, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

function VerificarCorreoContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [cooldown, setCooldown] = useState(60);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setSending(true);
    setError('');
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (resendError) {
      setError('No pudimos reenviar el correo. Intenta de nuevo.');
    } else {
      setSent(true);
      setCooldown(60);
      setTimeout(() => setSent(false), 4000);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo-mapex.png" alt="MAPEX" width={160} height={64} className="h-16 w-auto mx-auto object-contain" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-[#E8462A]/10 flex items-center justify-center">
              <Mail className="h-9 w-9 text-[#E8462A]" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#F5A623] flex items-center justify-center">
              <span className="text-white text-xs font-black">!</span>
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">Revisa tu correo</h1>
          <p className="text-gray-500 text-sm mb-1">Te enviamos un enlace de verificación a:</p>
          {email && (
            <p className="font-semibold text-gray-900 text-sm mb-6 break-all">{email}</p>
          )}

          {/* Steps */}
          <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3 mb-6">
            {[
              { n: 1, text: 'Abre tu bandeja de entrada' },
              { n: 2, text: 'Busca un correo de MAPEX' },
              { n: 3, text: 'Haz clic en "Verificar correo"' },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-[#E8462A] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{n}</span>
                </div>
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>

          {/* Spam notice */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 text-left">
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Si no lo ves en unos minutos, revisa tu carpeta de <strong>spam o correo no deseado</strong>.
            </p>
          </div>

          {/* Resend */}
          {error && (
            <p className="text-sm text-red-500 mb-3">{error}</p>
          )}
          {sent && (
            <div className="flex items-center justify-center gap-2 text-green-600 text-sm mb-3">
              <CheckCircle className="h-4 w-4" />
              <span>¡Correo reenviado!</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={cooldown > 0 || sending}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 ${sending ? 'animate-spin' : ''}`} />
            {cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : sending
              ? 'Enviando...'
              : 'Reenviar correo de verificación'}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/login" className="hover:text-[#E8462A] transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerificarCorreoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center"><div className="h-8 w-8 border-2 border-[#E8462A] border-t-transparent rounded-full animate-spin" /></div>}>
      <VerificarCorreoContent />
    </Suspense>
  );
}
