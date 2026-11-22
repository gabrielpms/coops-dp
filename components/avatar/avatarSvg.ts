export type AvatarConfig = {
  skin?: string; bg?: string; hairStyle?: string; shirtStyle?: string; facialHair?: string;
  glasses?: boolean; glassesShape?: string; earrings?: boolean; lashes?: boolean; crown?: boolean;
  /** cor do cabelo e da barba (paleta do produto) */ hairColor?: string;
  eyes?: string; brows?: string; mouth?: string;
  /** peça na cabeça (gorro, boné, fone…) */ headwear?: string;
  /** brincos: pino, pingente ou argola */ earringStyle?: string;
  /** cor das peças da cabeça e dos brincos */ accessoryColor?: string;
  freckles?: boolean; blush?: boolean; beautyMark?: boolean;
};
export const SKINS = ['#FFFFFF', '#F2D3BC', '#E0B08A', '#C68B5E', '#8D5A3B', '#5A3825'];
export const BGS = ['#F2F1EE', '#B7A6FF', '#F3D36B', '#F5A9D6', '#FF8A5B'];
export const HAIRS = ['curto', 'cacheado', 'chanel', 'longo', 'coque', 'careca', 'blackpower', 'afro-curto', 'trancas', 'dreads', 'rabo', 'ondulado', 'topete',
  'raspado', 'undercut', 'franja', 'longo-repartido', 'dois-coques', 'cacheado-longo', 'lateral', 'mullet'];
export const HAIR_COLORS: [string, string][] = [['Tinta', '#0E0E12'], ['Castanho', '#5A3825'], ['Ruivo', '#FF8A5B'], ['Loiro', '#F3D36B'], ['Rosa', '#F5A9D6'], ['Lilás', '#B7A6FF'], ['Menta', '#8FE3C8'], ['Grisalho', '#C9C7D1']];
export const ACCESSORY_COLORS: [string, string][] = [['Lilás', '#B7A6FF'], ['Amarelo', '#F3D36B'], ['Rosa', '#F5A9D6'], ['Coral', '#FF8A5B'], ['Menta', '#8FE3C8'], ['Tinta', '#0E0E12']];
export const SHIRTS = ['preta', 'clara', 'listrada', 'blazer', 'gola-alta', 'camisa', 'moletom'];
export const FACIAL = ['nenhum', 'bigode', 'barba', 'barba-cheia', 'cavanhaque'];
export const EYES = ['ponto', 'grande', 'feliz', 'sereno', 'sonolento', 'piscada'];
export const BROWS = ['fina', 'grossa', 'arqueada', 'franzida', 'sem'];
export const MOUTHS = ['sorriso', 'sorrisao', 'neutra', 'lado', 'surpresa'];
export const GLASSES_SHAPES = ['redondo', 'quadrado', 'gatinho', 'escuros'];
export const HEADWEAR = ['nenhum', 'gorro', 'bone', 'fone', 'headset', 'bandana', 'faixa', 'chapeu', 'bucket', 'boina', 'laco', 'flor'];
export const EARRINGS = ['nenhum', 'pino', 'pingente', 'argola'];

const INK = '#0E0E12', WHITE = '#FFFFFF';
type Cfg = {
  skin: string; bg: string; hair: string; hc: string; eyes: string; brows: string; mouth: string; shirt: string; facial: string;
  glasses: string; head: string; acc: string; ear: string; lashes: boolean; sardas: boolean; blush: boolean; pinta: boolean; crown: boolean;
};

/** Só aceita cor no formato #RRGGBB: o desenho é montado como texto, então nada de fora entra nele. */
const color = (v: string | undefined, fallback: string) => (v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback);
/** Só aceita um dos valores conhecidos. */
const pick = (v: string | undefined, list: readonly string[], fallback: string) => (v && list.includes(v) ? v : fallback);
const esc = (v: string) => v.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

function lum(h: string) { const n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }

