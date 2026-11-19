import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import type { Resultados } from '@/lib/agent/schemas';
import type { RunState } from '@/lib/agent/orchestrator';
import { AnaliseClient } from './AnaliseClient';

export const dynamic = 'force-dynamic';

export default async function AnalisePage({ params }: { params: Promise<{ projectId: string; id: string }> }) {
  const { projectId, id } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const i = await db.initiative.findFirst({ where: { id, projectId, project: accessibleWhere(u.id) }, select: { id: true, product: true, tableOpenedAt: true } });
  if (!i) notFound();
  const run = await db.agentRun.findFirst({ where: { initiativeId: id, status: 'DONE' }, orderBy: { createdAt: 'desc' } });
  if (!run) redirect(`/p/${projectId}/iniciativas/${id}/mesa`);
  const results = (run.state as unknown as RunState).results as Resultados;
  return (
    <AnaliseClient
      user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} projectId={projectId}
      initiative={{ id: i.id, product: i.product }} results={results} when={run.createdAt.toISOString()} model={run.model ?? ''}
    />
  );
}
