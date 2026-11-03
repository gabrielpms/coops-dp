import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// scrypt (nativo do Node, sem dependências). Formato guardado: scrypt$<sal>$<hash>
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('base64')}$${scryptSync(password, salt, KEYLEN).toString('base64')}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  const [alg, s, h] = (stored ?? '').split('$');
  // Sem hash guardado, ainda gasta o mesmo tempo para não revelar se a conta existe.
  const salt = Buffer.from(alg === 'scrypt' && s ? s : 'AAAAAAAAAAAAAAAAAAAAAA==', 'base64');
  const expected = Buffer.from(alg === 'scrypt' && h ? h : '', 'base64');
  const actual = scryptSync(password, salt, KEYLEN);
  return expected.length === KEYLEN && timingSafeEqual(actual, expected);
}
