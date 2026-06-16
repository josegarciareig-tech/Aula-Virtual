import { json, readJson, requireProfesorKey, unauthorized } from './_utils.js';

export async function onRequestPost(context) {
  try {
    const body = await readJson(context.request);
    if (!requireProfesorKey(body.profesor_key)) return unauthorized();

    const titulo = String(body.titulo || '').trim();
    const descripcion = String(body.descripcion || '').trim();

    if (!titulo) {
      return json({ ok: false, error: 'Título obligatorio' }, 400);
    }

    const result = await context.env.DB.prepare(
      'INSERT INTO cursos (titulo, descripcion, imagen) VALUES (?, ?, ?)'
    ).bind(titulo, descripcion, '').run();

    return json({ ok: true, id: result.meta?.last_row_id || null });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Error interno' }, 500);
  }
}