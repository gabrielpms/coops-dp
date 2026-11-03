import { db } from '@/lib/db';
import { loadPersonPage } from '@/lib/person';
import { SaudeClient } from './SaudeClient';

export const dynamic = 'force-dynamic';

export default async function SaudePage({ params }: { params: Promise<{ projectId: string; personId: string }> }) {
  const { projectId, personId } = await params;
  const { user, person, isOwn } = await loadPersonPage(projectId, personId);
  const rows = await db.healthCheckin.findMany({ where: { personId }, orderBy: { createdAt: 'desc' }, take: 8 });
  return (
    <SaudeClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }}
      person={{ id: person.id, name: person.name, avatar: (person.avatar as any) ?? null }} projectId={projectId} isOwn={isOwn}
      history={rows.map((r) => ({ id: r.id, cycle: r.cycle, saude: r.saude, design: r.design, produto: r.produto, negocio: r.negocio, note: r.note ?? '', at: r.createdAt.toISOString() }))}
    />
  );
}
