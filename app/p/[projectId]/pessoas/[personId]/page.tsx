import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { CoopsLink } from '@/components/nav/useCoopsRouter';

export default async function PessoaPlaceholder({ params }: { params: Promise<{ projectId: string; personId: string }> }) {
  const { projectId, personId } = await params;
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const person = await db.person.findFirst({ where: { id: personId, projectId, deletedAt: null, project: accessibleWhere(u.id) } });
  if (!person) notFound();
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CoopsLink href={`/p/${projectId}/time`} style={{ fontSize: 14 }}>← voltar ao time</CoopsLink>
      <h1 style={{ margin: 0, fontSize: 48, fontWeight: 800, letterSpacing: '-0.035em' }}>{person.name}</h1>
      <p style={{ margin: 0, color: '#A3A1AD', fontSize: 17 }}>Os decks da pessoa (eventos, skills, brain gym, jornada, saúde e entregas) entram no Marco 2 e 3 do plano do PRD.</p>
    </main>
  );
}
