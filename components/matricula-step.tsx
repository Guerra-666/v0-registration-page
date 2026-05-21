'use client';

import { useState } from 'react';
import { ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { validarMatricula } from '@/lib/actions';

interface MatriculaStepProps {
  onSuccess: (matricula: string, nombre: string, programa: string) => void;
  isLoading: boolean;
}

export function MatriculaStep({ onSuccess, isLoading }: MatriculaStepProps) {
  const [matricula, setMatricula] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    setError('');
    setIsValidating(true);

    const result = await validarMatricula(matricula);

    if (result.success && result.alumno) {
      const nombreCompleto = `${result.alumno.nombre} ${result.alumno.paterno} ${result.alumno.materno}`.trim();
      onSuccess(matricula, nombreCompleto, result.alumno.programa || '');
    } else {
      setError(result.error || 'Error al validar matrícula');
    }

    setIsValidating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      handleValidate();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#1a3a5c]/5 via-background to-[#2d5a7b]/5">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl border-t-4 border-t-[#1a3a5c]">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3a5c]">Bienvenido</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Ingresa tu matrícula para comenzar
            </p>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1a3a5c]">
              Matrícula
            </label>
            <Input
              type="text"
              placeholder="Ingresa tu matrícula"
              value={matricula}
              onChange={(e) => {
                setMatricula(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyPress={handleKeyPress}
              disabled={isValidating || isLoading}
              className="text-base h-12 border-[#1a3a5c]/20 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]"
            />
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Button */}
          <Button
            onClick={handleValidate}
            disabled={!matricula.trim() || isValidating || isLoading}
            className="w-full h-12 bg-[#1a3a5c] hover:bg-[#2d5a7b] text-white text-base font-medium"
            size="lg"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                Continuar
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground">
            Si no encuentras tu matrícula, contacta a Sistemas
          </p>
        </div>
      </Card>
    </div>
  );
}
