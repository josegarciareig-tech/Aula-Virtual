export async function onRequestPost(context) {
  try {
    const request = context.request;
    const env = context.env;

    const formData = await request.formData();

    const profesorKey = formData.get("profesor_key");
    const curso_id = Number(formData.get("curso_id"));
    const tema_id = Number(formData.get("tema_id"));
    const titulo = (formData.get("titulo") || "").toString().trim();
    const descripcion = (formData.get("descripcion") || "").toString().trim();
    const tipo = (formData.get("tipo") || "").toString().trim().toLowerCase();
    const file = formData.get("file");

    const ADMIN_KEY = env.ADMIN_KEY || "cambiar-esta-clave";

    if (profesorKey !== ADMIN_KEY) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    if (!curso_id || !tema_id || !titulo || !tipo || !file) {
      return Response.json({ ok: false, error: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return Response.json({ ok: false, error: "Archivo no válido" }, { status: 400 });
    }

    const allowed = ["pdf", "docx", "pptx", "html", "jpg", "jpeg", "png"];
    if (!allowed.includes(tipo)) {
      return Response.json({ ok: false, error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    const originalName = file.name || "archivo";
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectKey = `curso-${curso_id}/tema-${tema_id}/${safeName}`;

    await env.FILES.put(objectKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || "application/octet-stream"
      }
    });

    const result = await env.DB.prepare(`
      INSERT INTO materiales (curso_id, tema_id, titulo, descripcion, tipo, archivo_nombre, archivo_ruta)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      curso_id,
      tema_id,
      titulo,
      descripcion,
      tipo,
      safeName,
      objectKey
    ).run();

    return Response.json({
      ok: true,
      id: result.meta?.last_row_id || null,
      archivo: safeName,
      ruta: objectKey
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Error al subir archivo" },
      { status: 500 }
    );
  }
}