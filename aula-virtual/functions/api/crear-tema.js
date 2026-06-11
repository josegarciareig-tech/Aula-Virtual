export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const env = context.env;

    const profesorKey = (body.profesor_key || "").trim();
    const curso_id = Number(body.curso_id);
    const titulo = (body.titulo || "").trim();
    const descripcion = (body.descripcion || "").trim();

    const ADMIN_KEY = env.ADMIN_KEY || "cambiar-esta-clave";

    if (profesorKey !== ADMIN_KEY) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (!curso_id || !titulo) {
      return Response.json({ ok: false, error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const ordenResult = await env.DB.prepare(`
      SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente
      FROM temas
      WHERE curso_id = ?
    `).bind(curso_id).first();

    const orden = Number(ordenResult?.siguiente || 1);

    const result = await env.DB.prepare(`
      INSERT INTO temas (curso_id, titulo, descripcion, orden)
      VALUES (?, ?, ?, ?)
    `).bind(
      curso_id,
      titulo,
      descripcion,
      orden
    ).run();

    return Response.json({
      ok: true,
      id: result.meta?.last_row_id || null
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Error al crear tema" },
      { status: 500 }
    );
  }
}
