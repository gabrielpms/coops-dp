# PRD · Coops — your design companion

**Versão:** 1.0 · novembro de 2026
**Autor:** Gabriel Pinheiro Maciel
**Para:** time de engenharia / Claude Code
**Referência visual e de comportamento:** pasta `referencia/` que acompanha este PRD (protótipos `.dc.html` de cada tela e o Design System). Os protótipos foram feitos no canvas de design da Coops e são a **fonte de verdade** de layout, textos, estados e animações.

> **Regra de ouro para quem vai construir:** não reinvente a interface. Cada tela tem um protótipo em `referencia/`. Porte a marcação, os estilos, os `@keyframes` e a lógica de estado de cada protótipo para componentes do produto, trocando os dados fixos por dados vindos da API. Tudo que a pessoa cadastra precisa ser salvo no banco e continuar lá depois de recarregar a página, trocar de dispositivo ou sair e entrar de novo.

---

## 1. Visão do produto

A Coops é uma plataforma para times de design com dois produtos na mesma casa, conectados por um **hub de projetos**:

1. **Gestão de time** — *"Team management doesn't need to be a spreadsheet."* Cada pessoa é um conjunto de decks (eventos, skills, brain gym, jornada, saúde, entregas, power ups). Cada squad também tem seus decks (desafios, frentes, estratégia, indicadores, alavancas, saúde do time).
2. **Iniciativas com agente** — *"Product sense is complex, but doesn't need to be hard, we got you."* O designer descreve uma demanda. O agente confere o entendimento, a pessoa dá profundidade com cartas de contexto, o agente identifica o **momento** da iniciativa e entrega um **deck de ferramentas**. Cada ferramenta jogada vira um **deck de resposta** que a pessoa revisa carta a carta.

**Metáfora central:** tudo é deck e carta sobre uma mesa preta. O roxo claro marca a carta que importa agora.

### 1.1 Públicos

| Papel | O que faz |
|---|---|
| **Manager** (líder de design) | Cria projetos, administra lideranças, squads, categorias de skills. Vê e edita os decks das pessoas do time. Registra eventos (check-in, feedback, promoção, mérito, mudança de time). |
| **IC** (designer) | Vê e mantém os próprios decks (skills, brain gym, jornada, saúde, entregas). Cria iniciativas e trabalha com o agente. Edita os próprios dados e avatar. |

### 1.2 Objetivos

- Substituir planilhas de PDI, 1:1 e acompanhamento de time por decks vivos.
- Ajudar designers a amadurecer demandas antes de desenhar, com um agente que joga junto.
- Deixar visível o impacto do design (entregas ligadas a iniciativas e indicadores).

### 1.3 Fora do escopo desta versão

- App mobile nativo (o web precisa ser responsivo até 390 px).
- Integrações com Figma, Jira, Slack etc. (os links são só URLs salvas).
- Pagamentos e planos.

---

## 2. Princípios que não podem se perder

1. **Fidelidade ao protótipo.** Espaçamentos, tamanhos, textos (pt-BR), cores, sombras, raios e animações iguais aos de `referencia/`. Em caso de dúvida, o protótipo vence.
2. **Tudo é carta.** Listas de itens são cartas de 340 px de altura no padrão "deck aberto". Não use tabelas nem listas de linhas.
3. **Cadastro é deck de perguntas.** Todo cadastro ou edição que pede pensar abre um *bottom sheet* com um deck de perguntas: uma pergunta por carta, pontos de progresso, Voltar/Próxima, resumo no final.
4. **Um sheet por vez.** Nunca abrir dois *bottom sheets* ao mesmo tempo.
5. **Filtros são pills.** Abas de filtro em formato de pill com contador ("Todas · 3").
6. **Sem subtítulos separando grupos de cartas** numa mesma página. As cartas de uma página têm o mesmo formato.
7. **Ícones:** traço preto, outline, 2 px em grade de 64, cantos arredondados, sem preenchimento colorido, e **animados no hover/foco do card**. Uma ilustração por deck ou tipo de carta.
8. **Persistência total.** Nada que a pessoa digita ou escolhe pode sumir (ver seção 6).
9. **Acessibilidade:** foco visível em lilás, `aria-*` como nos protótipos, alvos de toque ≥ 44 px, e `prefers-reduced-motion` desliga todas as animações.

---

## 3. Arquitetura sugerida

> Sugestão. Se o time preferir outra stack, mantenha os requisitos de fidelidade e persistência.

| Camada | Escolha sugerida | Por quê |
|---|---|---|
| Front | **Next.js (App Router) + React + TypeScript** | Rotas por tela, server components para carregar dados, client components para animação e estado. |
| Estilo | **CSS Modules + variáveis CSS (tokens)**; `@keyframes` copiados do protótipo para `styles/motion.css` | Os protótipos usam CSS puro com estilos inline. Portar para CSS Modules mantém os valores exatos. Evite reescrever as animações em outra lib. |
| Estado de UI | React state / `useReducer` por tela, espelhando o `state` de cada protótipo | A lógica de cada protótipo (`renderVals`) já define os estados. |
| Dados no cliente | **TanStack Query** com atualizações otimistas | A UI responde na hora e o dado vai para o servidor em seguida. |
| API | Route handlers do Next (REST) ou tRPC | — |
| Banco | **PostgreSQL + Prisma** | Modelo relacional (projeto → squads → pessoas → decks). |
| Autenticação | Auth.js (e-mail com link mágico + Google) | O cadastro pede nome, e-mail, telefone e papel. |
| Arquivos | S3 compatível (anexos da mesa da iniciativa) | — |
| Agente | API da Anthropic (Claude), chamada pelo servidor, com saídas em JSON validadas por schema | Ver módulo M9. |
| Testes | Vitest (lógica), Playwright (fluxos + comparação visual com os protótipos) | — |

### 3.1 Estrutura de pastas sugerida

