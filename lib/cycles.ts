// Ciclos do projeto: duração configurável (3, 4 ou 6 meses). O id do ciclo guarda a duração:
// 3 meses → "2026-Q4", 4 meses → "2026-C3", 6 meses → "2026-S2". Ciclos antigos continuam válidos se a duração mudar.
export const CYCLE_MONTHS = [3, 4, 6] as const;
export type CycleMonths = (typeof CYCLE_MONTHS)[number];
const LETTER: Record<CycleMonths, string> = { 3: 'Q', 4: 'C', 6: 'S' };
const MONTHS_OF: Record<string, CycleMonths> = { Q: 3, C: 4, S: 6 };
export const CYCLE_NAME: Record<CycleMonths, string> = { 3: 'Trimestral', 4: 'Quadrimestral', 6: 'Semestral' };

export const asCycleMonths = (n: unknown): CycleMonths => (CYCLE_MONTHS.includes(n as CycleMonths) ? (n as CycleMonths) : 3);

/** Id do ciclo que contém a data. */
export const cycleOf = (d: Date, months: CycleMonths = 3) => `${d.getFullYear()}-${LETTER[months]}${Math.floor(d.getMonth() / months) + 1}`;
export const currentCycleFor = (months: CycleMonths = 3, now = new Date()) => cycleOf(now, months);

/** Início (inclusive) e fim (exclusivo) do ciclo, em horário local. */
export function cycleRange(id: string): { start: Date; end: Date; months: CycleMonths } | null {
  const m = /^(\d{4})-([QCS])(\d)$/.exec(id);
  if (!m) return null;
  const months = MONTHS_OF[m[2]], n = Number(m[3]), y = Number(m[1]);
  if (n < 1 || n > 12 / months) return null;
  return { start: new Date(y, (n - 1) * months, 1), end: new Date(y, n * months, 1), months };
}

/** Ciclos da duração atual, do mais recente ao mais antigo, desde `from` até o ciclo corrente. */
export function cyclesSince(from: Date, months: CycleMonths = 3, now = new Date()): string[] {
  const out: string[] = [];
  let y = now.getFullYear(), n = Math.floor(now.getMonth() / months) + 1;
  const first = cycleOf(from, months);
  for (let guard = 0; guard < 200; guard++) {
    const id = `${y}-${LETTER[months]}${n}`;
    out.push(id);
    if (id === first) break;
    n -= 1; if (n < 1) { y -= 1; n = 12 / months; }
  }
  return out;
}

export const cycleSpan = (id: string) => { const r = cycleRange(id); if (!r) return ''; const f = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', ''); const last = new Date(r.end.getTime() - 1); return `${f(r.start)} a ${f(last)}`; };
