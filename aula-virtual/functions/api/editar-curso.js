export async function onRequestPost(context) {
  try {
    const request = context.request;
    const env = context.env;

    const body = await request.json();

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

    await env.DB.prepare(`
      UPDATE cursos
      SET titulo = ?, descripcion = ?
      WHERE id = ?
    `).bind(
      titulo,
      descripcion,
      curso_id
    ).run();

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Error al editar curso" },
      { status: 500 }
    );
  }
}
