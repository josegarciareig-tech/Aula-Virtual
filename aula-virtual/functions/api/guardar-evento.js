import { json, readJson, requireProfesorKey, unauthorized } from './_utils.js';

export async function onRequestPost(context) {
  try {
    const body = await readJson(context.request);
    if (!requireProfesorKey(body.profesor_key)) return unauthorized();

    const curso_id = Number(body.curso_id || 0);
    const fecha = String(body.fecha || '').trim();
    const titulo = String(body.titulo || '').trim();
    const hora_inicio = String(body.hora_inicio || '').trim();
    const hora_fin = String(body.hora_fin || '').trim();
    const descripcion = String(body.descripcion || '').trim();

    if (!curso_id || !fecha || !titulo || !hora_inicio || !hora_fin) {
      return json({ ok: false, error: 'Faltan datos obligatorios' }, 400);
    }

    const result = await context.env.DB.prepare(
      'INSERT INTO eventos (curso_id, fecha, titulo, hora_inicio, hora_fin, descripcion) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(curso_id, fecha, titulo, hora_inicio, hora_fin, descripcion).run();

    return json({ ok: true, id: result.meta?.last_row_id || null });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Error interno' }, 500);
  }
}
