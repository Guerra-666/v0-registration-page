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
  const [resumen, setResumen] = useState({
    totalInscripciones: 0,
    totalAlumnos: 0,
    totalEventos: 0,
  });

  useEffect(() => {
    loadResumen();
  }, []);

  const loadResumen = async () => {
    setIsLoading(true);
    try {
      const data = await obtenerResumenDashboard();
      setResumen(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const result = await obtenerReporteInscripciones();
      
      if (!result.success || !result.data) {
        alert(result.error || 'Error al obtener datos');
        return;
      }

      // Prepare data for Excel with Spanish headers
      const excelData = result.data.map((row: ReporteData) => ({
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

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // Matricula
        { wch: 35 }, // Nombre
        { wch: 30 }, // Programa
        { wch: 10 }, // ID Evento
        { wch: 50 }, // Evento
        { wch: 20 }, // Dia
        { wch: 10 }, // Hora
        { wch: 25 }, // Sede
        { wch: 20 }, // Clasificacion
        { wch: 20 }, // Fecha
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Inscripciones');

      // Create a second sheet with summary by event
      const eventSummary = result.data.reduce((acc: Record<string, number>, row: ReporteData) => {
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

      // Generate filename with date
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `inscripciones_comiin_${fecha}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);
    } catch (error) {
      alert('Error al exportar datos');
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
              alt="Congreso Logo"
              width={45}
              height={45}
              className="object-contain"
              priority
            />
            <div>
              <h1 className="text-sm font-bold">Panel Administrativo</h1>
              <p className="text-xs opacity-80">Congreso COMIIN 2024</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a3a5c]">Dashboard de Inscripciones</h2>
          <p className="text-muted-foreground">Consulta y descarga el reporte de alumnos inscritos</p>
        </div>

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

        {/* Actions */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Exportar Datos</h3>
              <p className="text-sm text-muted-foreground">
                Descarga el listado completo de inscripciones en formato Excel
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadResumen}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="bg-[#1a3a5c] hover:bg-[#2d5a7b] text-white"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Excel
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">El archivo Excel incluye:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Hoja 1: Listado completo de inscripciones (Matricula, Nombre, Programa, Evento, Dia, Hora, Sede, etc.)</li>
              <li>Hoja 2: Resumen de inscritos por evento</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
}
