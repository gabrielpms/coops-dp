import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { CoopsLink } from '@/components/nav/useCoopsRouter';

const SECTIONS: Record<string, { title: string; when: string }> = {
  time: { title: 'Gestão de time', when: 'Marco 2 · Time' },
  iniciativas: { title: 'Iniciativas', when: 'Marco 4 · Iniciativas' },
};

export default async function Placeholder({ params }: { params: Promise<{ projectId: string; section: string }> }) {
  const { projectId, section } = await params;
  const meta = SECTIONS[section];
  if (!meta) notFound();
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const p = await db.project.findFirst({ where: { id: projectId, ...accessibleWhere(u.id) } });
  if (!p) notFound();
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CoopsLink href="/hub" style={{ fontSize: 14 }}>← voltar ao hub</CoopsLink>
      <h1 style={{ margin: 0, fontSize: 48, fontWeight: 800, letterSpacing: '-0.035em' }}>{meta.title}</h1>
      <p style={{ margin: 0, color: '#A3A1AD', fontSize: 17 }}>{p.name} · esta tela entra no {meta.when} do plano do PRD.</p>
    </main>
  );
}
