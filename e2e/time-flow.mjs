import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.BASE ?? 'http://localhost:3000';
const S = process.env.SHOTS ?? '/tmp/coops-time-';
const b = await chromium.launch(); const errors = [];
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
p.on('pageerror', (e) => errors.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('401') && !m.text().includes('409')) errors.push('console ' + m.text()); });
const stamp = Date.now(); const manager = `mgr${stamp}@x.com`, convidado = `joana${stamp}@x.com`;
await p.goto(BASE + '/cadastro'); await p.fill('#cad-nome', 'Marina Gestora'); await p.fill('#cad-email', manager); await p.fill('#cad-senha', 'senha-forte-123');
await p.click('button[type=submit]'); await p.waitForURL('**/primeiro-acesso'); await p.waitForLoadState('networkidle');
const id = await p.evaluate(async () => { const r = await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Nimbo Pay', segment: 'Fintech', skills: ['Pesquisa com usuários', 'Facilitação'] }) }); return (await r.json()).project.id; });
await p.goto(`${BASE}/p/${id}/time`); await p.waitForSelector('h1:text-is("Seu time, em cartas")');
console.log('vazio: chamada p/ convidar:', await p.locator('button:text-is("+ Convidar primeira pessoa")').isVisible());
console.log('vazio: chamada p/ criar squad:', await p.locator('button:text-is("+ Criar primeiro squad")').isVisible());
await p.screenshot({ path: S + '1-vazio.png' });
// convidar a primeira pessoa
await p.click('button:text-is("+ Convidar primeira pessoa")'); await p.waitForSelector('[role=dialog]');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(300); console.log('nome obrigatório:', await p.locator('span[role=alert]').innerText());
await p.fill('input[aria-label="Nome da pessoa"]', 'Joana Reis'); await p.fill('#mw-cargo', 'Senior Product Designer');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); // avatar
await p.click('button:text-is("Coque")'); await p.click('button:text-is("Blazer")');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); // skill
await p.click('button:text-is("Pesquisa com usuários")');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); // entrada
await p.fill('input[aria-label="Data de entrada"]', '2024-03-10');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); // email
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(400); console.log('e-mail obrigatório:', await p.locator('span[role=alert]').innerText());
await p.fill('input[aria-label="E-mail da pessoa"]', convidado);
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); await p.screenshot({ path: S + '2-resumo-membro.png' });
await p.click('button:text-is("Criar e convidar")'); await p.waitForSelector('a[aria-label="Abrir Joana Reis"]', { timeout: 10000 }); await p.waitForTimeout(400);
console.log('carta da pessoa:', await p.locator('text=CONVITE ENVIADO').isVisible(), '| painel de convidar sumiu:', await p.locator('button:text-is("+ Convidar primeira pessoa")').count() === 0, '| painel de squad segue:', await p.locator('button:text-is("+ Criar primeiro squad")').isVisible());
// primeiro squad com a Joana
await p.click('button:text-is("+ Criar primeiro squad")'); await p.waitForSelector('[role=dialog]');
await p.fill('input[aria-label="Nome do squad"]', 'Onboarding');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); await p.click('button[aria-label="Cor #F5A9D6"]');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650);
await p.click('button[aria-pressed]:has-text("Joana Reis")'); await p.click('button[aria-label="Coroa para Joana Reis"]');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650);
await p.click('button:text-is("Criar squad")'); await p.waitForSelector('[role=tab]:has-text("Onboarding")', { timeout: 8000 }); await p.waitForTimeout(600);
console.log('filtro do squad:', (await p.locator('[role=tab]:has-text("Onboarding")').innerText()).replace(/\s+/g, ' '), '| painéis vazios sumiram:', await p.locator('section[aria-label="Primeiros passos do time"]').count() === 0);
await p.screenshot({ path: S + '3-time.png' });
await p.reload(); await p.waitForSelector('[role=tab]:has-text("Onboarding")');
console.log('persistiu após recarregar: true');
await p.click('[role=tab]:has-text("Onboarding")'); await p.waitForTimeout(300);
console.log('filtrando pelo squad mostra:', (await p.locator('a[aria-label^="Abrir "]').allInnerTexts()).length, 'carta(s) de pessoa');
// a pessoa convidada cria conta e é vinculada à mesma carta
const p2 = await (await b.newContext()).newPage(); await p2.goto(BASE + '/cadastro'); await p2.fill('#cad-nome', 'Joana Reis'); await p2.fill('#cad-email', convidado); await p2.fill('#cad-senha', 'senha-forte-123');
await p2.click('button[type=submit]'); await p2.waitForURL('**/hub'); console.log('convidada entra direto no hub: true');
await p.reload(); await p.click('[role=tab]:has-text("Todos")'); await p.waitForTimeout(300);
console.log('carta deixa de ser "convite enviado":', await p.locator('text=CONVITE ENVIADO').count() === 0);
const st = await p2.evaluate(async (pid) => (await fetch(`/api/projects/${pid}/members`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'X', email: 'x@x.com' }) })).status, id);
console.log('IC não cria membro (esperado 403):', st);
await p2.goto(`${BASE}/p/${id}/time`); await p2.waitForURL('**/hub'); console.log('IC não vê a gestão de time: redireciona ao hub');
console.log('ERROS:', errors.length ? errors : 'nenhum'); await b.close();
