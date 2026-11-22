'use client';
import { useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { FocusCard, FocusClose } from '@/components/ds/FocusCard';
import { BannerStar } from '@/components/person/BannerIcons';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { CoopsLink } from '@/components/nav/useCoopsRouter';
import { mono } from '@/components/ds/tokens';
import { firstName } from '@/lib/format';
import type { AvatarConfig } from '@/components/avatar/Avatar';

type SK = { id: string; name: string; categoryId: string | null; self: number; manager: number; gym: number };
const RUBRIC = ['Ainda não pratica', 'Pratica com apoio', 'Pratica sozinho(a)', 'Referência no squad', 'Referência na empresa e ensina'];
const fmt = (n: number) => n.toFixed(1).replace('.', ',');
const YEL = '#F3D36B';

export function SkillsClient({ user, person, projectId, cycle, isOwn, canGrade, categories, skills: initial }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; person: { id: string; name: string; avatar: AvatarConfig | null }; projectId: string; cycle: string; isOwn: boolean; canGrade: boolean;
  categories: { id: string; name: string }[]; skills: SK[];
}) {
  const [skills, setSkills] = useState(initial);
  const [cat, setCat] = useState<string>('todas');
  const [warn, setWarn] = useState<{ msg: string; retry: () => void } | null>(null);
  const [open, setOpen] = useState<{ id: string; rect: DOMRect | null } | null>(null);
  const fn = firstName(person.name);
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '';

  // Atualização otimista (PRD 6.2): a nota muda na hora; se o servidor falhar, volta e oferece "Tentar de novo".
  const grade = async (s: SK, kind: 'self' | 'manager', n: number) => {
    const prev = skills;
    setSkills((all) => all.map((x) => (x.id === s.id ? { ...x, [kind]: n } : x))); setWarn(null);
    try {
      const r = await fetch(`/api/people/${person.id}/ratings`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ skillId: s.id, [kind === 'self' ? 'selfScore' : 'managerScore']: n === 0 ? null : n }) });
      if (!r.ok) throw new Error();
    } catch { setSkills(prev); setWarn({ msg: 'Não deu para salvar a nota.', retry: () => grade(s, kind, n) }); }
  };
  // Skills já avaliadas vêm primeiro (pelo que está salvo ao abrir a tela, para a carta não pular enquanto a pessoa dá a nota); a ordem original se mantém dentro de cada grupo.
  const [wasRated] = useState(() => new Set(initial.filter((x) => x.self > 0 || x.manager > 0).map((x) => x.id)));
  const shown = skills.filter((s) => cat === 'todas' || (cat === 'sem' ? !s.categoryId : s.categoryId === cat)).map((s, i) => ({ s, i })).sort((a, b) => Number(wasRated.has(b.s.id)) - Number(wasRated.has(a.s.id)) || a.i - b.i).map((x) => x.s);
  const rated = skills.filter((s) => s.self > 0), mrated = skills.filter((s) => s.manager > 0);
  const avg = rated.length ? rated.reduce((t, s) => t + s.self, 0) / rated.length : 0;
  const mavg = mrated.length ? mrated.reduce((t, s) => t + s.manager, 0) / mrated.length : 0;
  const gaps = skills.filter((s) => s.self > 0 && s.manager > 0 && s.self !== s.manager).length;
  const missing = skills.length - rated.length;
  const tabs: [string, string, number][] = [['todas', 'Todas', skills.length], ...categories.map((c) => [c.id, c.name, skills.filter((s) => s.categoryId === c.id).length] as [string, string, number])];
  if (skills.some((s) => !s.categoryId) && categories.length) tabs.push(['sem', 'Sem categoria', skills.filter((s) => !s.categoryId).length]);
  const cur = open ? skills.find((s) => s.id === open.id) ?? null : null;

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg={YEL} icon={<BannerStar />} avatar={{ ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) }} avatarBg="#D9B84B" avatarCrown avatarHref={`/p/${projectId}/pessoas/${person.id}`}
          back={{ href: `/p/${projectId}/pessoas/${person.id}`, label: `${isOwn ? 'Meu perfil' : person.name}` }}
          title={isOwn ? 'Autoavaliação de skills' : `Skills ${fn.endsWith('a') ? 'da' : 'do'} ${fn}`}
          desc={isOwn ? 'Dê sua nota de 1 a 5 em cada carta. Toque no nome da skill para ver o que cada nível significa e as evidências do ciclo.' : `Nota de 1 a 5 por skill, lado a lado com a nota do manager.${canGrade ? ' Você dá a nota do manager.' : ''}`} />
        {warn && <div role="alert" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', borderRadius: 14, border: '1.5px solid #FF8A5B', padding: '10px 14px', fontSize: 14 }}>{warn.msg}<button type="button" onClick={warn.retry} style={{ fontFamily: 'inherit', fontWeight: 600, color: '#0E0E12', background: '#FF8A5B', border: 0, borderRadius: 10, minHeight: 36, padding: '0 14px', cursor: 'pointer' }}>Tentar de novo</button></div>}
        {skills.length === 0 ? (
          <div style={{ borderRadius: 22, border: '1.5px dashed #4A4858', padding: 28, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
            <b style={{ fontSize: 20 }}>O projeto ainda não tem skills</b>
            <span style={{ color: '#A3A1AD' }}>As skills são definidas por quem administra o projeto.</span>
            {user.role === 'MANAGER' && <CoopsLink href={`/admin/${projectId}`} style={{ fontWeight: 600 }}>Ir para a Administração →</CoopsLink>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
            <div style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div role="tablist" aria-label="Categorias de skill" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tabs.map(([id, text, n]) => { const on = cat === id; return <button key={id} type="button" role="tab" aria-selected={on} onClick={() => setCat(id)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? YEL : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{text} · {n}</button>; })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 18 }}>
                {shown.map((s) => {
                  const v = s.self, on = v > 0, ink = on ? '#0E0E12' : '#F5F2EC', bg = on ? YEL : '#17171D';
                  const diff = on && s.manager > 0 ? v - s.manager : null;
                  const gapBg = diff === null ? '#A3A1AD' : diff === 0 ? '#8FE3C8' : diff > 0 ? '#B7A6FF' : '#FF8A5B';
                  const tag = catName(s.categoryId);
                  return (
                    <article key={s.id} className="coops-card" style={{ minHeight: 380, boxSizing: 'border-box', borderRadius: 24, background: bg, color: '#0E0E12', border: on ? '2px solid #0E0E12' : `2px dashed ${YEL}`, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{tag && <span style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: on ? YEL : '#0E0E12', background: ink, border: `1.5px solid ${ink}`, borderRadius: 999, padding: '4px 8px' }}>{tag.toUpperCase()}</span>}</span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', color: ink }}><span style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{on ? v : '—'}</span><span style={{ ...mono, fontSize: 10 }}>{isOwn ? 'SUA NOTA' : `NOTA DE ${fn.toUpperCase()}`}</span></span>
                      </div>
                      <button type="button" onClick={(e) => setOpen({ id: s.id, rect: (e.currentTarget.closest('.coops-card') ?? e.currentTarget).getBoundingClientRect() })} style={{ fontFamily: 'inherit', textAlign: 'left', background: 'transparent', border: 0, color: ink, padding: 0, display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer', marginTop: 'auto' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>{s.name}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg></span>
                      </button>
                      <div role="group" aria-label={`Nota para ${s.name}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 5 }}>
                        {[1, 2, 3, 4, 5].map((n) => { const f = n <= v; const st = { fontFamily: mono.fontFamily, fontSize: 13, fontWeight: 700, height: isOwn ? 44 : 40, borderRadius: 11, background: f ? (on ? '#0E0E12' : YEL) : 'transparent', color: f ? YEL : ink, border: `2px solid ${on ? '#0E0E12' : '#4A4858'}`, padding: 0 } as const;
                          return isOwn ? <button key={n} type="button" aria-label={`${s.name}: nota ${n}`} aria-pressed={v === n} onClick={() => grade(s, 'self', v === n ? 0 : n)} style={{ ...st, cursor: 'pointer' }}>{n}</button> : <span key={n} role="img" aria-label={`${s.name}: nota ${n}${v === n ? ' (resposta)' : ''}`} style={{ ...st, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>; })}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: `1.5px solid ${ink}`, paddingTop: 10, color: ink }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13 }}>Manager: <strong>{s.manager || '—'}</strong></span>
                          <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: '#0E0E12', background: gapBg, border: '1.5px solid #0E0E12', borderRadius: 6, padding: '3px 6px' }}>{diff === null ? '—' : diff === 0 ? '=' : diff > 0 ? `+${diff}` : String(diff)}</span>
                        </span>
                        {canGrade && <div role="group" aria-label={`Nota do manager para ${s.name}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 5 }}>
                          {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`Manager em ${s.name}: nota ${n}`} aria-pressed={s.manager === n} onClick={() => grade(s, 'manager', s.manager === n ? 0 : n)} style={{ fontFamily: mono.fontFamily, fontSize: 12, fontWeight: 700, height: 36, borderRadius: 9, background: n <= s.manager ? '#0E0E12' : 'transparent', color: n <= s.manager ? YEL : ink, border: `2px solid ${ink}`, padding: 0, cursor: 'pointer' }}>{n}</button>)}
                        </div>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <aside style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderRadius: 26, background: YEL, color: '#0E0E12', border: '2px solid #0E0E12', padding: 22, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '8px 8px 0 #B8962F' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#0E0E12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M32 6l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 23l16-2z" /></svg>
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 52, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{avg ? fmt(avg) : '—'}</span><span style={{ ...mono, fontSize: 11 }}>{isOwn ? 'SUA MÉDIA' : `MÉDIA ${fn.toUpperCase()}`} / 5</span></span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{missing ? `Falta avaliar ${missing} ${missing > 1 ? 'skills' : 'skill'}` : 'Tudo avaliado.'}</span>
                <span style={{ fontSize: 14, borderTop: '1.5px solid #0E0E12', paddingTop: 10 }}>{mavg ? `Média do manager ${fmt(mavg)} · ` : ''}{gaps} {gaps === 1 ? 'diferença' : 'diferenças'} com a nota do manager</span>
              </div>
              <span style={{ fontSize: 14, color: '#A3A1AD', lineHeight: 1.5 }}>Cada nota salva na hora. O manager vê a sua autoavaliação do ciclo {cycle.split('-')[1]} {cycle.split('-')[0]} e as diferenças viram pauta do 1:1.</span>
            </aside>
          </div>
        )}
      </div>
      {cur && open && (
        <FocusCard origin={open.rect} bg={YEL} ariaLabel={cur.name} onClose={() => setOpen(null)}>
          <div className="coops-fx-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ ...mono, fontSize: 12, color: 'rgba(14,14,18,0.68)' }}>DECK DE SKILLS › SKILL</span>
                <h2 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{cur.name}</h2>
                {catName(cur.categoryId) && <span style={{ fontSize: 16 }}>{catName(cur.categoryId)}</span>}
              </div>
              <FocusClose onClick={() => setOpen(null)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ ...mono, fontSize: 11, color: 'rgba(14,14,18,0.68)' }}>O QUE CADA NÍVEL SIGNIFICA</span>
              {RUBRIC.map((t, i) => { const k = i + 1, me = cur.self === k, mg = cur.manager === k, hl = me || mg; const who = me && mg ? (isOwn ? 'VOCÊ + MANAGER' : `${fn.toUpperCase()} + MANAGER`) : me ? (isOwn ? 'VOCÊ' : fn.toUpperCase()) : mg ? 'MANAGER' : '';
                return <div key={k} style={{ display: 'flex', gap: 14, alignItems: 'center', borderRadius: 14, background: hl ? 'rgba(245,242,236,0.7)' : 'transparent', border: `1.5px solid ${hl ? '#0E0E12' : 'rgba(14,14,18,0.3)'}`, padding: '12px 14px' }}>
                  <span style={{ flex: '0 0 36px', height: 36, borderRadius: 10, background: hl ? '#0E0E12' : 'transparent', color: hl ? YEL : '#0E0E12', border: '1.5px solid #0E0E12', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontWeight: 700 }}>{k}</span>
                  <span style={{ flex: 1, fontSize: 15, lineHeight: 1.4 }}>{t}</span><span style={{ ...mono, fontSize: 11 }}>{who}</span></div>; })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ ...mono, fontSize: 11, color: 'rgba(14,14,18,0.68)' }}>EVIDÊNCIAS NO CICLO</span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <CoopsLink href={`/p/${projectId}/pessoas/${person.id}/eventos`} style={{ flex: '1 1 140px', textDecoration: 'none', color: '#0E0E12', borderRadius: 16, background: '#B7A6FF', border: '2px solid #0E0E12', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ ...mono, fontSize: 10 }}>REGISTROS</span><span style={{ fontSize: 14, fontWeight: 600 }}>Ver eventos</span></CoopsLink>
                <CoopsLink href={`/p/${projectId}/pessoas/${person.id}/brain-gym`} style={{ flex: '1 1 140px', textDecoration: 'none', color: '#0E0E12', borderRadius: 16, background: '#F5A9D6', border: '2px solid #0E0E12', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ ...mono, fontSize: 10 }}>BRAIN GYM</span><span style={{ fontSize: 14, fontWeight: 600 }}>{cur.gym ? `${cur.gym} ${cur.gym === 1 ? 'estudo ligado' : 'estudos ligados'}` : 'Nenhum estudo ligado'}</span></CoopsLink>
              </div>
            </div>
          </div>
        </FocusCard>
      )}
    </div>
  );
}