```
app/
  (site)/            → landing e wish list
  (auth)/cadastro    → cadastro
  primeiro-acesso/   → onboarding do primeiro projeto
  hub/               → hub de projetos
  p/[projectId]/
    time/            → gestão de time, squads
    pessoas/[personId]/          → decks da pessoa
      eventos | skills | brain-gym | jornada | saude | entregas
    squads/[squadId]/            → decks do squad
      desafios | frentes | estrategia | indicadores | alavancas | saude
    iniciativas/                 → lista
    iniciativas/[initiativeId]/  → confere · mesa · momento
    admin/                       → administração
  meus-dados/        → dados e avatar do usuário
components/
  ds/                → Design System (seção 4)
  deck/              → Deck, Card, Pile, OpenDeckBanner, FocusCard
  wizard/            → QuestionDeck (deck de perguntas)
  sheet/             → BottomSheet
  icons/             → ícones animados (1 componente por ícone)
  avatar/            → Avatar + editor
lib/
  api/  db/  agent/  persistence/
styles/
  tokens.css  motion.css  base.css
```

---

## 4. Design System

Fontes: `referencia/CoopsDS-Fundamentos.dc.html`, `referencia/CoopsDS-Componentes.dc.html` e `referencia/CoopsAvatar.dc.html`. **Antes de qualquer tela**, crie os tokens e os componentes abaixo e uma página `/ds` interna que reproduza o DS para conferência visual.

### 4.1 Tokens

**Cor base**

| Token | Hex | Uso |
|---|---|---|
| `--lilac-100` | `#EEE9FF` | — |
| `--lilac-200` | `#D9CFFF` | tags neutras, fundos claros |
| `--lilac-300` | `#B7A6FF` | **primária**: carta que importa agora, botão primário, foco |
| `--lilac-500` | `#8B74F2` | 2ª camada da pilha |
| `--lilac-700` | `#4B36B0` | 3ª camada da pilha, textos de rótulo em fundo claro |
| `--ink-900` | `#0E0E12` | **mesa** (fundo), bordas de carta, texto em carta |
| `--ink-800` | `#17171D` | campos, cartas escuras |
| `--ink-700` | `#212129` | botões escuros, menus |
| `--ink-600` | `#2C2C36` | divisórias |
| `--ink-400` | `#4A4858` | bordas de botão fantasma |
| `--ink-300` | `#A3A1AD` | texto secundário, carta encerrada |
| `--paper` | `#F5F2EC` | carta neutra, texto em fundo escuro |

**Cores de deck.** Só identificam a origem da carta, nunca estado.

| Deck | Hex |
|---|---|
| Eventos · Iniciativa · Estratégia (squad) · Check-in | `#B7A6FF` |
| Skills · Indicadores (squad) | `#F3D36B` |
| Brain gym · Frentes (squad) · Mérito | `#F5A9D6` |
| Jornada · Desafios (squad) | `#FF8A5B` |
| Agente · Entregas · Mudança de time · Power ups | `#8FE3C8` |
| Saúde | `#A9D8F5` |
| Alavancas de time | `#C9F0B8` |
| Promoção | `#E8C46A` |
| Feedback | `#F5F2EC` |
| Carta encerrada ou descontinuada | `#A3A1AD` |

Tons claros usados como fundo de carta em revisão (deck de resposta): menta `#C9F1E3`, amarelo `#F8E7A6`, laranja `#FFC2A6`, rosa `#FAD3EA`, lilás `#E4DCFF`.

**Tipografia.** Schibsted Grotesk (400–800) para texto; JetBrains Mono (500/700) para rótulos e números pequenos.

| Estilo | Tamanho/peso |
|---|---|
| Display | 64/800, letter-spacing −0.035em |
| H1 | 40–52/800 |
| H2 | 28/700 |
| Título de carta | 22/600 |
| Corpo | 16/400 (nunca abaixo de 14 px) |
| Número | 44/600 |
| Rótulo | JetBrains Mono 11–12/500, caixa alta, letter-spacing 0.06–0.1em |

**Espaço:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
**Raio:** input 10 · botão 14 · carta 22 (carta grande 26) · mesa/sheet 32.
**Borda de carta:** 2 px `--ink-900`.
**Profundidade (pilha):** 1 carta = sem camadas; 2–4 cartas = 1 ou 2 camadas; 5+ cartas = montinho com até 3 camadas. A camada de trás usa um tom mais escuro da mesma cor e fica girada (+1,5° e +3°).
**Container:** largura máxima 1216 px, centralizado.

### 4.2 Componentes (montar em `components/ds`)

Cada item corresponde a uma seção de `CoopsDS-Componentes.dc.html`.

| Componente | Descrição curta |
|---|---|
| `Button` | Primário (lilás), neutro (paper), fantasma (borda ink-400), texto. Altura 48. Micro-interação de press. |
| `SegmentedPill` / `FilterPills` | Pills com contador. A selecionada tem fundo paper e texto ink. |
| `TextField`, `TextArea` | Fundo `#17171D`, borda `#2C2C36`, foco com borda lilás e halo `0 0 0 4px rgba(183,166,255,.18)`. |
| `Calendar` | Calendário "papel lilás" com marcação 52×46 centralizada. |
| `Avatar` + `AvatarEditor` | Avatar ilustrado parametrizável (ver 4.5). |
| `Card` | Carta 340 px de altura: ícone + número grande + rótulo mono, kicker, título, divisória, rodapé. |
| `Pile` | Carta com camadas de profundidade. |
| `BottomSheet` | Sobe da base (`coopsSheetIn`), overlay escuro com blur, alça, botão fechar 44–48 px, rolagem interna. |
| `FocusCard` | "Carta em foco": abre a partir da posição da carta clicada (`coopsFocusIn`/`coopsFocusOut` com `--fdx`, `--fdy`, `--fs`). |
| `OpenDeckBanner` (`coops-mban`) | Banner de deck aberto: caixa de ícone 116 px, link "← voltar", H1 52 px, tile de avatar, botão de ação. Anéis decorativos. |
| `QuestionDeck` | Deck de perguntas (ver 4.4). |
| `FirstAccessSteps` | Trilha de 3 passos: feito (menta), agora (lilás), depois (tracejado). |
| `AccountMenu` | Avatar no header abre menu: Meus dados / Administração (manager) / Sair. Animação `hbPop`. |
| `StickyProfileBar` | Barra fixa colada no topo (`top: 0`) que aparece quando o deck da pessoa chega a 140 px do topo, com resumo do hero. |
| `ChampionTag`, `ClosedCard` | Champion da frente; carta encerrada em `#A3A1AD`. |
| `AgentStar` | Estrela/brilho do agente (menta) com animações de gesto. |
| `AnalysisLoader` | Carregamento da análise com órbita de cartas (ver 4.3). |
| `TeamTable` | "Mesa do time" em tamanhos P/M/G. |
| `MomentSteps` | Pills dos 5 momentos da iniciativa. |

