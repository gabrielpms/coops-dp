'use client';
import { useState } from 'react';
import { FocusCard, FocusClose } from '@/components/ds/FocusCard';
import { DateCalendar } from '@/components/team/DateCalendar';
import { AnalysisOverlay } from '@/components/initiative/AnalysisOverlay';
import { mono } from '@/components/ds/tokens';

const btn = { fontFamily: 'inherit', fontWeight: 600, fontSize: 15, minHeight: 48, padding: '0 20px', borderRadius: 14, cursor: 'pointer' } as const;

/** Demos interativas do /ds: calendário, carta em foco e overlay do agente. */
export function DsDemos() {
  const [date, setDate] = useState('');
  const [focus, setFocus] = useState<DOMRect | null | false>(false);
  const [an, setAn] = useState(false);
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ width: 340 }}><DateCalendar value={date} onChange={setDate} max={new Date().toISOString().slice(0, 10)} /><p style={{ ...mono, fontSize: 12, color: '#A3A1AD' }}>{date || 'nenhuma data escolhida'}</p></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button type="button" onClick={(e) => setFocus(e.currentTarget.getBoundingClientRect())} style={{ ...btn, background: '#F3D36B', border: '2px solid #0E0E12', color: '#0E0E12' }}>Abrir carta em foco</button>
          <button type="button" onClick={() => setAn(true)} style={{ ...btn, background: '#8FE3C8', border: '2px solid #0E0E12', color: '#0E0E12' }}>Ver o agente analisando</button>
        </div>
      </div>
      {focus !== false && (
        <FocusCard origin={focus} bg="#F3D36B" ariaLabel="Exemplo de carta em foco" onClose={() => setFocus(false)}>
          <div className="coops-fx-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ ...mono, fontSize: 12, color: 'rgba(14,14,18,0.68)' }}>DS › CARTA EM FOCO</span><h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em' }}>Título da carta</h2></div>
              <FocusClose onClick={() => setFocus(false)} />
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>Abre a partir da posição da carta clicada e volta para ela ao fechar. Esc e clique fora também fecham.</p>
          </div>
        </FocusCard>
      )}
      {an && <AnalysisOverlay contextCount={4} resolvedCount={2} ready onDone={() => setAn(false)} onCancel={() => setAn(false)} />}
    </>
  );
}
