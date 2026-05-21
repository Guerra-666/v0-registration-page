'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, AlertCircle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Evento } from '@/lib/db';

interface EventosStepProps {
  alumno: {
    nombre: string;
    programa: string;
    matricula: string;
  };
  eventos: Evento[];
  onSuccess: (selectedIds: number[]) => void;
  isLoading: boolean;
}

export function EventosStep({
  alumno,
  eventos,
  onSuccess,
  isLoading,
}: EventosStepProps) {
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState('jueves');

  const eventosJueves = eventos.filter((e) => e.dia.toLowerCase().includes('28'));
  const eventosViernes = eventos.filter((e) => e.dia.toLowerCase().includes('29'));

  const toggleEvent = (id: number) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEvents(newSelected);
  };

  const handleConfirm = () => {
    if (selectedEvents.size >= 3) {
      onSuccess(Array.from(selectedEvents));
    }
  };

  const isValid = selectedEvents.size >= 3;

  const renderEventCard = (evento: Evento) => {
    const isDestacado = evento.clasificacion?.toLowerCase().includes('general') || 
                        evento.clasificacion?.toLowerCase().includes('destacad');
    
    return (
      <Card 
        key={evento.id} 
        className={`p-0 overflow-hidden hover:shadow-md transition-shadow ${
          isDestacado ? 'border-[#1a3a5c]' : 'border-border'
        }`}
      >
        <div className="flex">
          {/* Time badge - like reference design */}
          <div className="bg-[#1a3a5c] text-white px-4 py-4 flex flex-col items-center justify-center min-w-[80px]">
            <span className="text-xl font-bold">{evento.hora.split(' ')[0]}</span>
            <span className="text-xs opacity-90">{evento.hora.includes('AM') ? 'AM' : evento.hora.includes('PM') ? 'PM' : ''}</span>
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex gap-4 items-start">
              <Checkbox
                id={`event-${evento.id}`}
                checked={selectedEvents.has(evento.id)}
                onCheckedChange={() => toggleEvent(evento.id)}
                disabled={isLoading}
                className="mt-1"
              />
              <label
                htmlFor={`event-${evento.id}`}
                className="flex-1 cursor-pointer"
              >
                <h3 className="font-semibold text-[#1a3a5c] leading-tight mb-2">
                  {evento.actividad}
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 text-[#1a3a5c]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    {evento.ponente}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 text-[#1a3a5c]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    {evento.clasificacion} | {evento.sede}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            Selecciona tus Eventos
          </h1>
          <p className="text-muted-foreground">
            Bienvenido <span className="font-semibold">{alumno.nombre}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Programa: <span className="font-medium">{alumno.programa}</span>
          </p>
        </div>

        {/* Info Box */}
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Requisito:</span> Selecciona mínimo 3 eventos
          </p>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jueves">
              Jueves 28 de mayo
              {eventosJueves.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                  {eventosJueves.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="viernes">
              Viernes 29 de mayo
              {eventosViernes.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                  {eventosViernes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jueves" className="space-y-3">
            {eventosJueves.length > 0 ? (
              eventosJueves.map(renderEventCard)
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No hay eventos disponibles para este día
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="viernes" className="space-y-3">
            {eventosViernes.length > 0 ? (
              eventosViernes.map(renderEventCard)
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No hay eventos disponibles para este día
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Counter and Action */}
        <div className="space-y-4">
          <Card className="p-4 sticky bottom-4 bg-card shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {isValid ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedEvents.size} evento{selectedEvents.size !== 1 ? 's' : ''} seleccionado{selectedEvents.size !== 1 ? 's' : ''}
                  </p>
                  {!isValid && (
                    <p className="text-xs text-muted-foreground">
                      Selecciona al menos {3 - selectedEvents.size} más
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={!isValid || isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    Confirmar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
