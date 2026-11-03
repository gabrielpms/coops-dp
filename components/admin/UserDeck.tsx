'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { Err, Help, SummaryRow, Title } from '../wizard/parts';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { AvatarEditor, DEFAULT_AVATAR_CFG } from '../avatar/AvatarEditor';
import { cardInput, chipStyle, label } from '../ds/tokens';
import { EMAIL_RE, LEADER_TITLES } from '@/lib/validation';

export type UserForm = { name: string; title: string; phone: string; avatar: AvatarConfig; email: string; currentPassword: string };
export type UserDraft = Draft<UserForm>;
export type UserData = { id: string; name: string; email: string; title: string; phone: string; avatar: AvatarConfig | null; role: 'IC' | 'MANAGER' };
const LAST = 3;
const TAG = 'MEUS DADOS · EDITAR';

export function UserDeck({ user, draft, onDraftChange, onClose, onSaved }: { user: UserData; draft: UserDraft | null; onDraftChange: (d: UserDraft | null) => void; onClose: () => void; onSaved: () => void }) {
  const start: UserForm = { name: user.name, title: user.title, phone: user.phone, avatar: { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? {}) }, email: user.email, currentPassword: '' };
  const d = useDeckDraft<UserForm>({ scope: 'udata', entityId: user.id, empty: start, draft, last: LAST, onDraftChange });
  const { form, set } = d;
  const [errs, setErrs] = useState<{ name?: boolean; email?: boolean }>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const emailChanged = form.email.trim().toLowerCase() !== user.email;

  const validate = (to: number) => {
    if (to > 0 && !form.name.trim()) return { at: 0, flags: { name: true } };
    if (to > 2 && !EMAIL_RE.test(form.email.trim())) return { at: 2, flags: { email: true } };
    return null;
  };
  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch('/api/me', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: form.name.trim(), title: form.title.trim(), phone: form.phone.trim(), avatar: form.avatar, email: form.email.trim(), ...(emailChanged ? { currentPassword: form.currentPassword } : {}) }) });
      const data = await r.json();
      if (!r.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      d.done(); await fetch(`/api/drafts?scope=udata&entityId=${user.id}`, { method: 'DELETE' }).catch(() => {}); onSaved();
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    const e = validate(to > LAST ? 99 : to);
    if (e) { setErrs(e.flags); d.goTo(e.at); return; }
    setErrs({});
    if (to > LAST) { void submit(); return; }
    d.goTo(to);
  };

  const cards: DeckCard[] = [
    { id: 'quem', bg: '#8FE3C8', node: (<>
      <Title>Como você aparece no Coops?</Title><Help>Nome e cargo aparecem no hub e nas cartas de liderança.</Help>
      <input type="text" aria-label="Seu nome" autoComplete="name" value={form.name} onChange={(e) => { set({ name: e.target.value }); setErrs((x) => ({ ...x, name: false })); }} style={cardInput} />
      <Err show={errs.name}>Escreva seu nome para seguir.</Err>
      <label htmlFor="uw-cargo" style={label()}>CARGO · OPCIONAL</label>
      <input id="uw-cargo" type="text" value={form.title} placeholder="Ex.: Head de Design" onChange={(e) => set({ title: e.target.value })} style={cardInput} />
      <div role="group" aria-label="Sugestões de cargo" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{LEADER_TITLES.map((t) => <button key={t} type="button" aria-pressed={form.title === t} className="tw-chip" onClick={() => set({ title: t })} style={chipStyle(form.title === t)}>{t}</button>)}</div>
    </>) },
    { id: 'avatar', bg: '#F5F2EC', node: (<><Title>Monte o avatar</Title><Help>Ele aparece no topo da plataforma, no seu perfil e nos decks.</Help><AvatarEditor value={form.avatar} onChange={(avatar) => set({ avatar })} /></>) },
    { id: 'email', bg: '#A9D8F5', node: (<>
      <Title>Qual é o seu e-mail?</Title><Help>É por ele que você entra e recebe os avisos dos projetos.</Help>
      <input type="email" aria-label="Seu e-mail" autoComplete="email" value={form.email} onChange={(e) => { set({ email: e.target.value }); setErrs((x) => ({ ...x, email: false })); }} style={cardInput} />
      <Err show={errs.email}>Coloque um e-mail válido para seguir.</Err>
      {emailChanged && <><label htmlFor="uw-senha" style={label()}>SENHA ATUAL · PARA TROCAR O E-MAIL</label><input id="uw-senha" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => set({ currentPassword: e.target.value })} style={cardInput} /></>}
      <label htmlFor="uw-tel" style={label()}>TELEFONE · OPCIONAL</label>
      <input id="uw-tel" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} style={cardInput} />
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere seus dados?</Title><Help>As mudanças aparecem em todos os projetos.</Help>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12' }} aria-hidden="true"><Avatar {...form.avatar} size={120} label="" /></span>
        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SummaryRow k="NOME" v={form.name || '—'} /><SummaryRow k="CARGO" v={form.title || 'Sem cargo'} /><SummaryRow k="E-MAIL" v={form.email || '—'} />
        </div>
      </div>
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title="Editar meus dados" onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Salvando…" error={serverError} nextLabel={d.step === LAST ? 'Salvar meus dados' : 'Próxima'} />
    </BottomSheet>
  );
}
