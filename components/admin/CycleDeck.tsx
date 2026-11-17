'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { darkBtn, label } from '../ds/tokens';
import { CYCLE_MONTHS, CYCLE_NAME, currentCycleFor, cycleSpan, type CycleMonths } from '@/lib/cycles';
import { cycleLabel } from '@/lib/format';

/** Duração dos ciclos do projeto: 3, 4 ou 6 meses. */
export function CycleDeck({ projectId, current, onClose, onSaved }: { projectId: string; current: CycleMonths; onClose: () => void; onSaved: () => void }) {
  const [months, setMonths] = useState<CycleMonths>(current);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const next = currentCycleFor(months);
  const save = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/cycles`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ months }) });
      if (!r.ok) { setErr((await r.json().catch(() => ({}))).error ?? 'Não deu para salvar. Tente de novo.'); return; }
      onSaved();
    } catch { setErr('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };
  return (
    <BottomSheet tag="PROJETO · CICLOS" title="Duração dos ciclos" sub="Escolha quanto dura cada ciclo." onClose={onClose}>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: '#A3A1AD', maxWidth: 560 }}>Skills, saúde e jornada são respondidas por ciclo. Quando um ciclo termina, tudo dele fica guardado no histórico de ciclos, do squad e de cada pessoa.</p>
      <div role="radiogroup" aria-label="Duração do ciclo" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {CYCLE_MONTHS.map((m) => { const on = months === m; return (
          <button key={m} type="button" role="radio" aria-checked={on} onClick={() => setMonths(m)} style={{ fontFamily: 'inherit', flex: '0 1 150px', minWidth: 120, minHeight: 96, boxSizing: 'border-box', borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, cursor: 'pointer', textAlign: 'left', background: on ? '#8FE3C8' : 'transparent', color: on ? '#0E0E12' : '#F5F2EC', border: `2px solid ${on ? '#0E0E12' : '#4A4858'}`, boxShadow: on ? '4px 4px 0 #3E9A80' : 'none', transition: 'background .18s ease, border-color .18s ease, transform .18s ease' }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><b style={{ fontSize: 34, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{m}</b><span style={{ ...label(11, '0.06em') }}>MESES</span></span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{CYCLE_NAME[m]}</span>
          </button>); })}
      </div>
      <div style={{ borderRadius: 14, border: '1.5px dashed #4A4858', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={label(10)}>CICLO ATUAL COM ESSA DURAÇÃO</span>
        <span style={{ fontSize: 16 }}><b>{cycleLabel(next)}</b> · {cycleSpan(next)}</span>
        {months !== current && <span style={{ fontSize: 13, color: '#F3D36B', lineHeight: 1.4 }}>Ao mudar, o ciclo atual passa a ser o {cycleLabel(next)}. O que já foi respondido continua no histórico, no ciclo em que foi registrado.</span>}
      </div>
      {err && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{err}</span>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" disabled={busy || months === current} onClick={save} style={{ ...darkBtn, background: '#B7A6FF', color: '#0E0E12', minHeight: 48, padding: '0 22px', opacity: busy || months === current ? 0.5 : 1 }}>{busy ? 'Salvando…' : 'Salvar duração'}</button>
        <button type="button" onClick={onClose} style={{ ...darkBtn, background: 'transparent', color: '#F5F2EC', border: '1.5px solid #4A4858', minHeight: 48 }}>Cancelar</button>
      </div>
    </BottomSheet>
  );
}
