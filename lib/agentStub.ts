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
