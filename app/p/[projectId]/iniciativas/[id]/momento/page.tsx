import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { toolById, toolsOf, type Tool } from '@/lib/tools';
import type { RunState } from '@/lib/agent/orchestrator';
import { MomentoClient } from './MomentoClient';

export const dynamic = 'force-dynamic';

export default async function MomentoPage({ params }: { params: Promise<{ projectId: string; id: string }> }) {
  const { projectId, id } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const i = await db.initiative.findFirst({
    where: { id, projectId, project: accessibleWhere(u.id) },
    include: { plays: { include: { cards: { orderBy: { position: 'asc' } } } } },
  });
  if (!i) notFound();
  if (!i.tableOpenedAt || !i.moment) redirect(`/p/${projectId}/iniciativas/${id}/mesa`);
  // Com análise do agente, as ferramentas são as 4 a 6 que ele escolheu; sem ela, as do momento no catálogo.
  const run = await db.agentRun.findFirst({ where: { initiativeId: id, status: 'DONE' }, orderBy: { createdAt: 'desc' }, select: { state: true } });
  const picked = (run?.state as unknown as RunState | undefined)?.results.consolidar;
  const chosen = picked && picked.momento === i.moment ? picked.ferramentas.map(toolById).filter((t): t is Tool => !!t) : [];
  const tools = chosen.length >= 4 ? chosen : toolsOf(i.moment);
  for (const p of i.plays) { const t = toolById(p.toolId); if (t && !tools.some((x) => x.id === t.id)) tools.push(t); } // jogadas já feitas continuam visíveis
  return (
    <MomentoClient
      user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} projectId={projectId}
      initiative={{ id: i.id, product: i.product, moment: i.moment, reason: i.momentReason ?? '', closed: i.status === 'ENCERRADA' }}
      tools={tools}
      plays={i.plays.map((p) => ({ id: p.id, toolId: p.toolId, cards: p.cards.map((c) => ({ id: c.id, title: c.title, tag: c.tag, description: c.description, impact: c.impact, effort: c.effort, metric: c.metric, nextStep: c.nextStep, decision: c.decision as 'KEPT' | 'DISCARDED' | null, note: c.note ?? '' })) }))}
    />
  );
}
