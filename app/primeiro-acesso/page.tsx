import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere, projectInclude, serializeProject } from '@/lib/projects';
import { readProjectDraft } from '@/lib/drafts';
import { PrimeiroAcessoClient } from './PrimeiroAcessoClient';

export const dynamic = 'force-dynamic';

export default async function PrimeiroAcesso() {
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  if (u.role !== 'MANAGER') redirect('/hub');
  // Retoma onde parou: sem projeto → passo 2; com projeto criado por esta pessoa → passo 3.
  const mine = await db.project.findFirst({ where: { ...accessibleWhere(u.id), ownerId: u.id }, include: projectInclude, orderBy: { createdAt: 'asc' } });
  const [createDraft, editDraft] = await Promise.all([readProjectDraft(u.id), mine ? readProjectDraft(u.id, mine.id) : null]);
  return <PrimeiroAcessoClient user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} project={mine ? serializeProject(mine) : null} createDraft={createDraft} editDraft={editDraft} />;
}
