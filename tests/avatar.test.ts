import { describe, expect, it } from 'vitest';
import { avatarSvg, HAIRS, HEADWEAR } from '@/components/avatar/avatarSvg';
import { avatarSchema } from '@/lib/validation';

describe('avatar', () => {
  it('desenha todos os cabelos e peças de cabeça sem erro', () => {
    for (const h of HAIRS) expect(avatarSvg({ hairStyle: h }, 100, 'x', 'Avatar')).toContain('<svg');
    for (const w of HEADWEAR) expect(avatarSvg({ headwear: w }, 100, 'x', 'Avatar')).toContain('</svg>');
  });
  it('só mostra o que foi escolhido', () => {
    const svg = avatarSvg({ headwear: 'gorro', earringStyle: 'argola' }, 100, 'x', 'Avatar');
    expect(svg).toContain('<g display="inline"><path d="M33.2 38c'); // gorro visível
    expect(svg).toContain('<g display="inline" fill="none"><circle cx="32.4"'); // argola visível
    const plain = avatarSvg({}, 100, 'x', 'Avatar');
    expect(plain).toContain('<g display="none"><path d="M33.2 38c'); // sem gorro
    expect(plain).toContain('<g display="none" fill="none"><circle cx="32.4"');
  });
  it('mantém o campo antigo de brincos (sim/não) como pino', () => {
    expect(avatarSvg({ earrings: true }, 100, 'x', 'Avatar')).toContain('cx="33.6" cy="52.4"');
  });
  it('não deixa texto de fora entrar no desenho', () => {
    const evil = '"><script>alert(1)</script>';
    const svg = avatarSvg({ skin: evil, bg: evil, hairColor: evil, accessoryColor: evil, hairStyle: evil, headwear: evil, eyes: evil, glassesShape: evil, glasses: true }, 100, 'a"b', evil);
    expect(svg).not.toContain('<script');
    expect(svg).not.toContain(evil);
  });
  it('a validação aceita os campos novos', () => {
    const r = avatarSchema.parse({ hairColor: '#5A3825', eyes: 'feliz', headwear: 'bucket', earringStyle: 'argola', accessoryColor: '#F5A9D6', freckles: true });
    expect(r.headwear).toBe('bucket');
    expect(r.earringStyle).toBe('argola');
  });
});