### 4.3 Movimento (obrigatório preservar)

Copie os `@keyframes` dos protótipos **com os mesmos nomes e valores** para `styles/motion.css`. Os principais:

```css
@keyframes coopsSheetIn  { from { transform: translateY(100%) } to { transform: translateY(0) } }
@keyframes coopsCurtainIn{ from { opacity: 1 } to { opacity: 0 } }
@keyframes coopsFadeIn   { from { opacity: 0 } to { opacity: 1 } }
@keyframes coopsRise     { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes coopsPull     { 0% { transform: translateY(-16px) rotate(-2deg) } 50% { transform: translateY(-44px) scale(1.04) rotate(0) } 100% { transform: translateY(-16px) rotate(-2deg) } }
@keyframes coopsPress    { 0% { transform: translateY(-8px) rotate(-1.5deg) } 25% { transform: translateY(-2px) scale(.97) } 100% { transform: translateY(-8px) rotate(-1.5deg) } }
@keyframes coopsWave     { 30% { transform: translateY(-12px) rotate(-6deg) } 60% { transform: translateY(-6px) rotate(5deg) } 100% { transform: none } }
@keyframes coopsFocusIn  { from { transform: translate(var(--fdx), var(--fdy)) scale(var(--fs)); opacity: .35 } to { transform: none; opacity: 1 } }
@keyframes coopsFocusOut { from { transform: none; opacity: 1 } to { transform: translate(var(--fdx), var(--fdy)) scale(var(--fs)); opacity: 0 } }
@keyframes hbPop         { from { opacity: 0; transform: scale(.9) translateY(-6px) } to { opacity: 1; transform: none } }
```

**Padrões de interação**

| Padrão | Comportamento |
|---|---|
| Hover de carta (`coops-card`) | `transform .4s cubic-bezier(.2,.8,.2,1)`. Hover/foco: `translateY(-10px) rotate(-1.5deg)`. Clique: `coopsPull`. |
| Pilha (`coops-pile`) | A carta da frente sobe −16 px e gira −2°. |
| Navegação entre páginas | Ao clicar numa carta que navega: a carta faz o gesto (≈330 ms), a tela escurece (`html.coops-leaving`, cortina 260 ms) e a próxima página entra com `coopsCurtainIn` (500 ms). Use o padrão do protótipo: `preventDefault`, anima, depois navega. **Não use `window.location` direto no meio da animação**; use o roteador. |
| Ícones animados | Cada ícone tem um gesto que conta o que ele faz (foguete balança e a chama tremula, estrelas piscam, bandeira tremula, lâmpada acende…). Dispara no hover/foco do card inteiro e repete em loop de 0,5 a 1,6 s enquanto o hover dura. Só `transform`/`stroke`, sem trocar cor. Use `transform-box: view-box` em grupos. Os nomes dos keyframes (`icRocket`, `icFire`, `icTw`, `agBulb`, `jrFlag`, `shEcg`…) e as classes estão nos protótipos. |
| Deck de perguntas | As cartas entram e saem com `transform 520ms cubic-bezier(.65,0,.25,1)`. |
| Carregamento da análise | Overlay com 4 etapas de cerca de 1,1 s e barra de progresso. Anel de cartas gira em 7 s (`anRot`). A carta lilás da iniciativa fica no centro e depois se junta à rotação (`anLil`: 0–16% no centro, translateZ 180 px; 30% `rotateY(-180deg)`; 80% `rotateY(-360deg)` translateZ 150 px). O filtro vai nas **faces**, não no wrapper `preserve-3d`, para não achatar o 3D. |
| Deck de resposta (mesa de revisão) | Cartas distribuídas em leque (`s11Deal`). A carta aberta entra com `s11In`. Ao decidir, ela voa para o monte (`s11OutK` para a direita, para a mesa; `s11OutX` para a esquerda, descartar) e o monte pulsa (`s11Bump`). |
| Primeiro acesso | `faIn` (sobe 16 px com fade), `faPop` (carta do projeto entra empilhada com mola), `faWave` (bandeira). |
| Avatar / menu | `hbPop` no menu da conta. |

**Reduced motion:** todas as classes animadas precisam de regra `@media (prefers-reduced-motion: reduce) { animation: none !important; transition: none !important }`, como nos protótipos.

### 4.4 Deck de perguntas (`QuestionDeck`)

Usado em: novo projeto, primeiro projeto, novo membro, novo squad, nova iniciativa, conversa com o agente, eventos, brain gym, jornada, power up, entregas, liderança, categorias de skill, dados do usuário.

- Abre num `BottomSheet` com kicker mono (`SUAS ENTREGAS · NOVA ENTREGA`), título e "Uma pergunta por carta".
- **Stack de cartas:** a carta atual fica na frente; as próximas ficam atrás com `translate(16px·n, −12px·n) rotate(3°·n) scale(1 − .03·n)`; até 2 visíveis. As já respondidas saem para a esquerda (`translate(-118%, 24px) rotate(-12deg)`, opacidade 0).
- Rótulo por carta: `PERGUNTA n DE m` + ` · OPCIONAL` quando couber. A última carta é `RESUMO`.
- Rodapé: Voltar (opacidade .4 na 1ª), pontos de progresso clicáveis e botão Próxima / Criar / Salvar alterações.
- **Validação:** só bloqueia o que é obrigatório e leva a pessoa de volta à carta com erro (`role="alert"`).
- **Edição** usa o mesmo deck, preenchido, com título "Editar …".
- **Rascunho persistente:** ver 6.2.

