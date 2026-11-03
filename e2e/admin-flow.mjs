import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.BASE ?? 'http://localhost:3000';
const S = process.env.SHOTS ?? '/tmp/coops-admin-';
const b = await chromium.launch(); const errors = [];
const mk = async () => { const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage(); p.on('pageerror', (e) => errors.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/40[0-9]/.test(m.text())) errors.push('console ' + m.text()); }); return p; };
const stamp = Date.now(); const mgrEmail = `adm${stamp}@x.com`, newEmail = `adm2${stamp}@x.com`, leadEmail = `lid${stamp}@x.com`, icEmail = `ic${stamp}@x.com`;
const next = async (p, n = 1) => { for (let i = 0; i < n; i++) { await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); } };
const p = await mk();
await p.goto(BASE + '/cadastro'); await p.fill('#cad-nome', 'Marina Admin'); await p.fill('#cad-email', mgrEmail); await p.fill('#cad-senha', 'senha-forte-123');
await p.click('button[type=submit]'); await p.waitForURL('**/primeiro-acesso'); await p.waitForLoadState('networkidle');
const ids = await p.evaluate(async () => {
  const j = async (u, b) => (await fetch(u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) })).json();
  const pr = (await j('/api/projects', { name: 'Nimbo Pay', segment: 'Fintech', skills: ['Pesquisa com usuários', 'Facilitação', 'Visão de negócio'] })).project.id;
  const m1 = (await j(`/api/projects/${pr}/members`, { name: 'Rafael Lima', title: 'Product Designer', email: 'rafa@x.com' })).person.id;
  const sq = (await j(`/api/projects/${pr}/squads`, { name: 'Onboarding', color: '#F5A9D6', members: [{ personId: m1, crown: false }] })).squad.id;
  return { pr, m1, sq };
});
// menu da conta -> Administração
await p.goto(BASE + '/hub'); await p.click('button[aria-label="Abrir o menu da sua conta"]'); await p.click('[role=menuitem]:has-text("Administração")'); await p.waitForURL('**/admin');
await p.waitForSelector('h1:text-is("Administração")'); console.log('menu leva à Administração: true');
await p.screenshot({ path: S + '1-admin.png' });
await p.click('button[aria-label="Gerenciar o projeto Nimbo Pay"]'); await p.waitForURL(`**/admin/${ids.pr}`); await p.waitForSelector('h1:text-is("Liderança")');
// ---- Liderança
await p.click('button:text-is("+ Adicionar liderança")'); await p.waitForSelector('[role=dialog]');
await next(p); console.log('nome/e-mail obrigatórios:', await p.locator('span[role=alert]').first().innerText());
await p.fill('input[aria-label="Nome da liderança"]', 'Bianca Rocha'); await p.click('button:text-is("Head de Design")'); await p.fill('#lw-email', leadEmail);
await next(p); await p.click('button:text-is("Blazer")'); await next(p);
await p.click('button[aria-pressed]:has-text("Onboarding")'); await next(p);
console.log('pessoa do squad já vem marcada:', await p.locator('button[aria-pressed=true]:has-text("Rafael Lima")').count() === 1);
await next(p); await p.screenshot({ path: S + '2-resumo-lid.png' });
await p.click('button:text-is("Adicionar e enviar convite")'); await p.waitForSelector('button[aria-label="Associar squads e pessoas a Bianca Rocha"]', { timeout: 10000 }); await p.waitForTimeout(500);
console.log('carta da liderança:', (await p.locator('button[aria-label="Associar squads e pessoas a Bianca Rocha"]').innerText()).replace(/\s+/g, ' ').slice(0, 120));
// edita e remove
await p.click('button[aria-label="Associar squads e pessoas a Bianca Rocha"]'); await p.waitForSelector('[role=dialog]'); await next(p, 4);
console.log('botão remover no resumo:', await p.locator('button:text-is("Remover esta liderança")').isVisible());
await p.keyboard.press('Escape'); await p.waitForTimeout(400);
// ---- Categorias
await p.click('[role=tab]:has-text("Categorias de skill")'); await p.waitForSelector('h1:text-is("Categorias de skill")');
await p.click('button:text-is("+ Nova categoria")'); await p.waitForSelector('[role=dialog]'); await next(p); console.log('nome da categoria obrigatório:', await p.locator('span[role=alert]').first().innerText());
await p.click('button:text-is("Pesquisa e descoberta")'); await next(p);
await p.click('button:has-text("+ Pesquisa com usuários")'); await p.fill('input[aria-label="Nova skill"]', 'Entrevistas'); await p.keyboard.press('Enter');
await next(p); await p.click('button:text-is("Criar categoria")'); await p.waitForSelector('button[aria-label="Editar a categoria Pesquisa e descoberta"]', { timeout: 10000 }); await p.waitForTimeout(400);
console.log('categoria criada com skills:', (await p.locator('button[aria-label="Editar a categoria Pesquisa e descoberta"]').innerText()).replace(/\s+/g, ' '));
console.log('skills sem categoria listadas:', (await p.locator('p:has-text("sem categoria")').innerText()).slice(0, 90));
await p.screenshot({ path: S + '3-categorias.png' });
// ---- Dados do projeto
await p.click('[role=tab]:has-text("Dados do projeto")'); await p.click('button[aria-label="Editar indicadores-chave"]'); await p.waitForSelector('[role=dialog]'); await p.waitForTimeout(500);
await p.click('button:has-text("+ NPS")'); await next(p, 2); await p.click('button:text-is("Salvar dados")'); await p.waitForTimeout(1500);
console.log('indicador salvo:', (await p.locator('button[aria-label="Editar indicadores-chave"]').innerText()).includes('NPS'));
await p.reload(); await p.click('[role=tab]:has-text("Dados do projeto")'); console.log('persistiu após recarregar:', (await p.locator('button[aria-label="Editar indicadores-chave"]').innerText()).includes('NPS'));
// ---- Meus dados (e-mail exige senha)
await p.click('button[aria-label="Ver os seus dados"]'); await p.waitForSelector('[role=dialog]'); await p.waitForTimeout(500);
await p.fill('input[aria-label="Seu nome"]', 'Marina Gestora'); await p.click('button:text-is("Head de Design")'); await next(p, 2);
await p.fill('input[aria-label="Seu e-mail"]', newEmail); await p.fill('#uw-senha', 'senha-errada'); await next(p); await p.click('button:text-is("Salvar meus dados")'); await p.waitForTimeout(1200);
console.log('e-mail com senha errada:', await p.locator('span[role=alert]').first().innerText());
await p.click('button:text-is("Voltar")'); await p.waitForTimeout(700); await p.fill('#uw-senha', 'senha-forte-123'); await next(p); await p.click('button:text-is("Salvar meus dados")'); await p.waitForTimeout(1500);
await p.click('button[aria-label="Abrir o menu da sua conta"]'); console.log('menu mostra novo nome/e-mail:', await p.locator('[role=menu]').innerText().then((t) => t.includes('Marina Gestora') && t.includes(newEmail)));
await p.click('[role=menuitem]:has-text("Sair")'); await p.waitForURL(BASE + '/');
await p.goto(BASE + '/entrar'); await p.fill('#ent-email', newEmail); await p.fill('#ent-senha', 'senha-forte-123'); await p.click('button[type=submit]'); await p.waitForURL('**/hub'); console.log('login com o novo e-mail: true');
// ---- IC: só Meus dados, sem acesso à gestão
const q = await mk(); await q.goto(BASE + '/cadastro'); await q.fill('#cad-nome', 'Caio IC'); await q.fill('#cad-email', icEmail); await q.fill('#cad-senha', 'senha-forte-123'); await q.click('label:has(input[value=IC])');
await q.click('button[type=submit]'); await q.waitForURL('**/primeiro-acesso', { timeout: 8000 }).catch(() => {}); await q.goto(BASE + '/hub');
await q.click('button[aria-label="Abrir o menu da sua conta"]'); console.log('IC vê "Meus dados" no menu:', await q.locator('[role=menuitem]:has-text("Meus dados")').isVisible());
await q.click('[role=menuitem]:has-text("Meus dados")'); await q.waitForSelector('h1:text-is("Meus dados")'); console.log('IC sem abas de administração:', await q.locator('[role=tablist]').count() === 0);
const st = await q.evaluate(async (pr) => (await fetch(`/api/projects/${pr}/categories`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'X', skills: ['y'] }) })).status, ids.pr);
console.log('IC não cria categoria (404 por não ser do projeto):', st);
await q.goto(`${BASE}/admin/${ids.pr}`); await q.waitForURL('**/admin'); console.log('IC não abre a administração do projeto: redireciona');
console.log('ERROS:', errors.length ? errors : 'nenhum'); await b.close();
