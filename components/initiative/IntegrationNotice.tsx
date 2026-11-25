'use client';
import { CoopsLink } from '@/components/nav/useCoopsRouter';
import { label } from '@/components/ds/tokens';
import type { Readiness } from '@/lib/agent/readiness';

/** Aviso nas telas de iniciativas: o que não vai funcionar sem as integrações e onde ativar (Administração › Integrações). */
export function IntegrationNotice({ readiness: r, compact = false }: { readiness: Readiness; compact?: boolean }) {
  if (r.agent.ok && r.figma.ok) return null;
  const where = r.isOwner
    ? <>Para ativar: <CoopsLink href="/admin/integracoes" style={{ fontWeight: 700, color: '#F3D36B' }}>Administração › Integrações</CoopsLink>. Lá tem o passo a passo.</>
    : <>Quem ativa é {r.ownerName}, dono do projeto, em Administração › Integrações. Peça para essa pessoa conectar.</>;
  const box = { borderRadius: 18, border: '1.5px solid #F3D36B', background: 'rgba(243,211,107,0.08)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, lineHeight: 1.5 } as const;
  return (
    <section role="status" aria-label="Integrações pendentes" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {!r.agent.ok && (
        <div style={box}>
          <span style={{ ...label(11, '0.08em'), color: '#F3D36B' }}>AGENTE DESLIGADO</span>
          <b style={{ fontSize: 16 }}>A análise do agente não vai funcionar por enquanto.</b>
          <span style={{ color: '#C9C7D1' }}>{r.agent.reason} {compact ? '' : 'Sem a conexão com a Anthropic, o agente não lê a mesa nem gera o parecer.'}</span>
          <span>{where}</span>
        </div>
      )}
      {!r.figma.ok && (
        <div style={box}>
          <span style={{ ...label(11, '0.08em'), color: '#F3D36B' }}>FIGMA NÃO CONECTADO</span>
          <b style={{ fontSize: 16 }}>Não dá para importar telas por link do Figma.</b>
          <span style={{ color: '#C9C7D1' }}>Você ainda pode subir as telas em PNG ou PDF na mesa. Um link do Figma sozinho não é lido pelo agente.</span>
          <span>{where}</span>
        </div>
      )}
    </section>
  );
}
