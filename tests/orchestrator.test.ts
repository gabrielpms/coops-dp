import { afterEach, describe, expect, it, vi } from 'vitest';
import { advance, initialState, planFronts, progress, type Deps, type RunState } from '@/lib/agent/orchestrator';
import { extractJson, consolidadoSchema, routerSchema } from '@/lib/agent/schemas';
import { hasScreens, materialOf, sendable, type RunInput } from '@/lib/agent/context';

process.env.SESSION_SECRET = 'a'.repeat(40);

const base: RunInput = {
  initiative: { product: 'Checkout', problem: 'Abandono no pagamento', need: 'Reduzir abandono' },
  project: { name: 'Banco X', segment: 'Finanças', strategy: '', indicators: ['Conversão'], competitors: ['Banco Y'] },
  cards: [{ kind: 'OBJETIVO', title: 'Objetivo e expectativa', text: 'Subir a conversão', links: [] }],
  doubts: [],
  attachments: [],
};
const withScreens: RunInput = { ...base, attachments: [{ id: 'a1', kind: 'FLUXO', name: 'fluxo.png', mime: 'image/png', size: 10, material: 'tela' }] };

const skills = { integrada: { skillId: 's_i' }, heuristica: { skillId: 's_h' }, metricas: { skillId: 's_m' }, estrategia: { skillId: 's_e' } };
const deps = (over: Partial<Deps> = {}): Deps => ({ key: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx', model: 'claude-sonnet-5-5', skills, loadFile: async () => ({ name: 'fluxo.png', mime: 'image/png', bytes: new Uint8Array([1, 2, 3]) }), deadline: Date.now() + 60_000, ...over });

const heur = { score: 62, resumo: 'ok', achados: [{ tela: 'Tela 1', titulo: 'CTA escondido', severidade: 'ALTO', principio: 'Visibilidade', descricao: 'd', recomendacao: 'r' }] };
const metr = { coreAction: 'Concluir o pagamento', confirmada: false, pontos: [{ tela: 'Tela 1', camada: 'PRODUTO', evento: 'pagar_clicado', porque: 'p' }], lacunas: [] };
const estr = { score: 70, problema: { veredito: 'PARCIAL', justificativa: 'j' }, gaps: [], cenarios: [], horizontes: { h1: '', h2: '', h3: '' }, dicas: { quick: [], estruturantes: [] }, provocacoes: [] };
const cons = { resumo: 'Resumo', scoreUsabilidade: 62, scoreEstrategico: 70, coreAction: 'Pagar', maiorRisco: 'r', recomendacao: 'x', prioridades: [], proximosPassos: [], momento: 2, motivoMomento: 'faltam dados', ferramentas: ['pesquisa', 'jornada', 'inventada'] };

/** Simula a Anthropic: cada chamada à Messages devolve o JSON da fila; a Files API devolve um id. */
function mockAnthropic(texts: Array<string | object>) {
  const calls: Array<{ url: string; body: any }> = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    if (String(url).endsWith('/v1/files')) return new Response(JSON.stringify({ id: 'file_1' }), { status: 200 });
    const body = JSON.parse(String(init.body));
    calls.push({ url: String(url), body });
    const t = texts.shift() ?? '{}';
    const text = typeof t === 'string' ? t : '```json\n' + JSON.stringify(t) + '\n```';
    return new Response(JSON.stringify({ id: 'm', stop_reason: 'end_turn', content: [{ type: 'text', text }], usage: { input_tokens: 10, output_tokens: 5 } }), { status: 200 });
  }));
  return calls;
}
afterEach(() => vi.unstubAllGlobals());

async function runAll(input: RunInput, texts: Array<string | object>) {
  const calls = mockAnthropic(texts);
  let state: RunState = initialState();
  let out;
  for (let i = 0; i < 10; i++) { out = await advance(state, input, deps()); state = out.state; if (out.finished || out.failed) break; }
  return { state, out: out!, calls };
}

describe('material', () => {
  it('classifica pelo tipo de arquivo', () => {
    expect(materialOf('image/png')).toBe('tela');
    expect(materialOf('application/pdf')).toBe('apresentacao');
    expect(materialOf('application/vnd.openxmlformats-officedocument.presentationml.presentation')).toBe('apresentacao');
    expect(materialOf('text/csv')).toBe('planilha');
    expect(materialOf('video/mp4')).toBe('video');
  });
  it('só envia ao container o que dá para analisar', () => {
    const i: RunInput = { ...base, attachments: [{ id: '1', kind: 'FLUXO', name: 'a', mime: 'image/png', size: 1, material: 'tela' }, { id: '2', kind: 'FLUXO', name: 'v', mime: 'video/mp4', size: 1, material: 'video' }] };
    expect(sendable(i).map((a) => a.id)).toEqual(['1']);
    expect(hasScreens(i)).toBe(true);
    expect(hasScreens(base)).toBe(false);
  });
});

describe('roteamento', () => {
  it('sem telas roda só a estratégia, mesmo que o agente peça mais', () => {
    expect(planFronts(routerSchema.parse({ frentes: ['heuristica', 'metricas', 'estrategia'] }), base)).toEqual(['estrategia']);
  });
  it('com telas respeita o pedido, sempre com estratégia por último', () => {
    expect(planFronts(routerSchema.parse({ frentes: ['metricas'] }), withScreens)).toEqual(['metricas', 'estrategia']);
    expect(planFronts(routerSchema.parse({ frentes: ['estrategia', 'heuristica'] }), withScreens)).toEqual(['heuristica', 'estrategia']);
  });
});

