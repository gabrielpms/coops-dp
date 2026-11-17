import { db } from '@/lib/db';
import { loadSquadPage } from '@/lib/squad';
import { projectCycle } from '@/lib/projectCycle';
import { SquadHomeClient } from './SquadHomeClient';

export const dynamic = 'force-dynamic';

export default async function SquadPage({ params }: { params: Promise<{ projectId: string; squadId: string }> }) {
  const { projectId, squadId } = await params;
  const { user, squad, isManager } = await loadSquadPage(projectId, squadId);
  const { cycle } = await projectCycle(projectId);
  const [members, cards, health] = await Promise.all([
    db.squadMembership.findMany({ where: { squadId }, include: { person: { select: { id: true, name: true, title: true, avatar: true, deletedAt: true } } } }),
    db.squadCard.groupBy({ by: ['deck'], where: { squadId, deletedAt: null, status: 'ABERTA' }, _count: true }),
    db.healthCheckin.findMany({ where: { person: { squads: { some: { squadId } } }, cycle }, orderBy: { createdAt: 'desc' } }),
  ]);
  const latestH = [...new Map(health.map((h) => [h.personId, h])).values()];
  const healthAvg = latestH.length >= 3 ? latestH.reduce((a, h) => a + (h.saude + h.design + h.produto + h.negocio) / 4, 0) / latestH.length : null;
  const n = (d: string) => cards.find((c) => c.deck === d)?._count ?? 0;
  return (
    <SquadHomeClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }} projectId={projectId} squad={squad} isManager={isManager}
      people={members.filter((m) => !m.person.deletedAt).map((m) => ({ id: m.person.id, name: m.person.name, title: m.person.title ?? '', avatar: (m.person.avatar as any) ?? null, crown: m.crown }))}
      cycle={cycle} healthAvg={healthAvg} healthN={latestH.length} counts={{ DESAFIO: n('DESAFIO'), FRENTE: n('FRENTE'), ESTRATEGIA: n('ESTRATEGIA'), INDICADOR: n('INDICADOR'), ALAVANCA: n('ALAVANCA') }}
    />
  );
}
