export async function onRequestGet(context) {
  try {
    const db = context.env.DB

    const { results } = await db
      .prepare("SELECT id, titulo, descripcion, imagen, creado_en FROM cursos ORDER BY id DESC")
      .all()

    return Response.json({
      ok: true,
      cursos: results || []
    })
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Error al cargar cursos" },
      { status: 500 }
    )
  }
}