### 4.5 Avatar

Componente ilustrado em SVG (`referencia/CoopsAvatar.dc.html`), com estas propriedades salvas no perfil:

- `skin`: `#FFFFFF`, `#F2D3BC`, `#E0B08A`, `#C68B5E`, `#8D5A3B`, `#5A3825`
- `bg`: `#F2F1EE`, `#B7A6FF`, `#F3D36B`, `#F5A9D6`, `#FF8A5B`
- `hairStyle`: curto, cacheado, chanel, longo, coque, careca, blackpower, afro-curto, trancas, dreads, rabo, ondulado, topete
- `shirtStyle`: preta, clara, listrada, blazer, gola-alta, camisa
- `facialHair`: nenhum, bigode, barba, barba-cheia, cavanhaque
- `glasses` (bool), `glassesShape`: redondo, quadrado
- `earrings`, `lashes`, `crown` (bool; a coroa marca liderança)
- `size`: 24–320

O editor de avatar é uma carta dentro do deck de perguntas (liderança, novo membro, meus dados).

---

## 5. Módulos

Ordem sugerida de construção: **M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10**. Cada módulo lista telas de referência, rotas, entidades, regras e critérios de aceite. Os modelos de dados estão na seção 6.

### M0 · Fundação

**Referência:** todos os protótipos (header, transição, scroll) e `CoopsDS-*`.

- Tokens, `motion.css`, `base.css` (scrollbar fina lilás, `coops-wz-card` com scrollbar escura).
- Fontes Google: Schibsted Grotesk e JetBrains Mono.
- Layout com header: logo `coops.` (ponto lilás), navegação em pill (Meu perfil · Iniciativas / Time · Iniciativas conforme o papel), badge do papel (IC/MANAGER) e avatar com `AccountMenu`.
- Transição entre páginas (cortina) via roteador.
- Componentes do DS + página interna `/ds`.
- Autenticação, sessão e middleware de permissão (seção 7).
- Camada de persistência (seção 6.2): autosave, rascunhos e atualização otimista.

**Aceite:** `/ds` bate visualmente com `CoopsDS-Componentes`. Hover, clique e reduced motion funcionam em todos os componentes.

### M1 · Site e wish list

**Referência:** `Coops01f-Landing-WishList.dc.html` (landing final com wish list).

- Landing com hero animado e seções: "Seu time e suas iniciativas, em cima da mesa", "Sua coroa, seus power ups", "Do problema à decisão, uma carta de cada vez", os dois manifestos e "Puxe uma cadeira".
- **Wish list** em bottom sheet com deck de perguntas: papel (Designer IC, Lead/Manager, Head/Diretor(a), Produto/Outro), foco, dores (as opções mudam conforme o papel) e canais. Mostra "Cadeira reservada, {nome}". Permite "Editar minhas respostas".
- **Persistir:** `WishlistEntry`. Respostas editáveis pelo mesmo e-mail.

**Aceite:** a inscrição aparece no banco, e reabrir a wish list com o mesmo e-mail traz as respostas.

### M2 · Cadastro e primeiro acesso

**Referência:** `Coops02-Cadastro.dc.html`, `Coops02b-PrimeiroAcesso.dc.html`.

- **Cadastro:** à esquerda, painel lilás com carrossel automático de 5 cartas (Time, Skills, Brain gym, Jornada, Agente), legenda, balão do agente e pontos com barra de progresso (3,6 s por carta; pausa no hover). À direita, o formulário: nome, e-mail de trabalho, telefone e papel (IC ou Manager, como cartas de rádio). Botão "Criar conta"; link "Entrar".
- Após criar a conta:
  - Usuário **sem projeto** vai para `/primeiro-acesso`.
  - Usuário **com projeto ou convidado** vai para `/hub` ou para o projeto do convite.
- **Primeiro acesso:**
  1. Boas-vindas ("Boas-vindas, {nome}.") com a trilha de 3 passos: Conta criada (feito), Primeiro projeto (agora), Time e iniciativas (depois).
  2. Carta "Criar o primeiro projeto" (07 cartas, cerca de 5 min) e a lista do que será configurado, com Empresa e Skills marcados como obrigatórios.
  3. Abre o deck de perguntas de projeto (M3) com título "Seu primeiro projeto".
  4. Ao criar: "Projeto criado. Bora pro time?", passos 1 e 2 feitos e 3 agora. Mostra a carta do projeto (indicadores, skills, convites) e os próximos caminhos: **Montar squads e chamar o time** (M5) e **Abrir a primeira iniciativa** (M8). Links secundários: "Ir para o hub de projetos" e "Ajustar o projeto" (reabre o deck preenchido).
- **Persistir:** `User`, `Profile` (papel, avatar), `Project` e `Invite`. O progresso do onboarding (`onboardingStep`) também é salvo: se a pessoa fechar o navegador no meio, volta para o mesmo passo com o rascunho do projeto.

**Aceite:** criar conta, sair no meio do deck do projeto e voltar retoma o rascunho. Ao concluir, o projeto aparece no hub.

### M3 · Hub de projetos e cadastro de projeto

**Referência:** `Coops03-Hub.dc.html`, `Coops04-Projeto.dc.html`.

