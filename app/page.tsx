import { currentUser } from '@/lib/session';
import { Landing } from '@/components/landing/Landing';

export const dynamic = 'force-dynamic';

// A landing é sempre a página principal. Quem já está logado vê o atalho "Abrir meu painel" no menu.
export default async function Home() {
  return <Landing loggedIn={!!(await currentUser())} />;
}
