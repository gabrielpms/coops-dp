import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.BASE ?? 'http://localhost:3000';
const S = process.env.SHOTS ?? '/tmp/coops-ev-';
const b = await chromium.launch(); const errors = [];
const mk = async () => { const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage(); p.on('pageerror', (e) => errors.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/40[0-9]/.test(m.text())) errors.push('console ' + m.text()); }); return p; };
const stamp = Date.now(); const icEmail = `ev${stamp}@x.com`;
const next = async (p, n = 1) => { for (let i = 0; i < n; i++) { await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); } };
const p = await mk();
await p.goto(BASE + '/cadastro'); await p.fill('#cad-nome', 'Marina Gestora'); await p.fill('#cad-email', `me${stamp}@x.com`); await p.fill('#cad-senha', 'senha-forte-123');
await p.click('button[type=submit]'); await p.waitForURL('**/primeiro-acesso'); await p.waitForLoadState('networkidle');
const ids = await p.evaluate(async (ic) => {
  const j = async (u, bd) => (await fetch(u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(bd) })).json();
  const pr = (await j('/api/projects', { name: 'Nimbo Pay', segment: 'Fintech', skills: ['Pesquisa'] })).project.id;
  const joana = (await j(`/api/projects/${pr}/members`, { name: 'Joana Reis', email: ic })).person.id;
  return { pr, joana };
}, icEmail);
const ev = `${BASE}/p/${ids.pr}/pessoas/${ids.joana}/eventos`;
await p.goto(ev); await p.waitForSelector('h1:text-is("Eventos")');
await p.click('button:text-is("+ Evento")'); console.log('picker com 5 tipos:', await p.locator('[role=dialog] button.coops-card').count());
await p.click('[role=dialog] button.coops-card:has-text("Check-in")'); await p.waitForSelector('input[aria-label="Título do evento"]');
await next(p); console.log('título obrigatório:', await p.locator('span[role=alert]').first().innerText());
await p.fill('input[aria-label="Título do evento"]', 'Espaço para pesquisa no squad'); await next(p); await p.fill('textarea[aria-label="Resumo da conversa"]', 'Carga alta; ajustamos o escopo.'); await next(p);
for (const [aria, txt] of [['Pedido', 'Participar do planejamento'], ['Item de radar', 'Carga alta no fechamento'], ['Combinado', 'Testar bloco de pesquisa'], ['Item do próximo encontro', 'Joana traz o roteiro']]) { await p.fill(`input[aria-label="${aria}"]`, txt); await p.keyboard.press('Enter'); await next(p); }
await p.click('button:text-is("Registrar evento")'); await p.waitForSelector('button[aria-label="Abrir o evento Espaço para pesquisa no squad"]', { timeout: 10000 }); await p.waitForTimeout(400);
await p.click('button[aria-label="Abrir o evento Espaço para pesquisa no squad"]'); await p.waitForSelector('[role=dialog]:has-text("PEDIDOS")'); await p.waitForTimeout(500); await p.screenshot({ path: S + '1-foco.png' });
await p.click('button:text-is("Publicar")'); console.log('comentário vazio:', await p.locator('span[role=alert]').first().innerText());
await p.fill('textarea[aria-label="Adicionar comentário"]', 'Obrigada pelo espaço!'); await p.click('button:text-is("Publicar")'); await p.waitForSelector('text=Obrigada pelo espaço!'); await p.waitForTimeout(500);
await p.reload(); await p.click('button[aria-label^="Abrir o evento Espaço"]'); console.log('comentário persistiu:', await p.locator('text=Obrigada pelo espaço!').waitFor({ timeout: 4000 }).then(() => true).catch(() => false));
await p.click('button:text-is("Arquivar")'); await p.waitForTimeout(1500);
console.log('pills:', (await p.locator('[role=tab]').allInnerTexts()).join(' | '));
await p.click('[role=tab]:has-text("Arquivados")'); console.log('arquivado cinza:', (await p.locator('button[aria-label^="Abrir o evento Espaço"]').innerText()).includes('ARQUIVADO'));
// mudança de time e promoção
await p.click('[role=tab]:has-text("Todos")'); await p.click('button:text-is("+ Evento")'); await p.click('[role=dialog] button.coops-card:has-text("Promoção")'); await p.fill('input[aria-label="Título do evento"]', 'Promovida a Senior'); await next(p, 2);
await p.fill('#ev-de', 'Product Designer'); await p.fill('#ev-para', 'Senior Product Designer'); await next(p, 2); await p.click('button:text-is("Registrar evento")'); await p.waitForSelector('button[aria-label="Abrir o evento Promovida a Senior"]', { timeout: 10000 });
console.log('promoção registrada: true'); await p.screenshot({ path: S + '2-eventos.png' });
// IC: feedback próprio, sem outros tipos; entrega vira evento; comenta
const q = await mk(); await q.goto(BASE + '/cadastro'); await q.fill('#cad-nome', 'Joana Reis'); await q.fill('#cad-email', icEmail); await q.fill('#cad-senha', 'senha-forte-123'); await q.click('button[type=submit]'); await q.waitForURL('**/hub');
await q.goto(ev); await q.click('button:text-is("+ Evento")'); await q.waitForSelector('input[aria-label="Título do evento"]'); console.log('IC vai direto ao feedback (sem escolher tipo): true');
await q.fill('input[aria-label="Título do evento"]', 'A síntese ajudou o squad'); await next(q); await q.fill('textarea[aria-label="O que foi dito"]', 'Comentaram no review.'); await next(q); await q.fill('input[aria-label="Autor do feedback"]', 'Squad onboarding'); await next(q); await next(q);
await q.click('button:text-is("Registrar evento")'); await q.waitForSelector('button[aria-label="Abrir o evento A síntese ajudou o squad"]', { timeout: 10000 }); console.log('IC registrou o próprio feedback: true');
const st = await q.evaluate(async (pid) => (await fetch(`/api/people/${pid}/events`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'PROMOCAO', title: 'x' }) })).status, ids.joana); console.log('IC não registra promoção (esperado 403):', st);
await q.evaluate(async (pid) => { await fetch(`/api/people/${pid}/deliveries`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'Captura guiada', status: 'ENTREGUE' }) }); }, ids.joana);
await q.reload(); await q.waitForSelector('button[aria-label="Abrir o evento Captura guiada"]'); console.log('entrega aparece como evento: true');
await q.click('button[aria-label="Abrir o evento Promovida a Senior"]'); await q.fill('textarea[aria-label="Adicionar comentário"]', 'Obrigada!'); await q.click('button:text-is("Publicar")'); await q.waitForSelector('text=Obrigada!'); console.log('IC comenta no evento do manager: true');
console.log('ERROS:', errors.length ? errors : 'nenhum'); await b.close();