- **Hub:** "Olá, {nome}." e cartas de projeto empilhadas com segmento, nome, frase, contadores (squads · pessoas · iniciativas) e botões "Gestão de time" e "Iniciativas". Botão "+ Novo projeto" e carta tracejada de adicionar.
- **Deck de perguntas de projeto** (7 cartas):
  1. Empresa: nome (obrigatório), segmento (obrigatório: Fintech, Healthtech, Varejo, Educação, Mobilidade, SaaS B2B, Logística, Mídia) e frase.
  2. Estratégia da empresa e como o design contribui (opcional).
  3. Indicadores-chave, com sugestões: Ativação, Retenção em 30 dias, NPS, Conversão, Tempo até o primeiro valor, Receita recorrente (opcional).
  4. Concorrentes e links de referência (opcional).
  5. Skills do time: vem com 5 sugestões (Pesquisa com usuários, Interação e protótipo, Visual e sistemas, Facilitação, Visão de negócio); ao menos 1 é obrigatória.
  6. Convites: nome, e-mail e posição (IC/Manager) (opcional).
  7. Resumo, com prévia da carta do projeto.
- Ao criar, os convites são enviados por e-mail.
- **Persistir:** `Project`, `KeyIndicator[]`, `Competitor[]`, `ReferenceLink[]`, `Skill[]` (com categoria padrão) e `Invite[]`.

**Aceite:** o projeto criado aparece no hub com os contadores certos. Recarregar mantém tudo.

### M4 · Administração e meus dados

**Referência:** `Coops21-Admin.dc.html` (manager), `Coops21b-Admin-IC.dc.html` (IC · Meus dados).

- **Manager:** escolhe o projeto ("← Todos os projetos") e vê as cartas de administração no padrão de deck aberto:
  - **Liderança:** cadastrar e editar lideranças (deck de perguntas com carta de avatar). Na liderança, associar **membros** e **squads**. "Remover esta liderança".
  - **Categorias de skill:** criar categorias e as skills de cada uma. "Remover esta categoria".
  - **Dados do projeto:** segmento, indicadores-chave e concorrentes (mesmas perguntas de M3).
  - **Dados do usuário:** nome, e-mail, telefone e avatar.
- **IC (Meus dados):** edita os próprios dados e o avatar.
- **Persistir:** `Leadership` (+ vínculos com `Person` e `Squad`), `SkillCategory`, `Skill`, `Project`, `User` e `Profile.avatar`.

**Aceite:** a liderança criada aparece com o avatar escolhido, e os membros associados aparecem no time.

### M5 · Gestão de time (manager)

**Referência:** `Coops05-Time.dc.html`, `Coops16-Vazios.dc.html`, `Coops17-Squad.dc.html`.

- "Seu time, em cartas": pills por squad (Todos + cada squad), cartas de pessoa com avatar, cargo e squad. "+ Membro" e "+ Squad" abrem decks de perguntas (novo membro com avatar; novo squad com nome e membros). Calendário de check-ins.
- **Card do time (squad):** cabeçalho do squad e os decks do squad (M7).
- **Estados vazios** (`Coops16`): "Quando ainda não há cartas", "Decks de uma pessoa recém-adicionada", "+ Adicionar primeira pessoa".
- **Persistir:** `Person` (ligada a `User` quando aceita o convite), `Squad`, `SquadMembership`.

### M6 · Decks da pessoa

**Referência:** `Coops06-Membro.dc.html` (visão do manager), `Coops07-Membro-IC.dc.html` (Meu perfil · IC), `Coops12`–`Coops15`, `Coops19`, `Coops19b`, `Coops20`, `Coops20b`.

**Perfil da pessoa:** hero com avatar, nome, cargo e squad, mais a seção **Power ups** e os **Decks da {nome}**. A barra fixa (`StickyProfileBar`) aparece quando a seção de decks passa de 140 px do topo, colada no topo.

| Deck | Referência | O que faz | Entidade |
|---|---|---|---|
| **Power ups** | 06 | Mentoria (com quem, frequência), projeto paralelo, curso etc., com skill ligada e progresso. "+ Power up" abre deck de perguntas. | `PowerUp` |
| **Eventos** | 12 | Tipos: Check-in, Feedback, Entrega, Promoção, Mérito, Mudança de time. Filtros em pill. A carta em foco abre do lugar da carta. Comentários por evento. Arquivar. "Que tipo de evento você quer registrar?" e "Trocar o tipo". | `Event`, `EventComment` |
| **Skills** | 13 | Autoavaliação de 1 a 5 por skill, lado a lado com a nota do manager. | `SkillRating` (self e manager, por ciclo) |
| **Brain gym** | 14 | Conteúdos: curso, livro, vídeo/palestra, artigo, podcast, link. Cada um tem progresso (+/−) e skill ligada. "Remover do deck". | `StudyItem` |
| **Jornada** | 15 | "Para onde a {nome} está indo": objetivos do ciclo, com passos e foco. "+ Carta" e "Trocar o tipo". | `JourneyGoal`, `JourneyStep` |
| **Saúde** | 19 (IC), 19b (manager) | Check-in de saúde com 4 dimensões (saúde, design, produto, negócio), um ícone por pergunta, notas de 1 a 5 e sugestões do agente quando a nota está baixa. | `HealthCheckin` |
| **Entregas** | 20 (manager), 20b (IC) | Cartas com data, status, título, descrição (2 linhas) e iniciativa no rodapé. Filtros: Todas, Entregues, Em andamento, Pausadas. Carta em foco com impacto (editável, "Impacto pendente"), papel e links. Nova/editar entrega em deck de perguntas de 4 perguntas + resumo: (1) título e descrição; (2) iniciativa (lista + **Nenhuma iniciativa**) e status (**Entregue / Em andamento / Pausada**); (3) papel; (4) links (opcional); resumo. | `Delivery`, `DeliveryLink` |

**Regras:**
- O IC edita os próprios decks (exceto a nota do manager em skills).
- O manager vê tudo e registra eventos.
- Entregas ligadas a uma iniciativa aparecem também na mesa da iniciativa.

### M7 · Decks do squad

**Referência:** `Coops18a`–`Coops18f`, `Coops18-Squad-Deck`.

