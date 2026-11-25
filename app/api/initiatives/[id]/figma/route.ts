import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { figmaImportSchema } from '@/lib/validation';
import { MAX_FRAMES, listFrames, parseFigmaUrl, renderFrames } from '@/lib/figma';
import { objectKey, putObject, removeObject, safeName, storageConfigured } from '@/lib/storage';
import { openSecret } from '@/lib/secret';

export const maxDuration = 120;
type Ctx = { params: Promise<{ id: string }> };
const MAX_FILES = 20; // o motor envia no máximo 20 arquivos (lib/agent/context.ts)

/** Importa as telas de um link do Figma como anexos PNG da carta: daí em diante seguem o mesmo caminho dos arquivos enviados à mão. */
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  if (!storageConfigured()) return fail(503, 'O envio de arquivos ainda não está configurado neste ambiente.');
  if (!ctx.initiative.tableOpenedAt) return fail(409, 'Abra a mesa antes de anexar arquivos.');
  const body = await parse(req, figmaImportSchema);
  if (isResponse(body)) return body;
  const link = parseFigmaUrl(body.url);
  if (!link) return fail(400, 'Esse não parece um link do Figma (figma.com/design/…).');
  const project = await db.project.findUnique({ where: { id: ctx.initiative.projectId }, select: { owner: { select: { figmaToken: true } } } });
  const token = openSecret(project?.owner.figmaToken);
  if (!token) return fail(409, 'O Figma ainda não está conectado. Quem é dono do projeto cadastra o token em Administração › Integrações.');

  const existing = await db.attachment.findMany({ where: { initiativeId: id, uploaded: true }, select: { kind: true, name: true } });
  const room = MAX_FILES - existing.length;
  if (room <= 0) return fail(400, `A mesa já tem ${MAX_FILES} arquivos, que é o máximo que o agente lê. Remova algum para importar.`);

  const frames = await listFrames(token, link);
  if (!frames.ok) return fail(frames.status === 403 || frames.status === 404 ? 422 : 502, frames.message);
  if (!frames.data.length) return fail(422, 'Não encontrei telas nesse link. Cole o link de um arquivo, página ou frame que tenha frames.');
  const names = new Set(existing.filter((a) => a.kind === body.kind).map((a) => a.name));
  const fileName = (n: string) => `${safeName(n).replace(/\.+$/, '') || 'tela'}.png`;
  const fresh = frames.data.filter((f) => !names.has(fileName(f.name)));
  if (!fresh.length) return json({ imported: 0, skipped: frames.data.length, total: frames.data.length, truncated: false });
  const take = fresh.slice(0, Math.min(MAX_FRAMES, room));

  const imgs = await renderFrames(token, link.fileKey, take);
  if (!imgs.ok) return fail(imgs.status === 403 || imgs.status === 404 ? 422 : 502, imgs.message);
  if (!imgs.data.length) return fail(502, 'O Figma não conseguiu gerar as imagens dessas telas. Tente de novo.');

  let imported = 0;
  for (const img of imgs.data) {
    const name = fileName(img.name);
    const key = objectKey(id, name);
    try {
      await putObject(key, 'image/png', img.bytes);
      await db.attachment.create({ data: { initiativeId: id, kind: body.kind, name, mime: 'image/png', size: img.bytes.byteLength, key, uploaded: true, uploadedById: ctx.user.id } });
      imported++;
    } catch { await removeObject(key).catch(() => {}); }
  }
  if (!imported) return fail(502, 'Não deu para guardar as telas. Tente de novo.');
  return json({ imported, skipped: frames.data.length - fresh.length, total: frames.data.length, truncated: fresh.length > take.length }, 201);
}
