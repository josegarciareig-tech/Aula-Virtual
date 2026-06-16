import { json } from './_utils.js';

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const id = Number(url.searchParams.get('id') || 0);

    if (!id) return json({ ok: false, error: 'ID no válido' }, 400);

    const curso = await context.env.DB.prepare(
      'SELECT * FROM cursos WHERE id = ?'
    ).bind(id).first();

    if (!curso) return json({ ok: false, error: 'Curso no encontrado' }, 404);

    const temas = await context.env.DB.prepare(
      'SELECT * FROM temas WHERE curso_id = ? ORDER BY orden_num ASC, id ASC'
    ).bind(id).all();

    const materiales = await context.env.DB.prepare(
      'SELECT * FROM materiales WHERE curso_id = ? ORDER BY id DESC'
    ).bind(id).all();

    return json({
      ok: true,
      curso,
      temas: temas.results || [],
      materiales: materiales.results || []
    });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Error interno' }, 500);
  }
}