| Deck | O que faz | Entidade |
|---|---|---|
| **Desafios de time** | Desafios com ações e resultados. Editar e encerrar. Sugestões do agente ("Um benchmark de 3 apps pode ajudar aqui…"). | `SquadChallenge` |
| **Frentes de trabalho** | Frentes com **champion** (avatar + coroa), ou "Sem champion por agora". | `WorkFront` |
| **Estratégia de time** | Itens de estratégia. Editar. | `SquadStrategy` |
| **Indicadores de sucesso** | Indicadores com valor e variação. Encerrar e reabrir. Ligar a um desafio. | `SquadIndicator` |
| **Alavancas de time** | Alavancas. Editar. | `SquadLever` |
| **Saúde do time** | Agregado dos check-ins de saúde do squad. | derivado de `HealthCheckin` |

Carta encerrada ou descontinuada fica `#A3A1AD`, com a tag "DESCONTINUADA EM {mês}".

### M8 · Iniciativas

**Referência:** `Coops08-Iniciativa.dc.html`, `Coops09-Agente.dc.html`, `Coops10-Mesa.dc.html`, `Coops10b-Analise.dc.html`, `Coops11-Momento.dc.html`.

**8.1 Lista (08).** Banner "Iniciativas" e pills Em andamento e Encerradas. A primeira carta é fixa e tracejada: "Nova iniciativa". As cartas lilás mostram momento, contagem de cartas, squad e pessoas na mesa. A carta encerrada é cinza. O deck de perguntas da nova iniciativa tem produto (obrigatório), problema e necessidade (opcionais); no fim leva para o passo 8.2.

**8.2 Agente confere o entendimento (09).** Banner menta "Confere se entendi?".
- Cartas de produto, problema e necessidade. A necessidade é deduzida pelo agente e leva a tag "PRECISA CONFIRMAR".
- Cartas de **dúvidas** do agente.
- Responder uma dúvida abre a conversa no sheet. O agente responde ali mesmo e sempre fecha com "Entendi assim: … Entendi certo?". As opções são "Não, vou explicar melhor" e "Sim, resolver dúvida".
- A dúvida resolvida vira carta de contexto (lâmpada, "0N CONTEXTO", "RESOLVIDO COM O AGENTE"). Dá para "Reabrir dúvida".
- "Isso mesmo, abrir a mesa" só libera quando todas as dúvidas estão resolvidas; até lá aparece o rótulo "FALTAM RESOLVER N DÚVIDAS".

**8.3 Mesa da iniciativa (10).** "Dê profundidade com cartas de contexto".
- Cartas de contexto: impacto para o negócio, objetivo e expectativa, usuários, métricas, o que sabemos dos usuários, regras de negócio, referências visuais, tentativas anteriores, fluxo ou protótipo.
- Cada carta aceita texto, "+ Link" e "+ Anexar arquivo". "Tirar da mesa".
- A carta da iniciativa mostra também as **dúvidas resolvidas com o agente**.
- "Identificar o momento" abre o **carregamento da análise** (10b): órbita e 4 etapas, depois navega para 8.4.
- "Finalizar iniciativa": deck "Como essa iniciativa terminou?" e "Finalizar e registrar no perfil". Também é possível "Reabrir".

**8.4 Momento e deck de ferramentas (11).**
- "Sua iniciativa está em {momento}", com o porquê e as pills dos 5 momentos: 1 Entendimento do desafio · 2 Soft prepare · 3 Explore the solutions · 4 Risk mitigation · 5 Articulando decisões.
- Deck de ferramentas do momento: cartas com tipo (Diagnóstico, Pessoas, Dados, Ideias, Jornada, Futuro, Exploração, Provocação, Mercado, Rara · Tendência, Teste, Métricas, Narrativa, Decisão), cada uma com seu ícone animado.
- **Jogar uma carta** abre o **deck de resposta** (mesa de revisão), em bottom sheet:
  - Cabeçalho: objetivo ("Escolha quais caminhos vão para a mesa da iniciativa") e contador "N de M revisadas".
  - **Leque:** resumo do agente, contexto usado e as cartas distribuídas em leque.
  - **Carta aberta:**
    - Primeiro o essencial: título, linha de explicação, impacto, esforço, métrica afetada e o próximo passo caso a carta vá para a mesa ("Pedir variação" ao lado).
    - Depois, abas: Como funciona (com esboço visual), Evidências, Como aplicar, Riscos, Por que o agente sugeriu (fontes + notas).
  - **Decisão:** "Descartar" à esquerda e "Para a mesa" à direita, também pelas setas ← e →. Esc volta ao leque. A carta voa para o monte e a próxima pendente abre sozinha.
  - **Faixa fixa inferior:** monte de descartadas, as cartas do deck com o estado de cada uma e monte "Na mesa".
  - **Fim:** os caminhos que foram para a mesa, com o próximo passo de cada um, "Revisar de novo" e "Ver na mesa da iniciativa".
  - "Fechar e continuar depois" mantém o progresso.

**Persistir:** `Initiative`, `InitiativeAnswer`, `AgentDoubt`, `AgentMessage`, `ContextCard`, `Attachment`, `MomentAnalysis`, `ToolPlay`, `ResponseCard`, `ResponseDecision` (kept/discarded), `ResponseNote` e `InitiativeClosure`.

**Aceite:** fechar o deck de resposta no meio e voltar mantém as decisões tomadas e as notas.

### M9 · Agente (IA)

Pipeline em **5 etapas sequenciais**, todas no servidor e com saída JSON validada (zod):

| Etapa | Entrada | Saída |
|---|---|---|
| 1. Entender contexto | produto, problema, necessidade + dados do projeto (segmento, estratégia, indicadores, concorrentes) | resumo do entendimento, necessidade deduzida, dúvidas (máx. 3) |
| 2. Entender profundidade | cartas de contexto + dúvidas resolvidas | lacunas de contexto e sugestões de carta |
| 3. Identificar momento | tudo acima | momento (1–5) + porquê |
| 4. Selecionar decks/cartas | momento + contexto | 4 a 6 ferramentas do deck do momento |
| 5. Recomendações e provocações | ferramenta jogada + contexto | deck de resposta (2–4 cartas) com título, tag de risco (SEGURA/MÉDIA/OUSADA…), descrição, impacto, esforço, métrica, próximo passo, evidências, passos, riscos, fontes |