function buildSvg(c: Cfg, size: number, id: string, label: string): string {
    const hc = c.hc, ink = hc === INK;
    let fl = ink ? 'stroke="none"' : 'stroke="#0E0E12" stroke-width="1.1"'; // cabelo claro ganha um fio de contorno
    let st = c.hair, sh = c.shirt, fh = c.facial, full = fh === 'barba-cheia';
    const D = (v: unknown) => (v ? 'inline' : 'none');
    let shirtFill = (sh === 'preta' || sh === 'gola-alta') ? INK : WHITE;
    let s = '';
    s += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" role="img" aria-label="' + label + '"><defs><clipPath id="' + id + 'c"><circle cx="50" cy="50" r="47"/></clipPath><clipPath id="' + id + 't"><path d="M12 104C14 86 28 77 50 77s36 9 38 27z"/></clipPath></defs>';
    s += '<circle cx="50" cy="50" r="47" fill="' + c.bg + '"/>';
    s += '<g clip-path="url(#' + id + 'c)" stroke="#0E0E12" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">';
    // ---- cabelo de trás
    s += '<circle display="' + D(st === 'blackpower') + '" cx="50" cy="36" r="24" fill="' + hc + '" stroke="none"/>';
    s += '<circle display="' + D(st === 'afro-curto') + '" cx="50" cy="38" r="19.5" fill="' + hc + '" stroke="none"/>';
    s += '<path display="' + D(st === 'longo' || st === 'franja') + '" d="M31 44C31 28 40 20 50 20s19 8 19 24l2 40H59V58H41v26H29z" fill="' + hc + '"/>';
    s += '<g display="' + D(st === 'trancas') + '"><path d="M31 44C31 28 40 20 50 20s19 8 19 24l2 42H59V58H41v28H29z" fill="' + hc + '"/><path d="M33 58v24M37 60v24M63 60v24M67 58v24" fill="none" stroke="#FFFFFF" stroke-width="0.9"/></g>';
    s += '<g display="' + D(st === 'dreads') + '"><path d="M30 40c0-14 9-22 20-22s20 8 20 22l3 34-6 2-3-24-4 26-6-2V54H44v22l-6 2-4-26-3 24-6-2z" fill="' + hc + '"/><path d="M30 56l2 6M68 56l-2 6M33 66l1 6M66 66l-1 6" fill="none" stroke="#FFFFFF" stroke-width="0.9"/></g>';
    s += '<path display="' + D(st === 'chanel') + '" d="M29 46C27 29 37 19 50 19s23 10 21 27l1 13c-4 5-10 5-12 3V52H40v10c-2 2-8 2-12-3z" fill="' + hc + '"/>';
    s += '<path display="' + D(st === 'ondulado') + '" d="M30 46c-3-16 6-26 20-26s23 10 20 26c3 6 1 12-2 16-3-2-6-2-8 0V50H40v12c-2-2-5-2-8 0-3-4-5-10-2-16z" fill="' + hc + '"/>';
    s += '<path display="' + D(st === 'rabo') + '" d="M60 28c12 0 17 12 13 30-3-9-7-15-14-19z" fill="' + hc + '"/>';
    // novos (atrás)
    s += '<g display="' + D(st === 'dois-coques') + '" stroke="none" fill="' + hc + '"><circle cx="34" cy="21" r="7.5"/><circle cx="66" cy="21" r="7.5"/></g>';
    s += '<path display="' + D(st === 'cacheado-longo') + '" d="M29 46c-4 5-3 11-1 15-3 5-2 11 3 14 3 3 7 3 9 0h20c2 3 6 3 9 0 5-3 6-9 3-14 2-4 3-10-1-15 0-14-8-23-21-23s-21 9-21 23z" fill="' + hc + '"/>';
    s += '<path display="' + D(st === 'longo-repartido') + '" d="M30 44C30 27 39 20 50 20s20 7 20 24v36l-4 6H34l-4-6z" fill="' + hc + '"/>';
    s += '<path display="' + D(st === 'mullet') + '" d="M32 44c0-13 7-20 18-20s18 7 18 20l4 22-9-3v-9H39v9l-9 3z" fill="' + hc + '"/>';
    // ---- camisa
    s += '<path d="M12 104C14 86 28 77 50 77s36 9 38 27z" fill="' + shirtFill + '"/>';
    s += '<g display="' + D(sh === 'listrada') + '" clip-path="url(#' + id + 't)" stroke-width="1.4"><path d="M10 86h80M10 91h80M10 96h80M10 101h80"/></g>';
    s += '<g display="' + D(sh === 'blazer') + '" fill="none"><path d="M42 78l-4 26M58 78l4 26"/><path d="M42 78l4 8-6 4M58 78l-4 8 6 4"/></g>';
    s += '<g display="' + D(sh === 'camisa') + '" fill="#FFFFFF"><path d="M42 77l8 7-5 4-6-8zM58 77l-8 7 5 4 6-8z"/><path d="M50 84v20" fill="none"/></g>';
    s += '<g display="' + D(sh === 'moletom') + '" fill="#FFFFFF"><path d="M34 80c0-8 7-12 16-12s16 4 16 12c-4 6-28 6-32 0z"/><path d="M45 86v10M55 86v10" fill="none"/><path d="M30 99c13 4 27 4 40 0" fill="none"/></g>';
    // ---- pescoço
    s += '<path d="M43 58v20c3 3 11 3 14 0V58z" fill="' + c.skin + '"/>';
    s += '<path d="M43 61c4 6 10 6 14 0v6c-4 4-10 4-14 0z" fill="#0E0E12" stroke="none"/>';
    s += '<g display="' + D(sh === 'gola-alta') + '"><path d="M41.5 68h17v12h-17z" fill="#0E0E12"/><path d="M42 72h16M42 76h16" fill="none" stroke="#FFFFFF" stroke-width="0.9"/></g>';
    s += '<path display="' + D(sh === 'clara' || sh === 'listrada' || sh === 'blazer') + '" d="M41 78c4 5 14 5 18 0" fill="none"/>';
    // ---- orelhas, brincos, rosto
    s += '<circle cx="34" cy="47" r="4" fill="' + c.skin + '"/><circle cx="66" cy="47" r="4" fill="' + c.skin + '"/>';
    s += '<path d="M34 44c0-13 7-20 16-20s16 7 16 20c0 12-7 20-16 20s-16-8-16-20z" fill="' + c.skin + '"/>';
    // ---- barba
    s += '<path display="' + D(fh === 'barba') + '" d="M34.5 47c1 11 7 17 15.5 17s14.5-6 15.5-17c-3 9-8 13-15.5 13S37.5 56 34.5 47z" fill="' + hc + '" stroke="none"/>';
    let tex = lum(hc) < 0.35 ? '#FFFFFF' : '#0E0E12';
    // barba cheia: costeletas ligadas ao cabelo, linha da bochecha curva, bigode cheio, abertura oval para a boca e queixo arredondado
    s += '<g display="' + D(full) + '"><path d="M34.2 41.5C33.4 50 34.8 58 38.8 63.4c3 4.2 7 6 11.2 6s8.2-1.8 11.2-6c4-5.4 5.4-13.4 4.6-21.9-1 5.3-3.2 9.1-6.8 10.7-2.4-1-6-.8-9 .8-3-1.6-6.6-1.8-9-.8-3.6-1.6-5.8-5.4-6.8-10.7z" fill="' + hc + '" ' + fl + '/><path d="M44.2 58c1.6-1.8 10-1.8 11.6 0 .7 3.2-2.6 5.4-5.8 5.4s-6.5-2.2-5.8-5.4z" fill="' + c.skin + '" stroke="none"/><path d="M39.4 57.4c.6 3.8 2.6 7 5 9M60.6 57.4c-.6 3.8-2.6 7-5 9" fill="none" stroke="' + tex + '" stroke-width=".7" stroke-linecap="round" opacity=".3"/></g>';
    s += '<path display="' + D(fh === 'cavanhaque') + '" d="M45 59.5c1 4.5 3 6 5 6s4-1.5 5-6c-2 1-8 1-10 0z" fill="' + hc + '" stroke="none"/>';
    // ---- cabelo da frente
    s += '<path display="' + D(st === 'curto' || st === 'mullet') + '" d="M33 45c-3-16 6-25 18-25 11 0 19 8 16 23-2-7-7-11-13-12-6 3-14 4-19 7z" fill="' + hc + '" ' + fl + '/>';
    s += '<path display="' + D(st === 'cacheado' || st === 'cacheado-longo') + '" d="M32 43c-5-6-2-15 4-15-1-7 7-11 11-7 3-6 12-5 13 1 6-3 12 4 8 10 4 4 2 10-1 11-1-6-5-10-11-10-6 2-14 2-19 4-2 2-4 4-5 6z" fill="' + hc + '" ' + fl + '/>';
    s += '<path display="' + D(st === 'chanel') + '" d="M33.5 41c0-12 7-18 16.5-18s16.5 6 16.5 18z" fill="' + hc + '" ' + fl + '/>';
    s += '<g display="' + D(st === 'longo' || st === 'trancas') + '"><path d="M34 46c0-15 7-22 16-22 0 0-5 6-15.5 22zM66 46c0-15-7-22-16-22 0 0 5 6 15.5 22z" fill="' + hc + '" ' + fl + '/></g>';
    s += '<g display="' + D(st === 'coque') + '" ' + fl + ' fill="' + hc + '"><circle cx="50" cy="17" r="7"/><path d="M34 43c-1-13 6-19 16-19s17 6 16 19c-4-7-10-10-16-10s-12 3-16 10z"/></g>';
    s += '<path display="' + D(st === 'rabo' || st === 'dois-coques') + '" d="M34 43c-1-13 6-19 16-19s17 6 16 19c-4-7-10-10-16-10s-12 3-16 10z" fill="' + hc + '" ' + fl + '/>';
    s += '<path display="' + D(st === 'blackpower' || st === 'afro-curto') + '" d="M34 42c0-12 7-18 16-18s16 6 16 18c-3-5-9-8-16-8s-13 3-16 8z" fill="' + hc + '" ' + fl + '/>';
    s += '<path display="' + D(st === 'dreads') + '" d="M34 42c0-12 7-18 16-18s16 6 16 18c-4-4-9-6-16-6s-12 2-16 6z" fill="' + hc + '" ' + fl + '/>';
    s += '<path display="' + D(st === 'ondulado') + '" d="M34 44c-1-13 7-21 18-20 8 1 14 7 14 18-6-6-12-8-18-8-6 2-11 5-14 10z" fill="' + hc + '" ' + fl + '/>';
    s += '<path display="' + D(st === 'topete') + '" d="M34 43c-2-12 4-20 12-22 4-6 14-6 18 0 4 4 4 10 2 20-3-6-8-8-14-8-7 1-13 5-18 10z" fill="' + hc + '" ' + fl + '/>';
    s += '<path display="' + D(st === 'careca') + '" d="M42 28c4-2 12-2 16 0" fill="none" stroke-width="1.2"/>';
    // novos (frente)
    s += '<path display="' + D(st === 'raspado') + '" d="M34.4 43c-1-11 6-19 15.6-19s16.6 8 15.6 19c-1-5-3-8-5-10-6-3-15-3-21 0-2 2-4 5-5.2 10z" fill="' + hc + '" ' + fl + '/>';
    s += '<g display="' + D(st === 'undercut') + '"><path d="M37 39c-1-9 5-15 13.5-15s13.5 6 12.5 15c-4-4-8-6-13-6s-9 2-13 6z" fill="' + hc + '" ' + fl + '/><path d="M34.6 44c-.4-4 .2-8 2-11M65.4 44c.4-4-.2-8-2-11" fill="none" stroke="' + hc + '" stroke-width="1.8"/></g>';
    s += '<path display="' + D(st === 'franja') + '" d="M34 44c-1-14 7-21 16-21s17 7 16 21c-1-3-2-5-3-7-8 2-18 2-26 0-1 2-2 4-3 7z" fill="' + hc + '" ' + fl + '/>';
    s += '<g display="' + D(st === 'longo-repartido') + '"><path d="M34 46C34 32 40 24 50 24c-4 6-9 14-9.5 24L40 76l-7 4c1-12 1-22 1-34z" fill="' + hc + '" ' + fl + '/><path d="M66 46C66 32 60 24 50 24c4 6 9 14 9.5 24L60 76l7 4c-1-12-1-22-1-34z" fill="' + hc + '" ' + fl + '/></g>';
    s += '<path display="' + D(st === 'lateral') + '" d="M33.5 45c-2-15 6-23 17-23 9 0 16 5 16 15-8-5-18-4-33 8z" fill="' + hc + '" ' + fl + '/>';
    s += '<g display="' + D(c.ear === 'pino') + '" stroke-width="1.2"><circle cx="33.6" cy="52.4" r="1.9" fill="' + c.acc + '"/><circle cx="66.4" cy="52.4" r="1.9" fill="' + c.acc + '"/></g>';
    s += '<g display="' + D(c.ear === 'pingente') + '" stroke-width="1.2"><path d="M33.5 51.6v3.6M66.5 51.6v3.6" fill="none"/><circle cx="33.5" cy="57" r="2.4" fill="' + c.acc + '"/><circle cx="66.5" cy="57" r="2.4" fill="' + c.acc + '"/></g>';
    s += '<g display="' + D(c.ear === 'argola') + '" fill="none"><circle cx="32.4" cy="55.6" r="3.8" stroke-width="3.4"/><circle cx="67.6" cy="55.6" r="3.8" stroke-width="3.4"/><circle cx="32.4" cy="55.6" r="3.8" stroke="' + c.acc + '" stroke-width="1.5"/><circle cx="67.6" cy="55.6" r="3.8" stroke="' + c.acc + '" stroke-width="1.5"/></g>';
    // ---- rosto: extras sob os olhos
    s += '<g display="' + D(c.blush) + '" stroke="none"><ellipse cx="39.6" cy="53" rx="3.4" ry="2.1" fill="#F5A9D6"/><ellipse cx="60.4" cy="53" rx="3.4" ry="2.1" fill="#F5A9D6"/></g>';
    s += '<g display="' + D(c.sardas) + '" stroke="none" fill="#0E0E12" opacity=".6"><circle cx="40" cy="52" r=".7"/><circle cx="43" cy="53.4" r=".7"/><circle cx="41.4" cy="54.8" r=".7"/><circle cx="60" cy="52" r=".7"/><circle cx="57" cy="53.4" r=".7"/><circle cx="58.6" cy="54.8" r=".7"/></g>';
    s += '<circle display="' + D(c.pinta) + '" cx="58" cy="53.8" r=".9" fill="#0E0E12" stroke="none"/>';
    // ---- sobrancelhas
    let b = c.brows;
    s += '<path display="' + D(b === 'fina') + '" d="M40.5 42.5l4.5-.8M59.5 42.5l-4.5-.8" fill="none"/>';
    s += '<path display="' + D(b === 'grossa') + '" d="M40.3 42.6l4.8-.9M59.7 42.6l-4.8-.9" fill="none" stroke-width="2.8"/>';
    s += '<path display="' + D(b === 'arqueada') + '" d="M40 43.2c2-2.6 4-2.8 5.4-1.8M60 43.2c-2-2.6-4-2.8-5.4-1.8" fill="none" stroke-width="1.5"/>';
    s += '<path display="' + D(b === 'franzida') + '" d="M40.2 41.4l4.8 1.8M59.8 41.4l-4.8 1.8" fill="none"/>';
    // ---- olhos
    let e = c.eyes;
    s += '<g display="' + D(e === 'ponto' || e === 'sonolento') + '" fill="#0E0E12" stroke="none"><circle cx="44" cy="47" r="1.5"/><circle cx="56" cy="47" r="1.5"/></g>';
    s += '<path display="' + D(e === 'sonolento') + '" d="M41.6 45.5h4.8M53.6 45.5h4.8" fill="none" stroke-width="1.5"/>';
    s += '<g display="' + D(e === 'grande') + '" stroke="none"><ellipse cx="44" cy="47" rx="2.2" ry="2.8" fill="#0E0E12"/><ellipse cx="56" cy="47" rx="2.2" ry="2.8" fill="#0E0E12"/><circle cx="44.8" cy="46" r=".8" fill="#FFFFFF"/><circle cx="56.8" cy="46" r=".8" fill="#FFFFFF"/></g>';
    s += '<path display="' + D(e === 'feliz') + '" d="M41.6 48.2c1-2.9 3.8-2.9 4.8 0M53.6 48.2c1-2.9 3.8-2.9 4.8 0" fill="none" stroke-width="1.5"/>';
    s += '<path display="' + D(e === 'sereno') + '" d="M41.6 46.4c1 2.5 3.8 2.5 4.8 0M53.6 46.4c1 2.5 3.8 2.5 4.8 0" fill="none" stroke-width="1.5"/>';
    s += '<g display="' + D(e === 'piscada') + '"><circle cx="44" cy="47" r="1.5" fill="#0E0E12" stroke="none"/><path d="M53.6 46.4c1 2.5 3.8 2.5 4.8 0" fill="none" stroke-width="1.5"/></g>';
    s += '<path display="' + D(c.lashes) + '" d="M42 46l-1.8-1.2M58 46l1.8-1.2" fill="none" stroke-width="1.2"/>';
    s += '<path d="M50.5 47l-1.5 6h2.5" fill="none" stroke-width="1.3"/>';
    // ---- bigode e boca
    s += '<path display="' + D(fh === 'bigode' || fh === 'cavanhaque') + '" d="M43.5 56.5c2-3 5-3 6.5-1 1.5-2 4.5-2 6.5 1-2.5 0-4.5-.8-6.5-.3-2-.5-4 .3-6.5.3z" fill="' + hc + '" stroke="none"/>';
    let ms = '#0E0E12', m = c.mouth;
    s += '<path display="' + D(m === 'sorriso') + '" d="M46 57.5c2.5 2 5.5 2 8 0" fill="none" stroke="' + ms + '" stroke-width="1.4"/>';
    s += '<path display="' + D(m === 'sorrisao') + '" d="M45.4 56.6c1.4 5.4 7.8 5.4 9.2 0z" fill="#FFFFFF" stroke="' + ms + '" stroke-width="1.4"/>';
    s += '<path display="' + D(m === 'neutra') + '" d="M46.5 58.4h7" fill="none" stroke="' + ms + '" stroke-width="1.4"/>';
    s += '<path display="' + D(m === 'lado') + '" d="M46.2 58.8c3.2.6 5.6-.6 8-2.8" fill="none" stroke="' + ms + '" stroke-width="1.4"/>';
    s += '<ellipse display="' + D(m === 'surpresa') + '" cx="50" cy="58.6" rx="1.9" ry="2.4" fill="#0E0E12" stroke="none"/>';
    // ---- óculos
    let g = c.glasses;
    s += '<g display="' + D(g === 'redondo') + '" fill="none" stroke-width="1"><circle cx="43.5" cy="47" r="5.2"/><circle cx="56.5" cy="47" r="5.2"/><path d="M48.7 46.5h2.6M38.3 46l-4-1M61.7 46l4-1"/></g>';
    s += '<g display="' + D(g === 'quadrado') + '" fill="none" stroke-width="1.3"><rect x="37.8" y="42.8" width="10.6" height="8.4" rx="2"/><rect x="51.6" y="42.8" width="10.6" height="8.4" rx="2"/><path d="M48.4 46h3.2M37.8 45.5l-3.8-1M62.2 45.5l3.8-1"/></g>';
    s += '<g display="' + D(g === 'gatinho') + '" fill="none" stroke-width="1.3"><path d="M37.6 44.5c0-1.4.8-2.2 2-2.2h8.2c0 4.8-2 8.4-5.8 8.4-2.8 0-4.4-2.4-4.4-6.2zM62.4 44.5c0-1.4-.8-2.2-2-2.2h-8.2c0 4.8 2 8.4 5.8 8.4 2.8 0 4.4-2.4 4.4-6.2z"/><path d="M47.8 45.4h4.4M37.6 44.5l-3.6-1M62.4 44.5l3.6-1"/></g>';
    s += '<g display="' + D(g === 'escuros') + '" stroke-width="1.2"><path d="M38 43.4h10.4c.4 4.8-1.4 8.2-5.2 8.2-3 0-5.2-2.4-5.2-8.2zM62 43.4H51.6c-.4 4.8 1.4 8.2 5.2 8.2 3 0 5.2-2.4 5.2-8.2z" fill="#0E0E12"/><path d="M48.4 44.4h3.2M38 43.8l-4-.8M62 43.8l4-.8" fill="none"/><path d="M40.2 45.4l2.6-.9M53.8 45.4l2.6-.9" fill="none" stroke="#FFFFFF" stroke-width="1"/></g>';
    // ---- na cabeça
    let A = c.acc, h = c.head;
    // gorro: touca de tricô com barra dobrada, nervuras e pompom
    s += '<g display="' + D(h === 'gorro') + '"><path d="M33.2 38c-.8-13 6.4-18.6 16.8-18.6S67.6 25 66.8 38z" fill="' + A + '"/><path d="M41.6 24.4c-1.2 4-1.6 9-1.4 13.6M50 21v17M58.4 24.4c1.2 4 1.6 9 1.4 13.6" fill="none" stroke-width=".9" opacity=".55"/><rect x="31.8" y="34.4" width="36.4" height="8" rx="3.6" fill="' + A + '"/><path d="M36.6 35.8v5.2M41 35.8v5.2M45.4 35.8v5.2M50 35.8v5.2M54.6 35.8v5.2M59 35.8v5.2M63.4 35.8v5.2" fill="none" stroke-width=".9" opacity=".55"/><circle cx="50" cy="17.6" r="4.2" fill="' + A + '"/><path d="M47.6 16.4c.8-1 2-1.4 3.2-1M48 19.2c1.2.8 2.8.6 3.8-.4" fill="none" stroke-width=".8" opacity=".6"/></g>';
    // boné: gomos, botão e aba curva com sombra
    s += '<g display="' + D(h === 'bone') + '"><path d="M33.6 38.4c-.6-11.6 6-16.4 16.4-16.4s17 4.8 16.4 16.4z" fill="' + A + '"/><path d="M50 22.4v16M41.4 24.2c-2.4 3.6-3.4 8-3.4 14.2M58.6 24.2c2.4 3.6 3.4 8 3.4 14.2" fill="none" stroke-width="1" opacity=".6"/><circle cx="50" cy="22.4" r="1.5" fill="' + A + '"/><path d="M29.8 38.8c6.2-2.2 13.4-3.2 20.2-3.2s14 1 20.2 3.2c-.8 4.8-9 7.2-20.2 7.2s-19.4-2.4-20.2-7.2z" fill="' + A + '"/><path d="M34 41.4c5 1.6 10.4 2.2 16 2.2s11-.6 16-2.2" fill="none" stroke-width=".9" opacity=".6"/></g>';
    // fone de ouvido: arco colorido com contorno e conchas almofadadas
    s += '<g display="' + D(h === 'fone') + '"><path d="M31.6 47c-1.6-19 7-27.6 18.4-27.6S68 28 66.4 47" fill="none" stroke-width="4.6"/><path d="M31.6 47c-1.6-19 7-27.6 18.4-27.6S68 28 66.4 47" fill="none" stroke="' + A + '" stroke-width="2"/><rect x="27.8" y="42.4" width="6.8" height="13" rx="3.4" fill="' + A + '"/><rect x="65.4" y="42.4" width="6.8" height="13" rx="3.4" fill="' + A + '"/><path d="M31.2 46.4v5M68.8 46.4v5" fill="none" stroke-width=".9" opacity=".6"/></g>';
    // headset: o fone com a haste e o microfone
    s += '<g display="' + D(h === 'headset') + '"><path d="M31.6 47c-1.6-19 7-27.6 18.4-27.6S68 28 66.4 47" fill="none" stroke-width="4.6"/><path d="M31.6 47c-1.6-19 7-27.6 18.4-27.6S68 28 66.4 47" fill="none" stroke="' + A + '" stroke-width="2"/><rect x="65.4" y="42.4" width="6.8" height="13" rx="3.4" fill="' + A + '"/><rect x="27.8" y="42.4" width="6.8" height="13" rx="3.4" fill="' + A + '"/><path d="M30.6 55.2c.6 6.6 5.8 9.6 12.6 9.8" fill="none" stroke-width="1.8"/><rect x="41.6" y="62.4" width="6" height="4" rx="2" fill="' + A + '"/></g>';
    // faixa: faixa esportiva com listra
    s += '<g display="' + D(h === 'faixa') + '"><path d="M33.4 40.4c.4-11.6 7-17.8 16.6-17.8s16.2 6.2 16.6 17.8c-3.8-4.8-9.8-7.6-16.6-7.6s-12.8 2.8-16.6 7.6z" fill="' + A + '"/><path d="M35.2 38.2c3.4-3.8 8.4-6 14.8-6s11.4 2.2 14.8 6" fill="none" stroke="#FFFFFF" stroke-width="1.3"/></g>';
    // bandana: nó de lado com pontas, dobra e estampa
    s += '<g display="' + D(h === 'bandana') + '"><path d="M33.4 42.4c0-12.4 7-19.8 16.6-19.8s16.6 7.4 16.6 19.8c-4.4-2.6-9.8-3.8-16.6-3.8s-12.2 1.2-16.6 3.8z" fill="' + A + '"/><path d="M34.8 38.6c4.6-2 9.4-3 15.2-3s10.6 1 15.2 3" fill="none" stroke-width=".9" opacity=".6"/><g fill="#FFFFFF" stroke="none"><circle cx="41" cy="32.2" r=".9"/><circle cx="50" cy="29.6" r=".9"/><circle cx="59" cy="32.2" r=".9"/><circle cx="45.4" cy="35.6" r=".9"/><circle cx="54.6" cy="35.6" r=".9"/><path d="M50 32.4l1.2 1.4-1.2 1.4-1.2-1.4z"/></g><path d="M66.4 41.2l6.6-4.4.8 8.4zM66.4 41.2l5.6 6.4-8.2.6z" fill="' + A + '"/><circle cx="66.6" cy="41.4" r="2.4" fill="' + A + '"/></g>';
    // laço: duas asas com dobras, nó e pontas
    s += '<g display="' + D(h === 'laco') + '"><path d="M60 26.6c-3.2-7.4-10-9-11.8-5.6-1.2 2.6.6 8.6 11.8 5.6zM60 26.6c3.2-7.4 10-9 11.8-5.6 1.2 2.6-.6 8.6-11.8 5.6z" fill="' + A + '"/><path d="M55.2 22.4c-2 1-3.2 3-3.6 4.8M64.8 22.4c2 1 3.2 3 3.6 4.8" fill="none" stroke-width=".9" opacity=".6"/><path d="M58.6 28.6l-2.6 6.8 3.2-1.4zM61.4 28.6l2.6 6.8-3.2-1.4z" fill="' + A + '"/><circle cx="60" cy="26.6" r="2.7" fill="' + A + '"/></g>';
    // flor: seis pétalas, miolo e duas folhas
    s += '<g display="' + D(h === 'flor') + '"><path d="M43.8 37c3.2-.2 5.6-2.2 6.2-4.8-3 .2-5.6 2.2-6.2 4.8zM46.4 33.2c3.4.6 6.2-.6 7.4-3-3.2-.6-6 .6-7.4 3z" fill="#8FE3C8"/><g fill="' + A + '"><circle cx="39" cy="24.4" r="3.6"/><circle cx="43.4" cy="27" r="3.6"/><circle cx="43.4" cy="32" r="3.6"/><circle cx="39" cy="34.6" r="3.6"/><circle cx="34.6" cy="32" r="3.6"/><circle cx="34.6" cy="27" r="3.6"/></g><circle cx="39" cy="29.5" r="2.8" fill="#F3D36B"/></g>';

    // chapéu (fedora): aba larga atrás, copa alta vincada na frente, fita escura com fivela
    s += '<g display="' + D(h === 'chapeu') + '"><path d="M24.6 38c0-4.4 11.2-7.6 25.4-7.6S75.4 33.6 75.4 38c0 3.8-9.6 6-25.4 6S24.6 41.8 24.6 38z" fill="' + A + '"/><path d="M35.2 37.6c-.5-9.6.6-17.6 6.4-19.2 2.6-.7 5.2-.2 8.4-.2s5.8-.5 8.4.2c5.8 1.6 6.9 9.6 6.4 19.2-4 2.4-9.2 3.4-14.8 3.4s-10.8-1-14.8-3.4z" fill="' + A + '"/><path d="M42.4 20.2c3.2 2.6 11.8 2.6 15.2 0M37.6 26c2 1.8 3.4 4.4 3.8 7.4M62.4 26c-2 1.8-3.4 4.4-3.8 7.4" fill="none" stroke-width="1" opacity=".6"/><path d="M35 32.6c4.4 2.2 9.8 3.2 15 3.2s10.6-1 15-3.2v4.4c-4.4 2.2-9.8 3.4-15 3.4s-10.6-1.2-15-3.4z" fill="#0E0E12"/><rect x="46.6" y="33.2" width="6.8" height="5" rx="1" fill="none" stroke="#FFFFFF" stroke-width="1"/></g>';
    // bucket: copa redonda, aba caída em todo o contorno com costuras e ilhós
    s += '<g display="' + D(h === 'bucket') + '" transform="translate(0 -2.8)"><path d="M25.8 40.6c0-5.2 10.4-8.8 24.2-8.8s24.2 3.6 24.2 8.8c0 3.6-9.8 5.8-24.2 5.8s-24.2-2.2-24.2-5.8z" fill="' + A + '"/><path d="M29.4 41c4.2 2.8 11.4 3.8 20.6 3.8s16.4-1 20.6-3.8" fill="none" stroke-width="1" opacity=".6"/><path d="M34.8 38.6c-1-11 3.8-18.2 15.2-18.2s16.2 7.2 15.2 18.2c-4 2.2-9.4 3.2-15.2 3.2s-11.2-1-15.2-3.2z" fill="' + A + '"/><path d="M35.6 33c4.2 2 9.2 2.8 14.4 2.8s10.2-.8 14.4-2.8" fill="none" stroke-width="1" opacity=".6"/><circle cx="37" cy="28.4" r="1" fill="#0E0E12" stroke="none"/><circle cx="63" cy="28.4" r="1" fill="#0E0E12" stroke="none"/></g>';
    // boina: bojo inclinado para a esquerda, faixa na base, rabinho e dobras que saem dele
    s += '<g display="' + D(h === 'boina') + '"><path d="M27.4 38c-2.8-10 7.8-17.6 22.8-17.6 12.4 0 21 5.4 19.6 13.2-.8 4.8-9.2 7.2-19.8 7.2-5.4 0-9.6-.6-13.6-1.4-3.6-.8-7.6-.6-9-1.4z" fill="' + A + '"/><path d="M57 21.4c-5 3-9.4 8-11.6 14.6M57 21.4c1 5 .8 10.2-.4 15.4M57 21.4c5 3 8.8 7.4 11 12.4" fill="none" stroke-width=".9" opacity=".55"/><path d="M57.4 21.6l1.4-4" fill="none" stroke-width="2.4"/><path d="M34.4 37c4.8 2.8 10.4 3.8 15.6 3.8s10.8-1 15.6-3.8l.2 3.6c-4.8 3-10.8 4.2-15.8 4.2s-11-1.2-15.8-4.2z" fill="' + A + '"/></g>';

    s += '</g><g display="' + D(c.crown) + '"><path d="M66 6l5 8 6-6 5 8 6-5-3 17H69z" fill="#F3D36B" stroke="#0E0E12" stroke-width="2" stroke-linejoin="round"/></g></svg>';
    return s;
  }


