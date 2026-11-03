# Coops · your design companion

Implementação do [PRD](./docs/PRD-Coops.md). Protótipos de referência em [`docs/referencia/`](./docs/referencia) (fonte de verdade visual).

## Estado: Marco 1 · Base (M0 + M2 + M3)

| Pronto | Onde |
|---|---|
| Tokens, `@keyframes` copiados dos protótipos, base (scroll, cortina, reduced-motion) | `styles/` |
| Avatar parametrizável (SVG do `CoopsAvatar`) | `components/avatar` |
| BottomSheet, QuestionDeck, cortina de navegação, AccountMenu | `components/{sheet,wizard,nav,ds}` |
| Cadastro com carrossel, entrar por link mágico, sessão por cookie | `app/cadastro`, `app/entrar`, `app/api/auth` |
| Primeiro acesso (retoma de onde parou) | `app/primeiro-acesso` |
| Hub + deck de 7 perguntas de projeto (criar e editar) | `app/hub`, `components/wizard/ProjectDeck.tsx` |
| Rascunho do deck salvo no banco (debounce 600 ms + ao avançar) | `app/api/drafts` |
| Permissões: só manager cria/edita projeto; dados isolados por projeto | `lib/projects.ts`, rotas `app/api/projects` |
| `/ds` interno (cores, botões, avatares) — cresce com os componentes | `app/ds` |

`/p/[id]/time` e `/p/[id]/iniciativas` são páginas provisórias (Marcos 2 e 4).

## Rodar

```bash
cp .env.example .env        # preencha DATABASE_URL e SESSION_SECRET (32+ caracteres)
npm install
npx prisma db push          # ou: npm run db:migrate
npm run dev
```

Em desenvolvimento o link mágico de login aparece na tela e no log do servidor (não há SMTP ainda — `lib/mail.ts`).

## Testes

```bash
npm test                          # unitários (Vitest)
node e2e/marco1-flow.mjs          # fluxo E2E com o servidor rodando em :3000 (usa o Playwright instalado)
```

## Decisões e pendências

- **Login:** link mágico por e-mail (hash SHA-256 do token, 15 min, uso único). Google fica para depois (PRD §12.5). O cadastro já entra logado **sem verificar o e-mail** — ligar a verificação junto com o SMTP (M10).
- **Convites:** são salvos e vinculam a pessoa ao projeto quando ela cria a conta com o mesmo e-mail; o envio real é M10 (hoje só log).
- **Estilos:** inline como nos protótipos, para manter os valores exatos; classes/animações compartilhadas em `styles/motion.css`.
- **TanStack Query** entra com as ações otimistas do Marco 2; no Marco 1 só há criar/editar projeto e rascunhos.
- **Fora do Marco 1:** Administração (M4), time (M5), decks da pessoa e do squad (M6/M7), iniciativas e agente (M8/M9), landing/wish list (M1 do PRD, Marco 5), teste visual automatizado contra os protótipos.