- Conversa das dúvidas: o agente sempre termina com "Entendi assim: … Entendi certo?".
- Sugestões contextuais em outros decks (saúde baixa, indicador caindo, desafio sem ação) aparecem como "power-up do agente" (`coops-pu`).
- Toda saída do agente é **salva** (`AgentRun` com prompt, versão do modelo, entrada, saída e custo), para auditoria e para não recalcular ao reabrir a tela.
- O agente não inventa números: quando falta dado, escreve `[CONFIRMAR …]`, como no protótipo.

### M10 · Notificações e convites

- Convite por e-mail (projeto, liderança, membro).
- Check-in de saúde e lembrete de skills por ciclo (configurável depois).
- Entrega registrada pelo IC aparece para o manager.

---

## 6. Dados e persistência

### 6.1 Modelo de dados (resumo)

Todas as tabelas têm `id` (uuid), `createdAt`, `updatedAt`, `createdById`, e `deletedAt` (soft delete) quando a UI permite remover, arquivar ou encerrar.

```
User(id, name, email, phone, role: IC|MANAGER, onboardingStep)
Profile(userId, avatar JSON {skin,bg,hairStyle,shirtStyle,facialHair,glasses,glassesShape,earrings,lashes,crown}, title)
WishlistEntry(email, name, role, focus, pains[], channels[])

Project(id, name, segment, tagline, strategy, ownerId)
KeyIndicator(projectId, name)           Competitor(projectId, name)
ReferenceLink(projectId, url, host)     SkillCategory(projectId, name)
Skill(projectId, categoryId?, name)     Invite(projectId, name, email, position, status)

Leadership(projectId, personId)         LeadershipMember(leadershipId, personId)
LeadershipSquad(leadershipId, squadId)
Squad(projectId, name)                  Person(projectId, userId?, name, title, avatar JSON)
SquadMembership(squadId, personId)

PowerUp(personId, type, name, skillId?, frequency?, progress)
Event(personId, type: CHECKIN|FEEDBACK|ENTREGA|PROMOCAO|MERITO|MUDANCA_TIME, fields JSON, date, archivedAt)
EventComment(eventId, authorId, text)
SkillRating(personId, skillId, cycle, selfScore 0-5, managerScore 0-5)
StudyItem(personId, type: CURSO|LIVRO|VIDEO|ARTIGO|PODCAST|LINK, title, url?, skillId?, progress, total)
JourneyGoal(personId, cycle, title, focus)   JourneyStep(goalId, text, done)
HealthCheckin(personId, date, saude, design, produto, negocio, answers JSON)
Delivery(personId, title, description, initiativeId?, status: ENTREGUE|EM_ANDAMENTO|PAUSADA, role, impact, date)
DeliveryLink(deliveryId, url, host)

SquadChallenge(squadId, title, actions JSON, results JSON, status)
WorkFront(squadId, name, championPersonId?)
SquadStrategy(squadId, text)    SquadIndicator(squadId, name, value, trend, status)
SquadLever(squadId, name)

Initiative(projectId, squadId?, product, problem, need, needConfirmed, status: ABERTA|ENCERRADA, moment 1-5?)
AgentDoubt(initiativeId, question, status: ABERTA|RESOLVIDA, resolution)
AgentMessage(doubtId, from: USER|AGENT, text, kind: ASK|CONFIRM|DONE)
ContextCard(initiativeId, kind, text, onTable)    Attachment(contextCardId, url|fileKey, name)
MomentAnalysis(initiativeId, moment, why, agentRunId)
ToolPlay(initiativeId, toolId, momentId, agentRunId)
ResponseCard(toolPlayId, order, kind, tag, title, body, nextStep, detail, evidence JSON, steps JSON, metric, risks JSON, sources JSON, impact 1-3, effort 1-3)
ResponseDecision(responseCardId, decision: KEPT|DISCARDED, decidedById)
ResponseNote(responseCardId, authorId, text)
InitiativeClosure(initiativeId, outcome, learnings, registeredOnProfile)
AgentRun(id, step, model, input JSON, output JSON, tokens, costUsd)
Draft(userId, scope, entityId?, payload JSON)     ← rascunhos de deck de perguntas
```

### 6.2 Regras de persistência (obrigatórias)

1. **Nada se perde.** Todo dado digitado ou escolhido é salvo no servidor. Ao recarregar, trocar de dispositivo ou sair e entrar, a pessoa vê o mesmo estado.
2. **Rascunho de deck de perguntas.** Cada carta respondida salva um `Draft` (debounce de 600 ms ao digitar, e na hora ao avançar de carta). Ao reabrir o deck, ele volta na carta e com os valores do rascunho. O rascunho é apagado só quando a pessoa conclui ou escolhe descartar.
3. **Atualização otimista.** A UI muda na hora (TanStack Query). Se o servidor falhar, desfaz e mostra aviso discreto com "Tentar de novo".
4. **Ações de carta** (manter/descartar, progresso, notas 1–5, encerrar, reabrir, arquivar, resolver dúvida) são salvas imediatamente.
5. **Estado de navegação útil também persiste:** filtro selecionado por deck, última carta aberta no deck de resposta e onboarding em andamento (pode ficar em `localStorage`; o resto, no banco).
6. **Soft delete** em remover, arquivar, encerrar e descartar, com opção de reabrir quando a UI oferece.
7. **Concorrência:** `updatedAt` em cada escrita. Se outra pessoa editou antes, recarrega e avisa.
8. **Auditoria mínima:** quem criou e quem alterou (`createdById`, `updatedById`) em eventos, entregas, notas de skill e decisões de deck de resposta.

---

## 7. Permissões