/** Monta o SVG do avatar a partir da configuração salva. Tudo que entra no desenho passa por lista de valores conhecidos ou por cor #RRGGBB. */
export function avatarSvg(p: AvatarConfig, size: number, id: string, label: string): string {
  const gl = !!p.glasses;
  const cfg: Cfg = {
    skin: color(p.skin, WHITE), bg: color(p.bg, '#F2F1EE'), hair: pick(p.hairStyle, HAIRS, 'curto'), hc: color(p.hairColor, INK),
    eyes: pick(p.eyes, EYES, 'ponto'), brows: pick(p.brows, BROWS, 'fina'), mouth: pick(p.mouth, MOUTHS, 'sorriso'),
    shirt: pick(p.shirtStyle, SHIRTS, 'clara'), facial: pick(p.facialHair, FACIAL, 'nenhum'),
    glasses: gl ? pick(p.glassesShape, GLASSES_SHAPES, 'redondo') : 'nenhum',
    head: pick(p.headwear, HEADWEAR, 'nenhum'), acc: color(p.accessoryColor, '#F3D36B'),
    ear: p.earringStyle ? pick(p.earringStyle, EARRINGS, 'nenhum') : p.earrings ? 'pino' : 'nenhum', // `earrings` é o campo antigo (sim/não)
    lashes: !!p.lashes, sardas: !!p.freckles, blush: !!p.blush, pinta: !!p.beautyMark, crown: !!p.crown,
  };
  const n = Number(size);
  return buildSvg(cfg, Number.isFinite(n) ? n : 160, id.replace(/[^a-zA-Z0-9]/g, ''), esc(label));
}
