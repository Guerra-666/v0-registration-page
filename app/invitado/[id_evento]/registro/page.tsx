'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { obtenerEventoPorId, registrarAsistenciaExterno } from '@/lib/invitado-actions';

interface Evento {
  id: number;
  actividad: string;
  ponente: string;
  sede: string;
  hora: string;
  dia: string;
  clasificacion: string;
}

// Map dia number to readable format
function getDiaTexto(dia: string): string {
  if (dia === '1') return 'Jueves 28 de mayo';
  if (dia === '2') return 'Viernes 29 de mayo';
  if (dia === '3') return 'Sabado 30 de mayo';
  return dia;
}

export default function RegistroInvitadoPage() {
  const params = useParams();
  const idEvento = Number(params.id_evento);

  const [isLoading, setIsLoading] = useState(true);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [error404, setError404] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [esEgresado, setEsEgresado] = useState(false);
  const [matriculaEgresado, setMatriculaEgresado] = useState('');
  const [carreraEgresado, setCarreraEgresado] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);

  // Load event data
  useEffect(() => {
    async function loadEvento() {
      if (!idEvento || isNaN(idEvento)) {
        setError404(true);
        setIsLoading(false);
        return;
      }

      const result = await obtenerEventoPorId(idEvento);
      
      if (result.success && result.evento) {
        setEvento(result.evento);
      } else {
        setError404(true);
      }
      setIsLoading(false);
    }

    loadEvento();
  }, [idEvento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const result = await registrarAsistenciaExterno({
        evento_id: idEvento,
        nombre,
        correo,
        telefono,
        es_egresado: esEgresado,
        matricula_egresado: esEgresado ? matriculaEgresado : undefined,
        carrera_egresado: esEgresado ? carreraEgresado : undefined,
      });

      if (result.success) {
        console.log('[v0] Registro exitoso, mostrando pantalla de éxito');
        setRegistroExitoso(true);
      } else {
        console.log('[v0] Error en registro:', result.error);
        setSubmitError(result.error || 'Error al registrar');
      }
    } catch (err) {
      setSubmitError('Error inesperado al procesar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-[#1a3a5c] shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-BLANCO-ZJYsSidUIe6mzTHOqlPSn41svgcW5x.avif"
              alt="Congreso Multidisciplinario de Investigacion e Innovacion"
              width={280}
              height={60}
              className="object-contain h-12 sm:h-14 md:h-16 w-auto"
              priority
            />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // 404 Error
  if (error404) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-[#1a3a5c] shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-BLANCO-ZJYsSidUIe6mzTHOqlPSn41svgcW5x.avif"
              alt="Congreso Multidisciplinario de Investigacion e Innovacion"
              width={280}
              height={60}
              className="object-contain h-12 sm:h-14 md:h-16 w-auto"
              priority
            />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#1a3a5c]/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#1a3a5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Actividad no encontrada</h1>
            <p className="text-muted-foreground text-sm">
              El evento que buscas no existe o el enlace es incorrecto.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  // Success screen
  if (registroExitoso && evento) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-[#1a3a5c] shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-BLANCO-ZJYsSidUIe6mzTHOqlPSn41svgcW5x.avif"
              alt="Congreso Multidisciplinario de Investigacion e Innovacion"
              width={280}
              height={60}
              className="object-contain h-12 sm:h-14 md:h-16 w-auto"
              priority
            />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Asistencia Confirmada</h1>
              <p className="text-muted-foreground text-sm">
                Tu asistencia a <span className="font-medium text-[#1a3a5c]">{evento.actividad}</span> ha sido registrada exitosamente.
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Gracias por registrarte. Te esperamos.
              </p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-[#1a3a5c] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-BLANCO-ZJYsSidUIe6mzTHOqlPSn41svgcW5x.avif"
            alt="Congreso Multidisciplinario de Investigacion e Innovacion"
            width={280}
            height={60}
            className="object-contain h-12 sm:h-14 md:h-16 w-auto"
            priority
          />
        </div>
      </header>

      <main className="flex-1 py-6 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Event Info Card */}
          {evento && (
            <Card className="p-5 border-t-4 border-t-[#1a3a5c]">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-lg font-semibold text-[#1a3a5c] leading-tight flex-1">
                  {evento.actividad}
                </h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  evento.clasificacion?.toLowerCase().includes('destacad') || evento.clasificacion?.toLowerCase().includes('general')
                    ? 'bg-[#1a3a5c] text-white'
                    : 'bg-[#1a3a5c]/20 text-[#1a3a5c]'
                }`}>
                  {evento.clasificacion}
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1a3a5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {evento.ponente}
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1a3a5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {getDiaTexto(evento.dia)} | {evento.hora}
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1a3a5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {evento.sede}
                </p>
              </div>
            </Card>
          )}

          {/* Welcome text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Bienvenido a <span className="font-medium text-foreground">{evento?.actividad}</span>.
              <br />Ingresa tus datos para confirmar tu asistencia al momento.
            </p>
          </div>

          {/* Registration Form */}
          <Card className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="correo">Correo Electronico *</Label>
                <Input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telefono">Telefono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="10 digitos"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Egresado Switch */}
              <div className="flex items-center justify-between py-2 border-t border-b">
                <Label htmlFor="egresado" className="cursor-pointer">
                  ¿Eres egresado del CUH?
                </Label>
                <Switch
                  id="egresado"
                  checked={esEgresado}
                  onCheckedChange={setEsEgresado}
                  disabled={isSubmitting}
                />
              </div>

              {/* Campos de egresado con transicion */}
              <div
                className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${
                  esEgresado ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="matricula_egresado">Matricula de Egresado</Label>
                  <Input
                    id="matricula_egresado"
                    type="text"
                    value={matriculaEgresado}
                    onChange={(e) => setMatriculaEgresado(e.target.value)}
                    placeholder="Opcional"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="carrera_egresado">Carrera de la que egresaste *</Label>
                  <Input
                    id="carrera_egresado"
                    type="text"
                    value={carreraEgresado}
                    onChange={(e) => setCarreraEgresado(e.target.value)}
                    placeholder="Ej: Ingenieria en Sistemas"
                    required={esEgresado}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Error message */}
              {submitError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-11 bg-[#1a3a5c] hover:bg-[#152d47] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Registrando...
                  </span>
                ) : (
                  'Confirmar Asistencia'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
