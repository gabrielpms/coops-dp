/** Importação de telas do Figma: lista os frames de um link e baixa cada um como PNG (API REST do Figma, token pessoal do dono do projeto). */
const API = 'https://api.figma.com/v1';
export const MAX_FRAMES = 20;
const MAX_BYTES = 20 * 1024 * 1024;

export type FigmaLink = { fileKey: string; nodeId: string | null };
export type FigmaFrame = { id: string; name: string };
export type Res<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

/** Aceita links de arquivo, página ou frame (design/file/proto/board…); o node-id vem com "-" na URL e com ":" na API. */
export function parseFigmaUrl(raw: string): FigmaLink | null {
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); } catch { return null; }
  if (!/(^|\.)figma\.com$/i.test(u.hostname)) return null;
  const m = u.pathname.match(/^\/(?:design|file|proto|board|make)\/([A-Za-z0-9]{10,40})(?:\/branch\/([A-Za-z0-9]{10,40}))?/);
  if (!m) return null;
  const node = u.searchParams.get('node-id');
  return { fileKey: m[2] ?? m[1], nodeId: node ? node.replace(/-/g, ':') : null };
}
export const isFigmaUrl = (raw: string) => parseFigmaUrl(raw) !== null;

const msg = (status: number): string =>
  status === 403 ? 'O token do Figma não tem acesso a esse arquivo. Use um token de quem pode abrir o arquivo.'
    : status === 404 ? 'Não encontrei esse arquivo ou frame no Figma. Confira o link.'
    : status === 429 ? 'O Figma pediu para esperar um pouco. Tente de novo em instantes.'
    : 'O Figma não respondeu como esperado. Tente de novo.';

async function figma<T>(token: string, path: string): Promise<Res<T>> {
  try {
    const r = await fetch(`${API}${path}`, { headers: { 'X-Figma-Token': token }, signal: AbortSignal.timeout(45_000) });
    if (!r.ok) return { ok: false, status: r.status, message: msg(r.status) };
    return { ok: true, data: (await r.json()) as T };
  } catch { return { ok: false, status: 504, message: 'Sem resposta do Figma. Tente de novo.' }; }
}

/** Valida o token (usado ao salvar na tela de Integrações). */
export async function checkFigmaToken(token: string): Promise<Res<{ handle: string }>> {
  const r = await figma<{ handle?: string; email?: string }>(token, '/me');
  if (!r.ok) return { ok: false, status: r.status, message: r.status === 403 || r.status === 401 ? 'O Figma não aceitou esse token.' : r.message };
  return { ok: true, data: { handle: r.data.handle ?? '' } };
}

type Node = { id: string; name: string; type: string; visible?: boolean; children?: Node[] };
const SCREEN = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE']);

/** Telas do link: um frame vira uma tela; página ou seção viram os frames de primeiro nível; sem node-id, o primeiro nível de todas as páginas. */
function screensOf(root: Node, pickChildren: boolean): Node[] {
  const kids = (root.children ?? []).filter((c) => c.visible !== false);
  if (!pickChildren && SCREEN.has(root.type)) return [root];
  const out: Node[] = [];
  for (const c of kids) {
    if (SCREEN.has(c.type)) out.push(c);
    else if (c.type === 'SECTION') out.push(...(c.children ?? []).filter((x) => x.visible !== false && SCREEN.has(x.type)));
  }
  return out;
}

export async function listFrames(token: string, link: FigmaLink): Promise<Res<FigmaFrame[]>> {
  if (link.nodeId) {
    const r = await figma<{ nodes: Record<string, { document: Node } | null> }>(token, `/files/${link.fileKey}/nodes?ids=${encodeURIComponent(link.nodeId)}&depth=3`);
    if (!r.ok) return r;
    const doc = r.data.nodes[link.nodeId]?.document;
    if (!doc) return { ok: false, status: 404, message: msg(404) };
    const list = screensOf(doc, doc.type === 'CANVAS' || doc.type === 'SECTION');
    return { ok: true, data: list.map((n) => ({ id: n.id, name: n.name })) };
  }
  const r = await figma<{ document: Node }>(token, `/files/${link.fileKey}?depth=3`);
  if (!r.ok) return r;
  const list = (r.data.document.children ?? []).flatMap((page) => screensOf(page, true));
  return { ok: true, data: list.map((n) => ({ id: n.id, name: n.name })) };
}

export type Rendered = { name: string; bytes: Uint8Array };
/** Renderiza os frames em PNG e baixa os arquivos; frames que o Figma não conseguiu renderizar ficam de fora. */
export async function renderFrames(token: string, fileKey: string, frames: FigmaFrame[]): Promise<Res<Rendered[]>> {
  const ids = frames.map((f) => f.id);
  const r = await figma<{ images: Record<string, string | null>; err?: string | null }>(token, `/images/${fileKey}?ids=${encodeURIComponent(ids.join(','))}&format=png&scale=1`);
  if (!r.ok) return r;
  const out: Rendered[] = [];
  for (const f of frames) {
    const url = r.data.images[f.id];
    if (!url) continue;
    try {
      const img = await fetch(url, { signal: AbortSignal.timeout(45_000) });
      if (!img.ok) continue;
      const buf = new Uint8Array(await img.arrayBuffer());
      if (buf.byteLength > 0 && buf.byteLength <= MAX_BYTES) out.push({ name: f.name, bytes: buf });
    } catch { /* tela que não baixou fica de fora */ }
  }
  return { ok: true, data: out };
}
