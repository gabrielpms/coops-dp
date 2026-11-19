'use client';
import { useState } from 'react';
import { AppHeader, DEFAULT_AVATAR } from '@/components/ds/AppHeader';
import { AdminBanner, AdminCard } from '@/components/admin/AdminBanner';
import { IconDeck, IconPlug } from '@/components/admin/Icons';
import { ApiKeyDeck } from '@/components/admin/ApiKeyDeck';
import { Spinner } from '@/components/ds/ScreenLoader';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import type { AvatarConfig } from '@/components/avatar/Avatar';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';
import { MODELS, type SkillStatus } from '@/lib/agent/catalog';
import type { IntegrationState } from '@/lib/agent/settings';

const STATUS_BG: Record<SkillStatus, string> = { ENVIADA: '#8FE3C8', PENDENTE: '#F5F2EC', DESATUALIZADA: '#F3D36B' };
const STATUS_TXT: Record<SkillStatus, string> = { ENVIADA: 'ENVIADA', PENDENTE: 'PENDENTE', DESATUALIZADA: 'DESATUALIZADA' };

export function IntegracoesClient({ user, state, }: { user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; state: IntegrationState }) {
  const { refresh } = useCoopsRouter();
  const [deck, setDeck] = useState(false);
  const [busy, setBusy] = useState<null | 'skills' | 'test'>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const meAvatar = { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? DEFAULT_AVATAR) };
  const allSent = state.skills.every((s) => s.status === 'ENVIADA');
  const modelName = MODELS.find((m) => m.id === state.model)?.name ?? state.model;

  const call = async (kind: 'skills' | 'test', body?: object) => {
    if (!state.configured) { setMsg({ ok: false, text: 'Cadastre a chave da Anthropic primeiro.' }); return; }
    setBusy(kind); setMsg(null);
    try {
      const r = await fetch(`/api/me/integrations/anthropic/${kind === 'skills' ? 'skills' : 'test'}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg({ ok: false, text: d.error ?? 'Não deu certo. Tente de novo.' }); return; }
      setMsg({ ok: true, text: kind === 'skills' ? 'Skills enviadas para o workspace da Anthropic.' : `Conexão ok: a Anthropic respondeu com as 4 skills carregadas${d.reply ? ` ("${d.reply}")` : ''}.` });
      if (kind === 'skills') refresh();
    } catch { setMsg({ ok: false, text: 'Sem conexão. Tente de novo.' }); } finally { setBusy(null); }
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
          {state.skills.map((s, i) => (
            <AdminCard key={s.key} bg={STATUS_BG[s.status]} icon={<IconDeck bg={STATUS_BG[s.status]} />} big={String(i + 1).padStart(2, '0')} bigLabel={STATUS_TXT[s.status]} kicker="SKILL DO MOTOR" title={s.title}
              foot={s.status === 'ENVIADA' ? s.sub : s.status === 'DESATUALIZADA' ? `${s.sub} · toque para atualizar` : `${s.sub} · toque para enviar`} aria={`Enviar a skill ${s.title}`} onClick={() => busy === null && call('skills', { keys: [s.key] })} />
          ))}
          <button type="button" onClick={() => busy === null && call('test')} className="tw-add" style={{ fontFamily: 'inherit', height: 340, boxSizing: 'border-box', borderRadius: 22, background: 'transparent', border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', padding: 20 }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #4A4858', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{busy === 'test' ? <Spinner /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l4.5 4.5L19 7" /></svg>}</span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{busy === 'test' ? 'Testando…' : 'Testar conexão'}</span>
            <span style={{ fontSize: 13, color: '#A3A1AD', textAlign: 'center' }}>Faz uma chamada de ponta a ponta com a chave, o modelo e as 4 skills</span>
          </button>
        </div>
      </div>
      {deck && <ApiKeyDeck configured={state.configured} last4={state.last4} model={state.model} onClose={() => setDeck(false)} onSaved={() => { setDeck(false); setMsg({ ok: true, text: 'Integração salva. Envie as skills para o motor funcionar.' }); refresh(); }} />}
    </div>
  );
}
