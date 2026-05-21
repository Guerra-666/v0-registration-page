'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { validarAdministrativo } from '@/lib/admin-actions';

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [usuario, setUsuario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await validarAdministrativo(usuario);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Usuario no autorizado');
      }
    } catch {
      setError('Error al validar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a5c] to-[#2d5a7b] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#1a3a5c] p-3 rounded-xl">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-BLANCO-ZJYsSidUIe6mzTHOqlPSn41svgcW5x.avif"
                alt="Congreso Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Panel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Congreso COMIIN 2024
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="usuario" className="text-sm font-medium text-foreground">
              Usuario
            </label>
            <Input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="usuario.nombre"
              disabled={isLoading}
              className="h-12 text-base border-2 focus:border-[#1a3a5c]"
              autoComplete="username"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !usuario.trim()}
            className="w-full h-12 bg-[#1a3a5c] hover:bg-[#2d5a7b] text-white text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Ingresar
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Acceso exclusivo para personal administrativo
        </p>
      </Card>
    </div>
  );
}
