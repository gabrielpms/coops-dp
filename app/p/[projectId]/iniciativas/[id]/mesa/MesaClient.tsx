'use client';
import { AnalysisOverlay } from '@/components/initiative/AnalysisOverlay';
import { useRef, useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import type { AvatarConfig } from '@/components/avatar/Avatar';
import { CoopsLink, useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { BottomSheet } from '@/components/sheet/BottomSheet';
import { cardInput, darkBtn, label } from '@/components/ds/tokens';
import { CONTEXT_KINDS, CONTEXT_META } from '@/lib/validation';

type Kind = (typeof CONTEXT_KINDS)[number];
type Att = { id: string; kind: string; name: string; size: number };
const sizeLabel = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
type Card = { kind: string; text: string; links: string[] };
const MOMENTS = ['', 'Entendimento do desafio', 'Soft prepare', 'Explore the solutions', 'Risk mitigation', 'Articulando decisões'];
const OUTCOMES = { ENTREGUE: 'Entregue', PARCIAL: 'Entregue em parte', CANCELADA: 'Cancelada' } as const;

export function MesaClient({ user, projectId, initiative, cards, attachments, resolved, hasAnalysis, isOwner }: {
  /** já existe uma análise concluída do agente para esta iniciativa */ hasAnalysis: boolean; /** quem vê é o dono do projeto (cuida da chave da Anthropic) */ isOwner: boolean;
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; projectId: string;
  initiative: { id: string; product: string; problem: string; need: string; status: 'ABERTA' | 'ENCERRADA'; moment: number | null; momentReason: string; closeOutcome: string | null; closeNote: string };
  cards: Card[]; attachments: Att[]; resolved: { question: string; summary: string }[];
}) {
  const { refresh, go } = useCoopsRouter();
  const isManager = user.role === 'MANAGER';
  const closed = initiative.status === 'ENCERRADA';
  const canEdit = isManager && !closed;
  const [editing, setEditing] = useState<Kind | null>(null);
  const [text, setText] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [link, setLink] = useState('');
  const [closing, setClosing] = useState(false);
  const [outcome, setOutcome] = useState<keyof typeof OUTCOMES>('ENTREGUE');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = `/api/initiatives/${initiative.id}`;
  const filesOf = (k: string) => attachments.filter((a) => a.kind === k);
  const onTable = (k: string): Card | undefined => cards.find((c) => c.kind === k) ?? (filesOf(k).length ? { kind: k, text: '', links: [] } : undefined);
  const [uploading, setUploading] = useState(false);

  const call = async (url: string, method: string, body?: object) => {
    setBusy(true); setError(null);
    try {
      const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Não deu certo. Tente de novo.'); return null; }
      return data;
    } catch { setError('Sem conexão. Tente de novo.'); return null; } finally { setBusy(false); }
  };
  const open = (k: Kind) => { const c = onTable(k); setText(c?.text ?? ''); setLinks(c?.links ?? []); setLink(''); setError(null); setEditing(k); };
  const addLink = () => { const v = link.trim(); if (v && !links.includes(v)) setLinks([...links, v]); setLink(''); };
  const saveCard = async () => { const pending = link.trim(); const all = pending && !links.includes(pending) ? [...links, pending] : links; if (!text.trim() && !all.length && filesOf(editing!).length) { setEditing(null); return; } if (await call(`${api}/context/${editing}`, 'PUT', { text, links: all })) { setEditing(null); refresh(); } };
  const remove = async () => { if (await call(`${api}/context/${editing}`, 'DELETE')) { setEditing(null); refresh(); } };
  /** Envio em 3 passos: pede a URL, envia direto ao armazenamento e confirma. */
  const upload = async (file: File) => {
    if (!editing) return;
    setUploading(true); setError(null);
    try {
      const mime = file.type || 'application/octet-stream';
      const res = await fetch(`${api}/attachments`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: editing, name: file.name, mime, size: file.size }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Não deu para enviar. Tente de novo.'); return; }
      const put = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'content-type': mime }, body: file });
      if (!put.ok) { await fetch(`/api/attachments/${data.attachment.id}`, { method: 'DELETE' }).catch(() => {}); setError('O envio falhou. Tente de novo.'); return; }
      const ok = await fetch(`/api/attachments/${data.attachment.id}`, { method: 'PATCH' });
      if (!ok.ok) { setError((await ok.json().catch(() => ({}))).error ?? 'O envio não foi confirmado.'); return; }
      refresh();
    } catch { setError('Sem conexão. Tente de novo.'); } finally { setUploading(false); }
  };
  const removeFile = async (id: string) => { if (await call(`/api/attachments/${id}`, 'DELETE')) refresh(); };
  const [analysing, setAnalysing] = useState<'off' | 'running' | 'ready'>('off');
  // O agente analisa com animação (Coops10b) enquanto a identificação do momento roda no servidor.
  // Com a chave e as skills configuradas, a análise é real: cada passo roda numa requisição e a tela acompanha. Sem elas, cai no agente fixo.
  const [live, setLive] = useState<{ labels: string[]; done: number; error: string | null } | null>(null);
  const [via, setVia] = useState<'engine' | 'stub'>('stub');
  const [engineNote, setEngineNote] = useState<string | null>(null);
  const runId = useRef<string | null>(null);
  const cancelled = useRef(false);
  const drive = async () => {
    cancelled.current = false;
    setLive((l) => (l ? { ...l, error: null } : l));
    while (!cancelled.current && runId.current) {
      let data: any = {};
      try {
        const res = await fetch(`${api}/analysis/${runId.current}/advance`, { method: 'POST' });
        data = await res.json().catch(() => ({}));
        if (!res.ok) { setLive((l) => (l ? { ...l, error: data.error ?? 'Não deu certo. Tente de novo.' } : l)); return; }
      } catch { setLive((l) => (l ? { ...l, error: 'Sem conexão. Tente de novo.' } : l)); return; }
      const run = data.run;
      setLive({ labels: run.steps.map((s: { label: string }) => s.label), done: run.progress.done, error: run.status === 'FAILED' ? (run.error ?? 'Não deu certo. Tente de novo.') : null });
      if (run.status === 'FAILED') return;
      if (run.status === 'DONE') { setAnalysing((a) => (a === 'running' ? 'ready' : a)); return; }
    }
  };
  const identify = async () => {
    setAnalysing('running'); setLive(null); setEngineNote(null); setError(null);
    try {
      const res = await fetch(`${api}/analysis`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { runId.current = data.id; setVia('engine'); setLive({ labels: [], done: 0, error: null }); void drive(); return; }
      if (res.status === 409 && (data.code === 'NO_KEY' || data.code === 'NO_SKILLS')) {
        setVia('stub'); setEngineNote(data.message);
        if (await call(`${api}/moment`, 'POST')) setAnalysing((a) => (a === 'running' ? 'ready' : a)); else setAnalysing('off');
        return;
      }
      setError(data.error ?? 'Não deu certo. Tente de novo.'); setAnalysing('off');
    } catch { setError('Sem conexão. Tente de novo.'); setAnalysing('off'); }
  };
  const finish = async () => { if (await call(`${api}/close`, 'POST', { outcome, note })) { setClosing(false); refresh(); } };
  const reopen = async () => { if (await call(`${api}/close`, 'DELETE')) refresh(); };

  const box = { color: '#0E0E12', borderRadius: 22, border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200, boxSizing: 'border-box', boxShadow: '0 16px 36px rgba(0,0,0,0.45)' } as const;
  const ghost = { ...darkBtn, background: 'transparent', color: '#F5F2EC', border: '1.5px solid #4A4858', minHeight: 48 } as const;
  const primary = { fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#0E0E12', background: '#B7A6FF', border: '2px solid #0E0E12', borderRadius: 14, minHeight: 48, padding: '0 20px', cursor: busy ? 'wait' : 'pointer' } as const;

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8, borderRadius: 32, background: '#17171D', border: '1px solid #2C2C36', padding: 'clamp(20px, 4vw, 36px)' }}>
          <CoopsLink href={`/p/${projectId}/iniciativas`} style={{ fontSize: 14, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>← Iniciativas</CoopsLink>
          <span style={{ ...label(12, '0.1em'), color: '#B7A6FF' }}>{initiative.product.toUpperCase()} · MESA DA INICIATIVA</span>
          <h1 style={{ margin: 0, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05 }}>Dê profundidade com cartas de contexto</h1>
          {closed && <span style={{ ...label(12, '0.08em'), color: '#F3D36B' }}>ENCERRADA · {OUTCOMES[initiative.closeOutcome as keyof typeof OUTCOMES]?.toUpperCase()}{initiative.closeNote ? ` · ${initiative.closeNote}` : ''}</span>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
            {canEdit && <button type="button" disabled={busy} onClick={identify} style={primary}>{initiative.moment ? 'Analisar de novo' : 'Analisar com o agente'}</button>}
            {isManager && (closed ? <button type="button" disabled={busy} onClick={reopen} style={ghost}>Reabrir</button> : <button type="button" onClick={() => { setNote(''); setError(null); setClosing(true); }} style={ghost}>Finalizar iniciativa</button>)}
          </div>
          {hasAnalysis && <CoopsLink href={`/p/${projectId}/iniciativas/${initiative.id}/analise`} style={{ fontWeight: 600, fontSize: 15, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>Ver a análise do agente →</CoopsLink>}
          {engineNote && <span role="status" style={{ fontSize: 14, color: '#A3A1AD' }}>{engineNote}{isOwner && <> <CoopsLink href="/admin/integracoes" style={{ fontWeight: 600 }}>Abrir Integrações</CoopsLink></>}</span>}
          {initiative.moment && <CoopsLink href={`/p/${projectId}/iniciativas/${initiative.id}/momento`} style={{ fontWeight: 600, fontSize: 15, minHeight: 44, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start' }}>Ver ferramentas do momento →</CoopsLink>}
          {initiative.moment && <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.45 }}><b>Momento {initiative.moment} · {MOMENTS[initiative.moment]}.</b> <span style={{ color: '#A3A1AD' }}>{initiative.momentReason}</span></p>}
          {error && !editing && !closing && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
        </section>

        <section aria-label="Cartas da mesa" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          <div className="coops-ichov" tabIndex={0} style={{ ...box, background: '#B7A6FF', gridColumn: 'span 2', minHeight: 300, borderRadius: 30, boxShadow: '12px 12px 0 #4B36B0', margin: '0 12px 12px 0', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <svg width="60" height="60" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path className="ic-tw" d="M12 10v6M9 13h6" /><path className="ic-tw ic-tw2" d="M53 26v5M50.5 28.5h5" /><path className="ic-tw ic-tw3" d="M10 36h.01" /><path className="ic-tw ic-tw4" d="M55 8h.01" /><g className="ic-rocket"><path d="M32 6c10 8 14 20 10 34H22C18 26 22 14 32 6z" /><circle cx="32" cy="24" r="5" /><path d="M22 40l-8 10h12M42 40l8 10H38" /></g><path className="ic-fire" d="M26 42c0 7 3 11 6 19 3-8 6-12 6-19" /><path className="ic-fire ic-fire2" d="M29.5 42c0 4 1 7 2.5 11 1.5-4 2.5-7 2.5-11" /></svg>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{String(CONTEXT_KINDS.filter((k) => onTable(k)).length).padStart(2, '0')}</span><span style={label(11, '0')}>CONTEXTOS</span></span>
            </div>
            <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>A INICIATIVA</span>
            <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{initiative.product}</span>
            {initiative.problem && <span style={{ fontSize: 14, lineHeight: 1.4 }}><b>Problema:</b> {initiative.problem}</span>}
            <span style={{ fontSize: 14, lineHeight: 1.4 }}><b>Necessidade:</b> {initiative.need}</span>
            {resolved.length > 0 && <span style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, lineHeight: 1.4 }}><span style={label(10)}>RESOLVIDO COM O AGENTE</span>{resolved.map((r) => <span key={r.question}>• {r.summary}</span>)}</span>}
          </div>
          {CONTEXT_KINDS.map((k) => {
            const m = CONTEXT_META[k], c = onTable(k);
            return c ? (
              <div key={k} style={{ ...box, background: m.bg }}>
                <span style={label(11, '0.08em')}>{m.title.toUpperCase()}</span>
                {c.text && <span style={{ fontSize: 15, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{c.text}</span>}
                {filesOf(k).map((f) => <a key={f.id} href={`/api/attachments/${f.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0E0E12', fontSize: 13, wordBreak: 'break-all' }}>📎 {f.name} · {sizeLabel(f.size)}</a>)}
                {c.links.map((l) => <a key={l} href={/^https?:\/\//i.test(l) ? l : `https://${l}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0E0E12', fontSize: 13, wordBreak: 'break-all' }}>{l}</a>)}
                {canEdit && <button type="button" onClick={() => open(k)} style={{ ...darkBtn, marginTop: 'auto', alignSelf: 'flex-start', minHeight: 44 }}>Editar</button>}
              </div>
            ) : canEdit ? (
              <button key={k} type="button" onClick={() => open(k)} className="coops-card" aria-label={`Adicionar ${m.title}`} style={{ ...box, background: 'transparent', color: '#F5F2EC', border: '2px dashed #4A4858', boxShadow: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', justifyContent: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>+ {m.title}</span><span style={{ fontSize: 13, color: '#A3A1AD', lineHeight: 1.4 }}>{m.hint}</span>
              </button>
            ) : null;
          })}
        </section>
        <p style={{ margin: 0, color: '#A3A1AD', fontSize: 14 }}>O deck de ferramentas do momento entra no próximo passo.</p>
      </div>

      {editing && (
        <BottomSheet tag="MESA · CONTEXTO" title={CONTEXT_META[editing].title} onClose={() => setEditing(null)}>
          <p style={{ margin: 0, fontSize: 14, color: '#A3A1AD' }}>{CONTEXT_META[editing].hint}</p>
          <textarea aria-label="Texto da carta" maxLength={2000} placeholder="Escreva o que sabemos" value={text} onChange={(e) => setText(e.target.value)} style={{ ...cardInput, minHeight: 130, resize: 'vertical' }} />
          <form onSubmit={(e) => { e.preventDefault(); addLink(); }} style={{ display: 'flex', gap: 8 }}>
            <input type="text" aria-label="Novo link" placeholder="+ Link (https://…)" value={link} onChange={(e) => setLink(e.target.value)} style={{ ...cardInput, flex: '1 1 auto' }} />
            <button type="submit" style={darkBtn}>Adicionar</button>
          </form>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {links.map((l) => <button key={l} type="button" aria-label={`Remover ${l}`} onClick={() => setLinks(links.filter((x) => x !== l))} style={{ fontFamily: 'inherit', fontSize: 13, color: '#F5F2EC', background: '#2C2C36', border: 0, borderRadius: 999, minHeight: 36, padding: '0 12px', cursor: 'pointer' }}>{l} ✕</button>)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filesOf(editing).map((f) => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2C2C36', borderRadius: 12, padding: '4px 4px 4px 12px' }}>
                <a href={`/api/attachments/${f.id}`} target="_blank" rel="noopener noreferrer" style={{ flex: '1 1 auto', minWidth: 0, fontSize: 14, color: '#F5F2EC', overflowWrap: 'anywhere' }}>📎 {f.name} · {sizeLabel(f.size)}</a>
                <button type="button" aria-label={`Remover ${f.name}`} onClick={() => removeFile(f.id)} style={{ width: 44, height: 44, border: 0, background: 'transparent', color: '#F5F2EC', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <label style={{ ...ghost, display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', cursor: uploading ? 'wait' : 'pointer', boxSizing: 'border-box', fontWeight: 600, fontSize: 14, padding: '0 16px', borderRadius: 14 }}>
              {uploading ? 'Enviando…' : '+ Anexar arquivo'}
              <input type="file" disabled={uploading} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void upload(f); }} />
            </label>
            <span style={{ fontSize: 12, color: '#A3A1AD' }}>Imagem, PDF, Office, texto ou vídeo, até 25 MB.</span>
          </div>
          {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {onTable(editing) ? <button type="button" disabled={busy} onClick={remove} style={ghost}>Tirar da mesa</button> : <span />}
            <button type="button" disabled={busy} onClick={saveCard} style={primary}>{busy ? 'Salvando…' : 'Colocar na mesa'}</button>
          </div>
        </BottomSheet>
      )}

      {closing && (
        <BottomSheet tag="INICIATIVA · FINALIZAR" title="Como essa iniciativa terminou?" onClose={() => setClosing(false)}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Como essa iniciativa terminou?</p>
          <div role="radiogroup" aria-label="Resultado" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(Object.keys(OUTCOMES) as (keyof typeof OUTCOMES)[]).map((o) => <button key={o} type="button" role="radio" aria-checked={outcome === o} onClick={() => setOutcome(o)} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 14, minHeight: 44, padding: '0 16px', borderRadius: 999, cursor: 'pointer', color: outcome === o ? '#0E0E12' : '#F5F2EC', background: outcome === o ? '#B7A6FF' : 'transparent', border: outcome === o ? '2px solid #0E0E12' : '1.5px solid #4A4858' }}>{OUTCOMES[o]}</button>)}
          </div>
          <textarea aria-label="O que ficou de aprendizado" maxLength={1000} placeholder="O que ficou de aprendizado? (opcional)" value={note} onChange={(e) => setNote(e.target.value)} style={{ ...cardInput, minHeight: 100, resize: 'vertical' }} />
          {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
          <button type="button" disabled={busy} onClick={finish} style={{ ...primary, alignSelf: 'flex-start' }}>{busy ? 'Salvando…' : 'Finalizar e registrar no perfil'}</button>
        </BottomSheet>
      )}
      {analysing !== 'off' && <AnalysisOverlay contextCount={cards.length} resolvedCount={resolved.length} ready={analysing === 'ready'} onDone={() => go(`/p/${projectId}/iniciativas/${initiative.id}/${via === 'engine' ? 'analise' : 'momento'}`)} onCancel={() => { cancelled.current = true; setAnalysing('off'); }} live={via === 'engine' && live ? { labels: live.labels, done: live.done, error: live.error, onRetry: () => void drive() } : undefined} />}
    </div>
  );
}
