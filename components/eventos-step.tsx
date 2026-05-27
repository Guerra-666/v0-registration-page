'use client';

import { useState } from 'react';
import { ChevronRight, AlertCircle, Loader2, Check, Clock, Ban } from 'lucide-react';
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

// Parse "07:30 AM" or "01:00 PM" -> minutes from midnight
function parseHoraToMinutes(hora: string): number {
  if (!hora) return 0;
  const match = hora.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = (match[3] || '').toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

// Parse duration like "60", "90", "1.5 hrs", "2 horas" -> minutes
function parseDuracionToMinutes(duracion: string): number {
  if (!duracion) return 60; // default 60 min
  const num = parseFloat(duracion);
  if (isNaN(num)) return 60;
  // If it looks like hours (e.g. 1.5, 2) — values <= 8 are treated as hours
  if (num <= 8) return Math.round(num * 60);
  // Otherwise treat as minutes directly
  return Math.round(num);
}

// Check if two time ranges overlap
function hasTimeOverlap(
  startA: number, endA: number,
  startB: number, endB: number
): boolean {
  return startA < endB && startB < endA;
}

// Given a candidate event and current selected events (same day), find conflicting event if any
function findConflict(candidate: Evento, selected: Evento[]): Evento | null {
  const startC = parseHoraToMinutes(candidate.hora);
  const endC = startC + parseDuracionToMinutes(candidate.duracion);

  for (const sel of selected) {
    if (sel.dia !== candidate.dia) continue;
    const startS = parseHoraToMinutes(sel.hora);
    const endS = startS + parseDuracionToMinutes(sel.duracion);
    if (hasTimeOverlap(startC, endC, startS, endS)) {
      return sel;
    }
  }
  return null;
}

// Helper to clean up "Día 1 – Jueves 28 de mayo" -> "Jueves 28 de mayo"
function getDayLabel(dia: string): string {
  if (!dia) return '';
  return dia.replace(/^Día \d+\s*–\s*/i, '').trim();
}

// Helper to short label "Jueves 28 de mayo" -> "Jue 28"
function getDayShortLabel(dia: string): string {
  const cleaned = getDayLabel(dia);
  const match = cleaned.match(/(\w{3})\w*\s*(\d{1,2})/i);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return cleaned;
}

export function EventosStep({
  alumno,
  eventos,
  onSuccess,
  isLoading,
}: EventosStepProps) {
  // Group events by day
  const eventsByDay = eventos.reduce((acc, event) => {
    const day = event.dia || 'Otro';
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(event);
    return acc;
  }, {} as Record<string, Evento[]>);

  const days = Object.keys(eventsByDay).sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState(days[0] || '');
  // conflictWarning: maps event id -> name of conflicting event
  const [conflictWarning, setConflictWarning] = useState<{ id: number; conflictsWith: string } | null>(null);

  const selectedEventObjects = eventos.filter((e) => selectedEvents.has(e.id));

  const toggleEvent = (id: number) => {
    setConflictWarning(null);
    const newSelected = new Set(selectedEvents);

    if (newSelected.has(id)) {
      // Deselect — always allowed
      newSelected.delete(id);
      setSelectedEvents(newSelected);
      return;
    }

    // Trying to select — check if cupo lleno
    const candidate = eventos.find((e) => e.id === id);
    if (!candidate) return;

    // Block if cupo lleno
    if (!candidate.activo) return;

    const alreadySelectedSameDay = selectedEventObjects.filter(
      (e) => e.dia === candidate.dia
    );

    const conflict = findConflict(candidate, alreadySelectedSameDay);
    if (conflict) {
      setConflictWarning({ id, conflictsWith: conflict.actividad });
      return; // Block selection
    }

    newSelected.add(id);
    setSelectedEvents(newSelected);
  };

  const handleConfirm = () => {
    if (selectedEvents.size >= 1) {
      onSuccess(Array.from(selectedEvents));
    }
  };

  const isValid = selectedEvents.size >= 1;

  const renderEventCard = (evento: Evento) => {
    const isSelected = selectedEvents.has(evento.id);
    const isCupoLleno = !evento.activo;
    const isConflicted = !isSelected && !isCupoLleno && (() => {
      const alreadySelectedSameDay = selectedEventObjects.filter(
        (e) => e.dia === evento.dia
      );
      return findConflict(evento, alreadySelectedSameDay) !== null;
    })();

    const isDisabled = isCupoLleno || isConflicted;
    const showConflictBanner = conflictWarning?.id === evento.id;

    return (
      <div key={evento.id}>
        <Card
          className={`p-0 overflow-hidden transition-all ${
            isSelected
              ? 'border-[#1a3a5c] ring-1 ring-[#1a3a5c]/40'
              : isCupoLleno
              ? 'opacity-60 border-red-200 bg-red-50/30'
              : isConflicted
              ? 'opacity-50 border-border'
              : 'hover:shadow-md border-border'
          }`}
        >
          <div className="flex">
            {/* Time badge */}
            <div className={`px-2 sm:px-4 py-3 sm:py-4 flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px] ${
              isCupoLleno ? 'bg-red-400 text-white' : isConflicted ? 'bg-muted text-muted-foreground' : 'bg-[#1a3a5c] text-white'
            }`}>
              {isCupoLleno ? (
                <>
                  <Ban className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
                  <span className="text-[9px] sm:text-[10px] font-medium uppercase">Cupo</span>
                  <span className="text-[9px] sm:text-[10px] font-medium uppercase">Lleno</span>
                </>
              ) : (
                <>
                  <span className="text-base sm:text-xl font-bold">{evento.hora.split(' ')[0]}</span>
                  <span className="text-[10px] sm:text-xs opacity-90">
                    {evento.hora.includes('AM') ? 'AM' : evento.hora.includes('PM') ? 'PM' : ''}
                  </span>
                </>
              )}
            </div>

            <div className="flex-1 p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-4 items-start">
                <Checkbox
                  id={`event-${evento.id}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleEvent(evento.id)}
                  disabled={isLoading || isDisabled}
                  className="mt-0.5 sm:mt-1"
                />
                <label
                  htmlFor={`event-${evento.id}`}
                  className={`flex-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold leading-tight mb-1 sm:mb-2 text-sm sm:text-base ${
                      isCupoLleno ? 'text-muted-foreground' : 'text-[#1a3a5c]'
                    }`}>
                      {evento.actividad}
                    </h3>
                    {isCupoLleno && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 whitespace-nowrap">
                        Sin cupo
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                    <p className="flex items-center gap-1 sm:gap-2">
                      <span className={`inline-block w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isCupoLleno ? 'text-muted-foreground' : 'text-[#1a3a5c]'}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <span className="truncate">{evento.ponente}</span>
                    </p>
                    <p className="flex items-center gap-1 sm:gap-2">
                      <span className={`inline-block w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isCupoLleno ? 'text-muted-foreground' : 'text-[#1a3a5c]'}`}>
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

        {/* Conflict warning banner */}
        {showConflictBanner && (
          <div className="flex items-start gap-2 mt-1 mb-1 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Horario ocupado — ya seleccionaste{' '}
              <span className="font-semibold">{conflictWarning.conflictsWith}</span>{' '}
              a la misma hora.
            </span>
          </div>
        )}
      </div>
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
            Selecciona los eventos a los que quieras asistir.
          </p>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setConflictWarning(null); }} className="mb-4 sm:mb-6">
          <TabsList className="grid w-full h-auto" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map((day) => (
              <TabsTrigger key={day} value={day} className="text-xs sm:text-sm py-2 sm:py-3">
                <span className="hidden sm:inline">{getDayLabel(day)}</span>
                <span className="sm:hidden">{getDayShortLabel(day)}</span>
                {eventsByDay[day].length > 0 && (
                  <span className="ml-1 sm:ml-2 inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted">
                    {eventsByDay[day].length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {days.map((day) => (
            <TabsContent key={day} value={day} className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
              {eventsByDay[day].length > 0 ? (
                eventsByDay[day].map(renderEventCard)
              ) : (
                <Card className="p-6 sm:p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    No hay eventos disponibles para este día
                  </p>
                </Card>
              )}
            </TabsContent>
          ))}
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
                <p className="font-semibold text-foreground text-sm sm:text-base">
                  {selectedEvents.size} evento{selectedEvents.size !== 1 ? 's' : ''} seleccionado{selectedEvents.size !== 1 ? 's' : ''}
                </p>
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
