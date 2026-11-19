'use client';
import { ACCESSORY_COLORS, Avatar, BGS, BROWS, EARRINGS, EYES, FACIAL, GLASSES_SHAPES, HAIRS, HAIR_COLORS, HEADWEAR, MOUTHS, SHIRTS, SKINS, type AvatarConfig } from './Avatar';
import { chipStyle, label } from '../ds/tokens';

const HAIR_LABEL: Record<string, string> = {
  curto: 'Curto', cacheado: 'Cacheado', chanel: 'Chanel', longo: 'Longo', coque: 'Coque', careca: 'Careca', blackpower: 'Black power', 'afro-curto': 'Afro curto', trancas: 'Tranças', dreads: 'Dreads', rabo: 'Rabo', ondulado: 'Ondulado', topete: 'Topete',
  raspado: 'Raspado', undercut: 'Undercut', franja: 'Franja', 'longo-repartido': 'Longo repartido', 'dois-coques': 'Dois coques', 'cacheado-longo': 'Cacheado longo', lateral: 'Lateral', mullet: 'Mullet',
};
const SHIRT_LABEL: Record<string, string> = { preta: 'Preta', clara: 'Clara', listrada: 'Listrada', blazer: 'Blazer', 'gola-alta': 'Gola alta', camisa: 'Camisa', moletom: 'Moletom' };
const FACIAL_LABEL: Record<string, string> = { nenhum: 'Sem barba', bigode: 'Bigode', barba: 'Barba', 'barba-cheia': 'Barba cheia', cavanhaque: 'Cavanhaque' };
const EYES_LABEL: Record<string, string> = { ponto: 'Ponto', grande: 'Grandes', feliz: 'Felizes', sereno: 'Serenos', sonolento: 'Sonolentos', piscada: 'Piscada' };
const BROWS_LABEL: Record<string, string> = { fina: 'Finas', grossa: 'Grossas', arqueada: 'Arqueadas', franzida: 'Franzidas', sem: 'Sem' };
const MOUTH_LABEL: Record<string, string> = { sorriso: 'Sorriso', sorrisao: 'Sorrisão', neutra: 'Neutra', lado: 'De lado', surpresa: 'Surpresa' };
const GLASSES_LABEL: Record<string, string> = { nenhum: 'Sem óculos', redondo: 'Redondo', quadrado: 'Quadrado', gatinho: 'Gatinho', escuros: 'Escuros' };
const HEAD_LABEL: Record<string, string> = { nenhum: 'Nada na cabeça', gorro: 'Gorro', bone: 'Boné', fone: 'Fone de ouvido', headset: 'Headset', bandana: 'Bandana', faixa: 'Faixa', chapeu: 'Chapéu', bucket: 'Bucket', boina: 'Boina', laco: 'Laço', flor: 'Flor' };
const EAR_LABEL: Record<string, string> = { nenhum: 'Sem brincos', pino: 'Pino', pingente: 'Pingente', argola: 'Argola' };

export const DEFAULT_AVATAR_CFG: AvatarConfig = {
  skin: '#E0B08A', bg: '#B7A6FF', hairStyle: 'curto', hairColor: '#0E0E12', shirtStyle: 'clara', facialHair: 'nenhum', glasses: false, glassesShape: 'redondo',
  eyes: 'ponto', brows: 'fina', mouth: 'sorriso', headwear: 'nenhum', earringStyle: 'nenhum', accessoryColor: '#F3D36B', lashes: false, freckles: false, blush: false, beautyMark: false, crown: false,
};

