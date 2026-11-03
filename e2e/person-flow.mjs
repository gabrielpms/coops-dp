import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.BASE ?? 'http://localhost:3000';
const S = process.env.SHOTS ?? '/tmp/coops-person-';
const b = await chromium.launch(); const errors = [];
const mk = async () => { const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await c.newPage(); p.on('pageerror', (e) => errors.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/40[0-9]/.test(m.text())) errors.push('console ' + m.text()); }); return p; };
const stamp = Date.now(); const icEmail = `joana${stamp}@x.com`;
const next = async (p, n = 1) => { for (let i = 0; i < n; i++) { await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); } };
const p = await mk();
await p.goto(BASE + '/cadastro'); await p.fill('#cad-nome', 'Marina Gestora'); await p.fill('#cad-email', `mg${stamp}@x.com`); await p.fill('#cad-senha', 'senha-forte-123');
await p.click('button[type=submit]'); await p.waitForURL('**/primeiro-acesso'); await p.waitForLoadState('networkidle');
const ids = await p.evaluate(async (ic) => {
  const j = async (u, bd) => (await fetch(u, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(bd) })).json();
  const pr = (await j('/api/projects', { name: 'Nimbo Pay', segment: 'Fintech', skills: ['Pesquisa com usuários', 'Facilitação'] })).project.id;
  const joana = (await j(`/api/projects/${pr}/members`, { name: 'Joana Reis', title: 'Senior Product Designer', email: ic, mainSkill: 'Pesquisa', joinedAt: '2024-03-10' })).person.id;
  return { pr, joana };
}, icEmail);
await p.goto(`${BASE}/p/${ids.pr}/time`); await p.click('a[aria-label="Abrir Marina Gestora"]'); await p.waitForURL(/pessoas\//); const me = p.url().split('/pessoas/')[1];
await p.waitForSelector('h1:text-is("Marina Gestora")');
console.log('perfil: power ups vazio:', await p.locator('text=Nenhum power up ainda').isVisible());
// ---- power up
await p.click('button:text-is("+ Power up")'); await p.waitForSelector('[role=dialog]'); await next(p); console.log('tipo obrigatório:', await p.locator('span[role=alert]').first().innerText());
await p.click('button[role=radio]:has-text("Mentoria")'); await next(p); await p.fill('input[aria-label="Nome do power up"]', 'Bianca Rocha'); await next(p);
await p.click('button:text-is("Pesquisa com usuários")'); await next(p); await p.click('button[role=radio]:text-is("Quinzenal")'); await next(p);
await p.click('button:text-is("Criar power up")'); await p.waitForSelector('article:has-text("Bianca Rocha")', { timeout: 10000 }); console.log('power up criado: true');
await p.screenshot({ path: S + '1-perfil.png' });
// ---- entregas
await p.click('a[aria-label="Abrir o deck de Entregas"]'); await p.waitForSelector('h1:text-is("Suas entregas")');
await p.click('button:text-is("+ Nova entrega")'); await p.waitForSelector('[role=dialog]'); await next(p); console.log('título obrigatório:', await p.locator('span[role=alert]').first().innerText());
await p.fill('#dw-titulo', 'Captura guiada na câmera'); await p.fill('#dw-desc', 'Nova captura com guia de enquadramento.'); await next(p);
await p.click('button[role=radio]:text-is("Em andamento")'); await next(p); await p.fill('textarea[aria-label="Seu papel"]', 'Liderei pesquisa e design.'); await next(p);
await p.fill('input[aria-label="Link"]', 'x'); await p.keyboard.press('Enter'); console.log('link inválido:', await p.locator('span[role=alert]').first().innerText());
await p.fill('input[aria-label="Link"]', 'https://figma.com/file/abc'); await p.keyboard.press('Enter'); await next(p);
await p.click('button:text-is("Criar entrega")'); await p.waitForSelector('button[aria-label="Abrir a entrega Captura guiada na câmera"]', { timeout: 10000 }); await p.waitForTimeout(400);
console.log('pills:', (await p.locator('[role=tab]').allInnerTexts()).join(' | '));
await p.click('button[aria-label="Abrir a entrega Captura guiada na câmera"]'); await p.waitForSelector('[role=dialog]:has-text("Impacto pendente")'); await p.waitForTimeout(500);
await p.screenshot({ path: S + '2-foco.png' });
await p.click('button:text-is("Salvar impacto")'); console.log('impacto vazio barra:', await p.locator('span[role=alert]').innerText());
await p.fill('textarea[aria-label="Impacto da entrega"]', 'Menos abandono no envio do documento.'); await p.click('button:text-is("Salvar impacto")'); await p.waitForSelector('text=Menos abandono'); console.log('impacto salvo: true');
await p.keyboard.press('Escape'); await p.waitForTimeout(500);
await p.click('[role=tab]:has-text("Pausadas")'); console.log('filtro pausadas vazio:', await p.locator('button[aria-label^="Abrir a entrega"]').count() === 0);
await p.reload(); await p.waitForTimeout(500); console.log('filtro lembrado após recarregar:', await p.locator('[role=tab][aria-selected=true]').innerText().then((t) => t.startsWith('Pausadas')));
await p.click('[role=tab]:has-text("Todas")');
// ---- skills
await p.goto(`${BASE}/p/${ids.pr}/pessoas/${me}/skills`); await p.waitForSelector('h1:text-is("Autoavaliação de skills")');
await p.locator('[role=radiogroup][aria-label="Autoavaliação em Pesquisa com usuários"] button').nth(3).click(); await p.waitForTimeout(2500);
await p.reload(); console.log('nota 4 persistiu:', await p.locator('[role=radiogroup][aria-label="Autoavaliação em Pesquisa com usuários"] [aria-checked=true]').getAttribute('aria-label'));
await p.screenshot({ path: S + '3-skills.png' });
// ---- brain gym
await p.goto(`${BASE}/p/${ids.pr}/pessoas/${me}/brain-gym`); await p.click('button:text-is("+ Conteúdo")'); await p.click('[role=dialog] button.coops-card:has-text("Livro")');
await p.fill('input[aria-label="Título do conteúdo"]', 'Continuous Discovery Habits'); await next(p); await p.locator('[role=radiogroup][aria-label="Skill"] button:text-is("Pesquisa com usuários")').click(); await next(p);
await p.click('button:text-is("Criar carta")'); await p.waitForSelector('article:has-text("Continuous Discovery")', { timeout: 10000 }); await p.waitForTimeout(400);
await p.click('article:has-text("Continuous Discovery") button[aria-label="Aumentar progresso"]'); await p.click('article:has-text("Continuous Discovery") button[aria-label="Aumentar progresso"]'); await p.waitForTimeout(2000);
await p.reload(); console.log('progresso persistiu:', (await p.locator('article:has-text("Continuous Discovery")').innerText()).includes('20%'));
await p.screenshot({ path: S + '4-braingym.png' });
// ---- permissões: Joana (IC) e o manager
const q = await mk(); await q.goto(BASE + '/cadastro'); await q.fill('#cad-nome', 'Joana Reis'); await q.fill('#cad-email', icEmail); await q.fill('#cad-senha', 'senha-forte-123'); await q.click('button[type=submit]'); await q.waitForURL('**/hub');
await q.goto(`${BASE}/p/${ids.pr}/time`); await q.waitForURL(`**/pessoas/${ids.joana}`); console.log('IC é levado ao próprio perfil: true');
await q.goto(`${BASE}/p/${ids.pr}/pessoas/${me}`); await q.waitForURL('**/hub'); console.log('IC não abre o perfil de outra pessoa: redireciona');
const st = await q.evaluate(async (pid) => ({ mgrScore: (await fetch(`/api/people/${pid}/ratings`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ skillId: crypto.randomUUID(), managerScore: 5 }) })).status }), ids.joana);
console.log('IC não dá nota de manager (esperado 403):', st.mgrScore);
const sk = await p.evaluate(async (pid) => { const r = await fetch(`/api/people/${pid}/deliveries`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'x' }) }); return r.status; }, ids.joana);
console.log('manager não cria entrega para outra pessoa (esperado 403):', sk);
await p.goto(`${BASE}/p/${ids.pr}/pessoas/${ids.joana}/skills`); await p.waitForSelector('h1:has-text("Skills")');
await p.locator('[role=radiogroup][aria-label="Nota do manager em Facilitação"] button').nth(4).click(); await p.waitForTimeout(2000);
await q.goto(`${BASE}/p/${ids.pr}/pessoas/${ids.joana}/skills`); await q.waitForSelector('text=Manager: 5'); console.log('IC vê a nota do manager: true');
console.log('ERROS:', errors.length ? errors : 'nenhum'); await b.close();