describe('JSON do agente', () => {
  it('extrai o último bloco json e tolera texto em volta', () => {
    expect(extractJson('texto\n```json\n{"a":1}\n```\nfim')).toEqual({ a: 1 });
    expect(extractJson('```json\n{"a":1}\n```\n```json\n{"a":2}\n```')).toEqual({ a: 2 });
    expect(extractJson('oi {"b":3} tchau')).toEqual({ b: 3 });
    expect(() => extractJson('nada aqui')).toThrow();
  });
  it('ferramentas desconhecidas saem e o momento precisa estar entre 1 e 5', () => {
    expect(consolidadoSchema.parse(cons).ferramentas).toEqual(['pesquisa', 'jornada']);
    expect(consolidadoSchema.safeParse({ ...cons, momento: 9 }).success).toBe(false);
  });
});

describe('máquina de estados', () => {
  it('sem telas: roteia, roda só a estratégia e consolida (3 chamadas, nenhum arquivo)', async () => {
    const { state, out, calls } = await runAll(base, [{ frentes: ['heuristica', 'estrategia'], coreAction: 'Pagar', suposicoes: [], tipoMaterial: 'texto', justificativa: '' }, estr, cons]);
    expect(out.finished).toBe(true);
    expect(state.steps.map((s) => s.id)).toEqual(['rotear', 'estrategia', 'consolidar']);
    expect(calls).toHaveLength(3);
    expect(calls[0].body.container.skills[0].skill_id).toBe('s_i');
    expect(calls[1].body.container.skills[0].skill_id).toBe('s_e');
    expect(state.results.consolidar?.momento).toBe(2);
    expect(state.results.consolidar?.ferramentas.length).toBeGreaterThanOrEqual(4); // completa com as do momento
  });
  it('com telas: três frentes, arquivo enviado uma vez e anexado nas frentes; estratégia recebe os achados', async () => {
    const { state, calls, out } = await runAll(withScreens, [{ frentes: ['heuristica', 'metricas', 'estrategia'], coreAction: 'Pagar', suposicoes: [], tipoMaterial: 'telas', justificativa: '' }, heur, metr, estr, cons]);
    expect(out.finished).toBe(true);
    expect(state.steps.map((s) => s.id)).toEqual(['rotear', 'heuristica', 'metricas', 'estrategia', 'consolidar']);
    expect(state.files).toEqual({ a1: 'file_1' });
    const heurCall = calls.find((c) => c.body.container.skills[0].skill_id === 's_h')!;
    expect(JSON.stringify(heurCall.body.messages[0].content)).toContain('container_upload');
    const estrCall = calls.find((c) => c.body.container.skills[0].skill_id === 's_e')!;
    expect(JSON.stringify(estrCall.body.messages[0].content)).toContain('CTA escondido');
    expect(progress(state)).toEqual({ done: 5, total: 5 });
  });
  it('resposta fora do formato: tenta de novo uma vez e depois falha o passo, que pode ser refeito', async () => {
    mockAnthropic(['sem json', 'continua sem json']);
    let state = initialState();
    // o roteamento cai na regra padrão (não falha a análise)
    const r0 = await advance(state, base, deps());
    expect(r0.failed).toBe(false);
    expect(r0.state.results.rotear?.frentes).toEqual(['estrategia']);
    mockAnthropic(['ruim', 'pior']);
    const r1 = await advance(r0.state, base, deps());
    expect(r1.failed).toBe(true);
    expect(r1.state.steps.find((s) => s.id === 'estrategia')?.status).toBe('FAILED');
    mockAnthropic([estr]);
    const r2 = await advance(r1.state, base, deps()); // refaz o passo que falhou
    expect(r2.failed).toBe(false);
    expect(r2.state.results.estrategia?.score).toBe(70);
  });
  it('erro da API (chave recusada) falha o passo com a mensagem', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: { message: 'x' } }), { status: 401 })));
    const r = await advance(initialState(), base, deps());
    expect(r.failed).toBe(true);
    expect(r.state.steps[0].error).toMatch(/recusada/);
  });
  it('continua a conversa quando a Anthropic pausa o turno (pause_turn)', async () => {
    const calls: any[] = [];
    const seq = [
      { stop_reason: 'pause_turn', content: [{ type: 'text', text: 'trabalhando…' }], container: { id: 'cont_1' }, usage: { input_tokens: 5, output_tokens: 1 } },
      { stop_reason: 'end_turn', content: [{ type: 'text', text: '```json\n' + JSON.stringify({ frentes: ['estrategia'], coreAction: '', suposicoes: [], tipoMaterial: '', justificativa: '' }) + '\n```' }], usage: { input_tokens: 5, output_tokens: 2 } },
    ];
    vi.stubGlobal('fetch', vi.fn(async (_u: string, init: RequestInit) => { calls.push(JSON.parse(String(init.body))); return new Response(JSON.stringify({ id: 'm', ...seq.shift() }), { status: 200 }); }));
    const r = await advance(initialState(), base, deps());
    expect(r.failed).toBe(false);
    expect(calls).toHaveLength(2);
    expect(calls[1].container.id).toBe('cont_1');
    expect(calls[1].messages).toHaveLength(2);
    expect(r.state.steps[0].tokensIn).toBe(10);
  });
});
