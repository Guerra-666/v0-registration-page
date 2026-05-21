import { db } from '../lib/db';

async function checkAdmins() {
  const result = await db.execute('SELECT usuario, nombre_completo FROM administrativos LIMIT 5');
  console.log('Administrativos:', JSON.stringify(result.rows, null, 2));
}

checkAdmins().catch(console.error);
