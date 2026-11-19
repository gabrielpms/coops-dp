'use client';
import { useState } from 'react';
import { AppHeader, DEFAULT_AVATAR } from '@/components/ds/AppHeader';
import { AdminBanner, AdminCard } from '@/components/admin/AdminBanner';
import { IconDeck, IconPlug } from '@/components/admin/Icons';
import { ApiKeyDeck } from '@/components/admin/ApiKeyDeck';
import { Spinner } from '@/components/ds/ScreenLoader';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { label } from '@/components/ds/tokens';
import type { AvatarConfig } from '@/components/avatar/Avatar';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { MODELS, type SkillStatus } from '@/lib/agent/catalog';
import type { IntegrationState } from '@/lib/agent/settings';

const STATUS_BG: Record<SkillStatus, string> = { ENVIADA: '#8FE3C8', PENDENTE: '#F5F2EC', DESATUALIZADA: '#F3D36B' };
const OFF_BG = '#A3A1AD';
const STATUS_TXT: Record<SkillStatus, string> = { ENVIADA: 'ENVIADA', PENDENTE: 'PENDENTE', DESATUALIZADA: 'DESATUALIZADA' };

/** Chave liga/desliga (role="switch"): trilho com contorno em tinta, bolinha menta quando ligada. Fica sobre o card, fora do botão dele. */
function Toggle({ on, label, busy, onChange }: { on: boolean; label: string; busy: boolean; onChange: (next: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={busy} onClick={() => onChange(!on)} className="coops-tg"
      style={{ position: 'absolute', top: 22, left: 90, zIndex: 2, width: 54, height: 32, boxSizing: 'border-box', borderRadius: 999, border: '2px solid #0E0E12', background: on ? '#0E0E12' : 'transparent', padding: 3, cursor: busy ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background-color .2s ease' }}>
      <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: '50%', background: on ? '#8FE3C8' : '#0E0E12', transition: 'background-color .2s ease' }} />
    </button>
  );
}

export function IntegracoesClient({ user, state, }: { user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; state: IntegrationState }) {
  const { refresh } = useCoopsRouter();
  const [deck, setDeck] = useState(false);
  const [busy, setBusy] = useState<null | 'skills' | 'test'>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const meAvatar = { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? DEFAULT_AVATAR) };
  const allSent = state.skills.filter((s) => s.enabled).every((s) => s.status === 'ENVIADA');
  const modelName = MODELS.find((m) => m.id === state.model)?.name ?? state.model;

  const call = async (kind: 'skills' | 'test', body?: object) => {
    if (!state.configured) { const text = 'Cadastre a chave da Anthropic primeiro.'; if (kind === 'test') setTest({ ok: false, text }); else setMsg({ ok: false, text }); return; }
    setBusy(kind); setMsg(null); if (kind === 'test') setTest(null);
    try {
      const r = await fetch(`/api/me/integrations/anthropic/${kind === 'skills' ? 'skills' : 'test'}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { const text = d.error ?? 'Não deu certo. Tente de novo.'; if (kind === 'test') setTest({ ok: false, text }); else setMsg({ ok: false, text }); return; }
      if (kind === 'test') setTest({ ok: true, text: `A Anthropic respondeu com ${d.skills ?? 'as'} ${d.skills === 1 ? 'skill carregada' : 'skills carregadas'}${d.reply ? ` ("${d.reply}")` : ''}.` });
      else { setMsg({ ok: true, text: 'Skills enviadas para o workspace da Anthropic.' }); refresh(); }
    } catch { const text = 'Sem conexão. Tente de novo.'; if (kind === 'test') setTest({ ok: false, text }); else setMsg({ ok: false, text }); } finally { setBusy(null); }
  };

  const toggle = async (key: string, enabled: boolean) => {
    setToggling(key); setMsg(null); setTest(null);
    try {
      const r = await fetch('/api/me/integrations/anthropic/skills', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key, enabled }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg({ ok: false, text: d.error ?? 'Não deu certo. Tente de novo.' }); return; }
      refresh();
    } catch { setMsg({ ok: false, text: 'Sem conexão. Tente de novo.' }); } finally { setToggling(null); }
  };

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <AdminBanner view="int" title="Integrações" desc="A chave da Anthropic e as 4 skills que são o motor da análise das iniciativas. A chave é cifrada e só você a gerencia." meAvatar={meAvatar} back={{ href: '/admin', label: '← Administração' }}
          cta={state.configured ? { label: busy === 'skills' ? 'Enviando…' : allSent ? 'Atualizar as 4 skills' : 'Enviar as 4 skills', onClick: () => busy === null && call('skills') } : { label: 'Cadastrar a chave', onClick: () => setDeck(true) }} />
        {msg && <div role="status" style={{ borderRadius: 16, padding: '12px 16px', fontSize: 15, fontWeight: 600, background: msg.ok ? '#8FE3C8' : '#FF8A5B', color: '#0E0E12', border: '2px solid #0E0E12' }}>{msg.text}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          <AdminCard bg="#A9D8F5" icon={<IconPlug bg="#A9D8F5" />} big={state.configured ? 'ON' : 'OFF'} bigLabel="CHAVE" kicker="ANTHROPIC" title="Chave da API" foot={state.configured ? `Conectada · •••• ${state.last4} · modelo ${modelName}` : 'Não configurada. Cole a chave para começar'} aria="Cadastrar ou trocar a chave da Anthropic" onClick={() => setDeck(true)} />
          {state.skills.map((s, i) => {
            const bg = s.enabled ? STATUS_BG[s.status] : OFF_BG;
            return (
              <div key={s.key} style={{ position: 'relative', opacity: s.enabled ? 1 : 0.82 }}>
                <AdminCard bg={bg} icon={<IconDeck bg={bg} />} big={String(i + 1).padStart(2, '0')} bigLabel={s.enabled ? STATUS_TXT[s.status] : 'DESLIGADA'} kicker="SKILL DO MOTOR" title={s.title}
                  foot={!s.enabled ? 'Desligada: não entra nas análises' : s.status === 'ENVIADA' ? s.sub : s.status === 'DESATUALIZADA' ? `${s.sub} · toque para atualizar` : `${s.sub} · toque para enviar`} aria={`Enviar a skill ${s.title}`} onClick={() => busy === null && call('skills', { keys: [s.key] })} />
                <Toggle on={s.enabled} busy={toggling === s.key} label={`${s.enabled ? 'Desligar' : 'Ligar'} a skill ${s.title}`} onChange={(next) => toggle(s.key, next)} />
              </div>
            );
          })}
          <button type="button" onClick={() => busy === null && call('test')} className={test ? 'coops-card' : 'tw-add'} aria-live="polite" style={{ fontFamily: 'inherit', height: 340, boxSizing: 'border-box', borderRadius: 22, background: test ? (test.ok ? '#8FE3C8' : '#FF8A5B') : 'transparent', border: test ? '2px solid #0E0E12' : '1.5px dashed #4A4858', color: test ? '#0E0E12' : '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', padding: 20, boxShadow: test ? '0 16px 36px rgba(0,0,0,0.45)' : undefined }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', border: `1.5px solid ${test ? '#0E0E12' : '#4A4858'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {busy === 'test' ? <Spinner /> : test ? (test.ok
                ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l4.5 4.5L19 7" /></svg>
                : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>)
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l4.5 4.5L19 7" /></svg>}
            </span>
            <span style={{ ...label(11, '0.08em') }}>{busy === 'test' ? 'TESTANDO' : test ? (test.ok ? 'CONEXÃO OK' : 'FALHOU') : 'TESTE DE PONTA A PONTA'}</span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{busy === 'test' ? 'Testando…' : test ? (test.ok ? 'Tudo certo' : 'Não conectou') : 'Testar conexão'}</span>
            <span style={{ fontSize: 13, color: test ? '#0E0E12' : '#A3A1AD', textAlign: 'center', maxWidth: 220 }}>{busy === 'test' ? 'Falando com a Anthropic com a chave e as skills ligadas' : test ? `${test.text} Toque para testar de novo.` : 'Faz uma chamada de ponta a ponta com a chave, o modelo e as skills ligadas'}</span>
          </button>
        </div>
      </div>
      {deck && <ApiKeyDeck configured={state.configured} last4={state.last4} model={state.model} onClose={() => setDeck(false)} onSaved={() => { setDeck(false); setMsg({ ok: true, text: 'Integração salva. Envie as skills para o motor funcionar.' }); refresh(); }} />}
    </div>
  );
}
