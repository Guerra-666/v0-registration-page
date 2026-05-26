'use server';

import { db, Alumno, Evento } from './db';

export async function validarMatricula(matricula: string): Promise<{
  success: boolean;
  alumno?: Alumno;
  error?: string;
}> {
  if (!matricula.trim()) {
    return { success: false, error: 'Ingresa una matrícula válida' };
  }

  const result = await db.execute({
    sql: 'SELECT nombre, paterno, materno, programa, grupo, turno, gradoacademico, email_institucional FROM alumnos_activos WHERE matricula = ?',
    args: [matricula.trim()],
  });

  if (result.rows.length === 0) {
    return { success: false, error: 'Alumno no encontrado en el sistema' };
  }

  const row = result.rows[0];
  const alumno: Alumno = {
    matricula: matricula.trim(),
    nombre: (row.nombre as string) || '',
    paterno: (row.paterno as string) || '',
    materno: (row.materno as string) || '',
    programa: (row.programa as string) || '',
    grupo: (row.grupo as string) || '',
    turno: (row.turno as string) || '',
    gradoacademico: (row.gradoacademico as string) || '',
    email_institucional: (row.email_institucional as string) || '',
  };

  return { success: true, alumno };
}

export async function obtenerEventos(): Promise<Evento[]> {
  const result = await db.execute({
    sql: 'SELECT id_evento, dia, hora, actividad, ponente, sede, duracion, clasificacion FROM eventos_comiin ORDER BY dia, hora',
  });

  return result.rows.map((row) => ({
    id: row.id_evento as number,
    dia: (row.dia as string) || '',
    hora: (row.hora as string) || '',
    actividad: (row.actividad as string) || '',
    ponente: (row.ponente as string) || '',
    sede: (row.sede as string) || '',
    duracion: (row.duracion as string) || '',
    clasificacion: (row.clasificacion as string) || '',
  }));
}

export async function registrarInscripciones(
  matricula: string,
  eventoIds: number[]
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!matricula.trim() || eventoIds.length < 1) {
    return { success: false, error: 'Selecciona al menos un evento' };
  }

  const fechaRegistro = new Date().toISOString();

  const statements = eventoIds.map((eventoId) => ({
    sql: 'INSERT OR IGNORE INTO inscripciones_eventos (alumno_matricula, evento_id, fecha_registro) VALUES (?, ?, ?)',
    args: [matricula.trim(), eventoId, fechaRegistro],
  }));

  await db.batch(statements);

  return { success: true };
}
