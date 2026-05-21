'use client';

import { useState } from 'react';
import { ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { validarMatricula } from '@/lib/actions';

interface MatriculaStepProps {
  onSuccess: (matricula: string, nombre: string) => void;
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
      onSuccess(matricula, nombreCompleto);
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Bienvenido</h1>
            <p className="text-muted-foreground">
              Ingresa tu matrícula para comenzar
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Matrícula
            </label>
            <Input
              type="text"
              placeholder="Ej: 2024001"
              value={matricula}
              onChange={(e) => {
                setMatricula(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyPress={handleKeyPress}
              disabled={isValidating || isLoading}
              className="text-base"
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleValidate}
            disabled={!matricula.trim() || isValidating || isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Si no encuentras tu matrícula, contacta a administración
          </p>
        </div>
      </Card>
    </div>
  );
}
