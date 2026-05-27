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

  try {
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
  } catch (error: any) {
    console.error('[v0] Error validarMatricula:', error?.message);
    return { success: false, error: 'Error al consultar la base de datos' };
  }
}

export async function obtenerEventos(): Promise<Evento[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT id, dia, hora, actividad, ponente, sede, duracion, clasificacion, activo FROM eventos_comiin ORDER BY dia, hora',
    });

    return result.rows.map((row) => ({
      id: row.id as number,
      dia: (row.dia as string) || '',
      hora: (row.hora as string) || '',
      actividad: (row.actividad as string) || '',
      ponente: (row.ponente as string) || '',
      sede: (row.sede as string) || '',
      duracion: (row.duracion as string) || '',
      clasificacion: (row.clasificacion as string) || '',
      activo: true, // Force all events to be active/selectable so students can register
    }));
  } catch (error: any) {
    console.error('[v0] Error obtenerEventos:', error?.message);
    return [];
  }
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

  try {
    const fechaRegistro = new Date().toISOString();

    // Map eventos_comiin IDs to listado_final_eventos IDs by matching activity name
    const placeholders = eventoIds.map(() => '?').join(',');
    const mapResult = await db.execute({
      sql: `SELECT e.id AS comiin_id, l.id_evento AS listado_id
            FROM eventos_comiin e
            JOIN listado_final_eventos l ON TRIM(LOWER(e.actividad)) = TRIM(LOWER(l.actividad))
            WHERE e.id IN (${placeholders})`,
      args: eventoIds,
    });

    const idMap = new Map<number, number>();
    for (const row of mapResult.rows) {
      idMap.set(row.comiin_id as number, row.listado_id as number);
    }

    const statements: { sql: string; args: any[] }[] = [];
    const missingIds: number[] = [];

    for (const comiinId of eventoIds) {
      const listadoId = idMap.get(comiinId);
      if (listadoId !== undefined) {
        statements.push({
          sql: 'INSERT OR IGNORE INTO inscripciones_eventos (alumno_matricula, evento_id, fecha_registro) VALUES (?, ?, ?)',
          args: [matricula.trim(), listadoId, fechaRegistro],
        });
      } else {
        missingIds.push(comiinId);
      }
    }

    if (missingIds.length > 0) {
      console.warn(`[v0] No se pudieron mapear los IDs de eventos_comiin: ${missingIds.join(', ')}`);
      return {
        success: false,
        error: 'Uno o más eventos seleccionados no pudieron ser encontrados en el listado de eventos.',
      };
    }

    await db.batch(statements);

    return { success: true };
  } catch (error: any) {
    console.error('[v0] Error registrarInscripciones:', error?.message);
    return { success: false, error: 'Error al registrar inscripciones: ' + (error?.message || '') };
  }
}
