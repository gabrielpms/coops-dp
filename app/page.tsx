import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';
import { Landing } from '@/components/landing/Landing';

export const dynamic = 'force-dynamic';

// Quem está logado vai direto para o trabalho; quem não está vê a landing com a wish list.
export default async function Home() {
  const u = await currentUser();
  if (!u) return <Landing />;
  const has = await db.project.count({ where: accessibleWhere(u.id) });
  redirect(has || u.role !== 'MANAGER' ? '/hub' : '/primeiro-acesso');
}
