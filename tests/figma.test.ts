import { describe, expect, it } from 'vitest';
import { parseFigmaUrl } from '@/lib/figma';

describe('parseFigmaUrl', () => {
  it('lê arquivo e frame (node-id com hífen vira dois-pontos)', () => {
    expect(parseFigmaUrl('https://www.figma.com/design/AbC123xyz90/Meu-arquivo?node-id=12-345&t=x')).toEqual({ fileKey: 'AbC123xyz90', nodeId: '12:345' });
    expect(parseFigmaUrl('figma.com/file/AbC123xyz90/Nome')).toEqual({ fileKey: 'AbC123xyz90', nodeId: null });
  });
  it('usa a chave do branch quando há', () => {
    expect(parseFigmaUrl('https://www.figma.com/design/AbC123xyz90/branch/Zz9988776655/Nome')?.fileKey).toBe('Zz9988776655');
  });
  it('recusa o que não é link do Figma', () => {
    expect(parseFigmaUrl('https://example.com/design/AbC123xyz90/x')).toBeNull();
    expect(parseFigmaUrl('https://evil-figma.com/design/AbC123xyz90/x')).toBeNull();
    expect(parseFigmaUrl('texto solto')).toBeNull();
  });
});
