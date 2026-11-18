import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const key = () => createHash('sha256').update(`coops-access-password:${process.env.SESSION_SECRET ?? ''}`).digest();

/** Cifra (AES-256-GCM) a senha criada pela liderança para que ela possa ser consultada depois. Nunca é usada no login: quem vale é o hash. */
export function sealSecret(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString('base64')).join('.');
}

export function openSecret(sealed: string | null | undefined): string | null {
  if (!sealed) return null;
  try {
    const [iv, tag, enc] = sealed.split('.').map((s) => Buffer.from(s, 'base64'));
    const d = createDecipheriv('aes-256-gcm', key(), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
  } catch { return null; }
}
