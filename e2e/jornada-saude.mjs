import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.BASE ?? 'http://localhost:3000';
const S = process.env.SHOTS ?? '/tmp/coops-js-';
const b = await chromium.launch(); const errors = [];
const mk = async () => { const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage(); p.on('pageerror', (e) => errors.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/40[0-9]/.test(m.text())) errors.push('console ' + m.text()); }); return p; };
const stamp = Date.now(); const icEmail = `jo${stamp}@x.com`;
const next = async (p, n = 1) => { for (let i = 0; i < n; i++) { await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); } };
const p = await mk();
await p.goto(BASE + '/cadastro'); await p.fill('#cad-nome', 'Marina Gestora'); await p.fill('#cad-email', `mj${stamp}@x.com`); await p.fill('#cad-senha', 'senha-forte-123');
await p.click('button[type=submit]'); await p.waitForURL('**/primeiro-acesso'); await p.waitForLoadState('networkidle');
const ids = await p.evaluate(async (ic) => {
  const j = async (u, bd) => (await fetch(u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(bd) })).json();
  const pr = (await j('/api/projects', { name: 'Nimbo Pay', segment: 'Fintech', skills: ['Pesquisa com usuários', 'Facilitação'] })).project.id;
  const joana = (await j(`/api/projects/${pr}/members`, { name: 'Joana Reis', email: ic })).person.id;
  return { pr, joana };
}, icEmail);
await p.goto(`${BASE}/p/${ids.pr}/time`); await p.click('a[aria-label="Abrir Marina Gestora"]'); await p.waitForURL(/pessoas\//); const me = p.url().split('/pessoas/')[1];
console.log('perfil: cartas Jornada e Saúde ativas:', await p.locator('a[aria-label="Abrir o deck de Jornada"]').isVisible() && await p.locator('a[aria-label="Abrir o deck de Saúde"]').isVisible());
// ---- jornada
await p.goto(`${BASE}/p/${ids.pr}/pessoas/${me}/jornada`); await p.waitForSelector('h1:text-is("Jornada")');
await p.click('button:text-is("+ Carta")'); await p.click('[role=dialog] button.coops-card:has-text("Objetivo")'); await p.waitForSelector('textarea[aria-label="Objetivo"]');
await next(p); console.log('objetivo obrigatório:', await p.locator('span[role=alert]').first().innerText());
await p.fill('textarea[aria-label="Objetivo"]', 'Liderar a pesquisa de onboarding'); await next(p, 2);
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(400); console.log('sinal obrigatório:', await p.locator('span[role=alert]').first().innerText());
await p.fill('textarea[aria-label="Sinal"]', 'Síntese apresentada para produto e engenharia'); await next(p);
await p.click('button:text-is("Criar carta")'); await p.waitForSelector('button[aria-label="Abrir Liderar a pesquisa de onboarding"]', { timeout: 10000 }); await p.waitForTimeout(400);
await p.locator('article:has-text("Liderar a pesquisa") button[aria-label="Progresso 3 de 5"]').click(); await p.waitForTimeout(2000);
await p.reload(); console.log('progresso 3/5 persistiu:', (await p.locator('article:has-text("Liderar a pesquisa")').innerText()).includes('3/5'));
// foco
await p.click('button:text-is("+ Carta")'); await p.click('[role=dialog] button.coops-card:has-text("Foco de desenvolvimento")'); await p.fill('input[aria-label="Skill"]', 'Facilitação'); await next(p);
await p.click('[role=radiogroup][aria-label="Nível hoje"] button:text-is("4")'); await p.click('[role=radiogroup][aria-label="Meta no fim do ciclo"] button:text-is("3")'); await next(p);
console.log('meta maior que o nível:', await p.locator('span[role=alert]').first().innerText());
await p.click('[role=radiogroup][aria-label="Meta no fim do ciclo"] button:text-is("5")'); await next(p, 2); await p.click('button:text-is("Criar carta")'); await p.waitForSelector('button[aria-label="Abrir Facilitação"]', { timeout: 10000 });
console.log('foco criado: true'); await p.screenshot({ path: S + '1-jornada.png' });
// ---- saúde
await p.goto(`${BASE}/p/${ids.pr}/pessoas/${me}/saude`); await p.waitForSelector('h1:text-is("Saúde")');
await p.click('button:text-is("Enviar check-in de saúde")'); console.log('exige as 4 respostas:', await p.locator('span[role=alert]').innerText());
const rate = async (t, n) => p.locator(`[role=radiogroup][aria-label="${t}"] button`).nth(n - 1).click();
await rate('Saúde no período', 2); await rate('Estratégia do time de design', 4); await rate('Estratégia do produto', 5); await rate('Estratégia de negócio', 4);
console.log('dica do agente p/ nota baixa:', await p.locator('.coops-pu').first().innerText().then((t) => t.includes('Sua saúde está baixa')));
await p.fill('#sd-nota', 'Semana pesada.'); await p.click('button:text-is("Enviar check-in de saúde")'); await p.waitForSelector('text=Check-in enviado ✓', { timeout: 8000 });
await p.reload(); await p.waitForTimeout(800); console.log('histórico mostra o ciclo anterior após novo envio:', await p.locator('article[aria-label="Saúde no período"]').innerText().then((t) => t.includes('Q4')));
await p.screenshot({ path: S + '2-saude.png' });
// ---- manager vê o check-in da Joana, só leitura; IC não vê o da Marina
const q = await mk(); await q.goto(BASE + '/cadastro'); await q.fill('#cad-nome', 'Joana Reis'); await q.fill('#cad-email', icEmail); await q.fill('#cad-senha', 'senha-forte-123'); await q.click('button[type=submit]'); await q.waitForURL('**/hub');
const st = await q.evaluate(async (pid) => (await fetch(`/api/people/${pid}/health`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ saude: 1, design: 3, produto: 3, negocio: 3, note: 'Preciso de ajuda' }) })).status, ids.joana);
console.log('IC envia o próprio check-in:', st);
await p.goto(`${BASE}/p/${ids.pr}/pessoas/${ids.joana}/saude`); await p.waitForSelector('text=RECADO PARA O MANAGER'); console.log('manager vê o check-in e o recado: true | sem botão de envio:', await p.locator('button:text-is("Enviar check-in de saúde")').count() === 0);
console.log('dica ao manager sobre a Joana:', await p.locator('.coops-pu').first().innerText().then((t) => t.includes('Joana')));
const mst = await p.evaluate(async (pid) => (await fetch(`/api/people/${pid}/health`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ saude: 5, design: 5, produto: 5, negocio: 5 }) })).status, ids.joana);
console.log('manager não envia check-in da Joana (esperado 403):', mst);
console.log('ERROS:', errors.length ? errors : 'nenhum'); await b.close();
