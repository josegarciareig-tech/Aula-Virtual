export async function onRequestGet(context) {
  try {
    const db = context.env.DB;
    const bucket = context.env.FILES;
    const url = new URL(context.request.url);
    const id = Number(url.searchParams.get("id") || "0");

    if (!id) {
      return new Response("Falta el id del material", { status: 400 });
    }

    const material = await db
      .prepare(`
        SELECT id, curso_id, tema_id, titulo, tipo, archivo_nombre, archivo_ruta
        FROM materiales
        WHERE id = ? AND visible = 1
      `)
      .bind(id)
      .first();

    if (!material) {
      return new Response("Material no encontrado", { status: 404 });
    }

    if (!material.archivo_ruta) {
      return new Response("El material no tiene ruta de archivo", { status: 404 });
    }

    const object = await bucket.get(material.archivo_ruta);

    if (!object) {
      return new Response("Archivo no encontrado en R2", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    if (!headers.get("Content-Type")) {
      if (material.tipo === "pdf") headers.set("Content-Type", "application/pdf");
      else if (material.tipo === "html") headers.set("Content-Type", "text/html; charset=utf-8");
      else if (material.tipo === "docx") headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      else if (material.tipo === "pptx") headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
      else if (material.tipo === "jpg" || material.tipo === "jpeg") headers.set("Content-Type", "image/jpeg");
      else if (material.tipo === "png") headers.set("Content-Type", "image/png");
      else headers.set("Content-Type", "application/octet-stream");
    }

    headers.set("Content-Disposition", `inline; filename="${material.archivo_nombre || 'archivo'}"`);

    return new Response(object.body, { headers });
  } catch (error) {
    return new Response(error.message || "Error al abrir el material", { status: 500 });
  }
}