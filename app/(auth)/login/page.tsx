'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/cuenta';
  const urlError = searchParams.get('error');
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUnverifiedEmail('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      if (authError.message.toLowerCase().includes('email not confirmed')) {
        setUnverifiedEmail(email);
      } else {
        setError(authError.message);
      }
    } else {
      showToast('¡Bienvenido de vuelta!', 'success');
      router.push(redirectTo);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-black text-gray-900 mb-1">Iniciar sesión</h1>
      <p className="text-gray-500 text-sm mb-6">Accede a tu cuenta MAPEX</p>

      {urlError === 'verification_failed' && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">El enlace de verificación no es válido o expiró. Intenta reenviar el correo.</p>
        </div>
      )}

      {unverifiedEmail && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-semibold">Correo no verificado</p>
          </div>
          <p className="text-xs text-amber-700 mb-3">
            Debes verificar tu correo antes de iniciar sesión.
          </p>
          <Link
            href={`/verificar-correo?email=${encodeURIComponent(unverifiedEmail)}`}
            className="text-xs font-semibold text-amber-800 underline hover:text-amber-900"
          >
            Ir a verificar mi correo →
          </Link>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          icon={<Mail className="h-4 w-4" />}
          required
        />
        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            error={error}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-end">
          <Link href="/recuperar-contrasena" className="text-xs text-[#E8462A] hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Iniciar sesión <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-[#E8462A] font-semibold hover:underline">
          Regístrate gratis
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo-mapex.png" alt="MAPEX" width={160} height={64} className="h-16 w-auto mx-auto object-contain" />
          </Link>
        </div>
        <Suspense fallback={<div className="bg-white rounded-3xl p-8 text-center text-gray-400">Cargando...</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-[#E8462A] transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
