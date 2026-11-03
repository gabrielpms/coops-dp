import { describe, expect, it } from 'vitest';
import { projectSchema, signupSchema, hostOf } from '@/lib/validation';

describe('projectSchema (regras do deck de projeto, PRD M3)', () => {
  const ok = { name: 'Nimbo Pay', segment: 'Fintech', skills: ['Pesquisa com usuários'] };
  it('aceita o mínimo: empresa, segmento e 1 skill', () => expect(projectSchema.parse(ok).invites).toEqual([]));
  it('exige nome', () => expect(() => projectSchema.parse({ ...ok, name: '  ' })).toThrow());
  it('aceita segmento escrito pela pessoa (as tags são só atalhos)', () => expect(projectSchema.parse({ ...ok, segment: '  Seguros ' }).segment).toBe('Seguros'));
  it('exige segmento preenchido', () => expect(() => projectSchema.parse({ ...ok, segment: '   ' })).toThrow());
  it('limita o segmento a 60 caracteres', () => expect(() => projectSchema.parse({ ...ok, segment: 'x'.repeat(61) })).toThrow());
  it('exige ao menos 1 skill', () => expect(() => projectSchema.parse({ ...ok, skills: [] })).toThrow());
  it('valida e-mail dos convites', () => expect(() => projectSchema.parse({ ...ok, invites: [{ name: 'A', email: 'x', position: 'IC' }] })).toThrow());
});
describe('signupSchema', () => {
  it('normaliza o e-mail', () => expect(signupSchema.parse({ name: 'A', email: ' A@B.com ', role: 'IC', password: '12345678' }).email).toBe('a@b.com'));
  it('só aceita IC ou MANAGER', () => expect(() => signupSchema.parse({ name: 'A', email: 'a@b.com', role: 'ADMIN', password: '12345678' })).toThrow());
});
describe('hostOf', () => {
  it('extrai o host sem www', () => expect(hostOf('https://www.nubank.com.br/x')).toBe('nubank.com.br'));
  it('aceita link sem protocolo', () => expect(hostOf('figma.com/file')).toBe('figma.com'));
});

import { wishlistSchema } from '@/lib/validation';
describe('wishlistSchema (M1)', () => {
  const ok = { email: 'A@B.com', role: 'Designer IC', consent: true };
  it('aceita o mínimo e normaliza o e-mail', () => expect(wishlistSchema.parse(ok).email).toBe('a@b.com'));
  it('exige o aceite de comunicações', () => expect(() => wishlistSchema.parse({ ...ok, consent: false })).toThrow());
  it('exige e-mail válido', () => expect(() => wishlistSchema.parse({ ...ok, email: 'x' })).toThrow());
  it('só aceita papéis conhecidos', () => expect(() => wishlistSchema.parse({ ...ok, role: 'CEO' })).toThrow());
});

import { hashPassword, verifyPassword } from '@/lib/password';
describe('senha', () => {
  it('confere a senha certa e recusa a errada', () => { const h = hashPassword('senha-forte-123'); expect(verifyPassword('senha-forte-123', h)).toBe(true); expect(verifyPassword('outra-senha', h)).toBe(false); });
  it('gera hashes diferentes para a mesma senha (sal)', () => expect(hashPassword('x1234567')).not.toBe(hashPassword('x1234567')));
  it('conta sem senha nunca autentica', () => { expect(verifyPassword('qualquer', null)).toBe(false); expect(verifyPassword('', undefined)).toBe(false); });
  it('signup exige 8+ caracteres', () => expect(() => signupSchema.parse({ name: 'A', email: 'a@b.com', role: 'IC', password: '1234567' })).toThrow());
});

import { memberSchema, squadSchema } from '@/lib/validation';
describe('time (M5)', () => {
  const m = { name: 'Joana', email: 'J@x.com' };
  it('membro: exige nome e e-mail válido e normaliza o e-mail', () => { expect(memberSchema.parse(m).email).toBe('j@x.com'); expect(() => memberSchema.parse({ ...m, name: ' ' })).toThrow(); expect(() => memberSchema.parse({ ...m, email: 'x' })).toThrow(); });
  it('membro: data de entrada só no formato AAAA-MM-DD', () => { expect(memberSchema.parse({ ...m, joinedAt: '2024-03-10' }).joinedAt).toBe('2024-03-10'); expect(() => memberSchema.parse({ ...m, joinedAt: '10/03/2024' })).toThrow(); });
  it('squad: exige nome, cor em hex e ids de pessoa', () => { expect(squadSchema.parse({ name: 'Onboarding' }).color).toBe('#B7A6FF'); expect(() => squadSchema.parse({ name: '' })).toThrow(); expect(() => squadSchema.parse({ name: 'A', color: 'roxo' })).toThrow(); expect(() => squadSchema.parse({ name: 'A', members: [{ personId: 'x' }] })).toThrow(); });
});

