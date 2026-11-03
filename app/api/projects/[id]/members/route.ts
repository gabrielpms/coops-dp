import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { memberSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { sendMail } from '@/lib/mail';

type Ctx = { params: Promise<{ id: string }> };

// Nova pessoa: cria a carta no Time e o convite por e-mail.
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, memberSchema);
  if (isResponse(body)) return body;
  const dupe = await db.person.findFirst({ where: { projectId: id, email: body.email, deletedAt: null } });
  if (dupe) return fail(409, 'Já existe uma pessoa com esse e-mail neste projeto.');
  const person = await db.$transaction(async (tx) => {
    const p = await tx.person.create({ data: { projectId: id, name: body.name, title: body.title || null, email: body.email, mainSkill: body.mainSkill || null, joinedAt: body.joinedAt ? new Date(body.joinedAt) : null, avatar: body.avatar ?? undefined } });
    await tx.invite.upsert({ where: { projectId_email: { projectId: id, email: body.email } }, create: { projectId: id, name: body.name, email: body.email, position: 'IC' }, update: {} });
    return p;
  });
  await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'member', entityId: id } });
  await sendMail(body.email, `${ctx.user.name} convidou você para a Coops`, `Você foi convidado(a) para ${ctx.project.name}. Crie sua conta com este e-mail: ${process.env.APP_URL}/cadastro`);
  return json({ person: { id: person.id } }, 201);
}
