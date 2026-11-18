import { db } from '@/lib/db';
import { fail, isResponse, json, parse } from '@/lib/api/http';
import { leadershipSchema } from '@/lib/validation';
import { requireManagerOfProject } from '@/lib/team';
import { setLeadershipLinks } from '@/lib/leadership';
import { hashPassword } from '@/lib/password';
import { sealSecret } from '@/lib/secret';

type Ctx = { params: Promise<{ id: string }> };

// A própria pessoa logada vira liderança: usa a carta dela no Time, sem convite nem e-mail.
async function createSelfLeadership(projectId: string, ctx: { user: { id: string; name: string; email: string; title: string | null }; project: { name: string } }, body: { name: string; title: string; avatar?: object; squadIds: string[]; memberIds: string[] }) {
  try {
    const leadId = await db.$transaction(async (tx) => {
      const mine = await tx.person.findFirst({ where: { projectId, userId: ctx.user.id, deletedAt: null } });
      const data = { name: body.name, title: body.title || null, avatar: { ...(body.avatar ?? {}), crown: true } };
      const person = mine
        ? await tx.person.update({ where: { id: mine.id }, data })
        : await tx.person.create({ data: { ...data, projectId, userId: ctx.user.id, email: ctx.user.email } });
      const existing = await tx.leadership.findUnique({ where: { personId: person.id } });
      if (existing && !existing.deletedAt) throw new Error('ALREADY_LEADER');
      const l = existing
        ? await tx.leadership.update({ where: { id: existing.id }, data: { deletedAt: null } })
        : await tx.leadership.create({ data: { projectId, personId: person.id } });
      await setLeadershipLinks(tx, l.id, projectId, body.squadIds, body.memberIds.filter((m) => m !== person.id));
      return l.id;
    });
    await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'leadership', entityId: projectId } });
    return json({ leadership: { id: leadId } }, 201);
  } catch (e) {
    const m = (e as Error).message;
    if (m === 'ALREADY_LEADER') return fail(409, 'Você já é liderança neste projeto.');
    if (m === 'INVALID_LINKS') return fail(400, 'Algum squad ou pessoa escolhido não faz parte deste projeto.');
    throw e;
  }
}

// Nova liderança: cria a carta da pessoa (com coroa), convida como manager e associa squads e pessoas.
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const ctx = await requireManagerOfProject(id);
  if (isResponse(ctx)) return ctx;
  const body = await parse(req, leadershipSchema);
  if (isResponse(body)) return body;
  if (body.self) return createSelfLeadership(id, ctx, body);
  if (!body.email) return fail(400, 'Coloque um e-mail válido para o acesso da pessoa');
  if (!body.password) return fail(400, 'Crie uma senha de acesso com pelo menos 8 caracteres');
  const email = body.email, password = body.password;
  if (await db.person.findFirst({ where: { projectId: id, email, deletedAt: null } })) return fail(409, 'Já existe uma pessoa com esse e-mail neste projeto.');
  if (await db.user.findUnique({ where: { email } })) return fail(409, 'Esse e-mail já tem uma conta no Coops. Use outro e-mail ou peça para a pessoa entrar com a conta dela.');
  try {
    const lead = await db.$transaction(async (tx) => {
      const avatar = { ...(body.avatar ?? {}), crown: true };
      const u = await tx.user.create({ data: { name: body.name, email, passwordHash: hashPassword(password), accessPassword: sealSecret(password), role: 'MANAGER', onboardingStep: 3, title: body.title || null, avatar } });
      const person = await tx.person.create({ data: { projectId: id, userId: u.id, name: body.name, title: body.title || null, email, avatar } });
      await tx.invite.updateMany({ where: { projectId: id, email, status: 'PENDING' }, data: { status: 'ACCEPTED' } });
      const l = await tx.leadership.create({ data: { projectId: id, personId: person.id } });
      await setLeadershipLinks(tx, l.id, id, body.squadIds, body.memberIds.filter((m) => m !== person.id));
      return l;
    });
    await db.draft.deleteMany({ where: { userId: ctx.user.id, scope: 'leadership', entityId: id } });
    return json({ leadership: { id: lead.id } }, 201);
  } catch (e) {
    if ((e as Error).message === 'INVALID_LINKS') return fail(400, 'Algum squad ou pessoa escolhido não faz parte deste projeto.');
    throw e;
  }
}
