import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { CadastroClient } from './CadastroClient';

export default async function Cadastro() {
  if (await currentUser()) redirect('/');
  return <CadastroClient />;
}
