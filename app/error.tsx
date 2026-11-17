'use client';
import { useEffect } from 'react';

const STALE = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i;

/** Rede de segurança: em vez da tela preta "Application error", mostra o que houve e deixa tentar de novo.
 *  Se o erro for de arquivos antigos (acontece logo depois de um deploy novo), recarrega uma vez sozinho. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[coops] erro na tela:', error);
    if (STALE.test(`${error.name} ${error.message}`)) {
      try { if (sessionStorage.getItem('coops-reloaded') !== '1') { sessionStorage.setItem('coops-reloaded', '1'); location.reload(); } } catch { /* sem sessionStorage: segue com o botão */ }
    }
  }, [error]);
  return (
    <main style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.1em', color: '#FF8A5B' }}>ALGO DEU ERRADO NESTA TELA</span>
      <h1 style={{ margin: 0, fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>Não deu para abrir esta tela</h1>
      <p style={{ margin: 0, maxWidth: 520, color: '#A3A1AD', fontSize: 16, lineHeight: 1.5 }}>Tente de novo. Se continuar, mande este código para quem cuida do Coops.</p>
      <code style={{ maxWidth: 'min(640px, 100%)', overflowWrap: 'anywhere', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#F5F2EC', background: '#17171D', border: '1px solid #2C2C36', borderRadius: 12, padding: '10px 14px' }}>{error.message || 'erro sem mensagem'}{error.digest ? ` · ${error.digest}` : ''}</code>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button type="button" onClick={() => reset()} style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 15, color: '#0E0E12', background: '#B7A6FF', border: 0, borderRadius: 14, minHeight: 48, padding: '0 22px', cursor: 'pointer' }}>Tentar de novo</button>
        <a href="/hub" style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 600, fontSize: 15, color: '#F5F2EC', border: '1.5px solid #4A4858', borderRadius: 14, minHeight: 48, padding: '0 22px', textDecoration: 'none' }}>Ir para o hub</a>
      </div>
    </main>
  );
}
