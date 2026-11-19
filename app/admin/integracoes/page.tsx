import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { integrationState } from '@/lib/agent/settings';
import { IntegracoesClient } from './IntegracoesClient';

export const dynamic = 'force-dynamic';

export default async function IntegracoesPage() {
  const u = await currentUser();
  if (!u) redirect('/cadastro');
  if (u.role !== 'MANAGER') redirect('/admin');
  return <IntegracoesClient user={{ name: u.name, email: u.email, role: u.role, avatar: u.avatar as any }} state={await integrationState(u)} />;
}
