import { MOMENTS, TOOLS } from '@/lib/tools';
import type { Frente, Resultados } from './schemas';
import { contextText, type RunInput } from './context';

/** Ajuste de ambiente: as skills foram escritas para o claude.ai; aqui rodam num container da API, sem Figma, navegador nem perguntas. */
export const SYSTEM = [
  'Você é o motor de análise das iniciativas do Coops, um produto de gestão de times de design e produto. Responda sempre em português do Brasil.',
  'AMBIENTE: você roda num container de execução de código da API da Anthropic, com as skills do Coops carregadas. Não existem Figma/MCP, navegador, a ferramenta "Skill", publicação de artifact nem comentários. Os arquivos do material (quando há) chegam no container como arquivos anexados. Telas importadas de um link do Figma também chegam como imagens anexadas (um PNG por frame); um link do Figma sem imagens anexadas NÃO conta como tela.',
  'CONTEXTO JÁ DADO: quem preencheu o contexto foi a pessoa, na plataforma (texto abaixo). Isso substitui TODAS as perguntas que a skill faria e qualquer portão de confirmação: NÃO faça perguntas, NÃO espere resposta. Onde faltar informação, declare a suposição ou escreva "[CONFIRMAR …]". Nunca invente números, dados de uso, nem citações.',
  'SAÍDA: não publique página nem gere imagens para o usuário. Use a skill pelo método e pelos critérios dela, mas entregue o resultado FINAL apenas como um único bloco ```json com o formato pedido, sem texto depois dele. Textos curtos, diretos, com a tela de origem quando houver.',
].join('\n');

const jsonHint = (shape: string) => `Responda SÓ com um bloco \`\`\`json neste formato:\n${shape}`;

export function routerPrompt(i: RunInput): string {
  return [
    'TAREFA: use a skill "analise-integrada-de-material" SOMENTE para decidir o roteamento (não rode as análises agora).',
    contextText(i),
    'REGRAS: heuristica e metricas só fazem sentido com telas (imagens, PDF ou apresentação anexados). estrategia vale sempre e roda por último. Sem telas, use só estrategia. Se o usuário não especificou, com telas rode as três. Proponha a core action em uma frase, com base no contexto.',
    jsonHint('{"tipoMaterial":"…","frentes":["heuristica","metricas","estrategia"],"coreAction":"…","suposicoes":["…"],"justificativa":"…"}'),
  ].join('\n\n');
}

const FRONT_SKILL: Record<Frente, string> = { heuristica: 'screen-ia-usability-review', metricas: 'screen-metrics-tagging', estrategia: 'estrategia-jungle' };
const FRONT_SHAPE: Record<Frente, string> = {
  heuristica: '{"score":0-100,"resumo":"…","achados":[{"tela":"Tela 2","titulo":"…","severidade":"CRITICO|ALTO|MEDIO|BAIXO","principio":"…","descricao":"…","recomendacao":"…"}]}',
  metricas: '{"coreAction":"…","confirmada":false,"pontos":[{"tela":"Tela 1","camada":"NEGOCIO|PRODUTO|EXPERIENCIA","evento":"…","porque":"…"}],"lacunas":["…"]}',
  estrategia: '{"score":0-100,"problema":{"veredito":"CLARO|PARCIAL|AUSENTE","justificativa":"…"},"gaps":[{"titulo":"…","severidade":"CRITICO|ALTO|MEDIO|BAIXO","descricao":"…"}],"cenarios":[{"titulo":"…","plausibilidade":"PROVAVEL|PLAUSIVEL|POSSIVEL|SURPRESA","sinalAlerta":"…","mitigacao":"…"}],"horizontes":{"h1":"…","h2":"…","h3":"…"},"dicas":{"quick":["…"],"estruturantes":["…"]},"provocacoes":["…"]}',
};

export function frontPrompt(front: Frente, i: RunInput, r: Resultados): string {
  const prev = front === 'estrategia' && (r.heuristica || r.metricas)
    ? `\n\nACHADOS DAS OUTRAS FRENTES (cite-os em vez de repetir):\n${JSON.stringify({ heuristica: r.heuristica ? { score: r.heuristica.score, achados: r.heuristica.achados.slice(0, 5) } : undefined, metricas: r.metricas ? { coreAction: r.metricas.coreAction, lacunas: r.metricas.lacunas } : undefined })}`
    : '';
  return [
    `TAREFA: aplique a skill "${FRONT_SKILL[front]}" ao material desta iniciativa.${front === 'estrategia' ? ' Se não houver telas, analise o contexto escrito como uma proposta.' : ' Analise todas as telas anexadas, na ordem dos arquivos (Tela 1, Tela 2…).'}`,
    contextText(i),
    `Roteamento: core action proposta = "${r.rotear?.coreAction ?? ''}"; suposições = ${JSON.stringify(r.rotear?.suposicoes ?? [])}.${prev}`,
    jsonHint(FRONT_SHAPE[front]),
  ].join('\n\n');
}

export function consolidarPrompt(i: RunInput, r: Resultados): string {
  const tools = TOOLS.map((t) => `${t.id} (momento ${t.moment}: ${t.title})`).join('; ');
  return [
    'TAREFA: use a skill "analise-integrada-de-material" apenas para a CONSOLIDAÇÃO: cruze as frentes (usabilidade na core action sobe para prioridade máxima; pontos de métrica sem tela viram lacuna; problema que contradiz a tese estratégica vira ponto de decisão; itens repetidos viram um só). Não rode as skills de novo.',
    contextText(i),
    `RESULTADOS DAS FRENTES:\n${JSON.stringify({ roteamento: r.rotear, heuristica: r.heuristica, metricas: r.metricas, estrategia: r.estrategia })}`,
    `Além do parecer, identifique o MOMENTO da iniciativa no processo do Coops (1 a 5): ${MOMENTS.slice(1).map((m, n) => `${n + 1} = ${m}`).join('; ')}. Escolha de 4 a 6 ferramentas do catálogo, só pelos ids: ${tools}.`,
    jsonHint('{"resumo":"…(5 linhas no máximo)","scoreUsabilidade":0-100 ou null,"scoreEstrategico":0-100 ou null,"coreAction":"…","maiorRisco":"…","recomendacao":"…","prioridades":[{"item":"…","frentes":["heuristica"],"impacto":"ALTO|MEDIO|BAIXO","esforco":"ALTO|MEDIO|BAIXO","tela":"Tela 1"}],"proximosPassos":[{"acao":"…","dono":"DESIGN|PRODUTO|DADOS|ENGENHARIA"}],"momento":1,"motivoMomento":"…","ferramentas":["jtbd","dados"]}'),
  ].join('\n\n');
}
