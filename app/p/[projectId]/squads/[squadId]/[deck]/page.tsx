import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { loadSquadPage } from '@/lib/squad';
import { readDraft } from '@/lib/drafts';
import { SLUG_TO_DECK } from '@/components/squad/types';
import { SquadDeckClient } from './SquadDeckClient';
import { SaudeTimeClient } from './SaudeTimeClient';

export const dynamic = 'force-dynamic';
const MIN_ANSWERS = 3; // abaixo disso o agregado poderia identificar quem respondeu

export default async function SquadDeckPage({ params }: { params: Promise<{ projectId: string; squadId: string; deck: string }> }) {
  const { projectId, squadId, deck: slug } = await params;
  const { user, squad, isManager } = await loadSquadPage(projectId, squadId);
  const header = { user: { name: user.name, email: user.email, role: user.role, avatar: user.avatar as any }, projectId, squad };

  if (slug === 'saude') {
    const members = await db.squadMembership.findMany({ where: { squadId }, select: { personId: true } });
    const ids = members.map((m) => m.personId);
    const latest = await Promise.all(ids.map((personId) => db.healthCheckin.findFirst({ where: { personId }, orderBy: { createdAt: 'desc' } })));
    const rows = latest.filter((x): x is NonNullable<typeof x> => !!x);
    const avg = (k: 'saude' | 'design' | 'produto' | 'negocio') => rows.reduce((a, r) => a + r[k], 0) / (rows.length || 1);
    return <SaudeTimeClient {...header} total={ids.length} answers={rows.length} enough={rows.length >= MIN_ANSWERS} min={MIN_ANSWERS} avgs={{ saude: avg('saude'), design: avg('design'), produto: avg('produto'), negocio: avg('negocio') }} />;
  }
  const deck = SLUG_TO_DECK[slug];
  if (!deck) notFound();
  const [cards, members, challenges, draft] = await Promise.all([
    db.squadCard.findMany({ where: { squadId, deck, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
    db.squadMembership.findMany({ where: { squadId }, include: { person: { select: { id: true, name: true, avatar: true, deletedAt: true } } } }),
    db.squadCard.findMany({ where: { squadId, deck: 'DESAFIO', deletedAt: null, status: 'ABERTA' }, select: { id: true, title: true } }),
    isManager ? readDraft<any>(user.id, `squad:${deck}`, squadId) : null,
  ]);
  return (
    <SquadDeckClient {...header} deck={deck} isManager={isManager} draft={draft}
      people={members.filter((m) => !m.person.deletedAt).map((m) => ({ id: m.person.id, name: m.person.name, avatar: (m.person.avatar as any) ?? null }))}
      challenges={challenges}
      cards={cards.map((c) => ({ id: c.id, deck: c.deck, title: c.title, status: c.status, closedAt: c.closedAt ? c.closedAt.toISOString() : null, level: c.level, championPersonId: c.championPersonId, data: (c.data as any) ?? {} }))} />
  );
}
