'use server';

import { db } from './db';

export async function validarAdministrativo(usuario: string): Promise<{
  success: boolean;
  nombreCompleto?: string;
  error?: string;
}> {
  if (!usuario.trim()) {
    return { success: false, error: 'Ingresa un usuario valido' };
  }

  const normalizedUser = usuario.trim().toLowerCase();

  try {
    const result = await db.execute({
      sql: 'SELECT nombre_completo FROM administrativos WHERE LOWER(usuario) = ?',
      args: [normalizedUser],
    });

    if (result.rows.length > 0) {
      return { 
        success: true, 
        nombreCompleto: (result.rows[0].nombre_completo as string) || usuario 
      };
    }

    return { success: false, error: 'Usuario no autorizado' };
  } catch (error: any) {
    return { success: false, error: 'Error de conexion' };
  }
}

export async function obtenerReporteInscripciones(limit?: number): Promise<{
  success: boolean;
  data?: Array<{
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
  }>;
  error?: string;
}> {
  try {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const result = await db.execute({
      sql: `
        SELECT 
          i.alumno_matricula as matricula,
          a.nombre || ' ' || a.paterno || ' ' || COALESCE(a.materno, '') as nombre_alumno,
          a.programa,
          e.id_evento as evento_id,
          e.actividad as evento,
          e.dia,
          e.hora,
          e.sede,
          e.clasificacion,
          i.fecha_registro
        FROM inscripciones_eventos i
        LEFT JOIN alumnos_activos a ON i.alumno_matricula = a.matricula
        LEFT JOIN listado_final_eventos e ON i.evento_id = e.id_evento
        ORDER BY i.fecha_registro DESC, a.paterno, a.nombre
        ${limitClause}
      `,
    });

    const data = result.rows.map((row) => ({
      matricula: (row.matricula as string) || '',
      nombre_alumno: (row.nombre_alumno as string) || '',
      programa: (row.programa as string) || '',
      evento_id: (row.evento_id as number) || 0,
      evento: (row.evento as string) || '',
      dia: (row.dia as string) || '',
      hora: (row.hora as string) || '',
      sede: (row.sede as string) || '',
      clasificacion: (row.clasificacion as string) || '',
      fecha_registro: (row.fecha_registro as string) || '',
    }));

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al obtener datos' };
  }
}

export async function obtenerResumenDashboard(): Promise<{
  totalInscripciones: number;
  totalAlumnos: number;
  totalEventos: number;
  totalExternos: number;
}> {
  try {
    const [inscripciones, alumnos, eventos, externos] = await Promise.all([
      db.execute({ sql: 'SELECT COUNT(*) as count FROM inscripciones_eventos' }),
      db.execute({ sql: 'SELECT COUNT(DISTINCT alumno_matricula) as count FROM inscripciones_eventos' }),
      db.execute({ sql: 'SELECT COUNT(*) as count FROM listado_final_eventos' }),
      db.execute({ sql: 'SELECT COUNT(*) as count FROM inscripciones_externos' }),
    ]);

    return {
      totalInscripciones: (inscripciones.rows[0]?.count as number) || 0,
      totalAlumnos: (alumnos.rows[0]?.count as number) || 0,
      totalEventos: (eventos.rows[0]?.count as number) || 0,
      totalExternos: (externos.rows[0]?.count as number) || 0,
    };
  } catch {
    return {
      totalInscripciones: 0,
      totalAlumnos: 0,
      totalEventos: 0,
      totalExternos: 0,
    };
  }
}

export async function obtenerReporteExternos(): Promise<{
  success: boolean;
  data?: Array<{
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
  }>;
  error?: string;
}> {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          ie.id,
          ie.nombre_completo,
          ie.correo,
          ie.telefono,
          ie.matricula,
          ie.carrera,
          ie.evento_id,
          e.actividad as evento,
          e.dia,
          e.hora,
          e.sede,
          ie.fecha_registro
        FROM inscripciones_externos ie
        LEFT JOIN listado_final_eventos e ON ie.evento_id = e.id_evento
        ORDER BY ie.fecha_registro DESC
      `,
    });

    const data = result.rows.map((row) => ({
      id: (row.id as number) || 0,
      nombre_completo: (row.nombre_completo as string) || '',
      correo: (row.correo as string) || '',
      telefono: (row.telefono as string) || '',
      matricula: (row.matricula as string) || null,
      carrera: (row.carrera as string) || null,
      evento_id: (row.evento_id as number) || 0,
      evento: (row.evento as string) || '',
      dia: (row.dia as string) || '',
      hora: (row.hora as string) || '',
      sede: (row.sede as string) || '',
      fecha_registro: (row.fecha_registro as string) || '',
    }));

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al obtener externos' };
  }
}
