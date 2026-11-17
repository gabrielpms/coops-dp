import { db } from './db';
import { asCycleMonths, currentCycleFor, type CycleMonths } from './cycles';

/** Duração dos ciclos do projeto e o ciclo corrente. */
export async function projectCycle(projectId: string): Promise<{ months: CycleMonths; cycle: string }> {
  const p = await db.project.findUnique({ where: { id: projectId }, select: { cycleMonths: true } });
  const months = asCycleMonths(p?.cycleMonths);
  return { months, cycle: currentCycleFor(months) };
}
