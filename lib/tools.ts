// Catálogo fixo de ferramentas por momento (M8.4). O M9 passa a selecionar 4 a 6 por iniciativa.
export const MOMENTS = ['', 'Entendimento do desafio', 'Soft prepare', 'Explore the solutions', 'Risk mitigation', 'Articulando decisões'] as const;

export type Tool = { id: string; moment: number; type: string; title: string; desc: string; bg: string };
export const TOOLS: Tool[] = [
  { id: 'jtbd', moment: 1, type: 'Diagnóstico', title: 'Jobs to be done', desc: 'Que trabalho as pessoas contratam o produto para fazer?', bg: '#B7A6FF' },
  { id: 'stakeholders', moment: 1, type: 'Pessoas', title: 'Mapa de stakeholders', desc: 'Quem decide, quem influencia e quem é afetado.', bg: '#A9D8F5' },
  { id: 'dados', moment: 1, type: 'Dados', title: 'Leitura dos dados atuais', desc: 'O que os números já dizem sobre o problema.', bg: '#9BE3C3' },
  { id: 'provocacao', moment: 1, type: 'Provocação', title: 'E se o problema for outro?', desc: 'Questione o enquadramento antes de resolver.', bg: '#F3D36B' },
  { id: 'pesquisa', moment: 2, type: 'Pessoas', title: 'Plano de pesquisa rápida', desc: 'Como ouvir usuários em poucos dias.', bg: '#A9D8F5' },
  { id: 'jornada', moment: 2, type: 'Jornada', title: 'Jornada atual', desc: 'Onde a experiência quebra hoje.', bg: '#F5A9D6' },
  { id: 'mercado', moment: 2, type: 'Mercado', title: 'Benchmark de concorrentes', desc: 'Como o mercado resolve o mesmo problema.', bg: '#9BE3C3' },
  { id: 'metricas', moment: 2, type: 'Métricas', title: 'Métrica de sucesso', desc: 'Que número deve mudar e como medir.', bg: '#F3D36B' },
  { id: 'ideias', moment: 3, type: 'Ideias', title: 'Chuva de caminhos', desc: 'Várias direções antes de escolher uma.', bg: '#B7A6FF' },
  { id: 'futuro', moment: 3, type: 'Futuro', title: 'Cenários de futuro', desc: 'Como isso evolui em 12 meses.', bg: '#A9D8F5' },
  { id: 'exploracao', moment: 3, type: 'Exploração', title: 'Protótipo de baixa fidelidade', desc: 'Testar a ideia antes de construir.', bg: '#F5A9D6' },
  { id: 'tendencia', moment: 3, type: 'Rara · Tendência', title: 'Tendência fora da caixa', desc: 'Uma referência de outro setor.', bg: '#F3D36B' },
  { id: 'premortem', moment: 4, type: 'Teste', title: 'Pré-mortem', desc: 'Imagine que falhou: por quê?', bg: '#F5A9D6' },
  { id: 'teste', moment: 4, type: 'Teste', title: 'Teste de usabilidade', desc: 'Validar o fluxo com pessoas reais.', bg: '#9BE3C3' },
  { id: 'riscos', moment: 4, type: 'Diagnóstico', title: 'Matriz de riscos', desc: 'Probabilidade, impacto e mitigação.', bg: '#F3D36B' },
  { id: 'narrativa', moment: 5, type: 'Narrativa', title: 'História da decisão', desc: 'Contar o caminho até a escolha.', bg: '#B7A6FF' },
  { id: 'decisao', moment: 5, type: 'Decisão', title: 'Registro de decisão', desc: 'O que foi decidido, por quê e o que ficou de fora.', bg: '#A9D8F5' },
  { id: 'roadmap', moment: 5, type: 'Métricas', title: 'Plano de acompanhamento', desc: 'Como acompanhar o resultado depois do lançamento.', bg: '#9BE3C3' },
];
export const toolsOf = (moment: number) => TOOLS.filter((t) => t.moment === moment);
export const toolById = (id: string) => TOOLS.find((t) => t.id === id);

export type ResponseTemplate = { title: string; tag: 'SEGURA' | 'MÉDIA' | 'OUSADA'; description: string; impact: string; effort: string; metric: string; nextStep: string };

/** Deck de resposta fixo (3 cartas, da mais segura à mais ousada). Nunca inventa números: o que falta vira [CONFIRMAR …]. */
export function responseFor(tool: Tool, product: string): ResponseTemplate[] {
  return [
    { title: `${tool.title}: começar pelo básico`, tag: 'SEGURA', description: `Aplicar "${tool.title}" a "${product}" com o que já temos hoje, sem novas pesquisas.`, impact: 'Médio', effort: 'Baixo', metric: '[CONFIRMAR métrica afetada]', nextStep: 'Reservar uma sessão de 60 minutos com o squad e registrar o que surgir na mesa.' },
    { title: `${tool.title}: com ouvido nos usuários`, tag: 'MÉDIA', description: `Combinar "${tool.title}" com 5 conversas rápidas com pessoas que usam "${product}".`, impact: 'Alto', effort: 'Médio', metric: '[CONFIRMAR métrica afetada]', nextStep: 'Escolher quem entrevistar e marcar as conversas nesta semana.' },
    { title: `${tool.title}: apostar em algo novo`, tag: 'OUSADA', description: `Usar "${tool.title}" para questionar o desenho atual de "${product}" e testar uma direção diferente.`, impact: 'Alto', effort: 'Alto', metric: '[CONFIRMAR métrica afetada]', nextStep: 'Definir a hipótese mais arriscada e como testá-la em pequeno.' },
  ];
}
