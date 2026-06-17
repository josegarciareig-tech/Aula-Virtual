import { json, readJson, requireProfesorKey, unauthorized } from './_utils.js';

export async function onRequestPost(context) {
  try {
    const body = await readJson(context.request);
    if (!requireProfesorKey(body.profesor_key)) return unauthorized();

    const cursoId = Number(body.curso_id || 0);
    if (!cursoId) return json({ ok: false, error: 'Curso no válido' }, 400);

    await context.env.DB.prepare(
      'DELETE FROM materiales WHERE tema_id IN (SELECT id FROM temas WHERE curso_id = ?)'
    ).bind(cursoId).run();

    await context.env.DB.prepare(
      'DELETE FROM temas WHERE curso_id = ?'
    ).bind(cursoId).run();

    await context.env.DB.prepare(
      'DELETE FROM cursos WHERE id = ?'
    ).bind(cursoId).run();

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Error al borrar curso' }, 500);
  }
}
