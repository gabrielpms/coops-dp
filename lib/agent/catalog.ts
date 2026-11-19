/** As 4 skills que são o motor das iniciativas. `dir` é a pasta em `skills/` (o nome precisa bater com o `name` do SKILL.md). */
export const ENGINE_SKILLS = [
  { key: 'integrada', dir: 'analise-integrada-de-material', title: 'Orquestrador', sub: 'Escolhe as frentes pelo tipo de material e consolida o parecer', display: 'Coops · Análise integrada de material' },
  { key: 'heuristica', dir: 'screen-ia-usability-review', title: 'Heurística', sub: 'Arquitetura da informação e usabilidade, com score 0–100', display: 'Coops · Heurística de telas' },
  { key: 'metricas', dir: 'screen-metrics-tagging', title: 'Métricas', sub: 'Core action e pontos de tagueamento por camada', display: 'Coops · Métricas e tagueamento' },
  { key: 'estrategia', dir: 'estrategia-jungle', title: 'Estratégia', sub: 'Seis lentes estratégicas e score de maturidade', display: 'Coops · Estratégia Jungle' },
] as const;
export type EngineSkillKey = (typeof ENGINE_SKILLS)[number]['key'];
export const isSkillKey = (k: string): k is EngineSkillKey => ENGINE_SKILLS.some((s) => s.key === k);

export const MODELS = [
  { id: 'claude-sonnet-5-5', name: 'Sonnet 5.5', hint: 'Equilíbrio entre qualidade, velocidade e custo (padrão)' },
  { id: 'claude-opus-5-5', name: 'Opus 5.5', hint: 'Mais profundo, mais lento e mais caro' },
  { id: 'claude-fable-5-2', name: 'Fable 5.2', hint: 'O modelo mais capaz' },
] as const;
export const DEFAULT_MODEL: string = MODELS[0].id;
export const isModel = (m: string) => MODELS.some((x) => x.id === m);

export type StoredSkill = { skillId: string; displayTitle: string; hash: string; uploadedAt: string };
export type StoredSkills = Partial<Record<EngineSkillKey, StoredSkill>>;
/** As frentes de análise (o orquestrador não é uma frente). */
export const FRONT_KEYS = ['heuristica', 'metricas', 'estrategia'] as const;
export type SkillStatus = 'ENVIADA' | 'PENDENTE' | 'DESATUALIZADA';
