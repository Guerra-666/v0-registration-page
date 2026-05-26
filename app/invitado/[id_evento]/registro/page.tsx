'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { obtenerEventoPorId, registrarAsistenciaExterno, registrarAsistenciaAlumno } from '@/lib/invitado-actions';

const CARRERAS_CUH = [
  { grupo: 'Licenciaturas', opciones: [
    'Licenciatura en Derecho',
    'Licenciatura en Administracion y Sistemas Computacionales',
    'Licenciatura en Ciencias de la Educacion',
    'Licenciatura en Contaduria y Sistemas Fiscales',
    'Licenciatura en Ingenieria en Sistemas Computacionales',
    'Licenciatura en Psicologia',
  ]},
  { grupo: 'Maestrias', opciones: [
    'Maestria en Administracion de Negocios',
    'Maestria en Derecho Civil',
    'Maestria en Derecho Procesal Penal Acusatorio',
    'Maestria en Estrategias de Intervencion en Problemas de Aprendizaje',
    'Maestria en Formacion Docente',
    'Maestria en Finanzas',
  ]},
];

interface Evento {
  id: number;
  actividad: string;
  ponente: string;
  sede: string;
  hora: string;
  dia: string;
  clasificacion: string;
}

function getDiaTexto(dia: string): string {
  if (dia === '1') return 'Jueves 28 de mayo';
  if (dia === '2') return 'Viernes 29 de mayo';
  if (dia === '3') return 'Sabado 30 de mayo';
  return dia;
}

type TipoUsuario = null | 'alumno' | 'otro';

export default function RegistroInvitadoPage() {
  const params = useParams();
  const idEvento = Number(params.id_evento);

  const [isLoading, setIsLoading] = useState(true);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [error404, setError404] = useState(false);

  // Tipo de usuario seleccionado
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(null);

  // Alumno form state
  const [matricula, setMatricula] = useState('');
  const [alumnoNombre, setAlumnoNombre] = useState('');

  // Externo form state
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [esEgresado, setEsEgresado] = useState(false);
  const [matriculaEgresado, setMatriculaEgresado] = useState('');
  const [carreraEgresado, setCarreraEgresado] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);

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

  const handleAlumnoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const result = await registrarAsistenciaAlumno({
        evento_id: idEvento,
        matricula: matricula.toUpperCase(),
      });

      if (result.success && result.alumno) {
        setAlumnoNombre(result.alumno.nombre);
        setRegistroExitoso(true);
      } else {
        setSubmitError(result.error || 'Error al registrar');
      }
    } catch {
      setSubmitError('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const result = await registrarAsistenciaExterno({
        evento_id: idEvento,
        nombre,
        correo: correo || undefined,
        telefono: telefono || undefined,
        es_egresado: esEgresado,
        matricula_egresado: esEgresado ? matriculaEgresado : undefined,
        carrera_egresado: esEgresado ? carreraEgresado : undefined,
      });

      if (result.success) {
        setRegistroExitoso(true);
      } else {
        setSubmitError(result.error || 'Error al registrar');
      }
    } catch {
      setSubmitError('Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Header component
  const Header = () => (
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
  );

  // Event Info Card component
  const EventoCard = () => evento && (
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
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
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
        <Header />
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
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Asistencia Confirmada</h1>
              {alumnoNombre && (
                <p className="text-[#1a3a5c] font-medium">{alumnoNombre}</p>
              )}
              <p className="text-muted-foreground text-sm">
                Tu asistencia a <span className="font-medium text-[#1a3a5c]">{evento.actividad}</span> ha sido registrada.
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

  // Main content - Type selection
  if (!tipoUsuario) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 py-6 px-4">
          <div className="max-w-lg mx-auto space-y-6">
            <EventoCard />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Selecciona una opcion para confirmar tu asistencia
              </p>
            </div>

            <div className="grid gap-4">
              <Card 
                className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-[#1a3a5c]"
                onClick={() => setTipoUsuario('alumno')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1a3a5c] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a3a5c]">Alumno Activo CUH</h3>
                    <p className="text-sm text-muted-foreground">Tengo matricula vigente</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-[#2d5a7b]"
                onClick={() => setTipoUsuario('otro')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2d5a7b] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2d5a7b]">Otro</h3>
                    <p className="text-sm text-muted-foreground">Egresado CUH, Docente, Externo, etc.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Alumno form
  if (tipoUsuario === 'alumno') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 py-6 px-4">
          <div className="max-w-lg mx-auto space-y-6">
            <EventoCard />

            <Card className="p-5">
              <form onSubmit={handleAlumnoSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="font-semibold text-[#1a3a5c]">Alumno Activo CUH</h2>
                  <p className="text-sm text-muted-foreground">Ingresa tu matricula para confirmar asistencia</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="matricula">Matricula</Label>
                  <Input
                    id="matricula"
                    type="text"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                    placeholder="Ej: CUH12345678"
                    required
                    disabled={isSubmitting}
                    className="text-center text-lg"
                  />
                </div>

                {submitError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setTipoUsuario(null);
                      setSubmitError('');
                      setMatricula('');
                    }}
                    disabled={isSubmitting}
                  >
                    Volver
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#1a3a5c] hover:bg-[#152d47] text-white"
                    disabled={isSubmitting || !matricula.trim()}
                  >
                    {isSubmitting ? 'Registrando...' : 'Confirmar'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Externo/Otro form
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-6 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          <EventoCard />

          <Card className="p-5">
            <form onSubmit={handleExternoSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="font-semibold text-[#2d5a7b]">Registro de Asistencia</h2>
                <p className="text-sm text-muted-foreground">Completa tus datos</p>
              </div>

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
                <Label htmlFor="correo">Correo Electronico</Label>
                <Input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com (Opcional)"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="10 digitos (Opcional)"
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

              {/* Carrera egresado con transicion */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  esEgresado ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-2.5 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="matricula_egresado">Matricula de Egresado *</Label>
                    <Input
                      id="matricula_egresado"
                      type="text"
                      value={matriculaEgresado}
                      onChange={(e) => setMatriculaEgresado(e.target.value.toUpperCase())}
                      placeholder="Tu matricula"
                      disabled={isSubmitting}
                      className="text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="carrera_egresado">Carrera de la que egresaste *</Label>
                    <select
                      id="carrera_egresado"
                      value={carreraEgresado}
                      onChange={(e) => setCarreraEgresado(e.target.value)}
                      disabled={isSubmitting}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Selecciona tu carrera</option>
                      {CARRERAS_CUH.map((grupo) => (
                        <optgroup key={grupo.grupo} label={grupo.grupo}>
                          {grupo.opciones.map((carrera) => (
                            <option key={carrera} value={carrera}>{carrera}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setTipoUsuario(null);
                    setSubmitError('');
                    setNombre('');
                    setCorreo('');
                    setTelefono('');
                    setEsEgresado(false);
                    setMatriculaEgresado('');
                    setCarreraEgresado('');
                  }}
                  disabled={isSubmitting}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#2d5a7b] hover:bg-[#1a3a5c] text-white"
                  disabled={isSubmitting || !nombre.trim()}
                >
                  {isSubmitting ? 'Registrando...' : 'Confirmar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
