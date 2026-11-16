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
    const all = await db.healthCheckin.findMany({ where: { personId: { in: ids } }, orderBy: { createdAt: 'desc' } });
    type K = 'saude' | 'design' | 'produto' | 'negocio';
    const cycles = [...new Set(all.map((r) => r.cycle))].sort().slice(-4);
    // um check-in por pessoa por ciclo (o mais recente); o agregado só aparece com respostas suficientes
    const series = cycles.map((cycle) => {
      const rows = ids.map((id) => all.find((r) => r.personId === id && r.cycle === cycle)).filter((x): x is NonNullable<typeof x> => !!x);
      const avg = (k: K) => rows.reduce((a, r) => a + r[k], 0) / (rows.length || 1);
      return { cycle, n: rows.length, avgs: rows.length >= MIN_ANSWERS ? { saude: avg('saude'), design: avg('design'), produto: avg('produto'), negocio: avg('negocio') } : null };
    });
    const cur = series[series.length - 1] ?? null;
    return <SaudeTimeClient {...header} total={ids.length} answers={cur?.n ?? 0} enough={!!cur?.avgs} min={MIN_ANSWERS} series={series} />;
  }
  const deck = SLUG_TO_DECK[slug];
  if (!deck) notFound();
  const [cards, members, challenges, draft, openByDeck] = await Promise.all([
    db.squadCard.findMany({ where: { squadId, deck, deletedAt: null }, orderBy: { createdAt: 'asc' } }),
    db.squadMembership.findMany({ where: { squadId }, include: { person: { select: { id: true, name: true, avatar: true, deletedAt: true } } } }),
    db.squadCard.findMany({ where: { squadId, deck: 'DESAFIO', deletedAt: null, status: 'ABERTA' }, select: { id: true, title: true } }),
    isManager ? readDraft<any>(user.id, `squad:${deck}`, squadId) : null,
    db.squadCard.groupBy({ by: ['deck'], where: { squadId, deletedAt: null, status: 'ABERTA' }, _count: true }),
  ]);
  return (
    <SquadDeckClient {...header} deck={deck} deckCounts={Object.fromEntries(openByDeck.map((g) => [g.deck, g._count]))} isManager={isManager} draft={draft}
      people={members.filter((m) => !m.person.deletedAt).map((m) => ({ id: m.person.id, name: m.person.name, avatar: (m.person.avatar as any) ?? null }))}
      challenges={challenges}
      cards={cards.map((c) => ({ id: c.id, deck: c.deck, title: c.title, status: c.status, closedAt: c.closedAt ? c.closedAt.toISOString() : null, level: c.level, championPersonId: c.championPersonId, data: (c.data as any) ?? {} }))} />
  );
}
