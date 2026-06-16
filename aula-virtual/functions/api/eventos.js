import { json } from './_utils.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const year = String(url.searchParams.get('year') || '').trim();

    const sql = year
      ? 'SELECT * FROM eventos WHERE fecha LIKE ? ORDER BY fecha ASC, hora_inicio ASC, id ASC'
      : 'SELECT * FROM eventos ORDER BY fecha ASC, hora_inicio ASC, id ASC';

    const stmt = context.env.DB.prepare(sql);
    const rows = year ? await stmt.bind(`${year}%`).all() : await stmt.all();

    return json({ ok: true, eventos: rows.results || [] });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Error interno' }, 500);
  }
}