| Ação | Manager | IC |
|---|---|---|
| Criar, editar e administrar projeto, lideranças, squads, categorias | ✔ | — |
| Convidar pessoas | ✔ | — |
| Ver decks de qualquer pessoa do projeto | ✔ | só os próprios |
| Registrar eventos (check-in, feedback, promoção, mérito, mudança) | ✔ | — (vê os próprios) |
| Nota do manager em skills | ✔ | — |
| Autoavaliação, brain gym, jornada, saúde, entregas | vê | ✔ (os próprios) |
| Criar iniciativa e usar o agente | ✔ | ✔ |
| Editar os próprios dados e o avatar | ✔ | ✔ |

---

## 8. Requisitos não funcionais

- **Responsivo:** de 390 px a 1440 px+. Os protótipos têm as regras de `@media (max-width: 900px)`. No celular, os sheets ocupam a tela, as cartas viram coluna e a faixa do deck de resposta fica compacta.
- **Desempenho:** LCP < 2,5 s. Animações só com `transform`/`opacity` a 60 fps.
- **Acessibilidade:** WCAG 2.2 AA; navegação por teclado em cartas, pills, decks e no deck de resposta (←/→/Esc); `aria-live` nos status do agente e do carregamento.
- **Idioma:** pt-BR. Os textos dos protótipos são o padrão (tom direto, sem jargão, frases curtas).
- **Segurança:** dados isolados por projeto (row-level checks), uploads com URL assinada, chave do agente só no servidor.
- **Observabilidade:** logs de erro, métricas de uso por deck, custo do agente por projeto.

---

## 9. Plano de entrega

| Marco | Módulos | Resultado |
|---|---|---|
| 1 · Base | M0, M2 (cadastro), M3 | Conta, primeiro projeto e hub persistindo |
| 2 · Time | M4, M5, M6 (eventos, skills, entregas) | Gestão de time usável |
| 3 · Desenvolvimento | M6 (brain gym, jornada, saúde, power ups), M7 | Decks completos da pessoa e do squad |
| 4 · Iniciativas | M8 sem IA real (respostas fixas como no protótipo), depois M9 | Fluxo completo com agente |
| 5 · Site | M1, M10 | Aquisição e convites |

---

## 10. Critérios de aceite globais

1. **Fidelidade visual:** para cada tela, um teste Playwright tira screenshot em 1280 px e em 390 px e compara com o protótipo correspondente de `referencia/`, com tolerância baixa (as diferenças só podem vir dos dados).
2. **Animações:** todas as interações da seção 4.3 existem e respeitam reduced motion.
3. **Persistência:** para cada deck de perguntas e cada ação de carta, um teste E2E faz a ação, recarrega a página e confere que o dado continua lá.
4. **Um sheet por vez** em toda a aplicação.
5. **Permissões** da seção 7 cobertas por testes de API.

---

## 11. Mapa de telas → protótipos

| Tela | Arquivo em `referencia/` |
|---|---|
| Landing + wish list | `Coops01f-Landing-WishList.dc.html` |
| Cadastro | `Coops02-Cadastro.dc.html` |
| Primeiro acesso | `Coops02b-PrimeiroAcesso.dc.html` |
| Hub de projetos | `Coops03-Hub.dc.html` |
| Novo projeto (deck aberto) | `Coops04-Projeto.dc.html` |
| Time (manager) | `Coops05-Time.dc.html` |
| Membro (manager) | `Coops06-Membro.dc.html` |
| Meu perfil (IC) | `Coops07-Membro-IC.dc.html` |
| Iniciativas | `Coops08-Iniciativa.dc.html` |
| Agente confirma entendimento | `Coops09-Agente.dc.html` |
| Mesa da iniciativa | `Coops10-Mesa.dc.html` |
| Analisando o momento | `Coops10b-Analise.dc.html` |
| Momento + deck de ferramentas + deck de resposta | `Coops11-Momento.dc.html` |
| Deck de eventos | `Coops12-Deck-Eventos.dc.html` |
| Autoavaliação de skills | `Coops13-Skills.dc.html` |
| Brain gym | `Coops14-BrainGym.dc.html` |
| Jornada | `Coops15-Jornada.dc.html` |
| Estados vazios | `Coops16-Vazios.dc.html` |
| Card do squad | `Coops17-Squad.dc.html` |
| Decks do squad | `Coops18-Squad-Deck.dc.html`, `Coops18a`…`Coops18f` |
| Saúde (IC / manager) | `Coops19-Saude.dc.html`, `Coops19b-Saude-Manager.dc.html` |
| Entregas (manager / IC) | `Coops20-Entregas.dc.html`, `Coops20b-Entregas-IC.dc.html` |
| Administração / Meus dados | `Coops21-Admin.dc.html`, `Coops21b-Admin-IC.dc.html` |
| Design System | `CoopsDS-Fundamentos.dc.html`, `CoopsDS-Componentes.dc.html`, `CoopsDS-Avatares*.dc.html`, `CoopsAvatar.dc.html` |

### 11.1 Como ler um protótipo `.dc.html`

- **`<x-dc>…</x-dc>`:** marcação da tela. `{{chave}}` é um valor vindo do estado; `<sc-for list="{{lista}}" as="x">` é um loop; `<sc-if value="{{cond}}">` é um condicional.
- **`<helmet><style>`:** CSS da tela, incluindo os `@keyframes`. Copie sem alterar valores.
- **`<script type="text/x-dc" data-dc-script>`:** classe `Component` com `state` inicial e `renderVals()`, que calcula tudo que a tela mostra. Use como especificação de comportamento: estados, validações, textos dinâmicos e transições.
- **`<dc-import name="CoopsAvatar" …>`:** uso do componente de avatar com props.
- **`canvas.json`:** organização das telas no canvas (fluxos e títulos).

---

## 12. Perguntas em aberto

1. Ciclo de avaliação de skills e de jornada: trimestral fixo ou configurável por projeto?
2. Um IC pode pertencer a mais de um projeto ao mesmo tempo?
3. Limite de uso do agente por projeto (custo) e o que mostrar quando o limite acaba.
4. Retenção de anexos e conversas com o agente (LGPD).
5. Login: só link mágico e Google, ou também senha?
