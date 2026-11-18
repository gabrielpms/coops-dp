'use client';
import { chipStyle } from '../ds/tokens';

export type SquadOpt = { id: string; name: string; color: string };

/** Escolha de squad dentro de uma carta de deck: "Sem squad" ou um dos squads do projeto (um só por pessoa). */
export function SquadChoice({ squads, value, onChange }: { squads: SquadOpt[]; value: string | null; onChange: (id: string | null) => void }) {
  return (
    <div role="radiogroup" aria-label="Squad" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <button type="button" role="radio" aria-checked={value === null} className="tw-chip" onClick={() => onChange(null)} style={chipStyle(value === null)}>Sem squad</button>
      {squads.map((s) => {
        const on = value === s.id;
        return (
          <button key={s.id} type="button" role="radio" aria-checked={on} className="tw-chip" onClick={() => onChange(s.id)} style={{ ...chipStyle(on), display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, border: '1.5px solid #0E0E12' }} />{s.name}
          </button>
        );
      })}
    </div>
  );
}
