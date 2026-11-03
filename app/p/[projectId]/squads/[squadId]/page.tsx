import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { CoopsLink } from '@/components/nav/useCoopsRouter';

export default async function SquadPlaceholder({ params }: { params: Promise<{ projectId: string; squadId: string }> }) {
  const { projectId, squadId } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const squad = await db.squad.findFirst({ where: { id: squadId, projectId, deletedAt: null, project: accessibleWhere(u.id) } });
  if (!squad) notFound();
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CoopsLink href={`/p/${projectId}/time`} style={{ fontSize: 14 }}>← voltar ao time</CoopsLink>
      <h1 style={{ margin: 0, fontSize: 48, fontWeight: 800, letterSpacing: '-0.035em' }}>{squad.name}</h1>
      <p style={{ margin: 0, color: '#A3A1AD', fontSize: 17 }}>Os decks do squad (desafios, frentes, estratégia, indicadores, alavancas e saúde) entram no Marco 3 do plano do PRD.</p>
    </main>
  );
}
