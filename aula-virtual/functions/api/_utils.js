export const PROFESOR_KEY = 'docente2026';

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function readJson(request) {
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export function unauthorized() {
  return json({ ok: false, error: 'No autorizado' }, 401);
}

export function requireProfesorKey(value) {
  return String(value || '') === PROFESOR_KEY;
}
