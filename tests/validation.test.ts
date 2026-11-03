import { describe, expect, it } from 'vitest';
import { projectSchema, signupSchema, hostOf } from '@/lib/validation';

describe('projectSchema (regras do deck de projeto, PRD M3)', () => {
  const ok = { name: 'Nimbo Pay', segment: 'Fintech', skills: ['Pesquisa com usuários'] };
  it('aceita o mínimo: empresa, segmento e 1 skill', () => expect(projectSchema.parse(ok).invites).toEqual([]));
  it('exige nome', () => expect(() => projectSchema.parse({ ...ok, name: '  ' })).toThrow());
  it('exige segmento válido', () => expect(() => projectSchema.parse({ ...ok, segment: 'Outro' })).toThrow());
  it('exige ao menos 1 skill', () => expect(() => projectSchema.parse({ ...ok, skills: [] })).toThrow());
  it('valida e-mail dos convites', () => expect(() => projectSchema.parse({ ...ok, invites: [{ name: 'A', email: 'x', position: 'IC' }] })).toThrow());
});
describe('signupSchema', () => {
  it('normaliza o e-mail', () => expect(signupSchema.parse({ name: 'A', email: ' A@B.com ', role: 'IC' }).email).toBe('a@b.com'));
  it('só aceita IC ou MANAGER', () => expect(() => signupSchema.parse({ name: 'A', email: 'a@b.com', role: 'ADMIN' })).toThrow());
});
describe('hostOf', () => {
  it('extrai o host sem www', () => expect(hostOf('https://www.nubank.com.br/x')).toBe('nubank.com.br'));
  it('aceita link sem protocolo', () => expect(hostOf('figma.com/file')).toBe('figma.com'));
});
