# De-para · protótipos (canvas "Forja") → app

Fonte: canvas de protótipos (página "Coops · Fluxo" e "Coops · Design System"), espelhado em `docs/referencia/`.
Método: cobertura de textos e de classes/animações CSS de cada protótipo contra o código do app, mais leitura do markup e dos scripts de cada tela.
**Não houve comparação visual no navegador** (sem banco de dados no ambiente de desenvolvimento): confirme em preview.

Legenda: ✅ alinhado · 🟡 parcial (lacunas listadas) · ⚪ não comparado em detalhe

## Fluxo

| Protótipo | Rota / componente no app | Status | Lacunas / observações |
|---|---|---|---|
| 01f Landing + wish list | `app/page.tsx`, `components/landing/*` | ✅ | Cobertura de textos 100%. |
| 02 Cadastro | `app/cadastro`, `app/entrar` | ✅ | Cobertura de textos 100%. |
| 02b Primeiro acesso | `app/primeiro-acesso`, `components/wizard` | ✅ | Já era um porte fiel (classes `fa-*`, passos, cartas). Ajustados os subtítulos dos passos por estado e o aviso "Tudo isso fica na administração do projeto". |
| 03 Hub de projetos | `app/hub` | 🟡 | Só mensagens de validação do deck "novo projeto" divergem. |
| 04 Novo projeto | `components/wizard/ProjectDeck.tsx` | 🟡 | Mensagens de erro por carta divergem. |
| 05 Time (manager) | `app/p/[projectId]/time`, `components/team` | ✅ | Calendário de data de entrada (`DateCalendar`, com seletores de mês/ano além do protótipo); estados vazios. |
| 06 Membro (manager) | `pessoas/[personId]/ProfileClient.tsx` | ✅ | Pilhas, resumos por deck (saúde com delta e dimensão baixa, eventos por tipo, jornada atingidos/focos) e estados vazios. O botão "Ver como IC" do protótipo é só alternância de demonstração e não foi portado. |
| 07 Meu perfil (IC) | idem | ✅ | Idem; "Autoavaliação do Qx aberta" no deck de Skills. |
| 08 Iniciativas | `iniciativas/*`, `components/initiative` | ✅ | Deck de perguntas, carta "Nova iniciativa" animada (`in-new`/`in-plus`) e estado vazio. |
| 09 Agente confirma | `iniciativas/[id]/ConfereClient.tsx`, `lib/agentStub.ts` | 🟡 | Banner, cartas com ícones animados e chat com as classes do protótipo. O agente segue como stub (respostas fixas). |
| 10 Mesa / 10b Análise | `iniciativas/[id]/mesa`, `components/initiative/AnalysisOverlay.tsx` | ✅ | Overlay do agente analisando o momento e carta da iniciativa em destaque (`coops-ichov`, foguete animado, contador de contextos). As dúvidas resolvidas seguem agrupadas na carta da iniciativa (o protótipo as mostra como cartas separadas). |
| 11 Momento + ferramentas | `iniciativas/[id]/momento/MomentoClient.tsx`, `lib/toolIcons.ts` | 🟡 | Hero do agente, deck de ferramentas em leque com ícones animados por tipo, deck de resposta no palco (`s11-*`): carta em foco com impacto/esforço, descartar/mesa, leque de cartas, dock e resumo final. Faltam facetas ricas (evidências, passos, riscos, fontes), "Pedir variação" e a referência visual — o app só guarda título, tag, descrição, impacto, esforço, métrica e próximo passo. |
| 12 Deck · Eventos | `pessoas/[personId]/eventos`, `components/person/EventDeck.tsx` | ✅ | Banner animado, pilha com ícone por tipo, palco de celebração, carta em foco com rodapé fixo, "Registrado por", "Quem pode editar" e comentários recolhíveis. Fora de escopo: "cartas nesta pilha" (o protótipo só empilha registros dentro de um feedback; o app não tem esse dado) e anexos por arrastar arquivo (`fb-drop`; o app só guarda links e não há storage para eventos). |
| 13 Autoavaliação de skills | `pessoas/[personId]/skills` | 🟡 | Feito: cartas, painel de média, carta em foco com rubrica e evidências. Faltam: descrição da skill, comentário do manager e "Enviar autoavaliação" (sem campos no banco). |
| 14 Deck · Brain gym | `pessoas/[personId]/brain-gym`, `components/person/StudyDecks.tsx` | 🟡 | Feito: ícone animado por tipo, blocos de progresso, carta em foco. Falta: textos de resumo do deck "novo conteúdo". |
| 15 Deck · Jornada | `pessoas/[personId]/jornada`, `components/person/JourneyDeck.tsx` | 🟡 | Feito: ícones animados, pips numerados, carta em foco. Falta: "Ligado a quais objetivos?" nos focos e blocos de leitura do manager. |
| 16 Estados vazios | `components/person/EmptyDeckCard.tsx`, `ProfileClient.tsx`, `IniciativasClient.tsx` | ✅ | Decks vazios (eventos, skills, brain gym, jornada) para manager e IC; iniciativas vazias. Time vazio já existia. |
| 17 Card do time (squad) | `squads/[squadId]` | ✅ | Vitrine animada (`h17-*`), pilhas de decks com ícones animados e Saúde do time. |
| 18a–e Decks do squad | `squads/[squadId]/[deck]`, `components/squad`, `lib/validation.ts` | ✅ | Banner `dkban` e abas entre decks. Cartas e perguntas alinhadas campo a campo: Estratégia (declaração, hoje, futuro, H1–H3, ações), Indicador (por que, meta, valor/variação, % da meta, evidências, ações, desafio) e Alavanca (objetivo, como funciona, status, resultados). Cartas antigas continuam abrindo (campos novos vazios). Fora de escopo: o texto do "agente" por carta e o CTA contextual do protótipo. |
| 18f Saúde do time | `squads/[squadId]/[deck]/SaudeTimeClient.tsx` | ✅ | Cartas com média e variação, painel por ciclo, dica do agente; agregado só com 3+ respostas. |
| 19 / 19b Saúde (IC / manager) | `pessoas/[personId]/saude` | ✅ | Reescrita no padrão do protótipo; rascunho e envio persistem no banco. |
| 20 / 20b Entregas | `pessoas/[personId]/entregas`, `components/person/DeliveryDeck.tsx` | ✅ | Ícone animado, impacto pendente/editável (`imp-cta`), carta em foco e link "Abrir mesa da iniciativa". (Correção: `imp-*` é o fluxo de impacto, não "importar da mesa".) |
| 21 / 21b Administração | `app/admin`, `components/admin` | 🟡 | Ícones animados por tipo de card, incluindo o coração de saúde; cobertura de textos ~70–80% (restante é dado de exemplo). |

