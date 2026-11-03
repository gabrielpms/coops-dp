import { db } from './db';
import { hostOf, type ProjectInput } from './validation';

export const projectInclude = {
  indicators: { orderBy: { position: 'asc' as const } },
  competitors: { orderBy: { position: 'asc' as const } },
  referenceLinks: { orderBy: { position: 'asc' as const } },
  skills: { orderBy: { position: 'asc' as const } },
  invites: true,
  _count: { select: { squads: { where: { deletedAt: null } }, persons: { where: { deletedAt: null } }, initiatives: true } },
};

export function serializeProject(p: any) {
  return {
    id: p.id, name: p.name, segment: p.segment, tagline: p.tagline ?? '', strategy: p.strategy ?? '',
    indicators: p.indicators.map((x: any) => x.name), competitors: p.competitors.map((x: any) => x.name),
    links: p.referenceLinks.map((x: any) => x.url), skills: p.skills.map((x: any) => x.name),
    invites: p.invites.map((x: any) => ({ name: x.name, email: x.email, position: x.position, status: x.status })),
    counts: { squads: p._count.squads, people: p._count.persons + p.invites.filter((i: any) => i.status === 'PENDING').length, initiatives: p._count.initiatives },
    pendingInvites: p.invites.filter((i: any) => i.status === 'PENDING').length,
  };
}

const rows = <T, R extends object>(arr: T[], f: (x: T, i: number) => R) => arr.map((x, i) => ({ ...f(x, i), position: i }));

export async function createProject(ownerId: string, ownerName: string, input: ProjectInput) {
  return db.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        name: input.name, segment: input.segment, tagline: input.tagline || null, strategy: input.strategy || null, ownerId,
        indicators: { create: rows(input.indicators, (name) => ({ name })) },
        competitors: { create: rows(input.competitors, (name) => ({ name })) },
        referenceLinks: { create: rows(input.links, (url) => ({ url, host: hostOf(url) })) },
        skills: { create: rows(input.skills, (name) => ({ name })) },
        invites: { create: input.invites.filter((v, i, a) => a.findIndex((o) => o.email === v.email) === i).map((i) => ({ name: i.name, email: i.email, position: i.position })) },
        persons: { create: { name: ownerName, userId: ownerId } },
      },
    });
    await tx.user.updateMany({ where: { id: ownerId, onboardingStep: { lt: 3 } }, data: { onboardingStep: 3 } });
    return project.id;
  });
}

export async function updateProject(id: string, input: ProjectInput) {
  await db.$transaction(async (tx) => {
    await tx.project.update({ where: { id }, data: { name: input.name, segment: input.segment, tagline: input.tagline || null, strategy: input.strategy || null } });
    await Promise.all([tx.keyIndicator.deleteMany({ where: { projectId: id } }), tx.competitor.deleteMany({ where: { projectId: id } }), tx.referenceLink.deleteMany({ where: { projectId: id } })]);
    await tx.keyIndicator.createMany({ data: rows(input.indicators, (name) => ({ name, projectId: id })) });
    await tx.competitor.createMany({ data: rows(input.competitors, (name) => ({ name, projectId: id })) });
    await tx.referenceLink.createMany({ data: rows(input.links, (url) => ({ url, host: hostOf(url), projectId: id })) });
    // skills: mantém as existentes (podem ter categoria) e só adiciona/remove por nome
    const current = await tx.skill.findMany({ where: { projectId: id } });
    const keep = new Set(input.skills);
    await tx.skill.deleteMany({ where: { projectId: id, name: { notIn: [...keep] } } });
    const have = new Set(current.map((s) => s.name));
    await tx.skill.createMany({ data: input.skills.map((name, position) => ({ name, position, projectId: id })).filter((s) => !have.has(s.name)) });
    for (const [position, name] of input.skills.entries()) await tx.skill.updateMany({ where: { projectId: id, name }, data: { position } });
    // convites: acrescenta novos; remove pendentes que saíram da lista; nunca mexe em aceitos
    const emails = input.invites.map((i) => i.email);
    await tx.invite.deleteMany({ where: { projectId: id, status: 'PENDING', email: { notIn: emails } } });
    for (const i of input.invites) {
      await tx.invite.upsert({ where: { projectId_email: { projectId: id, email: i.email } }, create: { projectId: id, name: i.name, email: i.email, position: i.position }, update: {} });
    }
  });
}

/** Projeto visível para o usuário (dono ou pessoa vinculada). */
export function accessibleWhere(userId: string) {
  return { deletedAt: null, OR: [{ ownerId: userId }, { persons: { some: { userId, deletedAt: null } } }] };
}
