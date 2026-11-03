import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { EntrarClient } from './EntrarClient';

export default async function Entrar({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  if (await currentUser()) redirect('/hub');
  return <EntrarClient linkError={(await searchParams).erro === 'link'} />;
}
