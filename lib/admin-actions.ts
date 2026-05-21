'use server';

import { db } from './db';

// Hardcoded admin user while the table is being created
const TEMP_ADMIN_USER = 'adrian.guerra';

export async function validarAdministrativo(usuario: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!usuario.trim()) {
    return { success: false, error: 'Ingresa un usuario válido' };
  }

  const normalizedUser = usuario.trim().toLowerCase();

  // Check hardcoded user first
  if (normalizedUser === TEMP_ADMIN_USER) {
    return { success: true };
  }

  // Try to check against the database (if the table exists)
  try {
    const result = await db.execute({
      sql: 'SELECT usuario FROM administrativos WHERE LOWER(usuario) = ?',
      args: [normalizedUser],
    });

    if (result.rows.length > 0) {
      return { success: true };
    }
  } catch {
    // Table doesn't exist yet, only allow hardcoded user
  }

  return { success: false, error: 'Usuario no autorizado' };
}

export async function obtenerReporteInscripciones(): Promise<{
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
    const result = await db.execute({
      sql: `
        SELECT 
          i.alumno_matricula as matricula,
          a.nombre || ' ' || a.paterno || ' ' || COALESCE(a.materno, '') as nombre_alumno,
          a.programa,
          e.id as evento_id,
          e.actividad as evento,
          e.dia,
          e.hora,
          e.sede,
          e.clasificacion,
          i.fecha_registro
        FROM inscripciones_eventos i
        LEFT JOIN alumnos_activos a ON i.alumno_matricula = a.matricula
        LEFT JOIN eventos_comiin e ON i.evento_id = e.id
        ORDER BY i.fecha_registro DESC, a.paterno, a.nombre
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
}> {
  try {
    const [inscripciones, alumnos, eventos] = await Promise.all([
      db.execute({ sql: 'SELECT COUNT(*) as count FROM inscripciones_eventos' }),
      db.execute({ sql: 'SELECT COUNT(DISTINCT alumno_matricula) as count FROM inscripciones_eventos' }),
      db.execute({ sql: 'SELECT COUNT(*) as count FROM eventos_comiin' }),
    ]);

    return {
      totalInscripciones: (inscripciones.rows[0]?.count as number) || 0,
      totalAlumnos: (alumnos.rows[0]?.count as number) || 0,
      totalEventos: (eventos.rows[0]?.count as number) || 0,
    };
  } catch {
    return {
      totalInscripciones: 0,
      totalAlumnos: 0,
      totalEventos: 0,
    };
  }
}
