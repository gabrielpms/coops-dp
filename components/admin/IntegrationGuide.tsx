'use client';
import type { ReactNode } from 'react';
import { label } from '../ds/tokens';

const A = ({ href, children }: { href: string; children: ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#B7A6FF', fontWeight: 600 }}>{children}</a>;

/** Passo a passo de onde achar cada credencial. Aparece na página de Integrações e dentro de cada cadastro. */
export const GUIDES = {
  anthropic: {
    title: 'Como conseguir a chave da Anthropic',
    why: 'É o que deixa o agente ler a mesa da iniciativa e gerar o parecer. A conta da Anthropic precisa ter crédito.',
    steps: [
      <>Entre em <A href="https://console.anthropic.com">console.anthropic.com</A> com a conta da empresa.</>,
      <>No menu, abra <b>Settings › API keys</b> e clique em <b>Create key</b>. Escolha o workspace onde as skills do Coops vão morar (o padrão serve).</>,
      <>Copie a chave agora: ela começa com <code>sk-ant-</code> e a Anthropic só mostra uma vez.</>,
      <>Volte aqui, clique em <b>Cadastrar a chave</b> e cole. Depois use <b>Enviar as 4 skills</b> e <b>Testar conexão</b>.</>,
    ],
  },
  figma: {
    title: 'Como conseguir o token do Figma',
    why: 'É o que permite colar um link do Figma na iniciativa e importar as telas para a análise. É opcional: sem ele, dá para subir PNG ou PDF.',
    steps: [
      <>No Figma, clique no seu avatar (canto superior esquerdo) e abra <b>Settings</b>.</>,
      <>Na aba <b>Security</b>, vá em <b>Personal access tokens</b> e clique em <b>Generate new token</b>.</>,
      <>Dê o nome <b>Coops</b>, escolha a validade e marque só a leitura: <b>File content › Read-only</b>.</>,
      <>Copie o token (começa com <code>figd_</code>; o Figma só mostra uma vez) e cole em <b>Token do Figma</b> aqui. Ele lê os arquivos que a sua conta do Figma consegue abrir.</>,
    ],
  },
} as const;

export function GuideSteps({ guide }: { guide: keyof typeof GUIDES }) {
  const g = GUIDES[guide];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 14, lineHeight: 1.5, color: '#C9C7D1' }}>{g.why}</span>
      <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, lineHeight: 1.5 }}>
        {g.steps.map((t, i) => <li key={i}>{t}</li>)}
      </ol>
    </div>
  );
}

/** Bloco recolhível na página de Integrações; abre sozinho enquanto a integração não está configurada. */
export function IntegrationGuides({ anthropicOk, figmaOk }: { anthropicOk: boolean; figmaOk: boolean }) {
  const item = (guide: keyof typeof GUIDES, ok: boolean) => (
    <details open={!ok} style={{ borderRadius: 18, border: '1.5px solid #2C2C36', background: '#17171D', padding: '14px 18px' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 15, minHeight: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
        {GUIDES[guide].title}<span style={{ ...label(10, '0.08em'), color: ok ? '#8FE3C8' : '#F3D36B' }}>{ok ? 'CONFIGURADO' : 'PENDENTE'}</span>
      </summary>
      <div style={{ marginTop: 12 }}><GuideSteps guide={guide} /></div>
    </details>
  );
  return (
    <section aria-label="Como configurar as integrações" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ ...label(12, '0.1em'), color: '#A3A1AD' }}>COMO CONFIGURAR</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12, alignItems: 'start' }}>
        {item('anthropic', anthropicOk)}{item('figma', figmaOk)}
      </div>
    </section>
  );
}
