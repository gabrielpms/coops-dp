'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { AvatarEditor, DEFAULT_AVATAR_CFG } from '../avatar/AvatarEditor';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { AccessFields, MIN_PASSWORD } from '../team/AccessFields';
import { cardInput, darkBtn, label } from '../ds/tokens';
import { EMAIL_RE } from '@/lib/validation';

export type ManagedUser = { id: string; name: string; email: string; title: string; phone: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null; blocked: boolean; /** pessoa do projeto que ainda não tem conta: o id é o da pessoa */ pending?: boolean };

const field = { ...cardInput, background: '#17171D', color: '#F5F2EC', border: '1.5px solid #2C2C36', minHeight: 48 } as const;
const sec = { display: 'flex', flexDirection: 'column', gap: 8 } as const;

/** Manager edita tudo de um usuário do projeto: dados, papel, senha, bloqueio de acesso e exclusão. */
export function AdminUserDeck({ projectId, user, onClose, onSaved }: { projectId: string; user: ManagedUser; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: user.name, email: user.email, title: user.title, phone: user.phone, role: user.role, avatar: { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? {}) } as AvatarConfig });
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<null | 'save' | 'block' | 'delete'>(null);
  const [err, setErr] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [pwErr, setPwErr] = useState(false);
  const pending = !!user.pending;
  const url = pending ? `/api/projects/${projectId}/people/${user.id}/account` : `/api/projects/${projectId}/users/${user.id}`;
  const call = async (kind: 'save' | 'block' | 'delete', method: 'PATCH' | 'POST' | 'DELETE', body?: object) => {
    setBusy(kind); setErr(null);
    try {
      const r = await fetch(url, { method, headers: { 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      onSaved();
    } catch { setErr('Sem conexão. Tente de novo.'); } finally { setBusy(null); }
  };
  const save = () => {
    if (!f.name.trim()) { setErr('Escreva o nome.'); return; }
    if (!EMAIL_RE.test(f.email.trim())) { setErr('Coloque um e-mail válido.'); return; }
    if ((pending || password) && password.length < MIN_PASSWORD) { setPwErr(true); return; }
    void call('save', pending ? 'POST' : 'PATCH', { name: f.name.trim(), email: f.email.trim(), title: f.title.trim(), phone: f.phone.trim(), role: f.role, avatar: f.avatar, ...(password ? { password } : {}) });
  };
  return (
    <BottomSheet tag="DADOS · USUÁRIO" title={user.name} sub={pending ? 'Esta pessoa ainda não tem acesso. Crie uma senha para liberar o login.' : 'Edite tudo, redefina a senha, bloqueie o acesso ou exclua.'} onClose={onClose}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={sec}><label htmlFor="au-nome" style={label()}>NOME</label><input id="au-nome" type="text" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={field} /></div>
          <div style={sec}><label htmlFor="au-email" style={label()}>E-MAIL DE ACESSO</label><input id="au-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={field} /></div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ ...sec, flex: '1 1 180px' }}><label htmlFor="au-cargo" style={label()}>CARGO</label><input id="au-cargo" type="text" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} style={field} /></div>
            {!pending && <div style={{ ...sec, flex: '1 1 180px' }}><label htmlFor="au-tel" style={label()}>TELEFONE</label><input id="au-tel" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} style={field} /></div>}
          </div>
          <div style={sec}>
            <span style={label()}>PAPEL</span>
            <div role="radiogroup" aria-label="Papel" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {([['IC', 'IC', 'Vê e edita os próprios decks'], ['MANAGER', 'Manager', 'Gerencia time, squads e iniciativas']] as const).map(([k, t, h]) => { const on = f.role === k; return (
                <button key={k} type="button" role="radio" aria-checked={on} onClick={() => setF({ ...f, role: k })} style={{ fontFamily: 'inherit', flex: '1 1 200px', minHeight: 72, boxSizing: 'border-box', borderRadius: 14, padding: '10px 14px', textAlign: 'left', cursor: 'pointer', background: on ? '#8FE3C8' : 'transparent', color: on ? '#0E0E12' : '#F5F2EC', border: `2px solid ${on ? '#0E0E12' : '#4A4858'}`, display: 'flex', flexDirection: 'column', gap: 2 }}><b style={{ fontSize: 17 }}>{t}</b><span style={{ fontSize: 12 }}>{h}</span></button>); })}
            </div>
          </div>
          <div style={{ ...sec, borderRadius: 16, background: '#F5F2EC', color: '#0E0E12', padding: 16 }}>
            <b style={{ fontSize: 15 }}>{pending ? 'Criar senha de acesso' : 'Redefinir senha'}</b>
            <span style={{ fontSize: 13, lineHeight: 1.4 }}>{pending ? 'Defina a senha e passe o e-mail e a senha para a pessoa entrar.' : 'Deixe em branco para manter a atual. A pessoa passa a entrar com a nova senha.'}</span>
            <AccessFields id="au-senha" email={f.email.trim()} password={password} onPassword={(v) => { setPassword(v); setPwErr(false); }} error={pwErr} />
          </div>
        </div>
        <div style={{ flex: '0 1 300px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', background: '#F5F2EC' }}><Avatar {...f.avatar} crown={f.role === 'MANAGER'} size={120} label="" /></span>
          <div style={{ width: '100%' }}><AvatarEditor value={f.avatar} onChange={(avatar) => setF({ ...f, avatar })} /></div>
        </div>
      </div>

      {!pending && <div style={{ borderRadius: 16, border: `1.5px ${user.blocked ? 'solid' : 'dashed'} ${user.blocked ? '#FF8A5B' : '#4A4858'}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ ...label(11, '0.08em'), color: user.blocked ? '#FF8A5B' : '#A3A1AD' }}>{user.blocked ? 'ACESSO BLOQUEADO' : 'ACESSO LIBERADO'}</span>
        <span style={{ fontSize: 14, lineHeight: 1.45, color: '#A3A1AD' }}>{user.blocked ? 'Esta pessoa não consegue entrar e qualquer sessão aberta deixa de valer. Os dados dela continuam guardados.' : 'Bloquear impede o login e encerra as sessões abertas, em todos os projetos da conta. Os dados continuam guardados e dá para desbloquear depois.'}</span>
        <button type="button" disabled={busy !== null} onClick={() => call('block', 'PATCH', { blocked: !user.blocked })} style={{ ...darkBtn, alignSelf: 'flex-start', background: user.blocked ? '#8FE3C8' : 'transparent', color: user.blocked ? '#0E0E12' : '#FF8A5B', border: `1.5px solid ${user.blocked ? '#0E0E12' : '#FF8A5B'}`, minHeight: 48 }}>{busy === 'block' ? 'Salvando…' : user.blocked ? 'Desbloquear acesso' : 'Bloquear acesso'}</button>
      </div>}

      {err && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{err}</span>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" disabled={busy !== null} onClick={save} style={{ ...darkBtn, background: '#B7A6FF', color: '#0E0E12', minHeight: 48, padding: '0 22px' }}>{busy === 'save' ? 'Salvando…' : pending ? 'Criar acesso' : 'Salvar alterações'}</button>
          <button type="button" onClick={onClose} style={{ ...darkBtn, background: 'transparent', color: '#F5F2EC', border: '1.5px solid #4A4858', minHeight: 48 }}>Cancelar</button>
        </div>
        {!confirmDel ? (
          <button type="button" onClick={() => setConfirmDel(true)} style={{ ...darkBtn, background: 'transparent', color: '#FF8A5B', border: '1.5px solid #FF8A5B', minHeight: 48 }}>Excluir usuário</button>
        ) : (
          <span role="alert" style={{ display: 'inline-flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 14 }}>
            <span style={{ maxWidth: 320 }}>{pending ? `Isso tira ${user.name.split(' ')[0]} do projeto. Não dá para desfazer.` : `Isso tira ${user.name.split(' ')[0]} do projeto e apaga a conta se ela não estiver em outro projeto. Não dá para desfazer.`}</span>
            <button type="button" disabled={busy !== null} onClick={() => call('delete', 'DELETE')} style={{ ...darkBtn, background: '#FF8A5B', color: '#0E0E12', minHeight: 48 }}>{busy === 'delete' ? 'Excluindo…' : 'Sim, excluir'}</button>
            <button type="button" onClick={() => setConfirmDel(false)} style={{ ...darkBtn, background: 'transparent', color: '#F5F2EC', border: '1.5px solid #4A4858', minHeight: 48 }}>Voltar</button>
          </span>
        )}
      </div>
    </BottomSheet>
  );
}
