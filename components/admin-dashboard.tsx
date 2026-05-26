'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Users, Calendar, LogOut, Loader2, RefreshCw, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { obtenerReporteInscripciones, obtenerResumenDashboard, obtenerReporteExternos } from '@/lib/admin-actions';
import { getNombrePrograma } from '@/lib/programas';
import * as XLSX from 'xlsx';

interface AdminDashboardProps {
  adminName: string;
  onLogout: () => void;
}

type ReporteData = {
  matricula: string;
  nombre_alumno: string;
  programa: string;
  evento_id: number;
  evento: string;
  dia: string;
  hora: string;
  sede: string;
  clasificacion: string;
  fecha_registro: string;
};

type ExternoData = {
  id: number;
  nombre_completo: string;
  correo: string;
  telefono: string;
  matricula: string | null;
  carrera: string | null;
  evento_id: number;
  evento: string;
  dia: string;
  hora: string;
  sede: string;
  fecha_registro: string;
};

// Extract day number from various formats
// Could be: "Jueves 28 de mayo", "28", "1" (meaning day 1 = 28), "2" (meaning day 2 = 29)
function getDiaNumero(dia: string | null | undefined): string {
  if (!dia || typeof dia !== 'string') return '';
  
  const diaStr = dia.toString().trim();
  
  // If it's just "1" or "2", map to actual dates (1 = 28 mayo, 2 = 29 mayo)
  if (diaStr === '1') return '28';
  if (diaStr === '2') return '29';
  if (diaStr === '3') return '30';
  
  // If it contains a 2-digit number like 28, 29, 30, extract it
  const match = diaStr.match(/\b(28|29|30)\b/);
  if (match) return match[1];
  
  // Otherwise return as-is
  return diaStr;
}

