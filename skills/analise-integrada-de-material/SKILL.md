---
name: "analise-integrada-de-material"
description: "Recebe link ou arquivo (Figma, PDF, PPT, imagens, URL), extrai as telas e aciona as skills de análise heurística, métricas e estratégia, consolidando tudo num parecer único."
---

# Análise integrada de material

Orquestrador. Não faz a análise sozinho: prepara o material, decide quais skills acionar, roda cada uma e junta os resultados num parecer só, com prioridades cruzadas.

Gatilhos: "analisa esse material", "roda as análises nesse link", "heurística + métricas + estratégia", "faz o review completo", ou quando o usuário mandar um link/arquivo de Figma, PDF, PPT ou imagens pedindo análise sem especificar qual.

## 1. Ingestão: transformar qualquer entrada em telas

Objetivo: sair desta etapa com uma lista ordenada de telas (imagem + nome + texto extraído) numa pasta de trabalho `analise/<nome-do-material>/telas/`, nomeadas `tela-1.png`, `tela-2.png`… Esses mesmos arquivos e essa mesma numeração são usados pelas três skills, para que "Tela 3" signifique a mesma coisa em todas as entregas.

Cuidados que as três skills exigem:
- Compor PNGs com transparência sobre fundo branco (`bg = Image.new("RGBA", im.size, "white"); bg.alpha_composite(im.convert("RGBA"))`).
- Figma: se o download pela URL do `get_screenshot` for bloqueado, chamar com `enableBase64Response: true` e copiar o arquivo indicado em "Image source". Guardar as coordenadas do `get_metadata` num `coordenadas.json`, porque as três skills usam essas coordenadas para posicionar marcações.
- PPT: guardar também as notas do apresentador (a `estrategia-jungle` usa).

| Entrada | Como extrair |
|---|---|
| Link do Figma | Figma MCP: `get_metadata` para listar frames da página/nó do link; `get_screenshot` para cada frame relevante; `get_design_context` quando precisar de textos e componentes. Se o link não tiver node-id, listar as páginas e perguntar qual fluxo. |
| PDF | Skill `pdf-reading`: rasterizar páginas em PNG e extrair o texto de cada página. |
| PPT/PPTX | Skill `pptx`: extrair texto e notas de cada slide; converter para PDF (LibreOffice) e rasterizar os slides. |
| Imagens | Usar direto; ordenar pelo nome do arquivo ou pela ordem enviada. |
| URL de produto (site, Lovable, Figma Make, artifact) | WebFetch para texto; Claude in Chrome para screenshots das telas/estados. |
| Link do Google Drive | Conector do Google Drive para baixar o arquivo e seguir a linha do formato correspondente. |

Se um link não abrir (sem acesso, privado), dizer isso numa linha e pedir o arquivo exportado ou a permissão — não seguir com análise parcial sem avisar.

Ao final, registrar um `inventario.md` com: tipo de material, nº de telas, nome/ordem de cada uma e o fluxo aparente.

## 2. Contexto mínimo

As três skills têm portões próprios: a `screen-ia-usability-review` faz 3 perguntas e espera; a `screen-metrics-tagging` só mapeia depois da core action confirmada; a `estrategia-jungle` pode fazer até 2 perguntas. O orquestrador junta tudo numa **única rodada**, para que nenhuma skill filha precise parar depois.

Depois da ingestão, mandar uma mensagem só com:
1. **Inventário de telas** (tabela: nº, tela, momento, atividade principal proposta) para confirmar o escopo.
2. **Core action proposta**, com 1 linha de justificativa.
3. **Objetivo do fluxo** (o que a pessoa precisa conseguir e o que o negócio espera).
4. **Especificidades** (compliance, limitações técnicas, design system, fora do escopo).
5. **O que se sabe do comportamento do usuário** (funil, pesquisas, suporte).
6. **Momento do material** (discovery, proposta, solução detalhada, em produção) e **para quem é a análise**.
7. Opcional: ferramenta de analytics e eventos que já existem.

Junto de cada item, dar a hipótese que o material sugere, para o usuário só confirmar ou corrigir. Deixar claro que "não sei" vale. Não perguntar o que o material ou a mensagem já respondem.

Esperar a resposta antes de rodar as skills. Se a sessão rodar sem ninguém para responder, seguir com as hipóteses, marcá-las como suposições e declarar a core action como não confirmada.

## 3. Roteamento: quais skills acionar

Esta skill orquestra exatamente três skills. Não acionar outras.

Padrão: se o usuário não especificou, rodar as três.

| Frente | Skill | O que entrega |
|---|---|---|
| Heurística / usabilidade | `screen-ia-usability-review` | Marcações numeradas nas telas, score 0–100 e problemas priorizados de arquitetura da informação e usabilidade. |
| Métricas | `screen-metrics-tagging` | Confirmação da Core Action e pontos a taguear nas telas, numerados, nas camadas de negócio, produto e experiência, com o porquê de cada um. |
| Estratégia | `estrategia-jungle` | Leitura estratégica do material. Sempre por último, recebendo os resultados das outras duas como insumo. |

