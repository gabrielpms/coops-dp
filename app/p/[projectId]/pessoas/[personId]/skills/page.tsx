import { db } from '@/lib/db';
import { loadPersonPage } from '@/lib/person';
import { currentCycle } from '@/lib/validation';
import { SkillsClient } from './SkillsClient';

export const dynamic = 'force-dynamic';

export default async function SkillsPage({ params }: { params: Promise<{ projectId: string; personId: string }> }) {
  const { projectId, personId } = await params;
  const { user, person, isOwn, isManager } = await loadPersonPage(projectId, personId);
  const cycle = currentCycle();
  const [skills, categories, ratings] = await Promise.all([
    db.skill.findMany({ where: { projectId }, orderBy: { position: 'asc' } }),
    db.skillCategory.findMany({ where: { projectId }, orderBy: { name: 'asc' } }),
    db.skillRating.findMany({ where: { personId, cycle } }),
  ]);
  return (
    <SkillsClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }}
      person={{ id: person.id, name: person.name, avatar: (person.avatar as any) ?? null }} projectId={projectId} cycle={cycle} isOwn={isOwn} canGrade={isManager && !isOwn}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      skills={skills.map((s) => ({ id: s.id, name: s.name, categoryId: s.categoryId, self: ratings.find((r) => r.skillId === s.id)?.selfScore ?? 0, manager: ratings.find((r) => r.skillId === s.id)?.managerScore ?? 0 }))}
    />
  );
}