/** Editor de avatar: uma carta dentro do deck de perguntas. */
export function AvatarEditor({ value, onChange }: { value: AvatarConfig; onChange: (v: AvatarConfig) => void }) {
  const v = { ...DEFAULT_AVATAR_CFG, ...value };
  const set = (p: Partial<AvatarConfig>) => onChange({ ...v, ...p });
  // brincos do formato antigo (sim/não) aparecem como "Pino"
  const ear = v.earringStyle && v.earringStyle !== 'nenhum' ? v.earringStyle : v.earrings ? 'pino' : 'nenhum';
  const group = (title: string, items: readonly string[], cur: string | undefined, onPick: (i: string) => void, names: Record<string, string>) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={label()}>{title}</span>
      <div role="group" aria-label={title} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((i) => <button key={i} type="button" aria-pressed={cur === i} className="tw-chip" onClick={() => onPick(i)} style={chipStyle(cur === i)}>{names[i]}</button>)}
      </div>
    </div>
  );
  const swatches = (title: string, items: readonly (string | [string, string])[], cur: string | undefined, onPick: (c: string) => void) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={label()}>{title}</span>
      <div role="group" aria-label={title} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((it) => {
          const [name, c] = typeof it === 'string' ? [it, it] : it;
          return (
            <button key={c} type="button" aria-label={`${title} ${name}`} aria-pressed={cur === c} className="tw-sw" onClick={() => onPick(c)}
              style={{ width: 44, height: 44, borderRadius: '50%', background: c, border: '2px solid #0E0E12', cursor: 'pointer', boxShadow: cur === c ? '0 0 0 3px #F5F2EC, 0 0 0 5px #0E0E12' : 'none', padding: 0 }} />
          );
        })}
      </div>
    </div>
  );
  const toggle = (k: 'lashes' | 'freckles' | 'blush' | 'beautyMark', name: string) => <button key={k} type="button" aria-pressed={!!v[k]} className="tw-chip" onClick={() => set({ [k]: !v[k] })} style={chipStyle(!!v[k])}>{name}</button>;
  const hasAccessory = (v.headwear && v.headwear !== 'nenhum') || ear !== 'nenhum';
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '0 0 auto', lineHeight: 0, borderRadius: '50%', border: '2px solid #0E0E12', margin: '0 auto' }}><Avatar {...v} size={150} label="Prévia do avatar" /></div>
      <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {swatches('PELE', SKINS, v.skin, (skin) => set({ skin }))}
        {swatches('FUNDO', BGS, v.bg, (bg) => set({ bg }))}
        {group('CABELO', HAIRS, v.hairStyle, (hairStyle) => set({ hairStyle }), HAIR_LABEL)}
        {swatches('COR DO CABELO', HAIR_COLORS, v.hairColor, (hairColor) => set({ hairColor }))}
        {group('OLHOS', EYES, v.eyes, (eyes) => set({ eyes }), EYES_LABEL)}
        {group('SOBRANCELHAS', BROWS, v.brows, (brows) => set({ brows }), BROWS_LABEL)}
        {group('BOCA', MOUTHS, v.mouth, (mouth) => set({ mouth }), MOUTH_LABEL)}
        {group('BARBA', FACIAL, v.facialHair, (facialHair) => set({ facialHair }), FACIAL_LABEL)}
        {group('ÓCULOS', ['nenhum', ...GLASSES_SHAPES], v.glasses ? v.glassesShape ?? 'redondo' : 'nenhum', (i) => set(i === 'nenhum' ? { glasses: false } : { glasses: true, glassesShape: i }), GLASSES_LABEL)}
        {group('NA CABEÇA', HEADWEAR, v.headwear, (headwear) => set({ headwear }), HEAD_LABEL)}
        {group('BRINCOS', EARRINGS, ear, (earringStyle) => set({ earringStyle, earrings: earringStyle !== 'nenhum' }), EAR_LABEL)}
        {hasAccessory && swatches('COR DO ACESSÓRIO', ACCESSORY_COLORS, v.accessoryColor, (accessoryColor) => set({ accessoryColor }))}
        {group('CAMISA', SHIRTS, v.shirtStyle, (shirtStyle) => set({ shirtStyle }), SHIRT_LABEL)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label()}>EXTRAS</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{toggle('lashes', 'Cílios')}{toggle('freckles', 'Sardas')}{toggle('blush', 'Bochechas')}{toggle('beautyMark', 'Pintinha')}</div></div>
      </div>
    </div>
  );
}
