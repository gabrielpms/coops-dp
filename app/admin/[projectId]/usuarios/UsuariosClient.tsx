'use client';
import { useState } from 'react';
import { AppHeader, DEFAULT_AVATAR } from '@/components/ds/AppHeader';
import { AdminBanner, AdminCard } from '@/components/admin/AdminBanner';
import { AvatarIcon } from '@/components/admin/Icons';
import { AdminUserDeck, type ManagedUser } from '@/components/admin/AdminUserDeck';
import type { SquadOpt } from '@/components/team/SquadChoice';
import { Avatar, type AvatarConfig } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';

const status = (u: ManagedUser) => (u.blocked ? 'BLOQUEADO' : u.pending ? 'SEM ACESSO' : 'ATIVO');
const bgOf = (u: ManagedUser) => (u.blocked ? '#FF8A5B' : u.pending ? '#F3D36B' : '#B7A6FF');

export function UsuariosClient({ user, project, users, squads }: { user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; project: { id: string; name: string }; users: ManagedUser[]; squads: SquadOpt[] }) {
  const { refresh } = useCoopsRouter();
  const [open, setOpen] = useState<ManagedUser | null>(null);
  const meAvatar = { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? DEFAULT_AVATAR) };
  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <AdminBanner view="usr" title="Usuários" desc={`${project.name} · Toque numa carta para editar os dados, redefinir a senha, bloquear o acesso ou excluir.`} meAvatar={meAvatar} back={{ href: `/admin/${project.id}`, label: '← Administração do projeto' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {users.map((m) => (
            <AdminCard key={m.id} bg={bgOf(m)} icon={<AvatarIcon bg={(m.avatar as AvatarConfig | null)?.bg ?? '#F5F2EC'}><Avatar {...DEFAULT_AVATAR_CFG} {...(m.avatar ?? {})} crown={m.role === 'MANAGER'} size={52} label="" /></AvatarIcon>}
              big={m.role === 'MANAGER' ? 'MGR' : 'IC'} bigLabel={status(m)} kicker="USUÁRIO" title={m.name} foot={`${squads.find((q) => q.id === m.squadId)?.name ?? 'Sem squad'} · ${m.email || 'Sem e-mail'}`} aria={`Abrir o usuário ${m.name}`} onClick={() => setOpen(m)} />
          ))}
          {users.length === 0 && (
            <div style={{ height: 340, boxSizing: 'border-box', borderRadius: 22, border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 }}>
              <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></svg></span>
              <span style={{ fontSize: 17, fontWeight: 600 }}>Nenhum outro usuário</span>
              <span style={{ fontSize: 13, color: '#A3A1AD', textAlign: 'center' }}>Quem você cadastrar no Time ou na Liderança aparece aqui para editar, bloquear ou excluir</span>
            </div>
          )}
        </div>
      </div>
      {open && <AdminUserDeck key={open.id} projectId={project.id} user={open} squads={squads} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); refresh(); }} />}
    </div>
  );
}
