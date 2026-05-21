'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MatriculaStep } from '@/components/matricula-step';
import { EventosStep } from '@/components/eventos-step';
import { ConfirmationStep } from '@/components/confirmation-step';
import { Toast } from '@/components/toast';
import { obtenerEventos, registrarInscripciones } from '@/lib/actions';
import { Evento } from '@/lib/db';

type Step = 'matricula' | 'eventos' | 'confirmacion';

interface AlumnoState {
  matricula: string;
  nombre: string;
  programa: string;
}

export default function RegistroPage() {
  const [step, setStep] = useState<Step>('matricula');
  const [alumno, setAlumno] = useState<AlumnoState | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventosSeleccionados, setEventosSeleccionados] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleMatriculaSuccess = async (
    matricula: string,
    nombre: string
  ) => {
    setIsLoading(true);
    try {
      const eventosData = await obtenerEventos();
      setEventos(eventosData);

      // Extract programa from nombre para demo (ideally esto vendría de la BD)
      setAlumno({
        matricula,
        nombre,
        programa: 'Ingeniería Informática', // Este sería parte del alumno data
      });

      setStep('eventos');
    } catch (error) {
      setToast({
        message: 'Error al cargar eventos',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventosSuccess = async (selectedIds: number[]) => {
    setIsLoading(true);
    try {
      if (!alumno) {
        throw new Error('Alumno no definido');
      }

      await registrarInscripciones(alumno.matricula, selectedIds);

      // Get full evento objects for confirmation
      const selected = eventos.filter((e) => selectedIds.includes(e.id));
      setEventosSeleccionados(selected);

      setStep('confirmacion');
      setToast({
        message: 'Registro completado exitosamente',
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        message:
          error?.message ||
          'Error al registrar inscripciones',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRegistration = () => {
    setStep('matricula');
    setAlumno(null);
    setEventos([]);
    setEventosSeleccionados([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-primary-foreground rounded-lg p-1">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-BLANCO-ZJYsSidUIe6mzTHOqlPSn41svgcW5x.avif"
                alt="Congreso Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">Congreso COMIIN</h1>
              <p className="text-xs opacity-90">
                Multidisciplinario de Investigación e Innovación
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">28 - 30 de Mayo 2024</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {step === 'matricula' && (
          <MatriculaStep onSuccess={handleMatriculaSuccess} isLoading={isLoading} />
        )}

        {step === 'eventos' && alumno && (
          <EventosStep
            alumno={{
              nombre: alumno.nombre,
              programa: alumno.programa,
              matricula: alumno.matricula,
            }}
            eventos={eventos}
            onSuccess={handleEventosSuccess}
            isLoading={isLoading}
          />
        )}

        {step === 'confirmacion' && alumno && (
          <ConfirmationStep
            alumno={{
              nombre: alumno.nombre,
              programa: alumno.programa,
              matricula: alumno.matricula,
            }}
            eventosSeleccionados={eventosSeleccionados}
            onNewRegistration={handleNewRegistration}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
