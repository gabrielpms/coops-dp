import { db } from '@/lib/db';
import { fail, isResponse, json, requireUser } from '@/lib/api/http';
import { accessibleWhere } from '@/lib/projects';
import { MAX_FILE_BYTES, objectSize, presignDownload, removeObject, storageConfigured } from '@/lib/storage';

type Ctx = { params: Promise<{ id: string }> };

async function load(id: string) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const a = await db.attachment.findFirst({ where: { id, initiative: { project: accessibleWhere(user.id) } } });
  return a ? { user, a } : fail(404, 'Anexo não encontrado');
}

/** Abre o arquivo: redireciona para uma URL temporária de leitura (só quem tem acesso ao projeto). */
export async function GET(_: Request, { params }: Ctx) {
  const c = await load((await params).id);
  if (isResponse(c)) return c;
  if (!c.a.uploaded) return fail(409, 'O envio desse arquivo não foi concluído.');
  return Response.redirect(await presignDownload(c.a.key, c.a.name), 302);
}

/** Passo 2: o navegador confirma o envio; conferimos o objeto no bucket (existência e tamanho). */
export async function PATCH(_: Request, { params }: Ctx) {
  const c = await load((await params).id);
  if (isResponse(c)) return c;
  if (c.user.role !== 'MANAGER') return fail(403, 'Só o manager conduz a iniciativa');
  if (!storageConfigured()) return fail(503, 'Armazenamento não configurado.');
  let size = 0;
  try { size = await objectSize(c.a.key); } catch { return fail(409, 'O arquivo não chegou ao armazenamento. Tente enviar de novo.'); }
  if (size > MAX_FILE_BYTES) { await removeObject(c.a.key).catch(() => {}); await db.attachment.delete({ where: { id: c.a.id } }); return fail(400, 'O arquivo passa de 25 MB.'); }
  await db.attachment.update({ where: { id: c.a.id }, data: { uploaded: true, size } });
  return json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const c = await load((await params).id);
  if (isResponse(c)) return c;
  if (c.user.role !== 'MANAGER') return fail(403, 'Só o manager conduz a iniciativa');
  if (storageConfigured()) await removeObject(c.a.key).catch(() => {});
  await db.attachment.delete({ where: { id: c.a.id } });
  return json({ ok: true });
}
