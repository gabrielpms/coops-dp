import { db } from '@/lib/db';
import { loadPersonPage } from '@/lib/person';
import { readDraft } from '@/lib/drafts';
import { currentCycle } from '@/lib/validation';
import { JornadaClient } from './JornadaClient';

export const dynamic = 'force-dynamic';

export default async function JornadaPage({ params }: { params: Promise<{ projectId: string; personId: string }> }) {
  const { projectId, personId } = await params;
  const { user, person, isOwn } = await loadPersonPage(projectId, personId);
  const [goals, skills, dGoal, dFoco] = await Promise.all([
    db.journeyGoal.findMany({ where: { personId, deletedAt: null }, orderBy: [{ cycle: 'desc' }, { createdAt: 'asc' }] }),
    db.skill.findMany({ where: { projectId }, orderBy: { position: 'asc' }, select: { name: true } }),
    isOwn ? readDraft<any>(user.id, 'journey:OBJETIVO', personId) : null,
    isOwn ? readDraft<any>(user.id, 'journey:FOCO', personId) : null,
  ]);
  return (
    <JornadaClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }}
      person={{ id: person.id, name: person.name, avatar: (person.avatar as any) ?? null }} projectId={projectId} isOwn={isOwn} cycle={currentCycle()} skills={skills.map((s) => s.name)}
      goals={goals.map((g) => ({ id: g.id, kind: g.kind, cycle: g.cycle, title: g.title, why: g.why ?? '', signal: g.signal ?? '', measure: g.measure ?? '', levelFrom: g.levelFrom ?? 0, levelTo: g.levelTo ?? 0, practice: g.practice ?? '', progress: g.progress }))}
      drafts={{ OBJETIVO: dGoal, FOCO: dFoco }}
    />
  );
}
