// Agente "de mentira" do M8.2 (respostas fixas, como no protótipo). O M9 troca estas funções pela chamada real.

export type InitiativeText = { product: string; problem?: string | null; need?: string | null };

/** Até 3 dúvidas, em ordem de importância, conforme o que faltou no deck. */
export function initialDoubts(i: InitiativeText): string[] {
  const d: string[] = [];
  if (!i.problem?.trim()) d.push('Qual problema essa iniciativa resolve, e para quem?');
  d.push(`Quem são as pessoas usuárias de "${i.product}" mais afetadas por isso?`);
  d.push('Como vamos saber que deu certo? Qual indicador deveria mudar?');
  return d.slice(0, 3);
}

/** Necessidade deduzida (sempre pede confirmação). Não inventa números. */
export function deduceNeed(i: InitiativeText): string {
  if (i.need?.trim()) return i.need.trim();
  if (i.problem?.trim()) return `Resolver o problema em "${i.product}": ${i.problem.trim()} [CONFIRMAR meta e prazo]`;
  return `Melhorar "${i.product}" [CONFIRMAR qual resultado o negócio espera]`;
}

/** Resposta do agente: sempre fecha com "Entendi assim: … Entendi certo?". */
export function agentReply(userText: string): string {
  const t = userText.trim().replace(/\s+/g, ' ');
  const short = t.length > 280 ? `${t.slice(0, 277)}…` : t;
  return `Entendi assim: ${short.endsWith('.') ? short : `${short}.`} Entendi certo?`;
}

export const understoodSummary = (agentText: string) => agentText.replace(/^Entendi assim:\s*/, '').replace(/\s*Entendi certo\?$/, '');

/** Momento fixo do M8.3 (o M9 troca pela análise real): mais contexto na mesa avança o momento. */
export function identifyMoment(cardCount: number, resolvedDoubts: number): { moment: number; reason: string } {
  const depth = cardCount + resolvedDoubts;
  if (depth < 3) return { moment: 1, reason: 'Ainda há pouco contexto na mesa: o primeiro passo é entender bem o desafio.' };
  if (depth < 5) return { moment: 2, reason: 'O desafio já está claro; falta preparar o terreno com dados e pessoas antes de explorar soluções.' };
  if (depth < 7) return { moment: 3, reason: 'Há contexto suficiente para explorar soluções com segurança.' };
  return { moment: 4, reason: 'O contexto está profundo: vale mitigar riscos antes de decidir.' };
}
