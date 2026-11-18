'use client';
import { BottomSheet } from '../sheet/BottomSheet';
import { AdminCard } from './AdminBanner';
import { AvatarIcon } from './Icons';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '../avatar/AvatarEditor';
import type { ManagedUser } from './AdminUserDeck';

const status = (u: ManagedUser) => (u.blocked ? 'BLOQUEADO' : u.pending ? 'SEM ACESSO' : 'ATIVO');
const bgOf = (u: ManagedUser) => (u.blocked ? '#FF8A5B' : u.pending ? '#F3D36B' : '#B7A6FF');

/** Deck de usuários: uma carta por pessoa do projeto; abrir a carta leva à edição do usuário. */
export function UsersDeck({ users, onOpen, onClose }: { users: ManagedUser[]; onOpen: (u: ManagedUser) => void; onClose: () => void }) {
  return (
    <BottomSheet tag="DADOS · USUÁRIOS" title="Usuários" sub="Escolha uma carta para editar, redefinir a senha, bloquear ou excluir." onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {users.map((m) => {
          const bg = bgOf(m);
          return (
            <AdminCard key={m.id} bg={bg} icon={<AvatarIcon bg={(m.avatar as AvatarConfig | null)?.bg ?? '#F5F2EC'}><Avatar {...DEFAULT_AVATAR_CFG} {...(m.avatar ?? {})} crown={m.role === 'MANAGER'} size={52} label="" /></AvatarIcon>}
              big={m.role === 'MANAGER' ? 'MGR' : 'IC'} bigLabel={status(m)} kicker="USUÁRIO" title={m.name} foot={m.email || 'Sem e-mail'} aria={`Abrir o usuário ${m.name}`} onClick={() => onOpen(m)} />
          );
        })}
        {users.length === 0 && (
          <div style={{ height: 340, boxSizing: 'border-box', borderRadius: 22, border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 }}>
            <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></svg></span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>Nenhum outro usuário</span>
            <span style={{ fontSize: 13, color: '#A3A1AD', textAlign: 'center' }}>Quem você cadastrar no Time ou na Liderança aparece aqui para editar, bloquear ou excluir</span>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
