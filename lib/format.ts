export const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? n;
export const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
export const MONTHS_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const plural = (n: number, a: string, b: string) => (n === 1 ? a : b);
export const pad2 = (n: number) => String(n).padStart(2, '0');

/** "2 anos e 4 meses de casa" / "8 meses de casa" / "menos de 1 mês de casa" */
export function tenureLong(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return '';
  const d = new Date(iso);
  const m = Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth());
  if (m < 1) return 'menos de 1 mês de casa';
  const y = Math.floor(m / 12), r = m % 12;
  const parts = [y ? `${y} ${plural(y, 'ano', 'anos')}` : '', r ? `${r} ${plural(r, 'mês', 'meses')}` : ''].filter(Boolean);
  return `${parts.join(' e ')} de casa`;
}
export const cycleLabel = (c: string) => { const [y, q] = c.split('-'); return `${q} ${y}`; };
export const STATUS_LABEL = { ENTREGUE: 'ENTREGUE', EM_ANDAMENTO: 'EM ANDAMENTO', PAUSADA: 'PAUSADA' } as const;
export const STATUS_LONG = { ENTREGUE: 'Entregue', EM_ANDAMENTO: 'Em andamento', PAUSADA: 'Pausada' } as const;
