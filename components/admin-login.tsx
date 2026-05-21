'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validarAdministrativo } from '@/lib/admin-actions';

interface AdminLoginProps {
  onSuccess: (username: string) => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [usuario, setUsuario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    try {
      const result = await validarAdministrativo(usuario);
      if (result.success && result.nombreCompleto) {
        onSuccess(result.nombreCompleto);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <Input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          disabled={isLoading}
          className={`h-11 text-base ${error ? 'border-red-400' : ''}`}
          autoComplete="off"
          autoFocus
        />
        <Button
          type="submit"
          disabled={isLoading || !usuario.trim()}
          className="w-full h-11 bg-[#1a3a5c] hover:bg-[#2d5a7b] text-white"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ingresar'}
        </Button>
      </form>
    </div>
  );
}
