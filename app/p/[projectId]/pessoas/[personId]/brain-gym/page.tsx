import { db } from '@/lib/db';
import { loadPersonPage } from '@/lib/person';
import { readDraft } from '@/lib/drafts';
import { BrainGymClient } from './BrainGymClient';

export const dynamic = 'force-dynamic';

export default async function BrainGymPage({ params }: { params: Promise<{ projectId: string; personId: string }> }) {
  const { projectId, personId } = await params;
  const { user, person, isOwn } = await loadPersonPage(projectId, personId);
  const [items, skills, draft] = await Promise.all([
    db.studyItem.findMany({ where: { personId, deletedAt: null }, orderBy: { createdAt: 'desc' }, include: { skill: { select: { name: true } } } }),
    db.skill.findMany({ where: { projectId }, orderBy: { position: 'asc' }, select: { id: true, name: true } }),
    isOwn ? readDraft<any>(user.id, 'study', personId) : null,
  ]);
  return (
    <BrainGymClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }}
      person={{ id: person.id, name: person.name, avatar: (person.avatar as any) ?? null }} projectId={projectId} isOwn={isOwn} skills={skills}
      items={items.map((i) => ({ id: i.id, type: i.type, title: i.title, url: i.url ?? '', skillId: i.skillId ?? '', skillName: i.skill?.name ?? '', progress: i.progress, total: i.total, notes: i.notes ?? '' }))}
      draft={draft}
    />
  );
}
