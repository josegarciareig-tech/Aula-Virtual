import { json, readJson, requireProfesorKey, unauthorized } from './_utils.js';

export async function onRequestPost(context) {
  try {
    const body = await readJson(context.request);
    if (!requireProfesorKey(body.profesor_key)) return unauthorized();

    const temaId = Number(body.tema_id || 0);
    if (!temaId) return json({ ok: false, error: 'Tema no válido' }, 400);

    await context.env.DB.prepare(
      'DELETE FROM materiales WHERE tema_id = ?'
    ).bind(temaId).run();

    await context.env.DB.prepare(
      'DELETE FROM temas WHERE id = ?'
    ).bind(temaId).run();

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Error al borrar tema' }, 500);
  }
}