## Design system

| Protótipo | App | Status |
|---|---|---|
| DS Fundamentos / Componentes | `app/ds` | ⚪ O `/ds` cobre cores, botões e avatares; não inclui a biblioteca completa de cartas e animações. |
| Avatares (v1, v2) | `components/avatar` | ✅ |

## Mecanismos e arquitetura

| Item | Protótipo | App | Status |
|---|---|---|---|
| Estado | `setState` local, dados de exemplo | Banco (Prisma) + rotas `/api/people/*`; atualização otimista | ✅ (melhor que o protótipo) |
| Rascunhos de deck | não há | `/api/drafts` (Saúde, decks de projeto/iniciativa/pessoa) | ✅ |
| Carta em foco | `.coops-focus` + `coopsFocusIn/Out` | `components/ds/FocusCard.tsx` (+ `FocusClose`) | ✅ — mesma classe e animação; o protótipo posiciona de forma absoluta no artboard, o app em tela cheia. |
| Pickers de tipo | `.coops-card.ev-opt` | idem, sombra por variável `--evs` | ✅ |
| Bottom sheet / deck de perguntas | `.coops-wz-card` empilhadas | `BottomSheet` + `QuestionDeck` | ✅ |
| Cortina entre páginas | `body::after/before` | `useCoopsRouter` + `base.css` | ✅ |
| `prefers-reduced-motion` | em todo bloco de animação | `styles/prototype.css` copia as regras | ✅ |
| Animações CSS | por tela, dentro de `<helmet>` | `styles/motion.css`, `profile.css` e `prototype.css` (gerado a partir dos protótipos) | ✅ para as telas portadas; telas ⚪ já têm o CSS carregado, falta o markup. |

## Próximos passos sugeridos

1. Momento: facetas ricas do deck de resposta (exigem dados do agente real, M9).
2. Eventos: anexos de arquivo (precisa de storage por evento).
4. `/ds`: ampliar com a biblioteca de cartas e animações (hoje cobre cores, botões e avatares).
