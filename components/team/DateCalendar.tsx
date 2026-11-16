'use client';
import { useState } from 'react';
import { mono } from '../ds/tokens';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const pad = (n: number) => String(n).padStart(2, '0');
const sel = { fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: '#0E0E12', background: 'transparent', border: 0, cursor: 'pointer' } as const;

/** Calendário de data de entrada (Coops05): marcador desenhado no dia escolhido e sublinhado no dia de hoje. */
export function DateCalendar({ value, onChange, max }: { value: string; onChange: (iso: string) => void; max: string }) {
  const today = new Date(); const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const base = value ? new Date(`${value}T12:00:00`) : today;
  const [ym, setYm] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const shift = (k: number) => setYm(({ y, m }) => { const n = m + k; return { y: y + Math.floor(n / 12), m: ((n % 12) + 12) % 12 }; });
  const first = new Date(ym.y, ym.m, 1).getDay(), dim = new Date(ym.y, ym.m + 1, 0).getDate();
  const years = Array.from({ length: 41 }, (_, i) => today.getFullYear() - 40 + i);
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  return (
    <div className="tw-cal" role="group" aria-label="Calendário de data de entrada" style={{ borderRadius: 20, background: '#B7A6FF', border: '2px solid #0E0E12', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button type="button" className="tw-calnav" aria-label="Mês anterior" onClick={() => shift(-1)} style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #0E0E12', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E0E12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
        <span aria-live="polite" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <select aria-label="Mês" value={ym.m} onChange={(e) => setYm({ ...ym, m: Number(e.target.value) })} style={sel}>{MESES.map((n, i) => <option key={n} value={i}>{n}</option>)}</select>
          <select aria-label="Ano" value={ym.y} onChange={(e) => setYm({ ...ym, y: Number(e.target.value) })} style={sel}>{years.map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </span>
        <button type="button" className="tw-calnav" aria-label="Próximo mês" onClick={() => shift(1)} style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #0E0E12', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E0E12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button>
      </div>
      <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4, ...mono, fontSize: 10, letterSpacing: '0.06em', textAlign: 'center' }}>{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4 }}>
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const iso = `${ym.y}-${pad(ym.m + 1)}-${pad(d)}`, on = iso === value, isToday = iso === todayIso, off = iso > max;
          return (
            <button key={i} type="button" className="tw-day" aria-label={`${d} de ${MESES[ym.m].toLowerCase()} de ${ym.y}`} aria-pressed={on} disabled={off} onClick={() => onChange(iso)} style={{ position: 'relative', height: 34, borderRadius: 10, fontFamily: 'inherit', fontSize: 14, fontWeight: on || isToday ? 700 : 400, color: '#0E0E12', background: 'transparent', border: 0, cursor: off ? 'default' : 'pointer', opacity: off ? 0.35 : 1, padding: 0 }}>
              {on && <svg className="tw-mk" viewBox="0 0 48 44" preserveAspectRatio="none" aria-hidden="true"><path d="M13 35C3 28 4 11 20 5C36 0 47 10 45 22C43 34 30 42 17 39C8 37 3 29 6 20C8 15 12 11 17 9" fill="none" stroke="#0E0E12" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              {isToday && !on && <svg className="tw-ul" viewBox="0 0 20 6" preserveAspectRatio="none" aria-hidden="true"><path d="M1 4c4-3 6 1 9-1s6-2 9 0" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" /></svg>}
              <span style={{ position: 'relative', zIndex: 2 }}>{d}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
