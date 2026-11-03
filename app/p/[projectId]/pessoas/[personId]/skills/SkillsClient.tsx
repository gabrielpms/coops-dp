'use client';
import { useState } from 'react';
import { AppHeader } from '@/components/ds/AppHeader';
import { OpenDeckBanner } from '@/components/ds/OpenDeckBanner';
import { DiStar } from '@/components/person/DeckIcons';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { CoopsLink } from '@/components/nav/useCoopsRouter';
import { label } from '@/components/ds/tokens';
import { cycleLabel, firstName, plural } from '@/lib/format';
import type { AvatarConfig } from '@/components/avatar/Avatar';

type SK = { id: string; name: string; categoryId: string | null; self: number; manager: number };

function Pips({ value, onPick, editable, name, who }: { value: number; onPick: (n: number) => void; editable: boolean; name: string; who: string }) {
  return (
    <div role={editable ? 'radiogroup' : 'img'} aria-label={editable ? `${who} em ${name}` : `${who}: ${value || 'sem nota'} de 5`} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= value;
        const style = { height: 44, borderRadius: 8, border: '2px solid #0E0E12', background: on ? '#0E0E12' : 'transparent', padding: 0, cursor: editable ? 'pointer' : 'default' } as const;
        return editable ? <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`Nota ${n} de 5`} onClick={() => onPick(value === n ? 0 : n)} style={style} /> : <span key={n} style={{ ...style, height: 30 }} />;
      })}
    </div>
  );
}

