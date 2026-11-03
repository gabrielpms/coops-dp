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

export type LeadershipForm = { name: string; title: string; email: string; avatar: AvatarConfig; squadIds: string[]; memberIds: string[] };
export type LeadershipDraft = Draft<LeadershipForm>;
export type LeadSquad = { id: string; name: string; color: string; personIds: string[]; leader: string | null };
export type LeadPerson = { id: string; name: string; title: string; avatar: AvatarConfig | null; squadNames: string[]; leader: string | null; isLeaderPerson: boolean };
export type LeadershipView = { id: string; personId: string; name: string; title: string; email: string; avatar: AvatarConfig | null; squadIds: string[]; memberIds: string[]; invited: boolean };
const LAST = 4;

export function LeadershipDeck({ projectId, editing, squads, people, draft, onDraftChange, onClose, onSaved }: {
  projectId: string; editing: LeadershipView | null; squads: LeadSquad[]; people: LeadPerson[]; draft: LeadershipDraft | null; onDraftChange: (d: LeadershipDraft | null) => void; onClose: () => void; onSaved: () => void;
}) {
  const empty: LeadershipForm = editing
    ? { name: editing.name, title: editing.title, email: editing.email, avatar: { ...DEFAULT_AVATAR_CFG, ...(editing.avatar ?? {}), crown: true }, squadIds: editing.squadIds, memberIds: editing.memberIds }
    : { name: '', title: '', email: '', avatar: { ...DEFAULT_AVATAR_CFG, crown: true }, squadIds: [], memberIds: [] };
  const d = useDeckDraft<LeadershipForm>({ scope: 'leadership', entityId: projectId, empty, draft: editing ? null : draft, last: LAST, onDraftChange, persist: !editing });
  const { form, set } = d;
  const [errs, setErrs] = useState<{ name?: boolean; email?: boolean }>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const TAG = editing ? 'ADMINISTRAÇÃO · EDITAR LIDERANÇA' : 'ADMINISTRAÇÃO · NOVA LIDERANÇA';
  // quem pode ser liderado: todos, menos a própria pessoa que lidera
  const reports = people.filter((p) => p.id !== editing?.personId);

  const validate = (to: number) => {
    if (to > 0 && !form.name.trim()) return { at: 0, flags: { name: true } };
    if (to > 0 && !editing && !EMAIL_RE.test(form.email.trim())) return { at: 0, flags: { email: true } };
    return null;
  };
  const call = async (method: 'POST' | 'PATCH' | 'DELETE') => {
    setBusy(true); setServerError(null);
    try {
      const url = editing ? `/api/projects/${projectId}/leaderships/${editing.id}` : `/api/projects/${projectId}/leaderships`;
      const r = await fetch(url, { method, headers: { 'content-type': 'application/json' }, ...(method === 'DELETE' ? {} : { body: JSON.stringify({ name: form.name.trim(), title: form.title.trim(), ...(editing ? {} : { email: form.email.trim() }), avatar: { ...form.avatar, crown: true }, squadIds: form.squadIds, memberIds: form.memberIds }) }) });
      const data = await r.json();
      if (!r.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      d.done(); onSaved();
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  const go = (k: number) => {
    const to = Math.max(0, k);
    const e = validate(to > LAST ? 99 : to);
    if (e) { setErrs(e.flags); d.goTo(e.at); return; }
    setErrs({});
    if (to > LAST) { void call(editing ? 'PATCH' : 'POST'); return; }
    d.goTo(to);
  };
  // escolher um squad já marca as pessoas dele; dá para ajustar na carta seguinte
  const toggleSquad = (s: LeadSquad) => {
    const on = form.squadIds.includes(s.id);
    if (on) { set({ squadIds: form.squadIds.filter((x) => x !== s.id) }); return; }
    const add = s.personIds.filter((p) => p !== editing?.personId && !form.memberIds.includes(p));
    set({ squadIds: [...form.squadIds, s.id], memberIds: [...form.memberIds, ...add] });
  };
  const toggleMember = (id: string) => set({ memberIds: form.memberIds.includes(id) ? form.memberIds.filter((x) => x !== id) : [...form.memberIds, id] });
  const rowStyle = (on: boolean) => ({ display: 'flex', alignItems: 'center', gap: 10, minHeight: 56, width: '100%', boxSizing: 'border-box', textAlign: 'left', fontFamily: 'inherit', color: '#0E0E12', cursor: 'pointer', borderRadius: 14, border: '1.5px solid #0E0E12', background: on ? '#F5F2EC' : 'rgba(245,242,236,0.45)', padding: '6px 10px' }) as const;
  const pillOn = (on: boolean, t: string) => <span style={{ marginLeft: 'auto', ...label(10), border: '1.5px solid #0E0E12', borderRadius: 999, padding: '3px 8px', background: on ? '#0E0E12' : 'transparent', color: on ? '#F5F2EC' : '#0E0E12', whiteSpace: 'nowrap' }}>{t}</span>;

  const cards: DeckCard[] = [
    { id: 'quem', bg: '#F3D36B', node: (<>
      <Title>Quem vai liderar?</Title><Help>{editing ? 'Dá para ajustar nome, cargo, avatar, squads e pessoas.' : 'A pessoa recebe um convite para entrar como manager deste projeto.'}</Help>
      <input type="text" aria-label="Nome da liderança" placeholder="Ex.: Marina Lopes" value={form.name} onChange={(e) => { set({ name: e.target.value }); setErrs((x) => ({ ...x, name: false })); }} style={cardInput} />
      <Err show={errs.name}>Escreva o nome para seguir.</Err>
      <label htmlFor="lw-cargo" style={label()}>CARGO · OPCIONAL</label>
      <input id="lw-cargo" type="text" placeholder="Ex.: Head de Design" value={form.title} onChange={(e) => set({ title: e.target.value })} style={cardInput} />
      <div role="group" aria-label="Sugestões de cargo" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{LEADER_TITLES.map((t) => <button key={t} type="button" aria-pressed={form.title === t} className="tw-chip" onClick={() => set({ title: t })} style={chipStyle(form.title === t)}>{t}</button>)}</div>
      <label htmlFor="lw-email" style={label()}>E-MAIL PARA O CONVITE</label>
      <input id="lw-email" type="email" placeholder="nome@empresa.com" value={form.email} readOnly={!!editing} onChange={(e) => { set({ email: e.target.value }); setErrs((x) => ({ ...x, email: false })); }} style={{ ...cardInput, ...(editing ? { opacity: 0.6 } : {}) }} />
      <Err show={errs.email}>Coloque um e-mail válido para enviar o convite.</Err>
    </>) },
    { id: 'avatar', bg: '#F5F2EC', node: (<><Title>Monte o avatar</Title><Help>Ele aparece na carta de liderança e no topo da plataforma para essa pessoa.</Help><AvatarEditor value={form.avatar} onChange={(avatar) => set({ avatar: { ...avatar, crown: true } })} /></>) },
    { id: 'squads', bg: '#8FE3C8', optional: true, node: (<>
      <Title>Quais squads ficam com essa liderança?</Title><Help>Toque para incluir. As pessoas do squad entram junto e dá para ajustar na próxima carta.</Help>
      {squads.length === 0 && <span style={{ fontSize: 14 }}>Ainda não há squads neste projeto. Crie na Gestão de time.</span>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{squads.map((s) => { const on = form.squadIds.includes(s.id); return (
        <button key={s.id} type="button" aria-pressed={on} onClick={() => toggleSquad(s)} style={rowStyle(on)}>
          <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: '50%', background: s.color, border: '2px solid #0E0E12', flex: 'none' }} />
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</span><span style={{ fontSize: 12 }}>{s.personIds.length} {s.personIds.length === 1 ? 'pessoa' : 'pessoas'} · {s.leader && s.leader !== editing?.name ? `hoje com ${s.leader}` : 'sem liderança'}</span></span>
          {pillOn(on, on ? 'INCLUÍDO' : 'INCLUIR')}
        </button>); })}</div>
    </>) },
    { id: 'pessoas', bg: '#A9D8F5', optional: true, node: (<>
      <Title>Quem reporta para essa liderança?</Title><Help>As pessoas dos squads escolhidos já vêm marcadas. Toque para tirar ou incluir alguém.</Help>
      {reports.length === 0 && <span style={{ fontSize: 14 }}>Ainda não há outras pessoas no time.</span>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{reports.map((p) => { const on = form.memberIds.includes(p.id); return (
        <button key={p.id} type="button" aria-pressed={on} onClick={() => toggleMember(p.id)} style={rowStyle(on)}>
          <span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', flex: 'none' }}><Avatar {...(p.avatar ?? DEFAULT_AVATAR_CFG)} size={36} label="" /></span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{p.name}</span><span style={{ fontSize: 12 }}>{[p.title, p.squadNames.join(', ') || 'sem squad', p.leader && p.leader !== editing?.name ? `hoje com ${p.leader}` : ''].filter(Boolean).join(' · ')}</span></span>
          {pillOn(on, on ? 'REPORTA' : 'INCLUIR')}
        </button>); })}</div>
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere a liderança?</Title>
      <Help>{editing ? 'Squads e pessoas escolhidos saem da liderança anterior.' : `Ao confirmar, o convite vai para ${form.email.trim() || 'o e-mail informado'}. Squads e pessoas escolhidos saem da liderança anterior.`}</Help>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <span style={{ lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12' }} aria-hidden="true"><Avatar {...form.avatar} crown size={110} label="" /></span>
        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SummaryRow k="LIDERANÇA" v={`${form.name || '—'}${form.title ? ` · ${form.title}` : ''}`} />
          <SummaryRow k="SQUADS" v={form.squadIds.length ? form.squadIds.map((i) => squads.find((s) => s.id === i)?.name).filter(Boolean).join(', ') : 'Nenhum squad'} />
          <SummaryRow k="REPORTAM" v={form.memberIds.length ? `${form.memberIds.length} ${form.memberIds.length === 1 ? 'pessoa' : 'pessoas'}` : 'Ninguém ainda'} />
        </div>
      </div>
      {editing && <button type="button" disabled={busy} onClick={() => { if (window.confirm(`Remover a liderança de ${editing.name}? A carta da pessoa continua no time.`)) void call('DELETE'); }} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#0E0E12', background: 'transparent', border: '1.5px solid #0E0E12', borderRadius: 12, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>Remover esta liderança</button>}
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title={editing ? 'Editar liderança' : 'Nova liderança'} onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Salvando…" error={serverError} nextLabel={d.step === LAST ? (editing ? 'Salvar liderança' : 'Adicionar e enviar convite') : 'Próxima'} />
    </BottomSheet>
  );
}
