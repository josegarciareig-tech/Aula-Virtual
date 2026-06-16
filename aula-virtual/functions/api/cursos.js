import { json } from './_utils.js';

export async function onRequestGet(context) {
  try {
    const rows = await context.env.DB.prepare(
      'SELECT * FROM cursos ORDER BY id ASC'
    ).all();

    return json({ ok: true, cursos: rows.results || [] });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Error interno' }, 500);
  }
}
