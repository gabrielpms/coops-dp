'use client';
import { CoopsLink } from './useCoopsRouter';

/**
 * Botão "Voltar" único da plataforma. Sempre fica FORA do banner/carta, acima dele e alinhado à esquerda,
 * com seta + texto "Voltar para …" e área de toque de 44 px, para ser achado no mesmo lugar em qualquer tela.
 * `label` é só o destino (sem seta): "Time", "Meu perfil", "Hub de projetos".
 */
export function BackLink({ href, label }: { href: string; label: string }) {
  const dest = label.replace(/^←\s*/, '');
  return (
    <CoopsLink href={href} className="coops-back" aria-label={`Voltar para ${dest}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
      <span>Voltar para <b>{dest}</b></span>
    </CoopsLink>
  );
}
