'use client';
import { useState } from 'react';
import { AppHeader, DEFAULT_AVATAR } from '@/components/ds/AppHeader';
import { AdminBanner, AdminCard, AddCard, type BannerView } from '@/components/admin/AdminBanner';
import { AvatarIcon, IconBars, IconBino, IconBuild, IconDeck } from '@/components/admin/Icons';
import { UserDeck, type UserData, type UserDraft } from '@/components/admin/UserDeck';
import { ProjectDataDeck, type ProjectDataDraft } from '@/components/admin/ProjectDataDeck';
import { CategoryDeck, type CategoryDraft, type CategoryView } from '@/components/admin/CategoryDeck';
import { LeadershipDeck, type LeadershipDraft, type LeadershipView, type LeadPerson, type LeadSquad } from '@/components/admin/LeadershipDeck';
import { Avatar, type AvatarConfig } from '@/components/avatar/Avatar';
import { DEFAULT_AVATAR_CFG } from '@/components/avatar/AvatarEditor';
import { useCoopsRouter } from '@/components/nav/useCoopsRouter';

type Tab = 'lid' | 'hab' | 'dados';
type Deck = { kind: 'user' } | { kind: 'lead'; editing: LeadershipView | null } | { kind: 'cat'; editing: CategoryView | null } | { kind: 'dados'; step: number };
const plural = (n: number, a: string, b: string) => (n === 1 ? a : b);
const pad = (n: number) => String(n).padStart(2, '0');

