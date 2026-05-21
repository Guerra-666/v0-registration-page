'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Download, RotateCcw } from 'lucide-react';
import { Evento } from '@/lib/db';

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
  onNewRegistration,
}: ConfirmationStepProps) {
  const handleDownloadReceipt = () => {
    const receiptText = `
CONFIRMACION DE REGISTRO
Congreso Multidisciplinario de Investigacion e Innovacion

DATOS DEL ALUMNO:
Nombre: ${alumno.nombre}
Programa: ${alumno.programa}
Matricula: ${alumno.matricula}

EVENTOS REGISTRADOS (${eventosSeleccionados.length}):
${eventosSeleccionados
  .map((e, i) => `${i + 1}. ${e.actividad} - ${e.hora} (${e.sede})`)
  .join('\n')}

Fecha de registro: ${new Date().toLocaleDateString('es-MX')}
Hora de registro: ${new Date().toLocaleTimeString('es-MX')}

Gracias por tu asistencia!
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registro_${alumno.matricula}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-[#1a3a5c]/5 via-background to-[#2d5a7b]/5 py-4 sm:py-8 px-4 flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        <Card className="p-4 sm:p-8 shadow-xl border-t-4 border-t-green-500">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full blur-xl"></div>
                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-600 relative" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-4xl font-bold text-[#1a3a5c]">
                Registro Exitoso
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground">
                Tu inscripcion ha sido confirmada
              </p>
            </div>

            {/* Alumno Info */}
            <Card className="p-4 sm:p-6 bg-[#1a3a5c]/5 border-[#1a3a5c]/20 text-left">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Alumno:</span> {alumno.nombre}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Programa:</span> {alumno.programa}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Matricula:</span> {alumno.matricula}
                </p>
              </div>
            </Card>

            {/* Events Summary */}
            <div className="text-left space-y-2 sm:space-y-3">
              <h2 className="text-base sm:text-lg font-semibold text-[#1a3a5c]">
                Eventos registrados ({eventosSeleccionados.length}):
              </h2>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {eventosSeleccionados.map((evento, index) => (
                  <Card key={evento.id} className="p-3 sm:p-4 border-l-4 border-l-green-500">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-xs sm:text-sm line-clamp-2">
                          {evento.actividad}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {evento.hora} | {evento.sede}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button
                onClick={handleDownloadReceipt}
                variant="outline"
                className="w-full h-10 sm:h-11 border-[#1a3a5c] text-[#1a3a5c] hover:bg-[#1a3a5c]/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Comprobante
              </Button>
              <Button
                onClick={onNewRegistration}
                className="w-full h-10 sm:h-11 bg-[#1a3a5c] hover:bg-[#2d5a7b] text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Nuevo Registro
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
