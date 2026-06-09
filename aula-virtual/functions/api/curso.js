export async function onRequestGet(context) {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const cursoId = Number(url.searchParams.get("id") || "1");

    const curso = await db
      .prepare("SELECT id, titulo, descripcion FROM cursos WHERE id = ?")
      .bind(cursoId)
      .first();

    const { results: temas } = await db
      .prepare("SELECT id, curso_id, titulo, descripcion, orden_num FROM temas WHERE curso_id = ? ORDER BY orden_num ASC")
      .bind(cursoId)
      .all();

    const { results: materiales } = await db
      .prepare(`
        SELECT id, curso_id, tema_id, titulo, descripcion, tipo, archivo_nombre, archivo_ruta, visible
        FROM materiales
        WHERE curso_id = ? AND visible = 1
        ORDER BY id ASC
      `)
      .bind(cursoId)
      .all();

    return Response.json({
      ok: true,
      curso: curso || null,
      temas: temas || [],
      materiales: materiales || []
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Error al cargar el curso" },
      { status: 500 }
    );
  }
}
