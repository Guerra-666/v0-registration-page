'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MatriculaStep } from '@/components/matricula-step';
import { EventosStep } from '@/components/eventos-step';
import { ConfirmationStep } from '@/components/confirmation-step';
import { Toast } from '@/components/toast';
import { obtenerEventos, registrarInscripciones, validarMatricula } from '@/lib/actions';
import { getNombrePrograma } from '@/lib/programas';
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
    nombre: string,
    programa: string
  ) => {
    setIsLoading(true);
    try {
      const eventosData = await obtenerEventos();
      setEventos(eventosData);

      setAlumno({
        matricula,
        nombre,
        programa: getNombrePrograma(programa),
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

      const selected = eventos.filter((e) => selectedIds.includes(e.id));
      setEventosSeleccionados(selected);

      setStep('confirmacion');
      setToast({
        message: 'Registro completado exitosamente',
        type: 'success',
      });
    } catch (error: any) {
      setToast({
        message: error?.message || 'Error al registrar inscripciones',
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Premium Clean Design */}
      <header className="bg-[#1a3a5c] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-BLANCO-ZJYsSidUIe6mzTHOqlPSn41svgcW5x.avif"
            alt="Congreso Multidisciplinario de Investigación e Innovación"
            width={280}
            height={60}
            className="object-contain h-12 sm:h-14 md:h-16 w-auto"
            priority
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
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
