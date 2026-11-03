import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const S = process.env.SHOTS ?? '/tmp/coops-landing-';
const BASE = process.env.BASE ?? 'http://localhost:3000';
const b = await chromium.launch();
const errors = [];
const email = `ana${Date.now()}@estudio.com`;
try {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push('pageerror ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push('console ' + m.text()); });
  await p.goto(BASE + '/'); await p.waitForTimeout(900);
  console.log('h1:', await p.locator('h1').innerText());
  await p.screenshot({ path: S + '1-topo.png' });
  await p.screenshot({ path: S + '1-full.png', fullPage: true });
  await p.click('nav[aria-label=Principal] >> text=Entrar na wish list'); await p.waitForSelector('[role=dialog]'); await p.waitForTimeout(900);
  // sem aceite -> erro; e-mail inválido -> erro
  await p.fill('#wl-email', 'x'); await p.click('button[type=submit]'); console.log('erro e-mail:', await p.locator('p[role=alert]').innerText());
  await p.fill('#wl-nome', 'Ana Paula'); await p.fill('#wl-email', email);
  await p.click('button:text-is("Designer IC")');
  await p.click('button:text-is("Mostrar meu impacto")'); await p.click('button:text-is("Feedback que chega tarde")');
  await p.click('button:text-is("WhatsApp")');
  await p.click('button[type=submit]'); console.log('erro aceite:', await p.locator('p[role=alert]').innerText());
  await p.check('input[type=checkbox][aria-required=true]');
  await p.screenshot({ path: S + '2-form.png' });
  await p.click('button[type=submit]'); await p.waitForSelector('text=Cadeira reservada'); await p.waitForTimeout(500);
  console.log('confirmação:', (await p.locator('[role=status] h3').innerText()));
  await p.screenshot({ path: S + '3-ok.png' });
  // recarrega: mesmo navegador traz as respostas de volta
  await p.reload(); await p.waitForTimeout(600);
  await p.click('nav[aria-label=Principal] >> text=Entrar na wish list'); await p.waitForSelector('text=Cadeira reservada', { timeout: 6000 });
  console.log('reabriu com respostas salvas: true');
  await p.click('text=Editar minhas respostas');
  console.log('papel marcado:', await p.locator('button[aria-pressed=true]:text-is("Designer IC")').count() === 1, '| dores marcadas:', await p.locator('button[aria-pressed=true]:text-is("Mostrar meu impacto")').count() === 1);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  console.log('sheet fechou com Esc:', await p.locator('[role=dialog]').count() === 0);
  // outro navegador, mesmo e-mail, sem token -> recusa
  const p2 = await (await b.newContext()).newPage(); await p2.goto(BASE + '/'); await p2.waitForTimeout(500);
  await p2.click('nav[aria-label=Principal] >> text=Entrar na wish list'); await p2.waitForSelector('[role=dialog]');
  await p2.fill('#wl-email', email); await p2.check('input[type=checkbox][aria-required=true]'); await p2.click('button[type=submit]'); await p2.waitForTimeout(600);
  console.log('outro navegador sem token:', (await p2.locator('p[role=alert]').innerText()).slice(0, 60));
  // mobile
  const m = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage(); await m.goto(BASE + '/'); await m.waitForTimeout(900);
  console.log('mobile sem scroll horizontal:', await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await m.screenshot({ path: S + '4-mobile.png' });
} catch (e) { console.error('FALHOU', e.message.split('\n')[0]); errors.push('fail'); }
console.log('ERROS:', errors.length ? errors : 'nenhum');
await b.close();
process.exit(errors.length ? 1 : 0);
