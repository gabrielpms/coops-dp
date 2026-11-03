import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const S = process.env.SHOTS ?? '/tmp/coops-e2e-';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()); });
  const email = `marina${Date.now()}@nimbo.com`;
  await p.goto('http://localhost:3000/cadastro');
  await p.fill('#cad-nome', 'Marina Lopes'); await p.fill('#cad-email', email); await p.fill('#cad-tel', '(11) 90000-0000');
  await p.screenshot({ path: S + '1-cadastro.png' });
  await p.click('button[type=submit]'); await p.waitForURL('**/primeiro-acesso', { timeout: 8000 });
  await p.waitForTimeout(900); await p.screenshot({ path: S + '2-primeiro.png' });
  await p.click('button.fa-start'); await p.waitForSelector('[role=dialog]'); await p.waitForTimeout(900);
  // tenta avançar sem nome -> erro
  await p.click('button:text-is("Próxima")'); await p.waitForTimeout(300);
  console.log('erro nome visivel:', await p.locator('text=Escreva o nome da empresa').isVisible());
  await p.fill('input[aria-label="Nome da empresa"]', 'Nimbo Pay'); await p.click('button[role=radio]:has-text("Fintech")');
  await p.click('button:text-is("Próxima")'); await p.waitForTimeout(700);
  await p.fill('textarea[aria-label="Estratégia da empresa"]', 'Ser a primeira conta de quem nunca teve banco.');
  await p.screenshot({ path: S + '3-deck.png' });
  await p.waitForTimeout(900); // debounce do rascunho
  await p.reload(); await p.waitForTimeout(800);
  console.log('após reload, ainda no primeiro-acesso:', p.url().endsWith('/primeiro-acesso'));
  await p.click('button.fa-start'); await p.waitForSelector('[role=dialog]'); await p.waitForTimeout(1200);
  console.log('rascunho restaurou estratégia:', await p.inputValue('textarea[aria-label="Estratégia da empresa"]'));
  console.log('rascunho restaurou nome via voltar:');
  await p.click('button:text-is("Voltar")'); await p.waitForTimeout(700); console.log('  ', await p.inputValue('input[aria-label="Nome da empresa"]'));
  for (let i = 0; i < 2; i++) { await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650); }
  await p.click('button:has-text("+ Retenção em 30 dias")'); await p.click('button:has-text("+ NPS")');
  await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650);
  await p.fill('input[aria-label="Novo concorrente"]', 'Lume Bank'); await p.keyboard.press('Enter');
  await p.fill('input[aria-label="Novo link de referência"]', 'https://www.nubank.com.br'); await p.keyboard.press('Enter');
  await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650);
  await p.click('button[aria-label="Remover Facilitação"]');
  await p.click('button:text-is("Próxima")'); await p.waitForTimeout(650);
  await p.fill('input[aria-label="Nome da pessoa"]', 'Caio Souza'); await p.fill('input[aria-label="E-mail da pessoa"]', 'caio@nimbo.com'); await p.click('button:text-is("Convidar")');
  await p.screenshot({ path: S + '4-convites.png' });
  await p.click('button:text-is("Próxima")'); await p.waitForTimeout(700); await p.screenshot({ path: S + '5-resumo.png' });
  await p.click('button:text-is("Criar projeto")'); await p.waitForSelector('text=Projeto criado. Bora pro time?', { timeout: 8000 }); await p.waitForTimeout(1000);
  await p.screenshot({ path: S + '6-done.png' });
  await p.reload(); await p.waitForTimeout(800); console.log('reload mantém tela de projeto criado:', await p.locator('text=Projeto criado. Bora pro time?').isVisible());
  await p.click('text=Ir para o hub de projetos'); await p.waitForURL('**/hub'); await p.waitForTimeout(900);
  await p.screenshot({ path: S + '7-hub.png' });
  console.log('hub card:', (await p.locator('article').innerText()).replace(/\n/g, ' | '));
  await p.click('button[aria-label="Abrir o menu da sua conta"]'); await p.waitForTimeout(400); await p.screenshot({ path: S + '8-menu.png' });
  console.log('ERROS:', errors.length ? errors : 'nenhum');
  await b.close();
})().catch(e => { console.error('FALHOU', e.message.split('\n')[0]); process.exit(1); });
