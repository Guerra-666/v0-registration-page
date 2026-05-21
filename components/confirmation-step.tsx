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
CONFIRMACIÓN DE REGISTRO
Congreso Multidisciplinario de Investigación e Innovación

DATOS DEL ALUMNO:
Nombre: ${alumno.nombre}
Programa: ${alumno.programa}
Matrícula: ${alumno.matricula}

EVENTOS REGISTRADOS (${eventosSeleccionados.length}):
${eventosSeleccionados
  .map((e, i) => `${i + 1}. ${e.actividad} - ${e.hora} (${e.sede})`)
  .join('\n')}

Fecha de registro: ${new Date().toLocaleDateString('es-MX')}
Hora de registro: ${new Date().toLocaleTimeString('es-MX')}

¡Gracias por tu asistencia!
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8 px-4 flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        <Card className="p-8 shadow-lg">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full blur-xl"></div>
                <CheckCircle className="w-20 h-20 text-green-600 relative" />
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary">
                ¡Registro Exitoso!
              </h1>
              <p className="text-lg text-muted-foreground">
                Tu inscripción ha sido confirmada
              </p>
            </div>

            {/* Alumno Info */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="space-y-2 text-left">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Alumno:</span> {alumno.nombre}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Programa:</span>{' '}
                  {alumno.programa}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Matrícula:</span>{' '}
                  {alumno.matricula}
                </p>
              </div>
            </Card>

            {/* Events Summary */}
            <div className="text-left space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Eventos registrados ({eventosSeleccionados.length}):
              </h2>
              <div className="space-y-2">
                {eventosSeleccionados.map((evento, index) => (
                  <Card key={evento.id} className="p-4 border-l-4 border-l-green-600">
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {evento.actividad}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {evento.hora} • {evento.sede}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {evento.ponente}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary whitespace-nowrap flex-shrink-0">
                        {evento.clasificacion}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Se ha enviado una confirmación a{' '}
                <span className="font-semibold">tu correo institucional</span>.
                Conserva este comprobante para el día del evento.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleDownloadReceipt}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Comprobante
              </Button>
              <Button
                onClick={onNewRegistration}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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
