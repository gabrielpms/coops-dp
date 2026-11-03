import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { leadershipSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { setLeadershipLinks } from '@/lib/leadership';
import { sendMail } from '@/lib/mail';

type Ctx = { params: Promise<{ id: string }> };

// Nova liderança: cria a carta da pessoa (com coroa), convida como manager e associa squads e pessoas.
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, leadershipSchema);
  if (isResponse(body)) return body;
  if (!body.email) return fail(400, 'Coloque um e-mail válido para enviar o convite');
  const email = body.email;
  if (await db.person.findFirst({ where: { projectId: id, email, deletedAt: null } })) return fail(409, 'Já existe uma pessoa com esse e-mail neste projeto.');
  try {
    const lead = await db.$transaction(async (tx) => {
      const person = await tx.person.create({ data: { projectId: id, name: body.name, title: body.title || null, email, avatar: { ...(body.avatar ?? {}), crown: true } } });
      await tx.invite.upsert({ where: { projectId_email: { projectId: id, email } }, create: { projectId: id, name: body.name, email, position: 'MANAGER' }, update: {} });
      const l = await tx.leadership.create({ data: { projectId: id, personId: person.id } });
      await setLeadershipLinks(tx, l.id, id, body.squadIds, body.memberIds.filter((m) => m !== person.id));
      return l;
    });
    await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'leadership', entityId: id } });
    await sendMail(email, `${ctx.user.name} convidou você para liderar na Coops`, `Você foi convidado(a) como manager de ${ctx.project.name}. Crie sua conta com este e-mail: ${process.env.APP_URL}/cadastro`);
    return json({ leadership: { id: lead.id } }, 201);
  } catch (e) {
    if ((e as Error).message === 'INVALID_LINKS') return fail(400, 'Algum squad ou pessoa escolhido não faz parte deste projeto.');
    throw e;
  }
}
