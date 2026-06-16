import { json, readJson, requireProfesorKey, unauthorized } from './_utils.js';

export async function onRequestPost(context) {
  try {
    const body = await readJson(context.request);
    if (!requireProfesorKey(body.profesor_key)) return unauthorized();

    const eventoId = Number(body.evento_id || 0);
    if (!eventoId) return json({ ok: false, error: 'Evento no válido' }, 400);

    await context.env.DB.prepare(
      'DELETE FROM eventos WHERE id = ?'
    ).bind(eventoId).run();

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Error interno' }, 500);
  }
}
