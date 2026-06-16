import { json, readJson, requireProfesorKey, unauthorized } from './_utils.js';

export async function onRequestPost(context) {
  try {
    const body = await readJson(context.request);
    if (!requireProfesorKey(body.profesor_key)) return unauthorized();

    const materialId = Number(body.material_id || 0);
    if (!materialId) return json({ ok: false, error: 'Material no válido' }, 400);

    const material = await context.env.DB.prepare(
      'SELECT * FROM materiales WHERE id = ?'
    ).bind(materialId).first();

    if (!material) return json({ ok: false, error: 'Material no encontrado' }, 404);

    if (material.archivo_key) {
      await context.env.BUCKET.delete(material.archivo_key);
    }

    await context.env.DB.prepare(
      'DELETE FROM materiales WHERE id = ?'
    ).bind(materialId).run();

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: error.message || 'Error interno' }, 500);
  }
}
