'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft } from '../wizard/useDeckDraft';
import { Err, Help, SummaryRow, Title } from '../wizard/parts';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { AvatarEditor, DEFAULT_AVATAR_CFG } from '../avatar/AvatarEditor';
import { AccessFields, MIN_PASSWORD } from '../team/AccessFields';
import { cardInput, chipStyle, darkBtn, label } from '../ds/tokens';
import { EMAIL_RE, LEADER_TITLES } from '@/lib/validation';
import { SquadChoice, type SquadOpt } from '../team/SquadChoice';

export type ManagedUser = { id: string; name: string; email: string; title: string; phone: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null; blocked: boolean; /** squad atual (um só por pessoa) */ squadId: string | null; /** pessoa do projeto que ainda não tem conta: o id é o da pessoa */ pending?: boolean; /** senha criada pela liderança (vazia se foi a própria pessoa quem criou a dela) */ password?: string };
type Form = { name: string; title: string; avatar: AvatarConfig; email: string; phone: string; role: 'IC' | 'MANAGER'; squadId: string | null };
const LAST = 4;
const TAG = 'USUÁRIO · EDITAR';

/** Manager edita um usuário do projeto no mesmo fluxo de "Meus dados": uma carta por vez, do nome ao resumo. */
export function AdminUserDeck({ projectId, user, squads, onClose, onSaved }: { projectId: string; user: ManagedUser; squads: SquadOpt[]; onClose: () => void; onSaved: () => void }) {
  const pending = !!user.pending;
  const start: Form = { name: user.name, title: user.title, avatar: { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? {}) }, email: user.email, phone: user.phone, role: user.role, squadId: user.squadId };
  const d = useDeckDraft<Form>({ scope: 'auser', entityId: user.id, empty: start, last: LAST, persist: false });
  const { form, set } = d;
  const [password, setPassword] = useState(user.password ?? ''); // fica só no estado: nunca vai para rascunho
  const [errs, setErrs] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const first = user.name.split(' ')[0];
  const url = pending ? `/api/projects/${projectId}/people/${user.id}/account` : `/api/projects/${projectId}/users/${user.id}`;

  const call = async (method: 'PATCH' | 'POST' | 'DELETE', body?: object) => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch(url, { method, headers: { 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return false; }
      return true;
    } catch { setServerError('Sem conexão. Tente de novo.'); return false; } finally { setBusy(false); }
  };
  const submit = async () => {
    const body = { name: form.name.trim(), title: form.title.trim(), email: form.email.trim(), role: form.role, avatar: form.avatar, ...(form.squadId !== user.squadId ? { squadId: form.squadId } : {}), ...(pending ? {} : { phone: form.phone.trim() }), ...(password && password !== (user.password ?? '') ? { password } : {}) };
    if (await call(pending ? 'POST' : 'PATCH', body)) { d.done(); onSaved(); }
  };
  const validate = (to: number) => {
    if (to > 0 && !form.name.trim()) return { at: 0, flags: { name: true } };
    if (to > 3 && !EMAIL_RE.test(form.email.trim())) return { at: 3, flags: { email: true } };
    if (to > 3 && (pending || password) && password.length < MIN_PASSWORD) return { at: 3, flags: { password: true } };
    return null;
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    const e = validate(to > LAST ? 99 : to);
    if (e) { setErrs(e.flags); d.goTo(e.at); return; }
    setErrs({});
    if (to > LAST) { void submit(); return; }
    d.goTo(to);
  };
  const toggleBlock = async () => { if (await call('PATCH', { blocked: !user.blocked })) onSaved(); };
  const remove = async () => { if (await call('DELETE')) onSaved(); };

  const cards: DeckCard[] = [
    { id: 'quem', bg: '#8FE3C8', node: (<>
      <Title>Como {first} aparece no Coops?</Title><Help>Nome e cargo aparecem no hub e nas cartas de liderança.</Help>
      <input type="text" aria-label="Nome" autoComplete="off" value={form.name} onChange={(e) => { set({ name: e.target.value }); setErrs((x) => ({ ...x, name: false })); }} style={cardInput} />
      <Err show={errs.name}>Escreva o nome para seguir.</Err>
      <label htmlFor="au-cargo" style={label()}>CARGO · OPCIONAL</label>
      <input id="au-cargo" type="text" value={form.title} placeholder="Ex.: Head de Design" onChange={(e) => set({ title: e.target.value })} style={cardInput} />
      <div role="group" aria-label="Sugestões de cargo" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{LEADER_TITLES.map((t) => <button key={t} type="button" aria-pressed={form.title === t} className="tw-chip" onClick={() => set({ title: t })} style={chipStyle(form.title === t)}>{t}</button>)}</div>
      <span style={label()}>PAPEL</span>
      <div role="radiogroup" aria-label="Papel" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {([['IC', 'IC'], ['MANAGER', 'Manager']] as const).map(([k, t]) => <button key={k} type="button" role="radio" aria-checked={form.role === k} className="tw-chip" onClick={() => set({ role: k })} style={chipStyle(form.role === k)}>{t}</button>)}
      </div>
      <div style={{ marginTop: 'auto', borderTop: '1.5px solid #0E0E12', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={label(11, '0.08em')}>{pending ? 'SEM ACESSO · CRIE A SENHA NO PASSO 4' : user.blocked ? 'ACESSO BLOQUEADO' : 'ACESSO LIBERADO'}</span>
        {!confirmDel ? (
          <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!pending && <button type="button" disabled={busy} onClick={toggleBlock} style={{ ...darkBtn, minHeight: 44 }}>{user.blocked ? 'Desbloquear acesso' : 'Bloquear acesso'}</button>}
            <button type="button" onClick={() => setConfirmDel(true)} style={{ ...darkBtn, background: 'transparent', color: '#0E0E12', border: '1.5px solid #0E0E12', minHeight: 44 }}>Excluir usuário</button>
          </span>
        ) : (
          <div role="alert" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <span>{pending ? `Isso tira ${first} do projeto.` : `Isso tira ${first} do projeto e apaga a conta se ela não estiver em outro projeto.`} Não dá para desfazer.</span>
            <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" disabled={busy} onClick={remove} style={{ ...darkBtn, minHeight: 44 }}>{busy ? 'Excluindo…' : 'Sim, excluir'}</button>
              <button type="button" onClick={() => setConfirmDel(false)} style={{ ...darkBtn, background: 'transparent', color: '#0E0E12', border: '1.5px solid #0E0E12', minHeight: 44 }}>Voltar</button>
            </span>
          </div>
        )}
      </div>
    </>) },
    { id: 'avatar', bg: '#F5F2EC', node: (<><Title>Monte o avatar</Title><Help>Ele aparece no topo da plataforma, no perfil e nos decks.</Help><AvatarEditor value={form.avatar} onChange={(avatar) => set({ avatar })} /></>) },
    { id: 'squad', bg: '#8FE3C8', node: (<>
      <Title>Em qual squad {first} fica?</Title><Help>{squads.length ? 'A pessoa senta à mesa do squad escolhido. Quem já estava em outro squad muda para este.' : 'Ainda não há squads neste projeto. Crie um na tela Time.'}</Help>
      <SquadChoice squads={squads} value={form.squadId} onChange={(id) => set({ squadId: id })} />
    </>) },
    { id: 'acesso', bg: '#A9D8F5', node: (<>
      <Title>Qual o acesso de {first}?</Title><Help>{pending ? 'Crie a senha para liberar o login e passe o e-mail e a senha para a pessoa.' : 'A pessoa entra com este e-mail e esta senha. A senha fica registrada aqui; mude para redefinir.'}</Help>
      <input type="email" aria-label="E-mail" autoComplete="off" value={form.email} onChange={(e) => { set({ email: e.target.value }); setErrs((x) => ({ ...x, email: false })); }} style={cardInput} />
      <Err show={errs.email}>Coloque um e-mail válido para seguir.</Err>
      <AccessFields id="au-senha" email={form.email.trim()} password={password} onPassword={(v) => { setPassword(v); setErrs((x) => ({ ...x, password: false })); }} error={errs.password} />
      {!pending && <><label htmlFor="au-tel" style={label()}>TELEFONE · OPCIONAL</label>
      <input id="au-tel" type="tel" autoComplete="off" value={form.phone} onChange={(e) => set({ phone: e.target.value })} style={cardInput} /></>}
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere os dados de {first}?</Title><Help>{pending ? 'Ao salvar, a conta é criada e a pessoa já pode entrar.' : 'As mudanças aparecem em todos os projetos da pessoa.'}</Help>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12' }} aria-hidden="true"><Avatar {...form.avatar} crown={form.role === 'MANAGER'} size={120} label="" /></span>
        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SummaryRow k="NOME" v={form.name || '—'} /><SummaryRow k="CARGO" v={form.title || 'Sem cargo'} /><SummaryRow k="E-MAIL" v={form.email || '—'} />
          <SummaryRow k="SQUAD" v={squads.find((q) => q.id === form.squadId)?.name ?? 'Sem squad'} /><SummaryRow k="PAPEL" v={form.role === 'MANAGER' ? 'Manager' : 'IC'} /><SummaryRow k="SENHA" v={!password ? (pending ? '—' : 'Definida pela própria pessoa') : password !== (user.password ?? '') ? 'Será definida ao salvar' : 'Continua a atual'} />
        </div>
      </div>
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title={`Editar ${user.name}`} onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Salvando…" error={serverError} nextLabel={d.step === LAST ? (pending ? 'Criar acesso' : 'Salvar dados') : 'Próxima'} />
    </BottomSheet>
  );
}