export function AdminProjectClient({ user, project, categories, looseSkills, leaderships, squads, people, drafts }: {
  user: UserData; project: { id: string; name: string; segment: string; indicators: string[]; competitors: string[] }; categories: CategoryView[]; looseSkills: string[];
  leaderships: LeadershipView[]; squads: LeadSquad[]; people: LeadPerson[]; drafts: { leadership: LeadershipDraft | null; category: CategoryDraft | null; pdata: ProjectDataDraft | null; udata: UserDraft | null };
}) {
  const { refresh } = useCoopsRouter();
  const [tab, setTab] = useState<Tab>('lid');
  const [deck, setDeck] = useState<Deck | null>(null);
  const [dLead, setDLead] = useState(drafts.leadership);
  const [dCat, setDCat] = useState(drafts.category);
  const [dData, setDData] = useState(drafts.pdata);
  const [dUser, setDUser] = useState(drafts.udata);
  const meAvatar = { ...DEFAULT_AVATAR_CFG, ...(user.avatar ?? DEFAULT_AVATAR) };
  const done = () => { setDeck(null); refresh(); };
  const dataInitial = { name: project.name, segment: project.segment, indicators: project.indicators, competitors: project.competitors };

  const banner: Record<Tab, { view: BannerView; title: string; desc: string; cta: { label: string; onClick: () => void } }> = {
    lid: { view: 'lid', title: 'Liderança', desc: 'Quem lidera cada time no projeto. Toque numa carta para associar squads e pessoas.', cta: { label: '+ Adicionar liderança', onClick: () => setDeck({ kind: 'lead', editing: null }) } },
    hab: { view: 'hab', title: 'Categorias de skill', desc: 'As categorias e skills que aparecem no deck de Skills de cada pessoa do projeto.', cta: { label: '+ Nova categoria', onClick: () => setDeck({ kind: 'cat', editing: null }) } },
    dados: { view: 'dados', title: 'Dados do projeto', desc: 'Segmento, indicadores-chave e concorrentes: tudo isso alimenta o deck da empresa.', cta: { label: 'Editar dados do projeto', onClick: () => setDeck({ kind: 'dados', step: 0 }) } },
  };
  const b = banner[tab];
  const tabs: [Tab, string][] = [['lid', `Liderança · ${leaderships.length}`], ['hab', `Categorias de skill · ${categories.length}`], ['dados', 'Dados do projeto']];
  const leadFoot = (l: LeadershipView) => `${l.title || 'Sem cargo'} · ${l.squadIds.length ? l.squadIds.map((id) => squads.find((s) => s.id === id)?.name).filter(Boolean).join(', ') : 'nenhum squad ainda'}`;

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: '24px 32px 64px' }}>
      <div style={{ maxWidth: 1216, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <AppHeader name={user.name} email={user.email} role={user.role} avatar={user.avatar} />
        <AdminBanner view={b.view} title={b.title} desc={`${project.name} · ${b.desc}`} meAvatar={meAvatar} onMe={() => setDeck({ kind: 'user' })} back={{ href: '/admin', label: '← Todos os projetos' }} cta={b.cta} />
        <div role="tablist" aria-label="Administração do projeto" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tabs.map(([id, text]) => { const on = tab === id; return <button key={id} type="button" role="tab" aria-selected={on} onClick={() => setTab(id)} style={{ fontFamily: 'inherit', fontWeight: on ? 600 : 400, fontSize: 14, color: on ? '#0E0E12' : '#F5F2EC', background: on ? '#F5F2EC' : 'transparent', border: on ? 0 : '1px solid #4A4858', borderRadius: 999, minHeight: 44, padding: '0 16px', cursor: 'pointer' }}>{text}</button>; })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {tab === 'lid' && <>
            {leaderships.map((l) => (
              <AdminCard key={l.id} bg="#F3D36B" icon={<AvatarIcon bg={(l.avatar as AvatarConfig | null)?.bg ?? '#B7A6FF'}><Avatar {...DEFAULT_AVATAR_CFG} {...(l.avatar ?? {})} crown={false} size={52} label="" /></AvatarIcon>}
                big={pad(l.memberIds.length)} bigLabel={l.memberIds.length === 1 ? 'PESSOA REPORTA' : 'PESSOAS REPORTAM'} tag={l.invited ? 'CONVITE ENVIADO' : undefined} kicker="LIDERANÇA" title={l.name} foot={leadFoot(l)} aria={`Associar squads e pessoas a ${l.name}`} onClick={() => setDeck({ kind: 'lead', editing: l })} />
            ))}
            <AddCard title="Adicionar liderança" sub="Convide uma pessoa e associe squads e membros" onClick={() => setDeck({ kind: 'lead', editing: null })} />
          </>}
          {tab === 'hab' && <>
            {categories.map((c) => (
              <AdminCard key={c.id} bg="#F5A9D6" icon={<IconDeck bg="#F5A9D6" />} big={pad(c.skills.length)} bigLabel={c.skills.length === 1 ? 'SKILL' : 'SKILLS'} kicker="CATEGORIA" title={c.name} foot={c.skills.join(', ')} aria={`Editar a categoria ${c.name}`} onClick={() => setDeck({ kind: 'cat', editing: c })} />
            ))}
            <AddCard title="Nova categoria" sub="Agrupe skills que aparecem no deck de Skills do time" onClick={() => setDeck({ kind: 'cat', editing: null })} />
          </>}
          {tab === 'dados' && <>
            <AdminCard bg="#A9D8F5" icon={<IconBuild />} big="01" bigLabel="EMPRESA" kicker={project.segment.toUpperCase()} title={project.name} foot="Nome e segmento da empresa" aria="Editar empresa e segmento" onClick={() => setDeck({ kind: 'dados', step: 0 })} />
            <AdminCard bg="#F3D36B" icon={<IconBars />} big={pad(project.indicators.length)} bigLabel={project.indicators.length === 1 ? 'INDICADOR' : 'INDICADORES'} kicker="INDICADORES-CHAVE" title="Indicadores-chave" foot={project.indicators.join(', ') || 'Nenhum ainda'} aria="Editar indicadores-chave" onClick={() => setDeck({ kind: 'dados', step: 1 })} />
            <AdminCard bg="#F5A9D6" icon={<IconBino bg="#F5A9D6" />} big={pad(project.competitors.length)} bigLabel={project.competitors.length === 1 ? 'CONCORRENTE' : 'CONCORRENTES'} kicker="MERCADO" title="Concorrentes" foot={project.competitors.join(', ') || 'Nenhum ainda'} aria="Editar concorrentes" onClick={() => setDeck({ kind: 'dados', step: 2 })} />
          </>}
        </div>
        {tab === 'hab' && looseSkills.length > 0 && (
          <p style={{ margin: 0, fontSize: 14, color: '#A3A1AD', lineHeight: 1.5 }}>{looseSkills.length} {plural(looseSkills.length, 'skill do projeto está', 'skills do projeto estão')} sem categoria: {looseSkills.join(', ')}.</p>
        )}
      </div>

      {deck?.kind === 'user' && <UserDeck user={user} draft={dUser} onDraftChange={setDUser} onClose={() => setDeck(null)} onSaved={done} />}
      {deck?.kind === 'lead' && <LeadershipDeck key={deck.editing?.id ?? 'new'} projectId={project.id} editing={deck.editing} squads={squads} people={people} draft={dLead} onDraftChange={setDLead} onClose={() => setDeck(null)} onSaved={done} />}
      {deck?.kind === 'cat' && <CategoryDeck key={deck.editing?.id ?? 'new'} projectId={project.id} editing={deck.editing} loose={looseSkills} draft={dCat} onDraftChange={setDCat} onClose={() => setDeck(null)} onSaved={done} />}
      {deck?.kind === 'dados' && <ProjectDataDeck key={deck.step} projectId={project.id} initial={dataInitial} draft={{ form: dData?.form ?? dataInitial, step: deck.step }} onDraftChange={setDData} onClose={() => setDeck(null)} onSaved={done} />}
    </div>
  );
}
