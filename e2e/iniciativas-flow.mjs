import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.BASE ?? 'http://localhost:3000';
const b = await chromium.launch(); const errors = [];
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
p.on('pageerror', (e) => errors.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/40[139]|50[03]/.test(m.text())) errors.push('console ' + m.text()); });
const ok = (label, v) => { console.log(label + ':', v); if (v === false) errors.push('FALHOU: ' + label); };
const stamp = Date.now();
await p.goto(BASE + '/cadastro'); await p.fill('#cad-nome', 'Marina Gestora'); await p.fill('#cad-email', `mgr${stamp}@x.com`); await p.fill('#cad-senha', 'senha-forte-123');
await p.click('button[type=submit]'); await p.waitForURL('**/primeiro-acesso'); await p.waitForLoadState('networkidle');
const pid = await p.evaluate(async () => (await (await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Nimbo Pay', segment: 'Fintech', skills: ['Facilitação'] }) })).json()).project.id);
await p.goto(`${BASE}/p/${pid}/iniciativas`); await p.waitForSelector('h1:text-is("Iniciativas")');
// criar iniciativa pelo deck
await p.click('button[aria-label="Nova iniciativa"]'); await p.waitForSelector('[role=dialog]');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(500); ok('produto obrigatório', await p.locator('span[role=alert]').first().isVisible());
await p.fill('input[aria-label="Produto da iniciativa"]', 'Abertura de conta');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650);
await p.fill('textarea[aria-label="Problema"]', 'Muita gente abandona o cadastro.');
await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650);
await p.click('button:text-is("Criar iniciativa")'); await p.waitForURL(/iniciativas\/[0-9a-f-]{36}$/, { timeout: 10000 }); await p.waitForSelector('h1:text-is("Confere se entendi?")');
ok('abriu a conferência do agente', true);
ok('necessidade com PRECISA CONFIRMAR', await p.locator('text=PRECISA CONFIRMAR').isVisible());
const faltam = await p.locator('text=/FALTAM RESOLVER \\d+/').innerText(); console.log('rótulo:', faltam);
ok('mesa bloqueada com dúvidas abertas', await p.locator('button:text-is("Isso mesmo, abrir a mesa")').isDisabled());
// resolver todas as dúvidas
const n = Number(faltam.match(/\d+/)[0]);
for (let i = 0; i < n; i++) {
  await p.locator('button:text-is("Responder")').first().click(); await p.waitForSelector('[role=dialog]');
  await p.fill('textarea[aria-label="Sua resposta"]', `Resposta número ${i + 1}`); await p.click('button:text-is("Enviar")');
  await p.waitForSelector('text=/Entendi assim: Resposta número/'); if (i === 0) ok('agente fecha com "Entendi certo?"', await p.locator('text=Entendi certo?').first().isVisible());
  await p.click('button:text-is("Sim, resolver dúvida")'); await p.waitForTimeout(900);
}
ok('dúvidas viram cartas de contexto resolvidas', (await p.locator('text=RESOLVIDO COM O AGENTE').count()) === n);
// persistência: recarregar
await p.reload(); await p.waitForSelector('h1:text-is("Confere se entendi?")');
ok('reload mantém as dúvidas resolvidas', (await p.locator('text=RESOLVIDO COM O AGENTE').count()) === n);
await p.click('button:text-is("Isso mesmo, abrir a mesa")'); await p.waitForURL('**/mesa', { timeout: 10000 }); await p.waitForSelector('h1:has-text("cartas de contexto")');
ok('mesa mostra dúvidas resolvidas na carta da iniciativa', await p.locator('text=RESOLVIDO COM O AGENTE').isVisible());
// carta de contexto
await p.click('button[aria-label="Adicionar Métricas"]'); await p.waitForSelector('[role=dialog]');
await p.fill('textarea[aria-label="Texto da carta"]', 'Taxa de conclusão do cadastro'); await p.fill('input[aria-label="Novo link"]', 'figma.com/file/abc'); await p.click('button:text-is("Adicionar")');
await p.click('button:text-is("Colocar na mesa")'); await p.waitForSelector('[role=dialog]', { state: 'detached' }); await p.waitForTimeout(800);
await p.reload(); await p.waitForSelector('h1:has-text("cartas de contexto")');
ok('carta de contexto persiste após reload (texto e link)', await p.locator('text=Taxa de conclusão do cadastro').isVisible() && await p.locator('a:has-text("figma.com/file/abc")').isVisible());
// anexo sem armazenamento configurado deve falhar com mensagem clara, sem quebrar
await p.click('button:text-is("Editar")'); await p.waitForSelector('[role=dialog]');
await p.setInputFiles('input[type=file]', { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from('x') }); await p.waitForSelector('span[role=alert]', { timeout: 15000 });
console.log('anexo sem S3:', (await p.locator('span[role=alert]').allInnerTexts()).join(' | ')); await p.keyboard.press('Escape'); await p.waitForTimeout(600);
// momento + deck de ferramentas
await p.click('button:text-is("Identificar o momento")'); await p.waitForURL('**/momento', { timeout: 10000 }); await p.waitForSelector('h1:has-text("Sua iniciativa está em")');
console.log('momento:', await p.locator('h1').innerText());
await p.locator('button[aria-label^="Jogar"]').first().click(); await p.waitForSelector('[role=dialog]');
await p.waitForSelector('text=0 DE 3 REVISADAS'); ok('deck de resposta abre com 3 cartas', true);
await p.click('button:text-is("Para a mesa →")'); await p.waitForSelector('text=1 DE 3 REVISADAS');
await p.keyboard.press('ArrowLeft'); await p.waitForSelector('text=2 DE 3 REVISADAS'); ok('seta ← descarta', true);
// fechar no meio e voltar mantém
await p.click('button:text-is("Fechar e continuar depois")'); await p.waitForTimeout(800); await p.reload(); await p.waitForSelector('h1:has-text("Sua iniciativa está em")');
ok('progresso do deck persiste', await p.locator('text=2 de 3 revisadas').isVisible());
// finalizar
await p.goto(p.url().replace('/momento', '/mesa')); await p.click('button:text-is("Finalizar iniciativa")'); await p.waitForSelector('[role=dialog]');
await p.click('button:text-is("Finalizar e registrar no perfil")'); await p.waitForSelector('text=/ENCERRADA · ENTREGUE/', { timeout: 8000 }); ok('iniciativa encerrada', true);
await p.goto(`${BASE}/p/${pid}/iniciativas`); await p.click('[role=tab]:has-text("Encerradas")'); ok('aparece em Encerradas', await p.locator('text=Abertura de conta').isVisible());
console.log('ERROS:', errors.length ? errors.join('\n') : 'nenhum'); await b.close(); process.exit(errors.length ? 1 : 0);
