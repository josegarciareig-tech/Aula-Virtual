export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const env = context.env;

    const profesorKey = (body.profesor_key || "").trim();
    const tema_id = Number(body.tema_id);

    const ADMIN_KEY = env.ADMIN_KEY || "cambiar-esta-clave";

    if (profesorKey !== ADMIN_KEY) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (!tema_id) {
      return Response.json({ ok: false, error: "Falta tema_id" }, { status: 400 });
    }

    await env.DB.prepare(`DELETE FROM materiales WHERE tema_id = ?`)
      .bind(tema_id)
      .run();

    await env.DB.prepare(`DELETE FROM temas WHERE id = ?`)
      .bind(tema_id)
      .run();

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Error al borrar tema" },
      { status: 500 }
    );
  }
}
