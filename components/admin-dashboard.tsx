'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Users, Calendar, FileSpreadsheet, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { obtenerReporteInscripciones, obtenerResumenDashboard } from '@/lib/admin-actions';
import * as XLSX from 'xlsx';

interface AdminDashboardProps {
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

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [inscripciones, setInscripciones] = useState<ReporteData[]>([]);
  const [resumen, setResumen] = useState({
    totalInscripciones: 0,
    totalAlumnos: 0,
    totalEventos: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resumenData, reporteData] = await Promise.all([
        obtenerResumenDashboard(),
        obtenerReporteInscripciones(),
      ]);
      setResumen(resumenData);
      if (reporteData.success && reporteData.data) {
        setInscripciones(reporteData.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const excelData = inscripciones.map((row) => ({
        'Matricula': row.matricula,
        'Nombre del Alumno': row.nombre_alumno,
        'Programa Academico': row.programa,
        'ID Evento': row.evento_id,
        'Nombre del Evento': row.evento,
        'Dia': row.dia,
        'Hora': row.hora,
        'Sede': row.sede,
        'Clasificacion': row.clasificacion,
        'Fecha de Registro': row.fecha_registro ? new Date(row.fecha_registro).toLocaleString('es-MX') : '',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 12 }, { wch: 35 }, { wch: 30 }, { wch: 10 }, { wch: 50 },
        { wch: 20 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones');

      const eventSummary = inscripciones.reduce((acc: Record<string, number>, row) => {
        const key = row.evento || 'Sin evento';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const summaryData = Object.entries(eventSummary).map(([evento, count]) => ({
        'Evento': evento,
        'Total Inscritos': count,
      }));

      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 50 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen por Evento');

      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `inscripciones_comiin_${fecha}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-[#1a3a5c] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-BLANCO-ZJYsSidUIe6mzTHOqlPSn41svgcW5x.avif"
              alt="Logo"
              width={45}
              height={45}
              className="object-contain"
              priority
            />
            <div>
              <h1 className="text-sm font-bold">Panel Administrativo</h1>
              <p className="text-xs opacity-80">Congreso COMIIN</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-white/10">
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-l-[#1a3a5c]">
            <div className="flex items-center gap-4">
              <div className="bg-[#1a3a5c]/10 p-3 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-[#1a3a5c]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inscripciones</p>
                <p className="text-3xl font-bold text-[#1a3a5c]">
                  {isLoading ? '...' : resumen.totalInscripciones}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-[#2d5a7b]">
            <div className="flex items-center gap-4">
              <div className="bg-[#2d5a7b]/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-[#2d5a7b]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alumnos Registrados</p>
                <p className="text-3xl font-bold text-[#2d5a7b]">
                  {isLoading ? '...' : resumen.totalAlumnos}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-[#4a7a9c]">
            <div className="flex items-center gap-4">
              <div className="bg-[#4a7a9c]/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-[#4a7a9c]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eventos Disponibles</p>
                <p className="text-3xl font-bold text-[#4a7a9c]">
                  {isLoading ? '...' : resumen.totalEventos}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-[#1a3a5c]">Listado de Inscripciones</h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              onClick={handleExportExcel}
              disabled={isExporting || inscripciones.length === 0}
              className="bg-[#1a3a5c] hover:bg-[#2d5a7b] text-white"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Descargar Excel
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1a3a5c] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Matricula</th>
                  <th className="px-4 py-3 text-left font-medium">Alumno</th>
                  <th className="px-4 py-3 text-left font-medium">Programa</th>
                  <th className="px-4 py-3 text-left font-medium">Evento</th>
                  <th className="px-4 py-3 text-left font-medium">Dia</th>
                  <th className="px-4 py-3 text-left font-medium">Hora</th>
                  <th className="px-4 py-3 text-left font-medium">Sede</th>
                  <th className="px-4 py-3 text-left font-medium">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Cargando datos...
                    </td>
                  </tr>
                ) : inscripciones.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      No hay inscripciones registradas
                    </td>
                  </tr>
                ) : (
                  inscripciones.map((row, idx) => (
                    <tr key={`${row.matricula}-${row.evento_id}-${idx}`} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono text-xs">{row.matricula}</td>
                      <td className="px-4 py-3 font-medium">{row.nombre_alumno}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{row.programa}</td>
                      <td className="px-4 py-3 max-w-xs truncate" title={row.evento}>{row.evento}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.dia}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.hora}</td>
                      <td className="px-4 py-3 text-xs">{row.sede}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {row.fecha_registro ? new Date(row.fecha_registro).toLocaleDateString('es-MX') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {inscripciones.length > 0 && (
            <div className="px-4 py-3 bg-muted/30 border-t text-sm text-muted-foreground">
              Mostrando {inscripciones.length} registro{inscripciones.length !== 1 ? 's' : ''}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