export function SkillsClient({ user, person, projectId, cycle, isOwn, canGrade, categories, skills: initial }: {
  user: { name: string; email: string; role: 'IC' | 'MANAGER'; avatar: AvatarConfig | null }; person: { id: string; name: string; avatar: AvatarConfig | null }; projectId: string; cycle: string; isOwn: boolean; canGrade: boolean;
  categories: { id: string; name: string }[]; skills: SK[];
}) {
  const [skills, setSkills] = useState(initial);
  const [cat, setCat] = useState<string>('todas');
  const [warn, setWarn] = useState<{ msg: string; retry: () => void } | null>(null);
  const fn = firstName(person.name);

  // Atualização otimista (PRD 6.2): a nota muda na hora; se o servidor falhar, volta e oferece "Tentar de novo".
  const grade = async (s: SK, kind: 'self' | 'manager', n: number) => {
    const prev = skills;
    setSkills((all) => all.map((x) => (x.id === s.id ? { ...x, [kind]: n } : x))); setWarn(null);
    try {
      const r = await fetch(`/api/people/${person.id}/ratings`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ skillId: s.id, [kind === 'self' ? 'selfScore' : 'managerScore']: n === 0 ? null : n }) });
      if (!r.ok) throw new Error();
    } catch { setSkills(prev); setWarn({ msg: 'Não deu para salvar a nota.', retry: () => grade(s, kind, n) }); }
  };
  const shown = skills.filter((s) => cat === 'todas' || (cat === 'sem' ? !s.categoryId : s.categoryId === cat));
  const rated = skills.filter((s) => s.self > 0), mrated = skills.filter((s) => s.manager > 0);
  const avg = (a: SK[], k: 'self' | 'manager') => (a.length ? (a.reduce((t, s) => t + s[k], 0) / a.length).toFixed(1).replace('.', ',') : '—');
  const gaps = skills.filter((s) => s.self > 0 && s.manager > 0 && s.self !== s.manager).length;
  const tabs: [string, string, number][] = [['todas', 'Todas', skills.length], ...categories.map((c) => [c.id, c.name, skills.filter((s) => s.categoryId === c.id).length] as [string, string, number])];
  if (skills.some((s) => !s.categoryId) && categories.length) tabs.push(['sem', 'Sem categoria', skills.filter((s) => !s.categoryId).length]);

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <OpenDeckBanner bg="#F3D36B" icon={<DiStar />} avatar={{ ...DEFAULT_AVATAR_CFG, ...(person.avatar ?? {}) }} back={{ href: `/p/${projectId}/pessoas/${person.id}`, label: `← ${isOwn ? 'Meu perfil' : person.name}` }}
          title={isOwn ? 'Autoavaliação de skills' : `Skills ${fn.endsWith('a') ? 'da' : 'do'} ${fn}`} desc={`Nota de 1 a 5 por skill, lado a lado com a nota do manager. Ciclo ${cycleLabel(cycle)}.${canGrade ? ' Você dá a nota do manager.' : ''}`} />
        {warn && <div role="alert" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', borderRadius: 14, border: '1.5px solid #FF8A5B', padding: '10px 14px', fontSize: 14 }}>{warn.msg}<button type="button" onClick={warn.retry} style={{ fontFamily: 'inherit', fontWeight: 600, color: '#0E0E12', background: '#FF8A5B', border: 0, borderRadius: 10, minHeight: 44, padding: '0 14px', cursor: 'pointer' }}>Tentar de novo</button></div>}
        {skills.length === 0 ? (
          <div style={{ borderRadius: 22, border: '1.5px dashed #4A4858', padding: 28, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
            <b style={{ fontSize: 20 }}>O projeto ainda não tem skills</b>
            <span style={{ color: '#A3A1AD' }}>As skills são definidas por quem administra o projeto.</span>
            {user.role === 'MANAGER' && <CoopsLink href={`/admin/${projectId}`} style={{ fontWeight: 600 }}>Ir para a Administração →</CoopsLink>}
          </div>
        ) : <>
          <div role="tablist" aria-label="Categorias de skill" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tabs.map(([id, text, n]) => { const on = cat === id; return <button key={id} type="button" role="tab" aria-selected={on} onClick={() => setCat(id)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{text} · {n}</button>; })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {shown.map((s) => {
              const diff = s.self > 0 && s.manager > 0 ? s.manager - s.self : null;
              return (
                <article key={s.id} style={{ minHeight: 340, boxSizing: 'border-box', borderRadius: 22, background: '#F3D36B', color: '#0E0E12', border: '2px solid #0E0E12', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 16px 36px rgba(0,0,0,0.45)' }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><DiStar /><span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{s.self || '—'}</span><span style={label(11, '0')}>{isOwn ? 'SUA NOTA' : `NOTA ${fn.toUpperCase()}`}</span></span></span>
                  <span style={{ marginTop: 'auto', ...label(11, '0.08em') }}>SKILL</span>
                  <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{s.name}</span>
                  <Pips value={s.self} onPick={(n) => grade(s, 'self', n)} editable={isOwn} name={s.name} who="Autoavaliação" />
                  <div style={{ borderTop: '1.5px solid #0E0E12', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}><span><b>Manager: </b>{s.manager || 'sem nota'}</span>{diff !== null && diff !== 0 && <span style={{ fontWeight: 600 }}>{diff > 0 ? `Manager vê +${diff}` : `Manager vê ${diff}`}</span>}{diff === 0 && <span style={{ fontWeight: 600 }}>Alinhados</span>}</span>
                    {canGrade && <Pips value={s.manager} onPick={(n) => grade(s, 'manager', n)} editable name={s.name} who="Nota do manager" />}
                  </div>
                </article>
              );
            })}
          </div>
          <section aria-label="Resumo do ciclo" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', borderRadius: 22, background: '#17171D', border: '1px solid #2C2C36', padding: '20px 24px' }}>
            <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{avg(rated, 'self')}</span><span style={label(11, '0')}>{isOwn ? 'SUA MÉDIA' : `MÉDIA ${fn.toUpperCase()}`} / 5</span></span>
            <span style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>{avg(mrated, 'manager')}</span><span style={label(11, '0')}>MÉDIA DO MANAGER / 5</span></span>
            <span style={{ flex: '1 1 260px', color: '#A3A1AD', fontSize: 15, lineHeight: 1.5 }}>{rated.length} de {skills.length} {plural(skills.length, 'skill avaliada', 'skills avaliadas')}{gaps ? ` · ${gaps} ${plural(gaps, 'diferença', 'diferenças')} entre a autoavaliação e o manager para conversar no 1:1.` : '.'}</span>
          </section>
        </>}
      </div>
    </div>
  );
}