export function AdminDashboard({ adminName, onLogout }: AdminDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [inscripciones, setInscripciones] = useState<ReporteData[]>([]);
  const [externos, setExternos] = useState<ExternoData[]>([]);
  const [resumen, setResumen] = useState({
    totalInscripciones: 0,
    totalAlumnos: 0,
    totalEventos: 0,
    totalExternos: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resumenData, reporteData, externosData] = await Promise.all([
        obtenerResumenDashboard(),
        obtenerReporteInscripciones(3),
        obtenerReporteExternos(),
      ]);
      setResumen(resumenData);
      if (reporteData.success && reporteData.data) {
        setInscripciones(reporteData.data);
      }
      if (externosData.success && externosData.data) {
        setExternos(externosData.data.slice(0, 3));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Get ALL data for Excel export
      const [fullReport, externosReport] = await Promise.all([
        obtenerReporteInscripciones(),
        obtenerReporteExternos(),
      ]);
      const allData = fullReport.data || [];
      const externosData = externosReport.data || [];

      // Sheet 1: Complete detailed report
      const excelData = allData.map((row) => ({
        'Matricula': row.matricula,
        'Nombre del Alumno': row.nombre_alumno,
        'Programa Academico': getNombrePrograma(row.programa),
        'Clave Programa': row.programa,
        'ID Evento': row.evento_id,
        'Nombre del Evento': row.evento,
        'Dia': row.dia,
        'Dia (Num)': getDiaNumero(row.dia),
        'Hora': row.hora,
        'Sede': row.sede,
        'Clasificacion': row.clasificacion,
        'Fecha de Registro': row.fecha_registro ? new Date(row.fecha_registro).toLocaleString('es-MX') : '',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 12 }, { wch: 35 }, { wch: 50 }, { wch: 10 }, { wch: 10 },
        { wch: 60 }, { wch: 22 }, { wch: 8 }, { wch: 12 }, { wch: 30 },
        { wch: 20 }, { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones Completas');

      // Sheet 2: Summary by event with counts
      const eventSummary = allData.reduce((acc: Record<string, { count: number; dia: string; hora: string; sede: string }>, row) => {
        const key = row.evento || 'Sin evento';
        if (!acc[key]) {
          acc[key] = { count: 0, dia: row.dia, hora: row.hora, sede: row.sede };
        }
        acc[key].count++;
        return acc;
      }, {});

      const summaryData = Object.entries(eventSummary)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([evento, info]) => ({
          'Evento': evento,
          'Dia': getDiaNumero(info.dia),
          'Hora': info.hora,
          'Sede': info.sede,
          'Total Inscritos': info.count,
        }));

      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 60 }, { wch: 8 }, { wch: 12 }, { wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen por Evento');

      // Sheet 3: Summary by student
      const studentSummary = allData.reduce((acc: Record<string, { nombre: string; programa: string; eventos: string[] }>, row) => {
        const key = row.matricula;
        if (!acc[key]) {
          acc[key] = { nombre: row.nombre_alumno, programa: row.programa, eventos: [] };
        }
        acc[key].eventos.push(row.evento);
        return acc;
      }, {});

      const studentData = Object.entries(studentSummary).map(([matricula, info]) => ({
        'Matricula': matricula,
        'Nombre del Alumno': info.nombre,
        'Programa': getNombrePrograma(info.programa),
        'Total Eventos': info.eventos.length,
        'Eventos Inscritos': info.eventos.join(' | '),
      }));

      const wsStudents = XLSX.utils.json_to_sheet(studentData);
      wsStudents['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 50 }, { wch: 14 }, { wch: 100 }];
      XLSX.utils.book_append_sheet(wb, wsStudents, 'Resumen por Alumno');

      // Sheet 4: Summary by program
      const programSummary = allData.reduce((acc: Record<string, number>, row) => {
        const key = row.programa || 'Sin programa';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const programData = Object.entries(programSummary)
        .sort((a, b) => b[1] - a[1])
        .map(([programa, count]) => ({
          'Clave': programa,
          'Programa Academico': getNombrePrograma(programa),
          'Total Inscripciones': count,
        }));

      const wsPrograms = XLSX.utils.json_to_sheet(programData);
      wsPrograms['!cols'] = [{ wch: 10 }, { wch: 50 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, wsPrograms, 'Resumen por Programa');

      // Sheet 5: External attendees (Invitados/Egresados)
      const externosExcel = externosData.map((row) => ({
        'ID': row.id,
        'Nombre Completo': row.nombre_completo,
        'Correo': row.correo,
        'Telefono': row.telefono,
        'Tipo': row.matricula ? 'Egresado' : 'Invitado',
        'Matricula (Egresado)': row.matricula || 'N/A',
        'Carrera (Egresado)': row.carrera || 'N/A',
        'ID Evento': row.evento_id,
        'Evento': row.evento,
        'Dia': getDiaNumero(row.dia),
        'Hora': row.hora,
        'Sede': row.sede,
        'Fecha de Registro': row.fecha_registro,
      }));

      const wsExternos = XLSX.utils.json_to_sheet(externosExcel);
      wsExternos['!cols'] = [
        { wch: 6 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 10 },
        { wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 50 }, { wch: 8 },
        { wch: 12 }, { wch: 25 }, { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, wsExternos, 'Externos e Invitados');

      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `inscripciones_comiin_${fecha}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-[#1a3a5c] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-BLANCO-ZJYsSidUIe6mzTHOqlPSn41svgcW5x.avif"
            alt="Logo"
            width={200}
            height={50}
            className="object-contain h-10 sm:h-12 w-auto"
            priority
          />
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-white text-xs sm:text-sm font-medium hidden sm:inline">
              {adminName}
            </span>
            <Button 
              variant="ghost" 
              onClick={onLogout} 
              className="text-white hover:bg-white/10 h-9 px-2 sm:px-4"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 sm:py-8">
        {/* Stats Cards - Alumnos CUH */}
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Alumnos CUH</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 border-l-4 border-l-[#1a3a5c]">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-[#1a3a5c]/10 p-2 sm:p-3 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a3a5c]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Alumnos Registrados</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#1a3a5c]">
                  {isLoading ? '...' : resumen.totalAlumnos}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-l-4 border-l-[#4a7a9b]">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-[#4a7a9b]/10 p-2 sm:p-3 rounded-lg">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a7a9b]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Eventos Disponibles</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#4a7a9b]">
                  {isLoading ? '...' : resumen.totalEventos}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#1a3a5c]">Ultimos Registros</h2>
          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={loadData} 
              disabled={isLoading}
              className="flex-1 sm:flex-none h-9 sm:h-10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={isExporting || inscripciones.length === 0}
              className="flex-1 sm:flex-none bg-[#1a3a5c] hover:bg-[#2d5a7b] text-white h-9 sm:h-10"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">Descargar</span> Excel
            </Button>
          </div>
        </div>

        {/* Simplified Data Table - Last 5 only */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1a3a5c] text-white">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left font-medium text-xs sm:text-sm">Matricula</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-medium text-xs sm:text-sm">Alumno</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-medium text-xs sm:text-sm hidden md:table-cell">Programa</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-medium text-xs sm:text-sm">Evento</th>
                  <th className="px-3 sm:px-4 py-3 text-center font-medium text-xs sm:text-sm w-16">Dia</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-medium text-xs sm:text-sm hidden lg:table-cell">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Cargando datos...
                    </td>
                  </tr>
                ) : inscripciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No hay inscripciones registradas
                    </td>
                  </tr>
                ) : (
                  inscripciones.map((row, idx) => (
                    <tr key={`${row.matricula}-${row.evento_id}-${idx}`} className="hover:bg-muted/50">
                      <td className="px-3 sm:px-4 py-3 font-mono text-xs">{row.matricula}</td>
                      <td className="px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm">{row.nombre_alumno}</td>
                      <td className="px-3 sm:px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                        {getNombrePrograma(row.programa)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 max-w-[120px] sm:max-w-xs truncate text-xs sm:text-sm" title={row.evento}>
                        {row.evento}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-center text-xs font-medium">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1a3a5c]/10 text-[#1a3a5c]">
                          {getDiaNumero(row.dia)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs hidden lg:table-cell">{row.hora}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-muted/30 border-t text-xs sm:text-sm text-muted-foreground">
            Ultimos {inscripciones.length} registro{inscripciones.length !== 1 ? 's' : ''} de alumnos CUH &mdash; Descarga el Excel para el reporte completo
          </div>
        </Card>

        {/* Externos Section */}
        <div className="mt-8 sm:mt-10">
          {/* Divider with label */}
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-2">
              Externos, Egresados y Docentes
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Externos stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <Card className="p-4 sm:p-5 border-l-4 border-l-[#2d5a7b]">
              <div className="flex items-center gap-3">
                <div className="bg-[#2d5a7b]/10 p-2 sm:p-3 rounded-lg">
                  <UserPlus className="w-5 h-5 text-[#2d5a7b]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registros Externos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#2d5a7b]">
                    {isLoading ? '...' : resumen.totalExternos}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-5 border-l-4 border-l-[#4a7a9b]">
              <div className="flex items-center gap-3">
                <div className="bg-[#4a7a9b]/10 p-2 sm:p-3 rounded-lg">
                  <Users className="w-5 h-5 text-[#4a7a9b]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Egresados CUH</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#4a7a9b]">
                    {isLoading ? '...' : externos.filter(e => e.matricula).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Externos table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#2d5a7b] text-white">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left font-medium text-xs sm:text-sm">Nombre</th>
                    <th className="px-3 sm:px-4 py-3 text-left font-medium text-xs sm:text-sm hidden sm:table-cell">Tipo</th>
                    <th className="px-3 sm:px-4 py-3 text-left font-medium text-xs sm:text-sm hidden md:table-cell">Matricula</th>
                    <th className="px-3 sm:px-4 py-3 text-left font-medium text-xs sm:text-sm">Evento</th>
                    <th className="px-3 sm:px-4 py-3 text-center font-medium text-xs sm:text-sm w-16">Dia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Cargando...
                      </td>
                    </tr>
                  ) : externos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                        No hay registros externos
                      </td>
                    </tr>
                  ) : (
                    externos.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/50">
                        <td className="px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm">{row.nombre_completo}</td>
                        <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.matricula
                              ? 'bg-[#1a3a5c]/10 text-[#1a3a5c]'
                              : 'bg-[#4a7a9b]/10 text-[#4a7a9b]'
                          }`}>
                            {row.matricula ? 'Egresado' : 'Externo'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 font-mono text-xs hidden md:table-cell">
                          {row.matricula || <span className="text-muted-foreground">N/A</span>}
                        </td>
                        <td className="px-3 sm:px-4 py-3 max-w-[120px] sm:max-w-xs truncate text-xs sm:text-sm" title={row.evento}>
                          {row.evento}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#2d5a7b]/10 text-[#2d5a7b] text-xs font-medium">
                            {getDiaNumero(row.dia)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-muted/30 border-t text-xs sm:text-sm text-muted-foreground">
              Ultimos {externos.length} registro{externos.length !== 1 ? 's' : ''} de externos &mdash; Descarga el Excel para el reporte completo
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
