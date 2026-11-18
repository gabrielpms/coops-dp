'use client';
import { useState } from 'react';
import { BottomSheet } from '../sheet/BottomSheet';
import { AdminCard } from '../admin/AdminBanner';
import { IconUsers } from '../admin/Icons';
import { PersonCard, type PersonCardData } from './PersonCard';
import { darkBtn } from '../ds/tokens';

export type Candidate = PersonCardData & { squadName: string | null };

/** Entrada para colocar alguém no squad: primeiro pergunta se é um usuário novo (abre o cadastro) ou um que já existe (escolhe na lista de cartas). */
export function AddToSquadSheet({ projectId, squad, candidates, onNew, onClose, onSaved }: {
  projectId: string; squad: { id: string; name: string }; candidates: Candidate[]; onNew: () => void; onClose: () => void; onSaved: () => void;
}) {
  const [stage, setStage] = useState<'choice' | 'existing'>('choice');
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const who = candidates.find((c) => c.id === picked);

  const add = async () => {
    if (!picked) return;
    setBusy(true); setError(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/squads/${squad.id}/members`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ personId: picked }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setError(data.error ?? 'Não deu para adicionar. Tente de novo.'); return; }
      onSaved();
    } catch { setError('Sem conexão. Tente de novo.'); } finally { setBusy(false); }
  };

  return (
    <BottomSheet tag="SQUAD · ADICIONAR PESSOA" title={stage === 'choice' ? 'Quem entra no squad?' : 'Escolha o usuário'} sub={stage === 'choice' ? `Coloque alguém à mesa de ${squad.name}.` : 'Quem já estava em outro squad muda para este.'} onClose={onClose}>
      {stage === 'choice' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          <AdminCard bg="#B7A6FF" icon={<IconUsers bg="#B7A6FF" />} big="+" bigLabel="NOVO" kicker="CADASTRAR" title="Novo usuário" foot="Monte o avatar, crie o e-mail e a senha de acesso e já coloque no squad" aria="Cadastrar um novo usuário neste squad" onClick={onNew} />
          <AdminCard bg="#8FE3C8" icon={<IconUsers bg="#8FE3C8" />} big={String(candidates.length).padStart(2, '0')} bigLabel={candidates.length === 1 ? 'DISPONÍVEL' : 'DISPONÍVEIS'} kicker="ESCOLHER DA LISTA" title="Usuário já cadastrado" foot={candidates.length ? 'Quem já está no projeto e ainda não está neste squad' : 'Todos do projeto já estão neste squad'} aria="Escolher um usuário já cadastrado" onClick={() => setStage('existing')} />
        </div>
      ) : (
        <>
          <button type="button" onClick={() => { setStage('choice'); setPicked(null); setError(null); }} style={{ alignSelf: 'flex-start', fontFamily: 'inherit', fontSize: 14, color: '#A3A1AD', background: 'transparent', border: 0, cursor: 'pointer', minHeight: 44, padding: 0 }}>← Voltar</button>
          {candidates.length === 0 ? (
            <div style={{ boxSizing: 'border-box', minHeight: 240, borderRadius: 24, border: '1.5px dashed #4A4858', color: '#F5F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, textAlign: 'center' }}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>Todos já estão neste squad</span>
              <span style={{ fontSize: 13, color: '#A3A1AD' }}>Volte e cadastre um novo usuário.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(196px, 1fr))', gap: 20 }}>
              {candidates.map((c) => <PersonCard key={c.id} person={c} top={(c.squadName ?? 'SEM SQUAD').toUpperCase()} topRight={picked === c.id ? 'ESCOLHIDO' : ''} selected={picked === c.id} onSelect={() => setPicked(c.id)} ariaLabel={`Escolher ${c.name}`} />)}
            </div>
          )}
          {error && <span role="alert" style={{ fontSize: 14, fontWeight: 600, color: '#FF8A5B' }}>{error}</span>}
          {candidates.length > 0 && (
            <button type="button" disabled={!picked || busy} onClick={add} style={{ ...darkBtn, alignSelf: 'flex-start', background: '#B7A6FF', color: '#0E0E12', minHeight: 48, padding: '0 22px', opacity: picked ? 1 : 0.5 }}>{busy ? 'Adicionando…' : who ? `Adicionar ${who.name.split(' ')[0]} ao squad` : 'Escolha uma pessoa'}</button>
          )}
        </>
      )}
    </BottomSheet>
  );
}
