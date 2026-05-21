// Mapeo de códigos de programa a nombres completos
export const PROGRAMAS_MAP: Record<string, string> = {
  // Licenciaturas
  'LD': 'Licenciatura en Derecho',
  'LASC': 'Licenciatura en Administración y Sistemas Computacionales',
  'LCE': 'Licenciatura en Ciencias de la Educación',
  'LCSF': 'Licenciatura en Contaduría y Sistemas Fiscales',
  'ISC': 'Licenciatura en Ingeniería en Sistemas Computacionales',
  'LP': 'Licenciatura en Psicología',
  // Maestrías
  'MAN': 'Maestría en Administración de Negocios',
  'MDC': 'Maestría en Derecho Civil',
  'MDPPA': 'Maestría en Derecho Procesal Penal Acusatorio',
  'MEIPA': 'Maestría en Estrategias de Intervención en Problemas de Aprendizaje',
  'MFD': 'Maestría en Formación Docente',
  'MF': 'Maestría en Finanzas',
};

export function getNombrePrograma(codigo: string): string {
  if (!codigo) return 'No especificado';
  const codigoUpper = codigo.trim().toUpperCase();
  return PROGRAMAS_MAP[codigoUpper] || codigo;
}