Se o usuário pedir só uma frente ("só heurística"), rodar só ela e oferecer as outras numa linha no final.

Se alguma das três skills não estiver disponível na sessão, avisar numa linha qual faltou, rodar as outras e seguir com a consolidação.

## 4. Execução

Ordem:
1. `screen-ia-usability-review` e `screen-metrics-tagging` (independentes entre si, rodar em sequência direta sem esperar confirmação).
2. `estrategia-jungle` por último, recebendo:
   - contexto da etapa 2;
   - top problemas da heurística com o score;
   - Core Action e pontos de tagueamento principais;
   - pedido explícito: "analisa pela lente estratégica: o material resolve o objetivo de negócio? onde está o maior risco? o que eu levaria para a discussão com o time/stakeholders?"

Carregar cada skill com a ferramenta Skill e seguir as instruções dela, com estes ajustes de orquestração:
- **Telas já obtidas:** pular a etapa "obter a tela/material" da skill filha e usar os arquivos de `telas/`.
- **Portões já atendidos:** as respostas da etapa 2 valem como resposta às 3 perguntas da `screen-ia-usability-review`, como confirmação da Fase 1 da `screen-metrics-tagging` e como contexto da `estrategia-jungle`. Não perguntar de novo.
- **Página interativa de cada skill:** publicar normalmente (é onde ficam a reavaliação por achado e o histórico), com `declare_capabilities`.
- **Telas marcadas e resposta curta de cada skill:** não enviar ao usuário durante a execução. Guardar as imagens em `resultados/` e entregar tudo junto no final (etapa 6).
- **`estrategia-jungle` sem duplicar:** passar os achados da heurística e os pontos de métricas e pedir que ela cite esses números ("ver heurística #3", "ver métricas #12") em vez de criar achados repetidos sobre estados de tela ou sinais de sucesso; os achados dela devem focar em problema, solução, ecossistema e evolução.

Salvar os dados de cada skill (`dados.json` / bloco `DATA`) e o link da página publicada em `resultados/<frente>.md`.

## 5. Consolidação (o valor do orquestrador)

Cruzar as frentes em vez de empilhá-las:
- **Problemas de usabilidade na etapa da Core Action** sobem para prioridade máxima — afetam diretamente a métrica principal.
- **Pontos de tagueamento sem tela/estado correspondente** viram lacuna de design (ex.: não há estado de erro, então a taxa de erro não é mensurável).
- **Problemas heurísticos que contradizem a tese estratégica** viram ponto de decisão para o time.
- Problemas que aparecem em mais de uma frente são consolidados num item só.

Estrutura do parecer:
1. **Resumo executivo** (5 linhas no máximo): o material cumpre o objetivo? Score de usabilidade e score de maturidade estratégica (com as faixas), Core Action, maior risco, recomendação principal.
2. **Prioridades cruzadas**: tabela com item, frentes onde aparece, impacto (alto/médio/baixo), esforço estimado, tela.
3. **Heurística**: score, prints marcados, problemas priorizados (resumo, com o detalhe da skill anexado).
4. **Métricas**: Core Action, pontos de tagueamento por camada (negócio, produto, experiência) com prints marcados.
5. **Estratégia**: leitura estratégica, provocações para o time.
6. **Próximos passos**: 3 a 5 ações concretas com dono sugerido (design, produto, dados, engenharia).

## 6. Entrega

Entrega em duas camadas, numa única resposta final:

1. **Parecer consolidado** como artifact do tipo Docs (listar os tipos primeiro): seções 1, 2 e 6 completas; seções 3, 4 e 5 em resumo, cada uma com o link da página interativa da skill correspondente ("detalhe e reavaliação por achado aqui"). Embutir só os prints que sustentam as prioridades cruzadas.
2. **As três páginas interativas** já publicadas pelas skills (heurística, métricas, estratégia), linkadas no parecer.

Depois, enviar as telas marcadas de uma vez, agrupadas por frente, para quem quiser colar no Figma.

- Se o usuário pediu outro formato (PDF, PPT, Notion, Figma com anotações), usar esse no parecer consolidado.
- Se for para apresentar a stakeholders, perguntar se prefere deck (tipo Slides).
- Resposta final no chat: 2–3 frases com o veredito e os dois scores. Não repetir o conteúdo; os cards dos artifacts já trazem os links.
- Contexto novo que o usuário adicionar depois numa página interativa muda só aquela frente. Se ele pedir para atualizar o parecer, ler o estado salvo de cada página (`db_get` em `revisoes/estado`) antes de reconsolidar.

## Regras

- Não inventar dados de uso: métricas são propostas de medição, não números.
- Indicar sempre de qual tela vem cada achado (número da tela no inventário).
- Se o material tiver mais de ~25 telas, propor recorte por fluxo antes de analisar tudo.
- Escrever em português, no tom de quem lidera design: direto, com prioridade clara e ligação com resultado de negócio.