import { categorySchema, leadershipSchema, projectDataSchema, userPatchSchema } from '@/lib/validation';
describe('administração (M4)', () => {
  it('usuário: e-mail inválido é recusado e o válido é normalizado', () => { expect(() => userPatchSchema.parse({ email: 'x' })).toThrow(); expect(userPatchSchema.parse({ email: 'A@B.com' }).email).toBe('a@b.com'); });
  it('dados do projeto: segmento livre e obrigatório', () => { expect(projectDataSchema.parse({ name: 'N', segment: 'Seguros' }).segment).toBe('Seguros'); expect(() => projectDataSchema.parse({ name: 'N', segment: ' ' })).toThrow(); });
  it('categoria: exige nome e ao menos uma skill', () => { expect(categorySchema.parse({ name: 'C', skills: ['a'] }).skills).toEqual(['a']); expect(() => categorySchema.parse({ name: 'C', skills: [] })).toThrow(); expect(() => categorySchema.parse({ name: '', skills: ['a'] })).toThrow(); });
  it('liderança: nome obrigatório; ids precisam ser uuid', () => { expect(() => leadershipSchema.parse({ name: ' ' })).toThrow(); expect(() => leadershipSchema.parse({ name: 'A', squadIds: ['x'] })).toThrow(); expect(leadershipSchema.parse({ name: 'A' }).memberIds).toEqual([]); });
});

import { deliveryImpactSchema, deliverySchema, powerUpSchema, ratingSchema, studySchema, currentCycle } from '@/lib/validation';
describe('decks da pessoa (M6)', () => {
  it('entrega: título obrigatório, status padrão e links válidos', () => { expect(deliverySchema.parse({ title: 'A' }).status).toBe('ENTREGUE'); expect(() => deliverySchema.parse({ title: ' ' })).toThrow(); expect(() => deliverySchema.parse({ title: 'A', links: ['x'] })).toThrow(); expect(deliverySchema.parse({ title: 'A', links: ['figma.com/file/1'] }).links).toHaveLength(1); });
  it('entrega: impacto não pode ser vazio', () => expect(() => deliveryImpactSchema.parse({ impact: ' ' })).toThrow());
  it('brain gym: tipo conhecido, título e tamanho entre 1 e 60', () => { expect(studySchema.parse({ type: 'LIVRO', title: 'T' }).total).toBe(10); expect(() => studySchema.parse({ type: 'FILME', title: 'T' })).toThrow(); expect(() => studySchema.parse({ type: 'LIVRO', title: 'T', total: 0 })).toThrow(); });
  it('nota: de 1 a 5', () => { const id = '8d1d6b52-0b0c-4d0c-9a52-3b1b6c6f0a11'; expect(ratingSchema.parse({ skillId: id, selfScore: 5 }).selfScore).toBe(5); expect(() => ratingSchema.parse({ skillId: id, selfScore: 6 })).toThrow(); expect(() => ratingSchema.parse({ skillId: id, managerScore: 0 })).toThrow(); });
  it('power up: tipo obrigatório e progresso de 0 a 100', () => { expect(powerUpSchema.parse({ type: 'CURSO', name: 'N' }).progress).toBe(0); expect(() => powerUpSchema.parse({ type: 'X', name: 'N' })).toThrow(); expect(() => powerUpSchema.parse({ type: 'CURSO', name: 'N', progress: 101 })).toThrow(); });
  it('ciclo trimestral', () => { expect(currentCycle(new Date(2026, 10, 3))).toBe('2026-Q4'); expect(currentCycle(new Date(2026, 0, 1))).toBe('2026-Q1'); });
});

import { healthSchema, journeySchema } from '@/lib/validation';
describe('jornada e saúde (M6)', () => {
  it('objetivo exige título e sinal', () => { expect(journeySchema.parse({ kind: 'OBJETIVO', title: 'A', signal: 's' }).kind).toBe('OBJETIVO'); expect(() => journeySchema.parse({ kind: 'OBJETIVO', title: 'A' })).toThrow(); });
  it('foco exige meta maior que o nível de hoje', () => { expect(journeySchema.parse({ kind: 'FOCO', title: 'S', levelFrom: 3, levelTo: 4 }).levelTo).toBe(4); expect(() => journeySchema.parse({ kind: 'FOCO', title: 'S', levelFrom: 4, levelTo: 4 })).toThrow(); expect(() => journeySchema.parse({ kind: 'FOCO', title: 'S' })).toThrow(); });
  it('check-in exige as 4 notas de 1 a 5', () => { expect(healthSchema.parse({ saude: 1, design: 2, produto: 3, negocio: 5 }).note).toBe(''); expect(() => healthSchema.parse({ saude: 0, design: 2, produto: 3, negocio: 5 })).toThrow(); expect(() => healthSchema.parse({ saude: 1, design: 2, produto: 3 })).toThrow(); });
});
