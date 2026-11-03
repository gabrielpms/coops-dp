import { db } from '@/lib/db';
import { loadSquadPage } from '@/lib/squad';
import { SquadHomeClient } from './SquadHomeClient';

export const dynamic = 'force-dynamic';

export default async function SquadPage({ params }: { params: Promise<{ projectId: string; squadId: string }> }) {
  const { projectId, squadId } = await params;
  const { user, squad, isManager } = await loadSquadPage(projectId, squadId);
  const [members, cards] = await Promise.all([
    db.squadMembership.findMany({ where: { squadId }, include: { person: { select: { id: true, name: true, title: true, avatar: true, deletedAt: true } } } }),
    db.squadCard.groupBy({ by: ['deck'], where: { squadId, deletedAt: null, status: 'ABERTA' }, _count: true }),
  ]);
  const n = (d: string) => cards.find((c) => c.deck === d)?._count ?? 0;
  return (
    <SquadHomeClient
      user={{ name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }} projectId={projectId} squad={squad} isManager={isManager}
      people={members.filter((m) => !m.person.deletedAt).map((m) => ({ id: m.person.id, name: m.person.name, title: m.person.title ?? '', avatar: (m.person.avatar as any) ?? null, crown: m.crown }))}
      counts={{ DESAFIO: n('DESAFIO'), FRENTE: n('FRENTE'), ESTRATEGIA: n('ESTRATEGIA'), INDICADOR: n('INDICADOR'), ALAVANCA: n('ALAVANCA') }}
    />
  );
}
