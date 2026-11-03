'use client';
import { useState, type ReactNode } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from '../wizard/QuestionDeck';
import { useDeckDraft, type Draft } from '../wizard/useDeckDraft';
import { Avatar, type AvatarConfig } from '../avatar/Avatar';
import { AvatarEditor, DEFAULT_AVATAR_CFG } from '../avatar/AvatarEditor';
import { cardInput, chipStyle, label } from '../ds/tokens';
import { EMAIL_RE } from '@/lib/validation';

export type MemberForm = { name: string; title: string; avatar: AvatarConfig; mainSkill: string; joinedAt: string; email: string };
export type MemberDraft = Draft<MemberForm>;
const empty = (): MemberForm => ({ name: '', title: '', avatar: { ...DEFAULT_AVATAR_CFG }, mainSkill: '', joinedAt: '', email: '' });
const LAST = 5;
const TAG = 'TIME · NOVO MEMBRO';

const Title = ({ children }: { children: ReactNode }) => <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{children}</span>;
const Help = ({ children }: { children: ReactNode }) => <span style={{ fontSize: 14, lineHeight: 1.45 }}>{children}</span>;
const Err = ({ show, children }: { show?: boolean; children: ReactNode }) => (show ? <span role="alert" style={{ fontSize: 14, fontWeight: 600 }}>{children}</span> : null);

export function MemberDeck({ projectId, skills, draft, onDraftChange, onClose, onSaved }: {
  projectId: string; skills: string[]; draft: MemberDraft | null; onDraftChange: (d: MemberDraft | null) => void; onClose: () => void; onSaved: () => void;
}) {
  const d = useDeckDraft<MemberForm>({ scope: 'member', entityId: projectId, empty: empty(), draft, last: LAST, onDraftChange });
  const { form, set } = d;
  const [errs, setErrs] = useState<{ name?: boolean; email?: boolean }>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const emailOk = EMAIL_RE.test(form.email.trim());
  const validate = (to: number) => {
    if (to > 0 && !form.name.trim()) return { at: 0, flags: { name: true } };
    if (to > 4 && !emailOk) return { at: 4, flags: { email: true } };
    return null;
  };
  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/members`, { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), title: form.title.trim(), avatar: form.avatar, mainSkill: form.mainSkill.trim(), joinedAt: form.joinedAt, email: form.email.trim() }) });
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
    if (to > LAST) { void submit(); return; }
    d.goTo(to);
  };

  const cards: DeckCard[] = [
    { id: 'quem', bg: '#B7A6FF', node: (<>
      <Title>Quem está chegando?</Title><Help>Nome e cargo aparecem na carta da pessoa.</Help>
      <input type="text" aria-label="Nome da pessoa" placeholder="Ex.: Joana Reis" value={form.name} onChange={(e) => { set({ name: e.target.value }); setErrs((x) => ({ ...x, name: false })); }} style={cardInput} />
      <Err show={errs.name}>Escreva o nome da pessoa para seguir.</Err>
      <label htmlFor="mw-cargo" style={label()}>CARGO · OPCIONAL</label>
      <input id="mw-cargo" type="text" placeholder="Ex.: Senior Product Designer" value={form.title} onChange={(e) => set({ title: e.target.value })} style={cardInput} />
    </>) },
    { id: 'avatar', bg: '#F5F2EC', node: (<><Title>Monte o avatar</Title><Help>Ele aparece na carta, na mesa do squad e nos decks.</Help><AvatarEditor value={form.avatar} onChange={(avatar) => set({ avatar })} /></>) },
    { id: 'skill', bg: '#F3D36B', optional: true, node: (<>
      <Title>Qual é a skill principal?</Title><Help>Escreva com as suas palavras ou use uma sugestão. Vira o selo amarelo da carta.</Help>
      <input type="text" aria-label="Skill principal" placeholder="Ex.: Pesquisa" value={form.mainSkill} onChange={(e) => set({ mainSkill: e.target.value })} style={cardInput} />
      {skills.length > 0 && <><span style={label()}>SUGESTÕES DO PROJETO</span>
        <div role="group" aria-label="Sugestões de skill" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{skills.map((s) => <button key={s} type="button" aria-pressed={form.mainSkill === s} className="tw-chip" onClick={() => set({ mainSkill: s })} style={chipStyle(form.mainSkill === s)}>{s}</button>)}</div></>}
    </>) },
    { id: 'entrada', bg: '#F5A9D6', optional: true, node: (<>
      <Title>Quando a pessoa entrou?</Title><Help>A data calcula o tempo de casa na carta.</Help>
      <input type="date" aria-label="Data de entrada" max={new Date().toISOString().slice(0, 10)} value={form.joinedAt} onChange={(e) => set({ joinedAt: e.target.value })} style={cardInput} />
    </>) },
    { id: 'email', bg: '#A9D8F5', node: (<>
      <Title>Para qual e-mail vai o convite?</Title><Help>A pessoa recebe o convite para entrar no Coops e completar o perfil.</Help>
      <input type="email" aria-label="E-mail da pessoa" placeholder="nome@empresa.com" value={form.email} onChange={(e) => { set({ email: e.target.value }); setErrs((x) => ({ ...x, email: false })); }} style={cardInput} />
      <Err show={errs.email}>Coloque um e-mail válido para enviar o convite.</Err>
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere a carta?</Title><Help>Ao criar, a carta entra no time e o convite vai para {form.email.trim() || 'o e-mail informado'}.</Help>
      <div aria-hidden="true" style={{ alignSelf: 'flex-start', width: 220, borderRadius: 20, background: '#17171D', color: '#F5F2EC', border: '2px solid #0E0E12', overflow: 'hidden' }}>
        <div style={{ background: form.avatar.bg ?? '#B7A6FF', padding: '14px 14px 0', display: 'flex', justifyContent: 'center', borderBottom: '1.5px solid #0E0E12' }}><Avatar {...form.avatar} size={120} label="" /></div>
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{form.name || 'Nome da pessoa'}</span>
          <span style={{ fontSize: 13, color: '#A3A1AD' }}>{form.title || 'Cargo'}</span>
          {form.mainSkill && <span style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: '#0E0E12', background: '#F3D36B', borderRadius: 999, padding: '4px 10px' }}>{form.mainSkill}</span>}
        </div>
      </div>
    </>) },
  ];
  return (
    <BottomSheet tag={TAG} title="Novo membro" onClose={onClose}>
      <QuestionDeck tag={TAG} cards={cards} step={d.step} onGo={go} busy={busy} busyLabel="Criando carta…" error={serverError} nextLabel={d.step === LAST ? 'Criar e convidar' : 'Próxima'} />
    </BottomSheet>
  );
}
