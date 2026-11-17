import { describe, expect, it } from 'vitest';
import { cycleOf, cycleRange, cyclesSince, currentCycleFor, asCycleMonths } from '@/lib/cycles';

describe('ciclos', () => {
  it('id por duração', () => {
    expect(cycleOf(new Date(2026, 10, 17), 3)).toBe('2026-Q4');
    expect(cycleOf(new Date(2026, 10, 17), 4)).toBe('2026-C3');
    expect(cycleOf(new Date(2026, 10, 17), 6)).toBe('2026-S2');
    expect(cycleOf(new Date(2026, 0, 1), 6)).toBe('2026-S1');
    expect(currentCycleFor(4, new Date(2026, 4, 1))).toBe('2026-C2');
  });
  it('intervalo do ciclo', () => {
    const r = cycleRange('2026-C3')!;
    expect(r.start).toEqual(new Date(2026, 8, 1)); expect(r.end).toEqual(new Date(2027, 0, 1)); expect(r.months).toBe(4);
    expect(cycleRange('2026-Q5')).toBeNull(); expect(cycleRange('2026-S3')).toBeNull(); expect(cycleRange('x')).toBeNull();
  });
  it('lista ciclos do mais novo ao mais antigo', () => {
    expect(cyclesSince(new Date(2025, 10, 1), 3, new Date(2026, 4, 10))).toEqual(['2026-Q2', '2026-Q1', '2025-Q4']);
    expect(cyclesSince(new Date(2026, 0, 5), 6, new Date(2026, 8, 1))).toEqual(['2026-S2', '2026-S1']);
  });
  it('valor inválido vira 3', () => { expect(asCycleMonths(5)).toBe(3); expect(asCycleMonths(6)).toBe(6); });
});
