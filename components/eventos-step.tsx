'use client';

import { useState } from 'react';
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
          {/* Time badge */}
          <div className="bg-[#1a3a5c] text-white px-2 sm:px-4 py-3 sm:py-4 flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px]">
            <span className="text-base sm:text-xl font-bold">{evento.hora.split(' ')[0]}</span>
            <span className="text-[10px] sm:text-xs opacity-90">{evento.hora.includes('AM') ? 'AM' : evento.hora.includes('PM') ? 'PM' : ''}</span>
          </div>
          
          <div className="flex-1 p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-4 items-start">
              <Checkbox
                id={`event-${evento.id}`}
                checked={selectedEvents.has(evento.id)}
                onCheckedChange={() => toggleEvent(evento.id)}
                disabled={isLoading}
                className="mt-0.5 sm:mt-1"
              />
              <label
                htmlFor={`event-${evento.id}`}
                className="flex-1 cursor-pointer"
              >
                <h3 className="font-semibold text-[#1a3a5c] leading-tight mb-1 sm:mb-2 text-sm sm:text-base">
                  {evento.actividad}
                </h3>
                <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <p className="flex items-center gap-1 sm:gap-2">
                    <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 text-[#1a3a5c] flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <span className="truncate">{evento.ponente}</span>
                  </p>
                  <p className="flex items-center gap-1 sm:gap-2">
                    <span className="inline-block w-3 h-3 sm:w-4 sm:h-4 text-[#1a3a5c] flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <span className="truncate">{evento.clasificacion} | {evento.sede}</span>
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
    <div className="flex-1 bg-gradient-to-br from-[#1a3a5c]/5 via-background to-[#2d5a7b]/5 py-4 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8 text-center space-y-1 sm:space-y-2">
          <h1 className="text-xl sm:text-3xl font-bold text-[#1a3a5c]">
            Selecciona tus Eventos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Bienvenido <span className="font-semibold">{alumno.nombre}</span>
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {alumno.programa}
          </p>
        </div>

        {/* Info Box */}
        <Card className="p-3 sm:p-4 mb-4 sm:mb-6 bg-[#1a3a5c]/5 border-[#1a3a5c]/20">
          <p className="text-xs sm:text-sm text-foreground">
            <span className="font-semibold">Requisito:</span> Selecciona minimo 3 eventos
          </p>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="jueves" className="text-xs sm:text-sm py-2 sm:py-3">
              <span className="hidden sm:inline">Jueves 28 de mayo</span>
              <span className="sm:hidden">Jue 28</span>
              {eventosJueves.length > 0 && (
                <span className="ml-1 sm:ml-2 inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted">
                  {eventosJueves.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="viernes" className="text-xs sm:text-sm py-2 sm:py-3">
              <span className="hidden sm:inline">Viernes 29 de mayo</span>
              <span className="sm:hidden">Vie 29</span>
              {eventosViernes.length > 0 && (
                <span className="ml-1 sm:ml-2 inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted">
                  {eventosViernes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jueves" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
            {eventosJueves.length > 0 ? (
              eventosJueves.map(renderEventCard)
            ) : (
              <Card className="p-6 sm:p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No hay eventos disponibles para este dia
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="viernes" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
            {eventosViernes.length > 0 ? (
              eventosViernes.map(renderEventCard)
            ) : (
              <Card className="p-6 sm:p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No hay eventos disponibles para este dia
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Counter and Action - Fixed on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-background border-t shadow-lg sm:relative sm:border-0 sm:shadow-none sm:bg-transparent z-40">
          <Card className="p-3 sm:p-4 bg-card shadow-lg sm:shadow-md">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                {isValid ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-foreground text-sm sm:text-base">
                    {selectedEvents.size} evento{selectedEvents.size !== 1 ? 's' : ''}
                  </p>
                  {!isValid && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Faltan {3 - selectedEvents.size}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={!isValid || isLoading}
                className="bg-[#1a3a5c] hover:bg-[#2d5a7b] text-white h-9 sm:h-10 px-4 sm:px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Registrando...</span>
                  </>
                ) : (
                  <>
                    Confirmar
                    <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Spacer for fixed bottom bar on mobile */}
        <div className="h-20 sm:hidden" />
      </div>
    </div>
  );
}
