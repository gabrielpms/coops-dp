import type { ReactNode } from 'react';
import { Help, SummaryRow, Title } from '../wizard/parts';

const A = ({ href, children }: { href: string; children: ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>{children}</a>;

/** Passo a passo de onde achar cada credencial. Vive dentro do deck de cadastro de cada integração, como a primeira carta. */
export const GUIDES = {
  anthropic: {
    title: 'Onde achar a chave da Anthropic',
    why: 'É o que deixa o agente ler a mesa da iniciativa e gerar o parecer. A conta da Anthropic precisa ter crédito.',
    steps: [
      <>Entre em <A href="https://console.anthropic.com">console.anthropic.com</A> com a conta da empresa.</>,
      <>Abra <b>Settings › API keys</b> e clique em <b>Create key</b>. Escolha o workspace onde as skills do Coops vão morar (o padrão serve).</>,
      <>Copie a chave agora: ela começa com <code>sk-ant-</code> e a Anthropic só mostra uma vez.</>,
    ],
  },
  figma: {
    title: 'Onde achar o token do Figma',
    why: 'É o que permite colar um link do Figma na iniciativa e importar as telas para a análise. É opcional: sem ele, dá para subir PNG ou PDF.',
    steps: [
      <>No Figma, clique no seu avatar (canto superior esquerdo) e abra <b>Settings</b>.</>,
      <>Na aba <b>Security</b>, vá em <b>Personal access tokens</b> e clique em <b>Generate new token</b>.</>,
      <>Dê o nome <b>Coops</b>, escolha a validade e marque só a leitura: <b>File content › Read-only</b>. Copie o token (começa com <code>figd_</code>; o Figma só mostra uma vez).</>,
    ],
  },
} as const;

/** Conteúdo da carta-guia do deck: título, para que serve e um passo por linha, no mesmo padrão das cartas de resumo. */
export function GuideCard({ guide }: { guide: keyof typeof GUIDES }) {
  const g = GUIDES[guide];
  return (
    <>
      <Title>{g.title}</Title>
      <Help>{g.why}</Help>
      {g.steps.map((t, i) => <SummaryRow key={i} k={`PASSO ${i + 1}`} v={t} />)}
    </>
  );
}
