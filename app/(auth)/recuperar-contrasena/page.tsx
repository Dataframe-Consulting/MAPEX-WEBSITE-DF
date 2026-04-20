'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function RecuperarForm() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/recuperar-contrasena?mode=update`,
    });
    if (err) setError('No pudimos enviar el correo. Verifica que sea correcto.');
    else setSent(true);
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError('Error al actualizar la contraseña. Intenta de nuevo.');
    else setUpdated(true);
    setLoading(false);
  };

  if (updated) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">¡Contraseña actualizada!</h2>
        <p className="text-gray-500 text-sm mb-6">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <Button variant="primary" asChild className="w-full">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-[#E8462A]/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-[#E8462A]" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Revisa tu correo</h2>
        <p className="text-gray-500 text-sm mb-6">
          Te enviamos un enlace para restablecer tu contraseña a <strong>{email}</strong>.
        </p>
        <p className="text-xs text-gray-400">¿No lo ves? Revisa tu carpeta de spam.</p>
      </div>
    );
  }

  if (mode === 'update') {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#E8462A]/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-[#E8462A]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Nueva contraseña</h1>
            <p className="text-gray-500 text-xs">Elige una contraseña segura</p>
          </div>
        </div>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="relative">
            <Input label="Nueva contraseña *" type={showPass ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres" value={password}
              onChange={e => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Input label="Confirmar contraseña *" type="password" placeholder="Repite la contraseña"
            value={confirm} onChange={e => setConfirm(e.target.value)} error={error} required />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Guardar contraseña
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-black text-gray-900 mb-1">¿Olvidaste tu contraseña?</h1>
      <p className="text-gray-500 text-sm mb-6">Te enviaremos un enlace para restablecerla.</p>
      <form onSubmit={handleRequest} className="space-y-4">
        <Input label="Correo electrónico" type="email" placeholder="correo@ejemplo.com"
          value={email} onChange={e => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />} error={error} required />
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Enviar enlace de recuperación
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="text-[#E8462A] font-semibold hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al login
        </Link>
      </p>
    </div>
  );
}

export default function RecuperarContrasenaPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><Image src="/logo-mapex.png" alt="MAPEX" width={160} height={64} className="h-16 w-auto mx-auto object-contain" /></Link>
        </div>
        <Suspense fallback={<div className="bg-white rounded-3xl p-8 text-center text-gray-400">Cargando...</div>}>
          <RecuperarForm />
        </Suspense>
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-[#E8462A] transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
