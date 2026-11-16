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
| 02b Primeiro acesso | `app/primeiro-acesso`, `components/wizard` | 🟡 | Conferir passos 2 e 3 (textos "Escolha por onde seguir", "Organize quem você convidou em squads") e as validações por carta. |
| 03 Hub de projetos | `app/hub` | 🟡 | Só mensagens de validação do deck "novo projeto" divergem. |
| 04 Novo projeto | `components/wizard/ProjectDeck.tsx` | 🟡 | Mensagens de erro por carta divergem. |
| 05 Time (manager) | `app/p/[projectId]/time`, `components/team` | 🟡 | Mensagens de validação do convite/squad; estados vazios já existem (`ep-c1..3`). |
| 06 Membro (manager) | `pessoas/[personId]/ProfileClient.tsx` | ✅ | Pilhas, resumos por deck (saúde com delta e dimensão baixa, eventos por tipo, jornada atingidos/focos) e estados vazios. O botão "Ver como IC" do protótipo é só alternância de demonstração e não foi portado. |
| 07 Meu perfil (IC) | idem | ✅ | Idem; "Autoavaliação do Qx aberta" no deck de Skills. |
| 08 Iniciativas | `iniciativas/*`, `components/initiative` | 🟡 | Deck de perguntas existe; estado vazio agora segue o Coops16. |
| 09 Agente confirma | `lib/agentStub.ts` | ⚪ | O agente é um stub; o protótipo tem animações `ag-*` já carregadas no CSS, sem tela equivalente. |
| 10 Mesa / 10b Análise | `iniciativas/[id]/mesa` | ⚪ | Animações `an-*`, `ic-*` carregadas no CSS; tela não comparada. |
| 11 Momento + ferramentas | `iniciativas/[id]/momento` | ⚪ | Animações `s11-*` carregadas no CSS; tela não comparada. |
| 12 Deck · Eventos | `pessoas/[personId]/eventos`, `components/person/EventDeck.tsx` | 🟡 | Feito: banner animado, pilha com ícone por tipo, palco de celebração, carta em foco, "Registrado por", "Quem pode editar" e comentários recolhíveis. Faltam: pilha com várias cartas empilhadas, anexos por arrastar arquivo (o app só guarda links; exigiria storage) e micro-animações nas perguntas do deck. |
| 13 Autoavaliação de skills | `pessoas/[personId]/skills` | 🟡 | Feito: cartas, painel de média, carta em foco com rubrica e evidências. Faltam: descrição da skill, comentário do manager e "Enviar autoavaliação" (sem campos no banco). |
| 14 Deck · Brain gym | `pessoas/[personId]/brain-gym`, `components/person/StudyDecks.tsx` | 🟡 | Feito: ícone animado por tipo, blocos de progresso, carta em foco. Falta: textos de resumo do deck "novo conteúdo". |
| 15 Deck · Jornada | `pessoas/[personId]/jornada`, `components/person/JourneyDeck.tsx` | 🟡 | Feito: ícones animados, pips numerados, carta em foco. Falta: "Ligado a quais objetivos?" nos focos e blocos de leitura do manager. |
| 16 Estados vazios | `components/person/EmptyDeckCard.tsx`, `ProfileClient.tsx`, `IniciativasClient.tsx` | ✅ | Decks vazios (eventos, skills, brain gym, jornada) para manager e IC; iniciativas vazias. Time vazio já existia. |
| 17 Card do time (squad) | `squads/[squadId]` | ✅ | Vitrine animada (`h17-*`), pilhas de decks com ícones animados e Saúde do time. |
| 18a–e Decks do squad | `squads/[squadId]/[deck]`, `components/squad` | 🟡 | Banner `dkban`, abas de navegação entre decks e contagens portados. Cartas e carta em foco seguem a implementação anterior (comparar campo a campo). |
| 18f Saúde do time | `squads/[squadId]/[deck]/SaudeTimeClient.tsx` | ✅ | Cartas com média e variação, painel por ciclo, dica do agente; agregado só com 3+ respostas. |
| 19 / 19b Saúde (IC / manager) | `pessoas/[personId]/saude` | ✅ | Reescrita no padrão do protótipo; rascunho e envio persistem no banco. |
| 20 / 20b Entregas | `pessoas/[personId]/entregas`, `components/person/DeliveryDeck.tsx` | ✅ | Ícone animado, impacto pendente/editável (`imp-cta`), carta em foco e link "Abrir mesa da iniciativa". (Correção: `imp-*` é o fluxo de impacto, não "importar da mesa".) |
| 21 / 21b Administração | `app/admin`, `components/admin` | ⚪ | Cobertura de textos ~70–80% (restante é dados de exemplo). |

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

1. Cartas e carta em foco dos decks do squad (18a–e): comparar campo a campo.
2. Mesa, Momento e Agente (09–11): portar o markup para usar as animações já carregadas.
3. Eventos: pilha com várias cartas e micro-animações nas perguntas.
4. Administração (21/21b), Primeiro acesso (02b) e `/ds`: comparar com o mesmo método.
