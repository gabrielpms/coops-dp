import { useId } from 'react';

export type AvatarConfig = {
  skin?: string; bg?: string; hairStyle?: string; shirtStyle?: string; facialHair?: string;
  glasses?: boolean; glassesShape?: string; earrings?: boolean; lashes?: boolean; crown?: boolean;
};
export const SKINS = ['#FFFFFF', '#F2D3BC', '#E0B08A', '#C68B5E', '#8D5A3B', '#5A3825'];
export const BGS = ['#F2F1EE', '#B7A6FF', '#F3D36B', '#F5A9D6', '#FF8A5B'];
export const HAIRS = ['curto', 'cacheado', 'chanel', 'longo', 'coque', 'careca', 'blackpower', 'afro-curto', 'trancas', 'dreads', 'rabo', 'ondulado', 'topete'];
export const SHIRTS = ['preta', 'clara', 'listrada', 'blazer', 'gola-alta', 'camisa'];
export const FACIAL = ['nenhum', 'bigode', 'barba', 'barba-cheia', 'cavanhaque'];

export function Avatar({ size = 160, label = 'Avatar', ...p }: AvatarConfig & { size?: number; label?: string }) {
  const uid = useId().replace(/:/g, '');
  const st = p.hairStyle ?? 'curto', sh = p.shirtStyle ?? 'clara', fh = p.facialHair ?? 'nenhum';
  const gl = !!p.glasses, gs = p.glassesShape ?? 'redondo';
  const on = (v: boolean) => (v ? 'inline' : 'none');
  const full = fh === 'barba-cheia';
  const d = {
    skin: p.skin ?? '#FFFFFF', bg: p.bg ?? '#F2F1EE',
    shirtFill: sh === 'preta' || sh === 'gola-alta' ? '#0E0E12' : '#FFFFFF',
    stripesDisplay: on(sh === 'listrada'), blazerDisplay: on(sh === 'blazer'), collarDisplay: on(sh === 'camisa'),
    turtleDisplay: on(sh === 'gola-alta'), crewDisplay: on(sh === 'clara' || sh === 'listrada' || sh === 'blazer'),
    shortDisplay: on(st === 'curto'), curlyDisplay: on(st === 'cacheado'), bobDisplay: on(st === 'chanel'),
    longDisplay: on(st === 'longo'), bunDisplay: on(st === 'coque'), baldDisplay: on(st === 'careca'),
    afroDisplay: on(st === 'blackpower'), afroShortDisplay: on(st === 'afro-curto'),
    afroFrontDisplay: on(st === 'blackpower' || st === 'afro-curto'), braidsDisplay: on(st === 'trancas'),
    dreadsDisplay: on(st === 'dreads'), ponyDisplay: on(st === 'rabo'), wavyDisplay: on(st === 'ondulado'),
    quiffDisplay: on(st === 'topete'),
    stacheDisplay: on(fh === 'bigode' || full || fh === 'cavanhaque'), beardDisplay: on(fh === 'barba'),
    fullBeardDisplay: on(full), goateeDisplay: on(fh === 'cavanhaque'),
    mouthStroke: full ? '#FFFFFF' : '#0E0E12', browStroke: '#0E0E12',
    roundGlassesDisplay: on(gl && gs === 'redondo'), squareGlassesDisplay: on(gl && gs === 'quadrado'),
    earringsDisplay: on(!!p.earrings), lashesDisplay: on(!!p.lashes), crownDisplay: on(!!p.crown),
  };
  return (
    <span style={{ display: 'inline-block', width: size, height: size, position: 'relative', lineHeight: 0 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}>
<defs>
<clipPath id={`coops-av-circle-${uid}`}><circle cx="50" cy="50" r="47"></circle></clipPath>
<clipPath id={`coops-av-torso-${uid}`}><path d="M12 104C14 86 28 77 50 77s36 9 38 27z"></path></clipPath>
</defs>
<circle cx="50" cy="50" r="47" fill={d.bg}></circle>
<g clipPath={`url(#coops-av-circle-${uid})`} stroke="#0E0E12" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">

<circle display={d.afroDisplay} cx="50" cy="36" r="24" fill="#0E0E12" stroke="none"></circle>
<circle display={d.afroShortDisplay} cx="50" cy="38" r="19.5" fill="#0E0E12" stroke="none"></circle>
<path display={d.longDisplay} d="M31 44C31 28 40 20 50 20s19 8 19 24l2 40H59V58H41v26H29z" fill="#0E0E12"></path>
<g display={d.braidsDisplay}><path d="M31 44C31 28 40 20 50 20s19 8 19 24l2 42H59V58H41v28H29z" fill="#0E0E12"></path><path d="M33 58v24M37 60v24M63 60v24M67 58v24" fill="none" stroke="#FFFFFF" strokeWidth="0.9"></path></g>
<g display={d.dreadsDisplay}><path d="M30 40c0-14 9-22 20-22s20 8 20 22l3 34-6 2-3-24-4 26-6-2V54H44v22l-6 2-4-26-3 24-6-2z" fill="#0E0E12"></path><path d="M30 56l2 6M68 56l-2 6M33 66l1 6M66 66l-1 6" fill="none" stroke="#FFFFFF" strokeWidth="0.9"></path></g>
<path display={d.bobDisplay} d="M29 46C27 29 37 19 50 19s23 10 21 27l1 13c-4 5-10 5-12 3V52H40v10c-2 2-8 2-12-3z" fill="#0E0E12"></path>
<path display={d.wavyDisplay} d="M30 46c-3-16 6-26 20-26s23 10 20 26c3 6 1 12-2 16-3-2-6-2-8 0V50H40v12c-2-2-5-2-8 0-3-4-5-10-2-16z" fill="#0E0E12"></path>
<path display={d.ponyDisplay} d="M60 28c12 0 17 12 13 30-3-9-7-15-14-19z" fill="#0E0E12"></path>

<path d="M12 104C14 86 28 77 50 77s36 9 38 27z" fill={d.shirtFill}></path>
<g display={d.stripesDisplay} clipPath={`url(#coops-av-torso-${uid})`} strokeWidth="1.4"><path d="M10 86h80M10 91h80M10 96h80M10 101h80"></path></g>
<g display={d.blazerDisplay} fill="none"><path d="M42 78l-4 26M58 78l4 26"></path><path d="M42 78l4 8-6 4M58 78l-4 8 6 4"></path></g>
<g display={d.collarDisplay} fill="#FFFFFF"><path d="M42 77l8 7-5 4-6-8zM58 77l-8 7 5 4 6-8z"></path><path d="M50 84v20" fill="none"></path></g>

<path d="M43 58v20c3 3 11 3 14 0V58z" fill={d.skin}></path>
<path d="M43 61c4 6 10 6 14 0v6c-4 4-10 4-14 0z" fill="#0E0E12" stroke="none"></path>
<g display={d.turtleDisplay}><path d="M41.5 68h17v12h-17z" fill="#0E0E12"></path><path d="M42 72h16M42 76h16" fill="none" stroke="#FFFFFF" strokeWidth="0.9"></path></g>
<path display={d.crewDisplay} d="M41 78c4 5 14 5 18 0" fill="none"></path>

<circle cx="34" cy="47" r="4" fill={d.skin}></circle>
<circle cx="66" cy="47" r="4" fill={d.skin}></circle>
<g display={d.earringsDisplay} fill="none" strokeWidth="1.3"><circle cx="34" cy="53.5" r="2"></circle><circle cx="66" cy="53.5" r="2"></circle></g>
<path d="M34 44c0-13 7-20 16-20s16 7 16 20c0 12-7 20-16 20s-16-8-16-20z" fill={d.skin}></path>

<path display={d.beardDisplay} d="M34.5 47c1 11 7 17 15.5 17s14.5-6 15.5-17c-3 9-8 13-15.5 13S37.5 56 34.5 47z" fill="#0E0E12" stroke="none"></path>
<path display={d.fullBeardDisplay} d="M34.2 43c-.5 14 6 21 15.8 21s16.3-7 15.8-21c-2 6-4 9-7 10-2-3-5-4-8.8-4s-6.8 1-8.8 4c-3-1-5-4-7-10z" fill="#0E0E12" stroke="none"></path>
<path display={d.goateeDisplay} d="M45 59.5c1 4.5 3 6 5 6s4-1.5 5-6c-2 1-8 1-10 0z" fill="#0E0E12" stroke="none"></path>

<path display={d.shortDisplay} d="M33 45c-3-16 6-25 18-25 11 0 19 8 16 23-2-7-7-11-13-12-6 3-14 4-19 7z" fill="#0E0E12" stroke="none"></path>
<path display={d.curlyDisplay} d="M32 43c-5-6-2-15 4-15-1-7 7-11 11-7 3-6 12-5 13 1 6-3 12 4 8 10 4 4 2 10-1 11-1-6-5-10-11-10-6 2-14 2-19 4-2 2-4 4-5 6z" fill="#0E0E12" stroke="none"></path>
<path display={d.bobDisplay} d="M33.5 41c0-12 7-18 16.5-18s16.5 6 16.5 18z" fill="#0E0E12" stroke="none"></path>
<path display={d.longDisplay} d="M34 46c0-15 7-22 16-22 0 0-5 6-15.5 22zM66 46c0-15-7-22-16-22 0 0 5 6 15.5 22z" fill="#0E0E12" stroke="none"></path>
<path display={d.braidsDisplay} d="M34 46c0-15 7-22 16-22 0 0-5 6-15.5 22zM66 46c0-15-7-22-16-22 0 0 5 6 15.5 22z" fill="#0E0E12" stroke="none"></path>
<g display={d.bunDisplay} stroke="none" fill="#0E0E12"><circle cx="50" cy="17" r="7"></circle><path d="M34 43c-1-13 6-19 16-19s17 6 16 19c-4-7-10-10-16-10s-12 3-16 10z"></path></g>
<path display={d.ponyDisplay} d="M34 43c-1-13 6-19 16-19s17 6 16 19c-4-7-10-10-16-10s-12 3-16 10z" fill="#0E0E12" stroke="none"></path>
<path display={d.afroFrontDisplay} d="M34 42c0-12 7-18 16-18s16 6 16 18c-3-5-9-8-16-8s-13 3-16 8z" fill="#0E0E12" stroke="none"></path>
<path display={d.dreadsDisplay} d="M34 42c0-12 7-18 16-18s16 6 16 18c-4-4-9-6-16-6s-12 2-16 6z" fill="#0E0E12" stroke="none"></path>
<path display={d.wavyDisplay} d="M34 44c-1-13 7-21 18-20 8 1 14 7 14 18-6-6-12-8-18-8-6 2-11 5-14 10z" fill="#0E0E12" stroke="none"></path>
<path display={d.quiffDisplay} d="M34 43c-2-12 4-20 12-22 4-6 14-6 18 0 4 4 4 10 2 20-3-6-8-8-14-8-7 1-13 5-18 10z" fill="#0E0E12" stroke="none"></path>
<path display={d.baldDisplay} d="M42 28c4-2 12-2 16 0" fill="none" strokeWidth="1.2"></path>

<path d="M40.5 42.5l4.5-.8M59.5 42.5l-4.5-.8" fill="none" stroke={d.browStroke}></path>
<circle cx="44" cy="47" r="1.5" fill="#0E0E12" stroke="none"></circle>
<circle cx="56" cy="47" r="1.5" fill="#0E0E12" stroke="none"></circle>
<path display={d.lashesDisplay} d="M42 46l-1.8-1.2M58 46l1.8-1.2" fill="none" strokeWidth="1.2"></path>
<path d="M50.5 47l-1.5 6h2.5" fill="none" strokeWidth="1.3"></path>
<path display={d.stacheDisplay} d="M43.5 56.5c2-3 5-3 6.5-1 1.5-2 4.5-2 6.5 1-2.5 0-4.5-.8-6.5-.3-2-.5-4 .3-6.5.3z" fill="#0E0E12" stroke="none"></path>
<path d="M46 57.5c2.5 2 5.5 2 8 0" fill="none" stroke={d.mouthStroke} strokeWidth="1.4"></path>
<g display={d.roundGlassesDisplay} fill="none" strokeWidth="1"><circle cx="43.5" cy="47" r="5.2"></circle><circle cx="56.5" cy="47" r="5.2"></circle><path d="M48.7 46.5h2.6M38.3 46l-4-1M61.7 46l4-1"></path></g>
<g display={d.squareGlassesDisplay} fill="none" strokeWidth="1.3"><rect x="37.8" y="42.8" width="10.6" height="8.4" rx="2"></rect><rect x="51.6" y="42.8" width="10.6" height="8.4" rx="2"></rect><path d="M48.4 46h3.2M37.8 45.5l-3.8-1M62.2 45.5l3.8-1"></path></g>
</g>
<g display={d.crownDisplay}><path d="M66 6l5 8 6-6 5 8 6-5-3 17H69z" fill="#F3D36B" stroke="#0E0E12" strokeWidth="2" strokeLinejoin="round"></path></g>
</svg>
    </span>
  );
}
