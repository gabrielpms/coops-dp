import { describe, expect, it } from 'vitest';
import { openSecret, sealSecret } from '@/lib/secret';

process.env.SESSION_SECRET = 'a'.repeat(40);

describe('senha de acesso cifrada', () => {
  it('guarda e devolve a senha, sem expô-la no texto cifrado', () => {
    const sealed = sealSecret('Senha#2026ab');
    expect(sealed).not.toContain('Senha');
    expect(openSecret(sealed)).toBe('Senha#2026ab');
  });
  it('cada cifragem é diferente e valor inválido ou vazio não quebra', () => {
    expect(sealSecret('x1234567')).not.toBe(sealSecret('x1234567'));
    expect(openSecret('lixo')).toBeNull();
    expect(openSecret(null)).toBeNull();
  });
});
