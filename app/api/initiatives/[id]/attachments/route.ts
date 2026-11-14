import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { initiativeAccess } from '@/lib/initiatives';
import { ALLOWED_MIME, MAX_FILE_BYTES, objectKey, presignUpload, storageConfigured } from '@/lib/storage';
import { attachmentRequestSchema } from '@/lib/validation';

type Ctx = { params: Promise<{ id: string }> };

/** Passo 1: pede permissão de envio. Devolve a URL assinada; o navegador envia o arquivo direto ao bucket. */
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await initiativeAccess(id, true);
  if (isResponse(ctx)) return ctx;
  if (!storageConfigured()) return fail(503, 'O envio de arquivos ainda não está configurado neste ambiente.');
  if (!ctx.initiative.tableOpenedAt) return fail(409, 'Abra a mesa antes de anexar arquivos.');
  const body = await parse(req, attachmentRequestSchema);
  if (isResponse(body)) return body;
  if (!ALLOWED_MIME.includes(body.mime)) return fail(400, 'Esse tipo de arquivo não é aceito. Use imagem, PDF, Office, texto ou vídeo.');
  if (body.size > MAX_FILE_BYTES) return fail(400, 'O arquivo passa de 25 MB.');
  const key = objectKey(id, body.name);
  const a = await db.attachment.create({ data: { initiativeId: id, kind: body.kind, name: body.name, mime: body.mime, size: body.size, key, uploadedById: ctx.user.id } });
  return json({ attachment: { id: a.id }, uploadUrl: await presignUpload(key, body.mime) }, 201);
}
