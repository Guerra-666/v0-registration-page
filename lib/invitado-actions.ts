'use server';

import { db } from './db';

export async function obtenerEventoPorId(id: number): Promise<{
  success: boolean;
  evento?: {
    id: number;
    actividad: string;
    ponente: string;
    sede: string;
    hora: string;
    dia: string;
    clasificacion: string;
  };
  error?: string;
}> {
  if (!id || isNaN(id)) {
    return { success: false, error: 'ID de evento invalido' };
  }

  try {
    const result = await db.execute({
      sql: 'SELECT id, actividad, ponente, sede, hora, dia, clasificacion FROM eventos_comiin WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return { success: false, error: 'Evento no encontrado' };
    }

    const row = result.rows[0];
    return {
      success: true,
      evento: {
        id: row.id as number,
        actividad: row.actividad as string,
        ponente: row.ponente as string,
        sede: row.sede as string,
        hora: row.hora as string,
        dia: row.dia as string,
        clasificacion: row.clasificacion as string,
      },
    };
  } catch (error: any) {
    return { success: false, error: 'Error al consultar el evento' };
  }
}

export async function registrarAsistenciaExterno(data: {
  evento_id: number;
  nombre: string;
  correo: string;
  telefono: string;
  es_egresado: boolean;
  matricula_egresado?: string;
  carrera_egresado?: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  const { evento_id, nombre, correo, telefono, es_egresado, matricula_egresado, carrera_egresado } = data;

  // Validaciones
  if (!nombre.trim() || !correo.trim() || !telefono.trim()) {
    return { success: false, error: 'Todos los campos obligatorios deben completarse' };
  }

  if (es_egresado && !carrera_egresado?.trim()) {
    return { success: false, error: 'Si eres egresado, debes indicar tu carrera' };
  }

  // Fecha generada en el servidor (zona horaria Mexico City)
  const fechaRegistro = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

  try {
    await db.execute({
      sql: `INSERT INTO inscripciones_externos 
            (evento_id, nombre, correo, telefono, es_egresado, matricula_egresado, carrera_egresado, fecha_registro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        evento_id,
        nombre.trim(),
        correo.trim(),
        telefono.trim(),
        es_egresado ? 1 : 0,
        matricula_egresado?.trim() || null,
        carrera_egresado?.trim() || null,
        fechaRegistro,
      ],
    });

    return { success: true };
  } catch (error: any) {
    console.error('[v0] Error registro externo:', error.message);
    // Si falla por campo evento_id, reintentar sin él
    if (error.message?.includes('evento_id') || error.message?.includes('UNIQUE')) {
      try {
        await db.execute({
          sql: `INSERT INTO inscripciones_externos 
                (nombre, correo, telefono, es_egresado, matricula_egresado, carrera_egresado, fecha_registro) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            nombre.trim(),
            correo.trim(),
            telefono.trim(),
            es_egresado ? 1 : 0,
            matricula_egresado?.trim() || null,
            carrera_egresado?.trim() || null,
            fechaRegistro,
          ],
        });
        return { success: true };
      } catch (retryError: any) {
        console.error('[v0] Error reintento:', retryError.message);
        return { success: false, error: 'Error al registrar: ' + retryError.message };
      }
    }
    return { success: false, error: 'Error: ' + error.message };
  }
}
