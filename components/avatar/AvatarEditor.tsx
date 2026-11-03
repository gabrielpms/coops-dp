'use client';
import { Avatar, BGS, FACIAL, HAIRS, SHIRTS, SKINS, type AvatarConfig } from './Avatar';
import { chipStyle, label } from '../ds/tokens';

const HAIR_LABEL: Record<string, string> = { curto: 'Curto', cacheado: 'Cacheado', chanel: 'Chanel', longo: 'Longo', coque: 'Coque', careca: 'Careca', blackpower: 'Black power', 'afro-curto': 'Afro curto', trancas: 'Tranças', dreads: 'Dreads', rabo: 'Rabo', ondulado: 'Ondulado', topete: 'Topete' };
const SHIRT_LABEL: Record<string, string> = { preta: 'Preta', clara: 'Clara', listrada: 'Listrada', blazer: 'Blazer', 'gola-alta': 'Gola alta', camisa: 'Camisa' };
const FACIAL_LABEL: Record<string, string> = { nenhum: 'Sem barba', bigode: 'Bigode', barba: 'Barba', 'barba-cheia': 'Barba cheia', cavanhaque: 'Cavanhaque' };

export const DEFAULT_AVATAR_CFG: AvatarConfig = { skin: '#E0B08A', bg: '#B7A6FF', hairStyle: 'curto', shirtStyle: 'clara', facialHair: 'nenhum', glasses: false, glassesShape: 'redondo', earrings: false, lashes: false, crown: false };

/** Editor de avatar: uma carta dentro do deck de perguntas. */
export function AvatarEditor({ value, onChange }: { value: AvatarConfig; onChange: (v: AvatarConfig) => void }) {
  const v = { ...DEFAULT_AVATAR_CFG, ...value };
  const set = (p: Partial<AvatarConfig>) => onChange({ ...v, ...p });
  const group = (title: string, items: string[], cur: string | undefined, key: keyof AvatarConfig, names: Record<string, string>) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={label()}>{title}</span>
      <div role="group" aria-label={title} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((i) => <button key={i} type="button" aria-pressed={cur === i} className="tw-chip" onClick={() => set({ [key]: i } as Partial<AvatarConfig>)} style={chipStyle(cur === i)}>{names[i]}</button>)}
      </div>
    </div>
  );
  const swatches = (title: string, items: string[], cur: string | undefined, key: 'skin' | 'bg') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={label()}>{title}</span>
      <div role="group" aria-label={title} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((c) => (
          <button key={c} type="button" aria-label={`${title} ${c}`} aria-pressed={cur === c} className="tw-sw" onClick={() => set({ [key]: c })}
            style={{ width: 44, height: 44, borderRadius: '50%', background: c, border: '2px solid #0E0E12', cursor: 'pointer', boxShadow: cur === c ? '0 0 0 3px #F5F2EC, 0 0 0 5px #0E0E12' : 'none', padding: 0 }} />
        ))}
      </div>
    </div>
  );
  const toggle = (k: 'glasses' | 'earrings' | 'lashes', name: string) => <button key={k} type="button" aria-pressed={!!v[k]} className="tw-chip" onClick={() => set({ [k]: !v[k] })} style={chipStyle(!!v[k])}>{name}</button>;
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '0 0 auto', lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', margin: '0 auto' }}><Avatar {...v} size={150} label="Prévia do avatar" /></div>
      <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {swatches('PELE', SKINS, v.skin, 'skin')}
        {swatches('FUNDO', BGS, v.bg, 'bg')}
        {group('CABELO', HAIRS, v.hairStyle, 'hairStyle', HAIR_LABEL)}
        {group('CAMISA', SHIRTS, v.shirtStyle, 'shirtStyle', SHIRT_LABEL)}
        {group('BARBA', FACIAL, v.facialHair, 'facialHair', FACIAL_LABEL)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label()}>EXTRAS</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{toggle('glasses', 'Óculos')}{toggle('earrings', 'Brincos')}{toggle('lashes', 'Cílios')}</div></div>
      </div>
    </div>
  );
}
