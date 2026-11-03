import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { accessibleWhere } from '@/lib/projects';

// A landing + wish list (M1) entra no Marco 5. Até lá, a raiz decide para onde a pessoa vai.
export default async function Home() {
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  const has = await db.project.count({ where: accessibleWhere(u.id) });
  redirect(has || u.role !== 'MANAGER' ? '/hub' : '/primeiro-acesso');
}
