import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkKey, message, ping, uploadSkill } from '@/lib/agent/anthropic';
import { ENGINE_SKILLS } from '@/lib/agent/catalog';
import { readSkill, skillStatuses } from '@/lib/agent/catalog.server';
import { integrationState } from '@/lib/agent/settings';
import { anthropicSettingsSchema } from '@/lib/validation';
import { sealSecret } from '@/lib/secret';

process.env.SESSION_SECRET = 'a'.repeat(40);
const KEY = 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789';

type Call = { url: string; init: RequestInit };
function mockFetch(responses: Array<{ status?: number; body?: unknown }>) {
  const calls: Call[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const r = responses.shift() ?? { status: 200, body: {} };
    return new Response(JSON.stringify(r.body ?? {}), { status: r.status ?? 200, headers: { 'content-type': 'application/json' } });
  }));
  return calls;
}
afterEach(() => vi.unstubAllGlobals());

describe('chave da Anthropic', () => {
  it('só aceita o formato sk-ant-… e um dos modelos conhecidos', () => {
    expect(anthropicSettingsSchema.safeParse({ apiKey: KEY, model: 'claude-sonnet-5-5' }).success).toBe(true);
    expect(anthropicSettingsSchema.safeParse({ apiKey: 'abc' }).success).toBe(false);
    expect(anthropicSettingsSchema.safeParse({ model: 'gpt-x' }).success).toBe(false);
    expect(anthropicSettingsSchema.safeParse({}).success).toBe(true); // trocar só o modelo
  });
  it('explica os erros da API em português', async () => {
    mockFetch([{ status: 401, body: { error: { message: 'invalid x-api-key' } } }]);
    const r = await checkKey(KEY);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/recusada/);
  });
  it('manda a chave no cabeçalho e nunca na URL', async () => {
    const calls = mockFetch([{ body: { data: [] } }]);
    await checkKey(KEY);
    expect(calls[0].url).not.toContain(KEY);
    expect((calls[0].init.headers as Record<string, string>)['x-api-key']).toBe(KEY);
  });
  it('mostra só os 4 últimos caracteres e nunca a chave', async () => {
    const st = await integrationState({ anthropicKey: sealSecret(KEY), anthropicModel: null, anthropicSkills: null });
    expect(st.configured).toBe(true);
    expect(st.last4).toBe(KEY.slice(-4));
    expect(JSON.stringify(st)).not.toContain(KEY);
    const none = await integrationState({ anthropicKey: null, anthropicModel: null, anthropicSkills: null });
    expect(none.configured).toBe(false);
  });
});

describe('skills do motor', () => {
  it('as 4 skills existem no repositório com o nome da pasta no cabeçalho', async () => {
    expect(ENGINE_SKILLS).toHaveLength(4);
    for (const s of ENGINE_SKILLS) {
      const f = await readSkill(s.dir);
      expect(f.content).toContain(`name: "${s.dir}"`);
      expect(f.hash).toHaveLength(16);
    }
  });
  it('status: pendente, enviada e desatualizada', async () => {
    const st0 = await skillStatuses(null);
    expect(st0.every((s) => s.status === 'PENDENTE')).toBe(true);
    const h = (await readSkill(ENGINE_SKILLS[0].dir)).hash;
    const off = await skillStatuses(null, ['metricas']);
    expect(off.find((s) => s.key === 'metricas')!.enabled).toBe(false);
    expect(off.find((s) => s.key === 'estrategia')!.enabled).toBe(true);
    const st1 = await skillStatuses({ integrada: { skillId: 'skill_1', displayTitle: 'x', hash: h, uploadedAt: '2026-01-01' }, estrategia: { skillId: 'skill_2', displayTitle: 'y', hash: 'velho', uploadedAt: '2026-01-01' } });
    expect(st1.find((s) => s.key === 'integrada')!.status).toBe('ENVIADA');
    expect(st1.find((s) => s.key === 'estrategia')!.status).toBe('DESATUALIZADA');
    expect(st1.find((s) => s.key === 'heuristica')!.status).toBe('PENDENTE');
  });
  it('cria a skill quando não existe no workspace', async () => {
    const calls = mockFetch([{ body: { data: [] } }, { body: { id: 'skill_novo' } }]);
    const r = await uploadSkill(KEY, { displayTitle: 'Coops · Estratégia Jungle', dir: 'estrategia-jungle', content: '---\nname: "estrategia-jungle"\n---' });
    expect(r).toEqual({ ok: true, data: { skillId: 'skill_novo' } });
    expect(calls[1].url).toMatch(/\/v1\/skills$/);
    expect(calls[1].init.method).toBe('POST');
  });
  it('publica nova versão quando a skill já existe', async () => {
    const calls = mockFetch([{ body: { data: [{ id: 'skill_velho', display_title: 'Coops · Estratégia Jungle' }] } }, { body: {} }]);
    const r = await uploadSkill(KEY, { displayTitle: 'Coops · Estratégia Jungle', dir: 'estrategia-jungle', content: 'x' });
    expect(r).toEqual({ ok: true, data: { skillId: 'skill_velho' } });
    expect(calls[1].url).toContain('/v1/skills/skill_velho/versions');
  });
  it('carrega as skills no container com a execução de código ligada', async () => {
    const calls = mockFetch([{ body: { id: 'm', stop_reason: 'end_turn', content: [{ type: 'text', text: 'ok' }] } }]);
    const r = await ping(KEY, 'claude-sonnet-5-5', [{ skillId: 'skill_a' }, { skillId: 'skill_b' }]);
    expect(r).toEqual({ ok: true, data: { text: 'ok' } });
    const body = JSON.parse(String(calls[0].init.body));
    expect(body.container.skills).toEqual([{ type: 'custom', skill_id: 'skill_a', version: 'latest' }, { type: 'custom', skill_id: 'skill_b', version: 'latest' }]);
    expect(body.tools[0].type).toBe('code_execution_20250825');
    expect((calls[0].init.headers as Record<string, string>)['anthropic-beta']).toContain('skills-2025-10-02');
  });
  it('sem skills não liga container nem ferramentas', async () => {
    const calls = mockFetch([{ body: { id: 'm', stop_reason: 'end_turn', content: [] } }]);
    await message(KEY, { prompt: 'oi' });
    const body = JSON.parse(String(calls[0].init.body));
    expect(body.container).toBeUndefined();
    expect(body.tools).toBeUndefined();
  });
});
