import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { EntrarClient } from './EntrarClient';

export default async function Entrar() {
  if (await currentUser()) redirect('/hub');
  return <EntrarClient />;
}
