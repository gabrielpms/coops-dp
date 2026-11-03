'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { QuestionDeck, type DeckCard } from './QuestionDeck';
import { cardInput, chipStyle, darkBtn, label, removableChip, segmentIcon } from '../ds/tokens';
import { DEFAULT_SKILLS, EMAIL_RE, INDICATOR_SUGGESTIONS, SEGMENTS } from '@/lib/validation';

export type ProjectForm = {
  name: string; segment: string; tagline: string; strategy: string;
  indicators: string[]; competitors: string[]; links: string[]; skills: string[];
  invites: { name: string; email: string; position: 'IC' | 'MANAGER' }[];
};
export const emptyProject = (): ProjectForm => ({ name: '', segment: '', tagline: '', strategy: '', indicators: [], competitors: [], links: [], skills: [...DEFAULT_SKILLS], invites: [] });

const SCOPE = 'project';
const LAST = 6;
const POS_LABEL = { IC: 'IC', MANAGER: 'Manager' } as const;

type Saved = { id: string; [k: string]: unknown };

export type ProjectDraft = { form: ProjectForm; step: number };

export function ProjectDeck({ mode, projectId, initial, draft, title, onClose, onSaved, onDraftChange }: {
  mode: 'create' | 'edit'; projectId?: string; initial?: ProjectForm; title?: string; onClose: () => void; onSaved: (project: any) => void;
  /** Rascunho já carregado junto com a página: o deck abre pronto, sem esperar o servidor. */
  draft?: ProjectDraft | null;
  /** Avisa quem abriu o deck do último rascunho, para a próxima abertura já vir atualizada. */
  onDraftChange?: (d: ProjectDraft | null) => void;
}) {
  const entityId = mode === 'edit' ? projectId ?? '' : '';
  const [form, setForm] = useState<ProjectForm>(() => (draft?.form ? { ...emptyProject(), ...draft.form } : initial ?? emptyProject()));
  const [step, setStep] = useState(() => Math.min(LAST, draft?.step ?? 0));
  const [errs, setErrs] = useState<{ name?: boolean; segment?: boolean; skills?: boolean; invite?: boolean }>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [typed, setTyped] = useState({ ind: '', con: '', link: '', skill: '', pn: '', pe: '' });
  const [pos, setPos] = useState<'IC' | 'MANAGER'>('IC');
  const touched = useRef(false); // só grava rascunho depois que a pessoa mexe

  // ---- Rascunho persistente (PRD 6.2): salva com debounce de 600 ms ao digitar e na hora ao avançar
  const save = useCallback((f: ProjectForm, s: number) => {
    onDraftChange?.({ form: f, step: s });
    fetch('/api/drafts', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scope: SCOPE, entityId, payload: { form: f, step: s } }) }).catch(() => {});
  }, [entityId, onDraftChange]);

  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef({ form, step });
  latest.current = { form, step };
  useEffect(() => {
    if (!touched.current) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => save(latest.current.form, latest.current.step), 600);
    return () => clearTimeout(debounce.current);
  }, [form, save]);
  useEffect(() => () => { if (touched.current) save(latest.current.form, latest.current.step); }, [save]);

  const set = (patch: Partial<ProjectForm>) => { touched.current = true; setForm((f) => ({ ...f, ...patch })); };
  const trimmed = (f: ProjectForm) => ({ ...f, name: f.name.trim(), tagline: f.tagline.trim(), strategy: f.strategy.trim() });

  const validate = (f: ProjectForm, to: number) => {
    if (to > 0 && !f.name.trim()) return { at: 0, flags: { name: true } };
    if (to > 0 && !f.segment) return { at: 0, flags: { segment: true } };
    if (to > 4 && !f.skills.length) return { at: 4, flags: { skills: true } };
    return null;
  };

  const submit = async () => {
    setBusy(true); setServerError(null);
    try {
      const res = await fetch(mode === 'edit' ? `/api/projects/${projectId}` : '/api/projects', {
        method: mode === 'edit' ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(trimmed(form)),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? 'Não deu para salvar. Tente de novo.'); return; }
      touched.current = false; clearTimeout(debounce.current); onDraftChange?.(null);
      onSaved(data.project);
    } catch { setServerError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };

  const go = (k: number) => {
    touched.current = true;
    const target = Math.max(0, k);
    if (target > LAST) { const e = validate(form, 99); if (e) { setErrs(e.flags); setStep(e.at); return; } void submit(); return; }
    const e = validate(form, target);
    if (e) { setErrs(e.flags); setStep(e.at); save(form, e.at); return; }
    setErrs({}); setStep(target); save(form, target);
  };

  const addTo = (field: 'indicators' | 'competitors' | 'links' | 'skills', key: 'ind' | 'con' | 'link' | 'skill') => {
    const v = typed[key].trim(); if (!v) return;
    if (!form[field].includes(v)) set({ [field]: [...form[field], v] } as Partial<ProjectForm>);
    setTyped((t) => ({ ...t, [key]: '' }));
    if (field === 'skills') setErrs((e) => ({ ...e, skills: false }));
  };
  const removeFrom = (field: 'indicators' | 'competitors' | 'links' | 'skills', i: number) => set({ [field]: form[field].filter((_, j) => j !== i) } as Partial<ProjectForm>);

  const Title = ({ children }: { children: ReactNode }) => <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{children}</span>;
  const Help = ({ children }: { children: ReactNode }) => <span style={{ fontSize: 14, lineHeight: 1.45 }}>{children}</span>;
  const Err = ({ show, children }: { show?: boolean; children: ReactNode }) => (show ? <span role="alert" style={{ fontSize: 14, fontWeight: 600 }}>{children}</span> : null);
  const chips = (field: 'indicators' | 'competitors' | 'links' | 'skills', items: string[]) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((it, i) => (
        <button key={it} type="button" onClick={() => removeFrom(field, i)} aria-label={`Remover ${it}`} className="tw-chip" style={removableChip}>
          {it}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      ))}
    </div>
  );
  const addRow = (k: 'ind' | 'con' | 'link' | 'skill', field: 'indicators' | 'competitors' | 'links' | 'skills', ph: string, aria: string) => (
    <form onSubmit={(e) => { e.preventDefault(); addTo(field, k); }} style={{ display: 'flex', gap: 8 }}>
      <input type="text" aria-label={aria} placeholder={ph} value={typed[k]} onChange={(e) => setTyped((t) => ({ ...t, [k]: e.target.value }))} style={{ ...cardInput, flex: '1 1 auto' }} />
      <button type="submit" style={darkBtn}>Adicionar</button>
    </form>
  );
  const Mono = ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => <label htmlFor={htmlFor} style={label()}>{children}</label>;

  const addInvite = () => {
    const name = typed.pn.trim(), email = typed.pe.trim().toLowerCase();
    if (!name || !EMAIL_RE.test(email)) { setErrs((e) => ({ ...e, invite: true })); return; }
    setErrs((e) => ({ ...e, invite: false }));
    if (!form.invites.some((i) => i.email === email)) set({ invites: [...form.invites, { name, email, position: pos }] });
    setTyped((t) => ({ ...t, pn: '', pe: '' }));
  };

  const n = form.invites.length;
  const cnt = (c: number, a: string, b: string) => (c ? `${c} ${c === 1 ? a : b}` : 'Nenhum ainda');
  const cards: DeckCard[] = [
    { id: 'empresa', bg: '#B7A6FF', node: (<>
      <Title>Qual é a empresa?</Title><Help>O nome e o segmento aparecem na carta do projeto no hub.</Help>
      <input id="pw-nome" type="text" aria-label="Nome da empresa" placeholder="Ex.: Nimbo Pay" value={form.name} onChange={(e) => { set({ name: e.target.value }); setErrs((x) => ({ ...x, name: false })); }} style={cardInput} />
      <Err show={errs.name}>Escreva o nome da empresa para seguir.</Err>
      <span style={label()}>SEGMENTO</span>
      <div role="radiogroup" aria-label="Segmento" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {SEGMENTS.map((s) => <button key={s} type="button" role="radio" aria-checked={form.segment === s} className="tw-chip" onClick={() => { set({ segment: s }); setErrs((x) => ({ ...x, segment: false })); }} style={chipStyle(form.segment === s)}>{s}</button>)}
      </div>
      <Err show={errs.segment}>Escolha o segmento para seguir.</Err>
      <Mono htmlFor="pw-desc">EM UMA FRASE · OPCIONAL</Mono>
      <input id="pw-desc" type="text" placeholder="Ex.: Conta digital para quem abre a primeira conta" value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} style={cardInput} />
    </>) },
    { id: 'estrategia', bg: '#F5F2EC', optional: true, node: (<>
      <Title>Para onde a empresa está indo?</Title><Help>E como o design contribui. O agente usa isso para dar contexto às iniciativas.</Help>
      <textarea aria-label="Estratégia da empresa" placeholder="Ex.: Ser a primeira conta de quem nunca teve banco, com abertura simples e educação financeira no próprio app." value={form.strategy} onChange={(e) => set({ strategy: e.target.value })} style={{ ...cardInput, minHeight: 150, resize: 'vertical' }} />
    </>) },
    { id: 'indicadores', bg: '#F3D36B', optional: true, node: (<>
      <Title>Quais são os indicadores-chave?</Title><Help>Os números que mostram se o produto vai bem. Orientam iniciativas e entregas.</Help>
      {addRow("ind", "indicators", "Ex.: Retenção em 30 dias", "Novo indicador")}
      {chips("indicators", form.indicators)}
      <span style={label()}>SUGESTÕES</span>
      <div role="group" aria-label="Sugestões de indicador" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {INDICATOR_SUGGESTIONS.filter((s) => !form.indicators.includes(s)).map((s) => <button key={s} type="button" className="tw-chip" onClick={() => set({ indicators: [...form.indicators, s] })} style={chipStyle(false)}>+ {s}</button>)}
      </div>
    </>) },
    { id: 'mercado', bg: '#F5A9D6', optional: true, node: (<>
      <Title>Quem são os concorrentes?</Title><Help>Concorrentes e links de referência ajudam o agente a comparar soluções.</Help>
      {addRow("con", "competitors", "Ex.: Lume Bank", "Novo concorrente")}
      {chips("competitors", form.competitors)}
      <span style={label()}>REFERÊNCIAS · LINKS</span>
      {addRow("link", "links", "https://", "Novo link de referência")}
      {chips("links", form.links)}
    </>) },
    { id: 'skills', bg: '#F3D36B', node: (<>
      <Title>Quais skills o time desenvolve?</Title><Help>Já vêm cinco sugestões. Tire ou adicione; depois você organiza em categorias na administração.</Help>
      {addRow("skill", "skills", "Ex.: Escrita de interface", "Nova skill")}
      {chips("skills", form.skills)}
      <Err show={errs.skills}>Deixe pelo menos uma skill para seguir.</Err>
    </>) },
    { id: 'convites', bg: '#A9D8F5', optional: true, node: (<>
      <Title>Quem entra na plataforma?</Title><Help>Cada pessoa recebe um convite por e-mail. Dá para convidar mais gente depois.</Help>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 16, border: '1.5px solid #0E0E12', background: 'rgba(245,242,236,0.55)', padding: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input type="text" aria-label="Nome da pessoa" placeholder="Nome" value={typed.pn} onChange={(e) => setTyped((t) => ({ ...t, pn: e.target.value }))} style={{ ...cardInput, flex: '1 1 160px', width: 'auto' }} />
          <input type="email" aria-label="E-mail da pessoa" placeholder="nome@empresa.com" value={typed.pe} onChange={(e) => setTyped((t) => ({ ...t, pe: e.target.value }))} style={{ ...cardInput, flex: '1 1 200px', width: 'auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={label()}>POSIÇÃO</span>
            <div role="radiogroup" aria-label="Posição" style={{ display: 'flex', gap: 6 }}>
              {(['IC', 'MANAGER'] as const).map((p) => <button key={p} type="button" role="radio" aria-checked={pos === p} className="tw-chip" onClick={() => setPos(p)} style={chipStyle(pos === p)}>{POS_LABEL[p]}</button>)}
            </div>
          </div>
          <button type="button" onClick={addInvite} style={{ ...darkBtn, minHeight: 48 }}>Convidar</button>
        </div>
      </div>
      <Err show={errs.invite}>Coloque nome e um e-mail válido para convidar.</Err>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {form.invites.map((it, i) => (
          <div key={it.email} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12, border: '1.5px solid #0E0E12', background: '#F5F2EC', padding: '8px 8px 8px 12px' }}>
            <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 15, fontWeight: 700 }}>{it.name}</span><span style={{ fontSize: 12 }}>{it.email}</span></span>
            <span style={{ ...label(10), border: '1.5px solid #0E0E12', borderRadius: 999, padding: '3px 8px' }}>{it.position}</span>
            <button type="button" aria-label={`Tirar ${it.name}`} onClick={() => set({ invites: form.invites.filter((_, j) => j !== i) })} style={{ width: 44, height: 44, border: 0, background: 'transparent', cursor: 'pointer', color: '#0E0E12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        ))}
      </div>
    </>) },
    { id: 'resumo', bg: '#B7A6FF', summary: true, node: (<>
      <Title>Confere o projeto?</Title>
      <Help>{n ? `Ao criar, os convites vão para ${n} ${n === 1 ? 'pessoa' : 'pessoas'}.` : 'Dá para convidar pessoas depois, na gestão de time.'}</Help>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div aria-hidden="true" style={{ flex: '0 0 220px', borderRadius: 20, background: '#F5F2EC', border: '2px solid #0E0E12', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={segmentIcon(form.segment)} /></svg>
            <span style={label(10, '0')}>{(form.segment || 'Segmento').toUpperCase()}</span>
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{form.name || 'Nome da empresa'}</span>
          <span style={{ fontSize: 12, lineHeight: 1.35 }}>{form.tagline || 'A frase da empresa aparece aqui.'}</span>
          <span style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 4, borderTop: '1.5px solid #0E0E12', paddingTop: 8 }}>
            {[[0, 'squads'], [n, 'pessoas'], [0, 'iniciativas']].map(([v, l]) => <span key={l} style={{ display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: 18, fontWeight: 600 }}>{v}</b><span style={{ fontSize: 10 }}>{l}</span></span>)}
          </span>
        </div>
        <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['ESTRATÉGIA', form.strategy || 'Sem estratégia ainda'],
            ['INDICADORES-CHAVE', form.indicators.length ? form.indicators.join(', ') : 'Nenhum ainda'],
            ['MERCADO', `${cnt(form.competitors.length, 'concorrente', 'concorrentes')} · ${cnt(form.links.length, 'referência', 'referências').toLowerCase()}`],
            ['SKILLS', form.skills.join(', ')],
            ['PESSOAS', n ? form.invites.map((x) => `${x.name.split(' ')[0]} (${x.position === 'IC' ? 'IC' : 'Manager'})`).join(', ') : 'Ninguém convidado ainda'],
          ].map(([k, v]) => <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, background: 'rgba(245,242,236,0.6)', border: '1.5px solid #0E0E12', padding: '10px 12px' }}><span style={label(10)}>{k}</span><span style={{ fontSize: 14, lineHeight: 1.4 }}>{v}</span></div>)}
        </div>
      </div>
    </>) },
  ];

  const heading = title ?? (mode === 'edit' ? 'Editar projeto' : 'Novo projeto');
  return (
    <BottomSheet tag={mode === 'edit' ? 'PROJETO · EDITAR' : 'PROJETO · NOVO'} title={heading} onClose={onClose}>
      <QuestionDeck tag={mode === 'edit' ? 'PROJETO · EDITAR' : 'PROJETO · NOVO'} cards={cards} step={step} onGo={go} busy={busy} error={serverError}
        nextLabel={step === LAST ? (mode === 'edit' ? 'Salvar alterações' : 'Criar projeto') : 'Próxima'} />
    </BottomSheet>
  );
}
export type { Saved };
