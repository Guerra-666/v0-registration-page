import { createClient } from '@libsql/client';

const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
  throw new Error('Database credentials not configured');
}

export const db = createClient({
  url: dbUrl,
  authToken: authToken,
});

export interface Alumno {
  matricula: string;
  nombre: string;
  paterno: string;
  materno: string;
  programa: string;
  grupo: string;
  turno: string;
  gradoacademico: string;
  email_institucional: string;
}

export interface Evento {
  id: number;
  dia: string;
  hora: string;
  actividad: string;
  ponente: string;
  sede: string;
  duracion: string;
  clasificacion: string;
  activo: boolean;
}

export interface Inscripcion {
  alumno_matricula: string;
  evento_id: number;
  fecha_registro: string;
}
