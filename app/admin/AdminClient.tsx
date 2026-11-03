'use client';
import { useState } from 'react';
import { AppHeader, DEFAULT_AVATAR } from '@/components/ds/AppHeader';
import { AdminBanner, AdminCard, AddCard } from '@/components/admin/AdminBanner';
import { AvatarIcon, IconBrief } from '@/components/admin/Icons';
import { UserDeck, type UserData, type UserDraft } from '@/components/admin/UserDeck';
import { ProjectDeck, type ProjectDraft } from '@/components/wizard/ProjectDeck';
import { Avatar } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';

type AdminProject = { id: string; name: string; segment: string; tagline: string; counts: { squads: number; people: number; initiatives: number }; leaderships: number; categories: number };
const plural = (n: number, a: string, b: string) => (n === 1 ? a : b);
const pad = (n: number) => String(n).padStart(2, '0');

export function AdminClient({ user, projects, projectDraft: pd0, userDraft: ud0 }: { user: UserData; projects: AdminProject[]; projectDraft: ProjectDraft | null; userDraft: UserDraft | null }) {
  const { go, refresh } = useCoopsRouter();
  const isManager = user.role === 'MANAGER';
  const [tab, setTab] = useState<'projetos' | 'meus-dados'>(isManager ? 'projetos' : 'meus-dados');
  const [deck, setDeck] = useState<'user' | 'project' | null>(null);
  const [projectDraft, setProjectDraft] = useState(pd0);
  const [userDraft, setUserDraft] = useState(ud0);
  const meAvatar = { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? DEFAULT_AVATAR) };
  const done = () => { setDeck(null); refresh(); };
  const view = tab === 'projetos' ? 'admin' : 'me';

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <AdminBanner view={view} meAvatar={meAvatar} onMe={() => setTab('meus-dados')} back={{ href: '/hub', label: '← Hub de projetos' }}
          title={view === 'admin' ? 'Administração' : 'Meus dados'}
          desc={view === 'admin' ? 'Seus projetos, quem lidera cada time, as skills que o time desenvolve e os dados da empresa.' : 'Como você aparece no Coops: nome, cargo, e-mail e avatar.'}
          cta={view === 'admin' ? { label: '+ Novo projeto', onClick: () => setDeck('project') } : { label: 'Editar meus dados', onClick: () => setDeck('user') }} />
        {isManager && (
          <div role="tablist" aria-label="Administração" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {([['projetos', `Projetos · ${projects.length}`], ['meus-dados', 'Meus dados']] as const).map(([id, text]) => {
              const on = tab === id;
              return <button key={id} type="button" role="tab" aria-selected={on} onClick={() => setTab(id)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{text}</button>;
            })}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {view === 'admin' ? <>
            {projects.map((p) => (
              <AdminCard key={p.id} bg="#B7A6FF" icon={<IconBrief bg="#B7A6FF" />} big={pad(p.counts.squads)} bigLabel={p.counts.squads === 1 ? 'SQUAD' : 'SQUADS'} kicker={p.segment.toUpperCase()} title={p.name}
                foot={`${p.leaderships} ${plural(p.leaderships, 'liderança', 'lideranças')} · ${p.categories} ${plural(p.categories, 'categoria', 'categorias')} de skill · Gerenciar o projeto →`} aria={`Gerenciar o projeto ${p.name}`}
                onClick={() => go(`/admin/${p.id}`)} />
            ))}
            <AddCard title="Novo projeto" sub="Empresa, estratégia, skills e mercado em um só deck" onClick={() => setDeck('project')} />
          </> : (
            <AdminCard bg="#8FE3C8" icon={<AvatarIcon bg={meAvatar.bg ?? '#B7A6FF'}><Avatar {...meAvatar} crown={false} size={52} label="" /></AvatarIcon>} big={pad(isManager ? projects.length : 1)} bigLabel={isManager ? (projects.length === 1 ? 'PROJETO' : 'PROJETOS') : 'PERFIL'}
              kicker={user.role === 'MANAGER' ? 'MANAGER' : 'IC'} title={user.name} foot={`${user.title || 'Sem cargo'} · ${user.email}`} aria="Editar meus dados" onClick={() => setDeck('user')} />
          )}
        </div>
      </div>
      {deck === 'user' && <UserDeck user={user} draft={userDraft} onDraftChange={setUserDraft} onClose={() => setDeck(null)} onSaved={done} />}
      {deck === 'project' && <ProjectDeck mode="create" draft={projectDraft} onDraftChange={setProjectDraft} onClose={() => setDeck(null)} onSaved={done} />}
    </div>
  );
}
