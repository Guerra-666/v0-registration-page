'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Evento } from '@/lib/db';
import { getNombrePrograma } from '@/lib/programas';

interface ConfirmationStepProps {
  alumno: {
    nombre: string;
    programa: string;
    matricula: string;
  };
  eventosSeleccionados: Evento[];
  onNewRegistration: () => void;
}

export function ConfirmationStep({
  alumno,
  eventosSeleccionados,
}: ConfirmationStepProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-[#1a3a5c]/5 via-background to-[#2d5a7b]/5 py-4 sm:py-8 px-4 flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        <Card className="p-4 sm:p-8 shadow-xl border-t-4 border-t-[#1a3a5c]">
          <div className="text-center space-y-4 sm:space-y-6">

            {/* Success Icon */}
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-[#1a3a5c]" />
            </div>

            {/* Title */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3a5c]">
                Registro Exitoso
              </h1>
            </div>

            {/* Thank you message */}
            <Card className="p-4 sm:p-5 bg-[#1a3a5c] border-0">
              <p className="text-white text-sm sm:text-base font-medium leading-relaxed">
                Gracias por registrarte, tu coordinador le dara seguimiento a tu asistencia.
              </p>
            </Card>

            {/* Alumno Info */}
            <Card className="p-4 sm:p-5 bg-[#1a3a5c]/5 border-[#1a3a5c]/20 text-left space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Alumno:</span> {alumno.nombre}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Programa:</span>{' '}
                {getNombrePrograma(alumno.programa)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Matricula:</span> {alumno.matricula}
              </p>
            </Card>

            {/* Events Summary */}
            <div className="text-left space-y-2 sm:space-y-3">
              <h2 className="text-sm sm:text-base font-semibold text-[#1a3a5c]">
                Eventos registrados ({eventosSeleccionados.length})
              </h2>
              <div className="space-y-2 max-h-[35vh] overflow-y-auto">
                {eventosSeleccionados.map((evento, index) => (
                  <Card key={evento.id} className="p-3 border-l-4 border-l-[#1a3a5c]">
                    <div className="flex gap-3 items-start">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1a3a5c] text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-xs sm:text-sm leading-snug">
                          {evento.actividad}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                          {evento.hora}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
}
