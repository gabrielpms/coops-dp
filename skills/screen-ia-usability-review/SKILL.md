---
name: "screen-ia-usability-review"
description: "Analisa telas (print, Figma, URL, Lovable) em arquitetura da informação e usabilidade: pergunta o contexto da jornada e entrega uma página com print marcado, achados reavaliáveis com novo contexto e score 0–100. Use para 'analisa essa tela'."
---

# Objetivo

Fazer uma análise crítica e acionável de uma ou mais telas, cobrindo arquitetura da informação (AI) e usabilidade. A análise serve para designers melhorarem a tela e para levar o assunto ao time e a stakeholders. Ela deve ser específica (apontar o elemento exato), fundamentada (citar o princípio) e priorizada (o que corrigir primeiro).

Acione esta skill sempre que o usuário enviar uma tela, print, link do Figma, URL, protótipo do Lovable/Figma Make ou artifact e pedir análise, review, feedback, crítica, avaliação heurística, "o que melhorar nessa tela", "tá boa essa tela?", "analisa a usabilidade" ou "analisa a arquitetura da informação".

# 1. Obter a tela

- **Imagem anexada:** ler diretamente.
- **Link do Figma:** usar as ferramentas do Figma (get_screenshot para ver a tela; get_design_context ou get_metadata para hierarquia, textos e componentes).
- **URL ou protótipo publicado:** abrir no navegador, tirar screenshot e ler o texto da página. Se houver fluxo, navegar pelas telas principais.
- **Várias telas:** analisar cada uma e depois o fluxo entre elas (consistência, continuidade, navegação).

Se não for possível acessar a tela, pedir um print.

**É obrigatório ter a tela como arquivo de imagem (PNG/JPG) no workspace**, porque a saída é o print anotado:
- Imagem anexada: usar o arquivo enviado (trabalhar numa cópia).
- Figma: exportar o frame como imagem (download/export do nó). Usar get_metadata para obter as coordenadas reais dos elementos (x, y, largura, altura) e posicionar as marcações com precisão, ajustando a escala para o tamanho do arquivo exportado.
- URL/protótipo: capturar o screenshot como arquivo. Se a ferramenta só devolver a imagem para visualização, sem arquivo, pedir ao usuário que anexe o print.
- Se nada disso funcionar, pedir o print antes de analisar. Não entregar a análise sem as telas marcadas.

**Dica para Figma:** o download por URL do Figma costuma ser bloqueado no workspace. Chamar get_screenshot com `enableBase64Response: true`; o resultado traz uma linha "Image source: /tmp/...png". Copiar esse arquivo para o diretório de trabalho. Se o nó do link for uma seção com várias telas (variantes), fazer um screenshot por frame, usando os ids que o get_metadata lista.

# 2. Entender o contexto da jornada (antes de julgar)

Usabilidade só se avalia diante de um objetivo. **Depois de receber o link ou a imagem, e antes de analisar, sempre fazer estas 3 perguntas ao usuário:**

1. **Qual é o objetivo do fluxo?** O que a pessoa precisa conseguir fazer e o que o negócio espera dessa jornada.
2. **Existe alguma especificidade que precisa ser dita?** Por exemplo: regras regulatórias ou de compliance, limitações técnicas, teste A/B em andamento, restrições do design system, o que está fora do escopo.
3. **O que sabemos sobre o comportamento do usuário?** Dados de uso, funil, pesquisas, reclamações de suporte, perfil e familiaridade com o produto.

**Como perguntar**
- Primeiro obter e olhar a tela (seção 1), para fazer perguntas informadas.
- Mandar as 3 perguntas numa única mensagem curta. Junto de cada uma, dar a hipótese que a tela sugere, para o usuário só confirmar ou corrigir. Ex.: "1. Objetivo do fluxo: parece ser concluir um depósito rápido no app. É isso?"
- Deixar claro que pode responder só o que souber; "não sei" é uma resposta válida.
- Esperar a resposta antes de analisar. Não entregar análise parcial antes disso.
- Se o usuário já respondeu alguma dessas perguntas na mensagem inicial, não repetir; perguntar só o que faltar.
- Se a sessão rodar sem ninguém para responder (tarefa agendada, por exemplo), seguir com as hipóteses e declará-las como suposições.

**Como as respostas entram na análise**
- **Objetivo do fluxo:** define a tarefa principal e a core action. A severidade de cada achado é medida pelo quanto ele atrapalha esse objetivo.
- **Especificidades:** não recomendar o que elas proíbem (ex.: um texto legal obrigatório não vira "excesso de informação"). Quando uma especificidade gera um problema de usabilidade, apontar o problema e sugerir como conviver com a restrição.
- **Comportamento do usuário:** usar os dados para calibrar a severidade (um problema numa etapa com alto abandono pesa mais) e citar o dado no impacto do achado. Quando um achado contradiz o que os dados mostram, dizer isso. Não colocar em "Perguntas para o time" o que já foi respondido.

Além das 3 perguntas, identificar pela própria tela: produto e plataforma (web, app mobile, desktop, backoffice) e momento da jornada (onboarding, uso recorrente, checkout, erro etc.).

No topo da página, o contexto aparece em cartões (objetivo, usuário, especificidades, comportamento), marcando o que continuou sendo suposição.

# 3. Lentes de análise

Percorrer todas as lentes, mas só relatar o que for relevante para esta tela. Não preencher categoria por obrigação.

## A. Arquitetura da informação
- **Hierarquia e prioridade:** a informação mais importante para a tarefa é a mais visível? O olhar segue a ordem certa?
- **Organização e agrupamento:** os itens relacionados estão juntos? Os grupos fazem sentido para o modelo mental do usuário (não do organograma ou do banco de dados)?
- **Rotulagem:** os rótulos são claros, consistentes e na linguagem do usuário? Há jargão interno, ambiguidade ou termos diferentes para a mesma coisa?
- **Navegação e orientação:** a pessoa sabe onde está, de onde veio e para onde pode ir? Os caminhos de saída e retorno estão claros?
- **Encontrabilidade:** o que o usuário procura é fácil de achar (busca, filtros, atalhos)?
- **Divulgação progressiva:** a tela mostra o necessário agora e esconde o resto sem perder o acesso? Há excesso ou falta de informação?
- **Densidade e carga cognitiva:** quantidade de decisões, opções e textos simultâneos.

Referências: os 8 princípios de AI de Dan Brown (objetos, escolhas, divulgação, exemplares, portas de entrada, múltipla classificação, navegação focada, crescimento) e os sistemas de organização, rotulagem, navegação e busca de Rosenfeld & Morville.

## B. Usabilidade (10 heurísticas de Nielsen)
1. Visibilidade do status do sistema
2. Correspondência com o mundo real
3. Controle e liberdade do usuário
4. Consistência e padrões
5. Prevenção de erros
6. Reconhecimento em vez de memorização
7. Flexibilidade e eficiência de uso
8. Estética e design minimalista
9. Ajudar a reconhecer, diagnosticar e corrigir erros
10. Ajuda e documentação

## C. Interação e percepção
- **Affordance e significantes:** o que é clicável parece clicável? Os estados (hover, ativo, desabilitado, foco) existem?
- **CTA:** a ação principal é única e evidente? As ações secundárias e destrutivas estão diferenciadas?
- **Gestalt:** proximidade, similaridade, alinhamento e espaço em branco estão comunicando a estrutura certa?
- **Leis de UX:** Fitts (tamanho e distância de alvos, alcance do polegar no mobile), Hick (número de escolhas), Jakob (padrões conhecidos), Miller (agrupamento).
- **Formulários:** rótulos visíveis, campos na ordem lógica, validação no momento certo, mensagens de erro úteis, máscaras e teclados adequados.
- **Estados da tela:** vazio, carregando, erro, sucesso, primeiro uso. Apontar os que provavelmente não foram desenhados.

## D. Acessibilidade básica
- Contraste de texto e elementos (referência WCAG AA: 4,5:1 para texto normal).
- Tamanho mínimo de alvos de toque (cerca de 44×44 pt / 48×48 dp).
- Informação transmitida só por cor.
- Tamanho e legibilidade de texto, hierarquia tipográfica.
- Textos de links e botões que fazem sentido fora de contexto.

Quando a avaliação vier só de imagem, deixar claro que é uma estimativa visual e não uma auditoria técnica.

# 4. Severidade

Classificar cada problema numa escala inspirada em Nielsen:

- 🔴 **Crítico:** impede ou compromete seriamente a tarefa principal, gera erro com consequência ou exclui usuários. Corrigir antes de lançar.
- 🟠 **Alto:** causa confusão, retrabalho ou abandono em parte relevante dos usuários. Prioridade alta.
- 🟡 **Médio:** atrito perceptível, mas contornável. Entrar no backlog.
- ⚪ **Baixo:** polimento, consistência ou estética. Corrigir quando houver oportunidade.

Para decidir a severidade, considerar frequência (quantos encontram), impacto (quanto atrapalha) e persistência (acontece toda vez?).

# 5. Score de qualidade (0–100)

O score sai da rubrica abaixo, não de impressão geral. Assim telas diferentes podem ser comparadas e a mesma tela pode ser reavaliada depois de ajustada.

**Passo 1: nota de 0 a 5 por dimensão, a partir dos problemas encontrados nela**

| Nota | Critério |
|---|---|
| 5 | Nenhum problema relevante; boas práticas aplicadas |
| 4 | Só problemas de severidade baixa |
| 3 | Pelo menos um problema médio, nenhum alto ou crítico |
| 2 | Pelo menos um problema alto |
| 1 | Pelo menos um problema crítico |
| 0 | A dimensão impede a tarefa principal |

Meio ponto é permitido quando a dimensão fica entre dois níveis (ex.: vários problemas médios → 2,5).

**Passo 2: aplicar os pesos**

| Dimensão | Peso |
|---|---|
| Hierarquia e prioridade | 20 |
| Organização e rotulagem | 15 |
| Navegação e orientação | 15 |
| Interação e feedback | 15 |
| Prevenção e tratamento de erros | 15 |
| Acessibilidade | 10 |
| Consistência e estética | 10 |

Score = soma de (nota ÷ 5 × peso). Se uma dimensão não se aplicar à tela (ex.: tela sem nenhuma entrada de dados para avaliar erros), marcar "N/A" e redistribuir o peso proporcionalmente entre as demais.

**Passo 3: tetos por severidade**
- Qualquer problema crítico: score máximo 59.
- Três ou mais problemas altos: score máximo 74.

**Faixas**
- 90–100: Excelente
- 75–89: Bom
- 60–74: Regular
- 40–59: Fraco
- 0–39: Crítico

Calcular o score com código (não de cabeça) e mostrar a conta na tabela por dimensão. Com várias telas, dar um score por tela e um score geral (média simples), e apontar a tela mais fraca.

# 6. Marcações

As marcações numeradas são desenhadas na página de entrega (seção 7), por cima do print original, com o número igual ao do achado na lista ao lado.

**Regras das marcações**
- Um retângulo em volta do elemento exato e um círculo numerado num canto dele: superior esquerdo por padrão (`pos: "tl"`), ou `tr`, `bl`, `br` quando o número cobriria texto importante ou outra marcação.
- Cor pela severidade: vermelho = crítico, laranja = alto, amarelo = médio, cinza = baixo.
- Numerar na ordem dos problemas priorizados (1 = mais severo).
- Um problema que aparece em vários lugares usa o mesmo número em cada lugar.
- Problemas que não têm um local (ex.: "falta estado vazio", "não há busca") não recebem marcação; ficam só na lista, indicados como "sem marcação".

**Processo**
1. Rodar `grade.py` (abaixo) na tela para gerar uma cópia com grade de coordenadas, e olhar essa cópia para estimar as caixas (x0, y0, x1, y1) de cada elemento em pixels da imagem original. Com Figma, usar as coordenadas do get_metadata.
2. Registrar as caixas no campo `marcas` de cada achado, nos dados da página (seção 7).
3. **Conferir o posicionamento uma vez**: gerar a página e abrir uma captura dela (Chrome headless, se houver). Corrigir as coordenadas se precisar.

`grade.py`:
```python
import sys
from PIL import Image, ImageDraw
img = Image.open(sys.argv[1]).convert("RGB"); W, H = img.size
d = ImageDraw.Draw(img); passo = 50 if max(W, H) <= 1200 else 100
for x in range(0, W, passo):
    d.line([x, 0, x, H], fill=(255, 0, 180), width=1); d.text((x + 2, 2), str(x), fill=(255, 0, 180))
for y in range(0, H, passo):
    d.line([0, y, W, y], fill=(0, 160, 255), width=1); d.text((2, y + 2), str(y), fill=(0, 160, 255))
img.save(sys.argv[2]); print(sys.argv[2], (W, H))
```

As coordenadas da caixa são sempre em pixels da imagem original.

# 7. Entrega: página interativa

**A entrega é uma página publicada como artefato**, organizada assim:
- **Resumo no topo:** título, cartões de contexto (objetivo, usuário, especificidades, comportamento; suposições com borda tracejada) e o cartão de score: anel com a nota, faixa, barra de distribuição por severidade e as 3 dimensões mais fracas.
- **Centro:** a tela com as marcações à esquerda (fixa ao rolar, com seletor quando há mais de uma tela) e os achados à direita, com filtro por severidade. Cada achado mostra número, severidade, título, onde, o que acontece, impacto e princípio lado a lado, e a recomendação em destaque. Passar o mouse num achado destaca a marcação; tocar num número na tela leva ao achado.
- **Fim:** diagnóstico geral, score por dimensão com barras coloridas pela nota, e quatro cartões: o que está funcionando, quick wins, perguntas para o time e como validar.

**Reavaliação por achado, refletida na página inteira.** Cada achado tem "Responder ou adicionar contexto". A pessoa escreve o que a análise não considerou (um dado de uso, uma regra de compliance, uma decisão já tomada) e toca em "Reavaliar este achado". A página manda ao Claude o estado completo da análise mais a conversa daquele achado, e recebe de volta a análise atualizada. Com isso a página:
- reavalia o achado (mantido, ajustado ou descartado) e mostra a conversa nele, com as mudanças;
- ajusta outros achados que o contexto afeta, marcados com "Ajustado pela reavaliação do #n" e o motivo;
- atualiza as partes gerais: cartões de contexto (incorporando o que a pessoa confirmou), linha do score, diagnóstico geral, comentários das dimensões, o que está funcionando, quick wins, perguntas para o time (tirando o que foi respondido) e como validar;
- recalcula notas das dimensões, distribuição, filtros, marcações na tela e score ("Original X → atual Y");
- marca cada seção alterada com "Atualizado pela reavaliação do #n", destaca o que mudou e registra a reavaliação num histórico no topo;
- salva tudo no banco do artefato (documento `revisoes/estado`), para quem abrir depois ver a versão atual.
A reavaliação só muda o que o contexto justifica; o que continua correto fica igual.

**Como montar**
1. Salvar `template.html` e `montar.py` (abaixo) no diretório de trabalho.
2. Escrever `dados.json` com a análise (formato abaixo). As notas das dimensões e o score são calculados pela página a partir dos achados ligados a cada dimensão (seção 5); conferir que batem com o cálculo feito em código.
3. Copiar os prints para uma pasta `page/` com os nomes usados em `telas[].arquivo` e rodar `python3 montar.py template.html dados.json page/index.html`.
4. Conferir uma vez a página renderizada (seção 6, passo 3).
5. Publicar a pasta como artefato com `index.html` e os PNGs (publish_files), com título "Review da tela de [nome]".
6. Logo depois, declarar as capacidades do artefato (declare_capabilities): `{"sample": {"images": true}, "db": {}, "user": {}}`. Sem isso o botão de reavaliar não aparece. Para um artefato que já existe e ainda não tem as capacidades, declarar primeiro e publicar depois.
7. Na resposta do chat, dar só 2 a 3 linhas: score, faixa, o achado mais grave e que cada achado pode receber contexto na própria página. Não repetir o relatório no chat.

Se não houver ferramenta de artefato na sessão, enviar o `index.html` e os PNGs como arquivos (sem reavaliação na página; a conversa segue no chat).

**Contexto enviado pelo chat.** O usuário também pode responder no chat (ex.: "sobre o #2, o botão só preenche o valor"). Nesse caso, aplicar as mesmas regras da reavaliação na página: reavaliar o achado, ajustar outros achados afetados e atualizar todas as partes gerais em `dados.json` (contexto, notaScore, diagnóstico, comentários das dimensões, o que funciona, quick wins, perguntas, como validar). Republicar no mesmo artefato e responder no chat em 2 a 3 frases o que mudou na análise ou por que foi mantido.

**Ao voltar a uma análise já publicada**, ler o estado salvo pela página (db_get no documento `revisoes/estado`, com o slug do artefato) e incorporar ao `dados.json` antes de responder ou republicar, para não desfazer o que foi reavaliado.

**Formato de `dados.json`**
```json
{
 "titulo": "Review da tela de Depósito",
 "eyebrow": "Review de AI e usabilidade · Produto / Fluxo",
 "contextoItens": [
  {"rotulo": "Objetivo do fluxo", "texto": "...", "suposicao": false},
  {"rotulo": "Usuário", "texto": "...", "suposicao": true},
  {"rotulo": "Especificidades", "texto": "...", "suposicao": false},
  {"rotulo": "Comportamento", "texto": "...", "suposicao": false}
 ],
 "notaScore": "Uma linha sobre o que mais puxou o score.",
 "telas": [{"nome": "Variante 01", "arquivo": "tela-01.png", "w": 412, "h": 917, "alt": "Descrição da tela"}],
 "dimensoes": [{"nome": "Hierarquia e prioridade", "peso": 20, "achados": [3], "comentario": "..."}],
 "achados": [{"n": 1, "sev": "alto", "titulo": "...", "onde": "...",
   "marcas": [{"tela": 0, "box": [x0, y0, x1, y1], "pos": "tl"}],
   "oQue": "...", "principio": "...", "impacto": "...", "recomendacao": "..."}],
 "diagnostico": "3 a 5 linhas.",
 "funcionando": ["..."], "quickWins": ["..."], "perguntas": ["..."], "validar": ["..."]
}
```
- `contextoItens`: um cartão por item, com textos curtos (1 a 2 frases). `suposicao: true` quando o item foi inferido e não confirmado pelo usuário.
- Usar as 7 dimensões da seção 5, com os pesos de lá. `achados` lista os números dos achados ligados à dimensão; a nota sai do mais severo deles (2,5 quando há dois ou mais médios e nada pior). Dimensão que não se aplica: `"nota": null` (a página redistribui o peso).
- `w` e `h` são o tamanho em pixels do print; `box` usa essas mesmas unidades.
- `tela` é o índice da tela em `telas` (0 = primeira). Um achado presente em várias telas repete a marca para cada uma.
- Achado sem local: `"marcas": []`.
- Os textos aceitam `<b>` para negrito.

`montar.py`:
```python
import json, sys, html
# uso: python3 montar.py template.html dados.json saida.html
tpl, dados, saida = sys.argv[1:4]
d = json.load(open(dados))
s = open(tpl).read().replace("__TITULO__", html.escape(d["titulo"])).replace("__DATA__", json.dumps(d, ensure_ascii=False, indent=1).replace("</", "<\\/"))
open(saida, "w").write(s); print(saida)
```

`template.html` (não alterar; só os dados mudam):
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITULO__</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
/* Layout: faixa de resumo (contexto + score) no topo; tela fixa à esquerda e achados filtráveis à direita; diagnóstico, dimensões e próximos passos no fim. */
:root {
  --bg: #EEF0F4;
  --surface: #FFFFFF;
  --sunken: #F6F7F9;
  --ink: #12151C;
  --muted: #5B6170;
  --line: #E0E3EA;
  --accent: #3050E0;
  --ok: #2F9461;
  --sev-critico: #D3343A; --sev-alto: #E35D10; --sev-medio: #C08A00; --sev-baixo: #7D818D;
  --font-display: "Bricolage Grotesque", "Manrope", system-ui, sans-serif;
  --font-body: "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --radius: 16px;
  --shadow: 0 1px 2px rgba(18, 21, 28, .04), 0 8px 24px rgba(18, 21, 28, .06);
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0E1014; --surface: #171A20; --sunken: #1D2128; --ink: #ECEEF3; --muted: #9EA4B2; --line: #2A2F38; --accent: #8AA2FF; --ok: #5CC28E;
    --sev-critico: #FF6A70; --sev-alto: #FF8A3D; --sev-medio: #F0C030; --sev-baixo: #A4A8B3;
    --shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.25);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #0E1014; --surface: #171A20; --sunken: #1D2128; --ink: #ECEEF3; --muted: #9EA4B2; --line: #2A2F38; --accent: #8AA2FF; --ok: #5CC28E;
  --sev-critico: #FF6A70; --sev-alto: #FF8A3D; --sev-medio: #F0C030; --sev-baixo: #A4A8B3;
  --shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.25);
  color-scheme: dark;
}
* { box-sizing: border-box; }
html, body { margin: 0; }
body { background: var(--bg); color: var(--ink); font-family: var(--font-body); font-size: 15px; line-height: 1.55; -webkit-font-smoothing: antialiased; }
.wrap { max-width: 1280px; margin: 0 auto; padding: 36px 24px 72px; display: grid; gap: 24px; }
h1, h2, h3 { margin: 0; text-wrap: balance; }
h1 { font-family: var(--font-display); font-size: 36px; line-height: 1.08; font-weight: 800; letter-spacing: -0.02em; }
h2 { font-family: var(--font-display); font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
h3 { font-size: 16.5px; font-weight: 800; line-height: 1.35; letter-spacing: -0.005em; }
p { margin: 0; }
button { font: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); }
.eyebrow { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }

/* Resumo */
.hero { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: stretch; }
.hero-main { display: grid; gap: 16px; align-content: start; }
.ctx { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.ctx-item { padding: 12px 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; display: grid; gap: 4px; }
.ctx-item b { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
.ctx-item span { font-size: 14px; }
.ctx-item.suposicao { background: transparent; border-style: dashed; }
.ctx-text { color: var(--muted); max-width: 75ch; }
.scorecard { padding: 20px; display: grid; gap: 16px; align-content: start; }
.score-top { display: flex; gap: 18px; align-items: center; }
.ring { position: relative; width: 112px; height: 112px; flex: none; }
.ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring .track { stroke: var(--sunken); }
.ring .val { stroke: var(--band); transition: stroke-dashoffset .6s ease; }
.ring .num { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
.ring .num strong { font-family: var(--font-mono); font-size: 30px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.ring .num small { display: block; font-size: 11px; color: var(--muted); margin-top: 2px; }
.band { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 99px; background: color-mix(in srgb, var(--band) 16%, transparent); color: var(--ink); }
.band::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--band); }
.score-note { font-size: 13px; color: var(--muted); margin-top: 8px; }
.delta { font-size: 12.5px; font-weight: 700; margin-top: 6px; color: var(--ink); }
.dist { display: grid; gap: 8px; }
.dist-bar { display: flex; height: 8px; border-radius: 99px; overflow: hidden; background: var(--sunken); gap: 2px; }
.dist-bar i { display: block; height: 100%; background: var(--c); }
.dist-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; color: var(--muted); }
.dist-legend span { display: inline-flex; align-items: center; gap: 5px; }
.dist-legend span::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
.dist-legend b { color: var(--ink); font-variant-numeric: tabular-nums; }
.weak { display: grid; gap: 8px; padding-top: 14px; border-top: 1px solid var(--line); }
.weak-row { display: grid; grid-template-columns: 1fr 64px 28px; gap: 10px; align-items: center; font-size: 13px; }
.weak-row .meter { height: 6px; }
.hint { font-size: 13px; color: var(--muted); display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 12px; background: color-mix(in srgb, var(--accent) 7%, var(--surface)); border: 1px solid color-mix(in srgb, var(--accent) 18%, var(--line)); }
.hint b { color: var(--ink); }
.hist { display: grid; gap: 8px; padding: 14px 16px; }
.hist-item { display: grid; gap: 6px; font-size: 13.5px; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.hist-item:last-child { border-bottom: 0; padding-bottom: 0; }
.hist-item .chg { margin-top: 0; }
.hist-when { font-size: 12px; color: var(--muted); }
.upd { display: inline-block; margin-left: 8px; font-family: var(--font-body); font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 99px; background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--ink); vertical-align: middle; text-transform: none; letter-spacing: 0; }
.upd[hidden] { display: none; }
@keyframes flash { from { box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 35%, transparent); } to { box-shadow: var(--shadow); } }
.flash { animation: flash 1.6s ease-out; }

/* Área principal */
.main { display: grid; grid-template-columns: minmax(300px, 400px) 1fr; gap: 28px; align-items: start; }
.stage { position: sticky; top: 16px; display: grid; gap: 12px; }
.stage-panel { padding: 16px; background: var(--sunken); border: 1px solid var(--line); border-radius: 22px; display: grid; gap: 12px; }
.seg { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 4px; }
.seg button { flex: 1; border: 0; background: transparent; color: var(--muted); font-size: 13px; font-weight: 700; padding: 7px 10px; border-radius: 8px; cursor: pointer; }
.seg button[aria-selected="true"] { background: var(--ink); color: var(--surface); }
.screen { position: relative; border-radius: 26px; overflow: hidden; background: #fff; box-shadow: 0 0 0 1px var(--line), 0 18px 40px rgba(18, 21, 28, .14); }
.screen img { display: block; width: 100%; height: auto; }
.box { position: absolute; border: 2px solid var(--c); border-radius: 7px; pointer-events: none; background: color-mix(in srgb, var(--c) 6%, transparent); transition: box-shadow .15s, background .15s, opacity .15s; }
.marker { position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; border-radius: 50%; background: var(--c); color: #fff; border: 2px solid #fff;
  font: 800 12px/20px var(--font-body); text-align: center; cursor: pointer; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,.28); transition: transform .15s, opacity .15s; }
.mark.is-active .box { background: color-mix(in srgb, var(--c) 16%, transparent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 28%, transparent); }
.marker.is-active { transform: scale(1.2); }
.dim .box, .dim.marker { opacity: .22; }
.stage-note { font-size: 12.5px; color: var(--muted); text-align: center; }

/* Achados */
.findings { display: grid; gap: 14px; align-content: start; }
.findings-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.filters { display: flex; gap: 6px; flex-wrap: wrap; }
.filters button { border: 1px solid var(--line); background: var(--surface); color: var(--ink); font-size: 12.5px; font-weight: 700; padding: 6px 11px; border-radius: 99px; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; }
.filters button[aria-pressed="true"] { background: var(--ink); color: var(--surface); border-color: var(--ink); }
.filters button i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
.filters button span { font-variant-numeric: tabular-nums; opacity: .7; }
.list { display: grid; gap: 14px; }
.finding { position: relative; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); padding: 18px 20px 18px 24px; display: grid; gap: 14px; cursor: pointer; transition: box-shadow .15s, border-color .15s; overflow: hidden; }
.finding::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--c); }
.finding.is-active { border-color: color-mix(in srgb, var(--c) 55%, var(--line)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent), var(--shadow); }
.finding[hidden] { display: none; }
.finding.descartado { opacity: .6; }
.finding.descartado h3 { text-decoration: line-through; }
.f-top { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: start; }
.pin { width: 32px; height: 32px; border-radius: 10px; background: var(--c); color: #fff; font-weight: 800; font-size: 15px; display: grid; place-items: center; }
.pin.none { background: transparent; color: var(--c); border: 2px dashed var(--c); }
.f-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 4px; }
.pill { font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; background: color-mix(in srgb, var(--c) 14%, transparent); color: var(--ink); }
.pill.soft { background: var(--sunken); color: var(--muted); text-transform: none; letter-spacing: 0; }
.pill.status { background: color-mix(in srgb, var(--accent) 14%, transparent); text-transform: none; letter-spacing: 0; }
.where { font-size: 13px; color: var(--muted); margin-top: 2px; }
.f-body { display: grid; gap: 12px; }
.f-what { font-size: 15px; }
.f-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.f-cols div { background: var(--sunken); border-radius: 10px; padding: 10px 12px; font-size: 13.5px; }
.f-cols b, .reco b { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 2px; }
.reco { border-left: 3px solid var(--accent); padding: 4px 0 4px 14px; font-size: 14.5px; }
.reco b { color: var(--accent); }
.thread { display: grid; gap: 8px; padding-top: 4px; border-top: 1px solid var(--line); }
.msg { font-size: 14px; border-radius: 12px; padding: 10px 12px; display: grid; gap: 4px; max-width: 92%; }
.msg.user { justify-self: end; background: var(--sunken); }
.msg.claude { background: color-mix(in srgb, var(--accent) 8%, var(--surface)); border: 1px solid color-mix(in srgb, var(--accent) 16%, var(--line)); }
.msg .who { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
.chg { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.chip { font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 99px; background: var(--surface); border: 1px solid var(--line); }
.reply-toggle { justify-self: start; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font-size: 13px; font-weight: 700; padding: 7px 12px; border-radius: 10px; cursor: pointer; }
.reply-toggle:hover { border-color: var(--accent); color: var(--accent); }
.reply { display: grid; gap: 8px; }
.reply[hidden] { display: none; }
.reply label { font-size: 12.5px; color: var(--muted); }
.reply textarea { font: inherit; font-size: 14px; color: var(--ink); background: var(--sunken); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; min-height: 80px; resize: vertical; }
.reply-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.btn { border: 0; border-radius: 10px; padding: 9px 14px; background: var(--accent); color: #fff; font-size: 13.5px; font-weight: 800; cursor: pointer; }
.btn[disabled] { opacity: .55; cursor: progress; }
.status-note { font-size: 12.5px; color: var(--muted); }

/* Seções finais */
.panel { padding: 22px 24px; display: grid; gap: 16px; }
.diag { font-size: 16px; line-height: 1.6; max-width: 80ch; }
.dims { display: grid; gap: 2px; }
.dim-row { display: grid; grid-template-columns: minmax(180px, 1.1fr) 1.4fr 70px 70px minmax(160px, 1.6fr); gap: 14px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
.dim-row.head { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); padding-top: 0; }
.dim-row.total { border-bottom: 0; font-weight: 800; }
.dim-name b { display: block; }
.dim-name small { color: var(--muted); font-size: 12px; }
.meter { height: 8px; border-radius: 99px; background: var(--sunken); overflow: hidden; }
.meter i { display: block; height: 100%; border-radius: 99px; background: var(--m); }
.n { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.dim-com { color: var(--muted); font-size: 13.5px; }
.foot { font-size: 12.5px; color: var(--muted); }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
.next ul, .next ol { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; counter-reset: q; }
.next li { position: relative; padding-left: 28px; font-size: 14.5px; }
.next li::before { position: absolute; left: 0; top: 1px; width: 20px; height: 20px; border-radius: 6px; display: grid; place-items: center; font-size: 11px; font-weight: 800; }
.next.good li::before { content: "✓"; background: color-mix(in srgb, var(--ok) 16%, transparent); color: var(--ok); }
.next.wins li::before { counter-increment: q; content: counter(q); background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); }
.next.ask li::before { content: "?"; background: var(--sunken); color: var(--muted); }
.next.test li::before { content: "→"; background: var(--sunken); color: var(--muted); }

@media (max-width: 960px) {
  .ctx { grid-template-columns: 1fr; }
  .hero, .main { grid-template-columns: 1fr; }
  .stage { position: static; max-width: 420px; }
  .dim-row { grid-template-columns: 1fr 70px 70px; }
  .dim-row .meter, .dim-row .dim-com, .dim-row.head span:nth-child(2), .dim-row.head span:nth-child(5) { display: none; }
}
@media (max-width: 560px) {
  h1 { font-size: 28px; }
  .f-cols { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
</style>
</head>
<body>
<div class="wrap">
  <section class="hero">
    <div class="hero-main">
      <div class="eyebrow" id="eyebrow"></div>
      <h1 id="titulo"></h1>
      <div class="eyebrow">Contexto considerado <span class="upd" id="upd-contexto" hidden></span></div>
      <div id="ctx"></div>
      <p class="hint" id="banner" hidden><span><b>Discorda de algum achado?</b> Abra “Responder ou adicionar contexto” no achado. A análise inteira é refeita com o novo contexto.</span></p>
      <div class="card hist" id="historico" hidden></div>
    </div>
    <aside class="card scorecard" id="scorebox">
      <div class="eyebrow">Score de qualidade <span class="upd" id="upd-score" hidden></span></div>
      <div class="score-top">
        <div class="ring" aria-hidden="true">
          <svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="52" fill="none" stroke-width="12"/><circle class="val" id="ringval" cx="60" cy="60" r="52" fill="none" stroke-width="12" stroke-linecap="round"/></svg>
          <div class="num"><div><strong id="score"></strong><small>de 100</small></div></div>
        </div>
        <div>
          <span class="band" id="faixa"></span>
          <p class="score-note" id="scorenota"></p>
          <p class="delta" id="scoredelta" hidden></p>
        </div>
      </div>
      <div class="dist">
        <div class="dist-bar" id="distbar" aria-hidden="true"></div>
        <div class="dist-legend" id="distlegend"></div>
      </div>
      <div class="weak"><div class="eyebrow">Dimensões mais fracas</div><div id="weak" style="display:grid;gap:8px"></div></div>
    </aside>
  </section>

  <section class="main">
    <div class="stage">
      <div class="stage-panel">
        <div class="seg" role="tablist" aria-label="Tela analisada" id="tabs"></div>
        <div class="screen" id="screen"><img id="shot" alt=""></div>
      </div>
      <p class="stage-note">Passe o mouse num achado para destacá-lo na tela. Toque num número para ir ao achado.</p>
    </div>
    <div class="findings">
      <div class="findings-head">
        <h2 id="findings-title"></h2>
        <div class="filters" id="filters" role="group" aria-label="Filtrar por severidade"></div>
      </div>
      <div class="list" id="findings-list"></div>
    </div>
  </section>

  <section class="card panel" id="sec-diagnostico">
    <div class="eyebrow">Diagnóstico geral <span class="upd" id="upd-diagnostico" hidden></span></div>
    <p class="diag" id="diagnostico"></p>
  </section>

  <section class="card panel" id="sec-dimensoes">
    <h2>Score por dimensão <span class="upd" id="upd-dimensoes" hidden></span></h2>
    <div class="dims" id="dims"></div>
    <p class="foot">Nota por dimensão, a partir do achado mais severo ligado a ela: 5 sem problemas, 4 só baixos, 3 com médio (2,5 com dois ou mais médios), 2 com alto, 1 com crítico. Pontos = nota ÷ 5 × peso. Tetos: qualquer crítico limita a 59; três ou mais altos limitam a 74. Achados descartados não contam.</p>
  </section>

  <section class="grid2">
    <div class="card panel next good" id="sec-funcionando"><h2>O que está funcionando <span class="upd" id="upd-funcionando" hidden></span></h2><ul id="funcionando"></ul></div>
    <div class="card panel next wins" id="sec-quickWins"><h2>Quick wins <span class="upd" id="upd-quickWins" hidden></span></h2><ol id="quickwins"></ol></div>
    <div class="card panel next ask" id="sec-perguntas"><h2>Perguntas para o time <span class="upd" id="upd-perguntas" hidden></span></h2><ul id="perguntas"></ul></div>
    <div class="card panel next test" id="sec-validar"><h2>Como validar <span class="upd" id="upd-validar" hidden></span></h2><ul id="validar"></ul></div>
  </section>
  <p class="foot">Análise especialista: os achados são hipóteses fundamentadas, a confirmar com dados e testes. A acessibilidade foi estimada visualmente, sem auditoria de contraste.</p>
</div>

<script>
/* ============ DADOS DA ANÁLISE: preencher só este bloco ============ */
const DATA = __DATA__;
/* ==================================================================== */

const SEV = {
  critico: { label: "Crítico", c: "var(--sev-critico)", nota: 1 },
  alto:    { label: "Alto",    c: "var(--sev-alto)",    nota: 2 },
  medio:   { label: "Médio",   c: "var(--sev-medio)",   nota: 3 },
  baixo:   { label: "Baixo",   c: "var(--sev-baixo)",   nota: 4 }
};
const ORDEM = ["critico", "alto", "medio", "baixo"];
const STATUS = { mantido: "Avaliação mantida", ajustado: "Avaliação ajustada", descartado: "Descartado após contexto" };
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = v => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: v % 1 ? 1 : 0, maximumFractionDigits: 1 });
const BAND = s => s >= 90 ? ["Excelente", "var(--ok)"] : s >= 75 ? ["Bom", "var(--ok)"] : s >= 60 ? ["Regular", "var(--sev-medio)"] : s >= 40 ? ["Fraco", "var(--sev-alto)"] : ["Crítico", "var(--sev-critico)"];
const NOTA_COR = n => n >= 4.5 ? "var(--ok)" : n >= 3.5 ? "var(--sev-baixo)" : n >= 2.5 ? "var(--sev-medio)" : n >= 1.5 ? "var(--sev-alto)" : "var(--sev-critico)";

// estado: avaliação original + revisões
const ORIGINAL = JSON.parse(JSON.stringify(DATA.achados));
const REV = {};          // n -> { atual: {...}, conversa: [...], origem?: n }
let G = {};              // partes gerais revisadas: contextoItens, notaScore, diagnostico, funcionando, quickWins, perguntas, validar, dimComentarios
let LOG = [];            // histórico de reavaliações
let filtro = "todos";
const val = k => G[k] !== undefined ? G[k] : DATA[k];
const comentario = d => G.dimComentarios?.[d.nome] ?? d.comentario;
const achado = n => { const base = DATA.achados.find(a => a.n == n); return { ...base, ...(REV[n]?.atual || {}) }; };
const ativos = () => DATA.achados.map(a => achado(a.n)).filter(a => a.status !== "descartado");

function calcular(lista) {
  const porN = Object.fromEntries(lista.map(a => [a.n, a]));
  let bruto = 0, pesoAtivo = 0;
  const dims = DATA.dimensoes.map(d => {
    if (d.nota === null) return { ...d, notaCalc: null };
    const ligados = (d.achados || []).map(n => porN[n]).filter(Boolean);
    let nota = 5;
    if (ligados.length) {
      nota = Math.min(...ligados.map(a => SEV[a.sev].nota));
      if (nota === 3 && ligados.filter(a => a.sev === "medio").length >= 2) nota = 2.5;
    }
    pesoAtivo += d.peso;
    return { ...d, notaCalc: nota };
  });
  dims.forEach(d => { if (d.notaCalc !== null) { d.pontos = d.notaCalc / 5 * d.peso * 100 / pesoAtivo; bruto += d.pontos; } });
  const nCrit = lista.filter(a => a.sev === "critico").length, nAlto = lista.filter(a => a.sev === "alto").length;
  const teto = nCrit ? 59 : nAlto >= 3 ? 74 : 100;
  return { dims, bruto, teto, score: Math.round(Math.min(bruto, teto) * 10) / 10 };
}
const SCORE_ORIGINAL = calcular(ORIGINAL).score;

function renderResumo() {
  const r = calcular(ativos()), [faixa, cor] = BAND(r.score);
  $("scorebox").style.setProperty("--band", cor);
  $("score").textContent = fmt(r.score);
  const C = 2 * Math.PI * 52, ring = $("ringval");
  ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C * (1 - r.score / 100);
  $("faixa").textContent = faixa;
  $("scorenota").textContent = val("notaScore") + (r.teto < 100 && r.bruto > r.teto ? ` Teto de ${r.teto} aplicado.` : "");
  $("scorebox").setAttribute("aria-label", `Score de qualidade ${fmt(r.score)} de 100, faixa ${faixa}`);
  const mudou = r.score !== SCORE_ORIGINAL;
  $("scoredelta").hidden = !mudou;
  if (mudou) $("scoredelta").textContent = `Original ${fmt(SCORE_ORIGINAL)} → atual ${fmt(r.score)} com o contexto adicionado`;

  const lista = ativos(), cont = {}; lista.forEach(a => cont[a.sev] = (cont[a.sev] || 0) + 1);
  const desc = DATA.achados.length - lista.length;
  $("distbar").innerHTML = ORDEM.filter(k => cont[k]).map(k => `<i style="--c:${SEV[k].c};flex:${cont[k]}"></i>`).join("");
  $("distlegend").innerHTML = ORDEM.filter(k => cont[k]).map(k => `<span style="--c:${SEV[k].c}"><b>${cont[k]}</b> ${SEV[k].label.toLowerCase()}${cont[k] > 1 ? "s" : ""}</span>`).join("") + (desc ? `<span style="--c:var(--line)"><b>${desc}</b> descartado${desc > 1 ? "s" : ""}</span>` : "");

  $("weak").innerHTML = r.dims.filter(d => d.notaCalc !== null && d.notaCalc < 5).sort((a, b) => a.notaCalc - b.notaCalc).slice(0, 3)
    .map(d => `<div class="weak-row"><span>${d.nome}</span><div class="meter"><i style="width:${d.notaCalc / 5 * 100}%;--m:${NOTA_COR(d.notaCalc)}"></i></div><span class="n">${fmt(d.notaCalc)}</span></div>`).join("") || `<span class="foot">Nenhuma dimensão com problemas.</span>`;

  let html = `<div class="dim-row head"><span>Dimensão</span><span>Nota</span><span>Peso</span><span>Pontos</span><span>Comentário</span></div>`;
  r.dims.forEach(d => {
    const na = d.notaCalc === null;
    html += `<div class="dim-row"><div class="dim-name"><b>${d.nome}</b><small>${(d.achados || []).length ? "Achados " + d.achados.join(", ") : "Sem achados"}</small></div>
      <div style="display:flex;gap:10px;align-items:center"><div class="meter" style="flex:1"><i style="width:${na ? 0 : d.notaCalc / 5 * 100}%;--m:${na ? "var(--line)" : NOTA_COR(d.notaCalc)}"></i></div><span class="n">${na ? "N/A" : fmt(d.notaCalc)}</span></div>
      <span class="n">${d.peso}</span><span class="n">${na ? "—" : fmt(Math.round(d.pontos * 10) / 10)}</span><span class="dim-com">${comentario(d)}</span></div>`;
  });
  html += `<div class="dim-row total"><span>Total</span><span></span><span class="n">100</span><span class="n">${fmt(r.score)}</span><span class="dim-com">${r.teto < 100 && r.bruto > r.teto ? "Teto de " + r.teto + " aplicado" : "Sem teto aplicado"}</span></div>`;
  $("dims").innerHTML = html;

  const todos = DATA.achados.length;
  $("findings-title").textContent = `${todos} achados`;
  const opts = [["todos", "Todos", null, todos], ...ORDEM.filter(k => cont[k]).map(k => [k, SEV[k].label, SEV[k].c, cont[k]])];
  if (desc) opts.push(["descartado", "Descartados", "var(--line)", desc]);
  if (!opts.some(o => o[0] === filtro)) filtro = "todos";
  $("filters").innerHTML = opts.map(([k, l, c, n]) => `<button type="button" data-f="${k}" aria-pressed="${filtro === k}">${c ? `<i style="--c:${c}"></i>` : ""}${l} <span>${n}</span></button>`).join("");
}

let podeReavaliar = false;
function visivel(f) { return filtro === "todos" || (filtro === "descartado" ? f.status === "descartado" : f.sev === filtro && f.status !== "descartado"); }
function renderFinding(n) {
  const f = achado(n), s = SEV[f.sev], temMarca = f.marcas.length > 0, conv = REV[n]?.conversa || [];
  let el = $("achado-" + n);
  const aberto = el?.querySelector(".reply") && !el.querySelector(".reply").hidden;
  const rascunho = el?.querySelector("textarea")?.value || "";
  if (!el) { el = document.createElement("article"); el.id = "achado-" + n; el.tabIndex = 0; el.dataset.n = n; el.className = "finding"; $("findings-list").appendChild(el); bindFinding(el); }
  el.classList.toggle("descartado", f.status === "descartado");
  el.hidden = !visivel(f);
  el.style.setProperty("--c", s.c);
  el.innerHTML = `<div class="f-top"><div class="pin ${temMarca ? "" : "none"}" aria-hidden="true">${n}</div>
      <div><div class="f-meta"><span class="pill">${s.label}</span>${temMarca ? "" : `<span class="pill soft">Sem marcação</span>`}${f.status ? `<span class="pill status">${STATUS[f.status]}</span>` : ""}${REV[n]?.origem ? `<span class="pill soft">Ajustado pela reavaliação do #${REV[n].origem}</span>` : ""}</div>
      <h3>${f.titulo}</h3><div class="where">${f.onde}</div></div></div>
    <div class="f-body">
      <p class="f-what">${f.oQue}</p>
      <div class="f-cols"><div><b>Impacto</b>${f.impacto}</div><div><b>Princípio</b>${f.principio}</div></div>
      <div class="reco"><b>Recomendação</b>${f.recomendacao}</div>
    </div>
    ${conv.length ? `<div class="thread">${conv.map(m => m.autor === "usuario"
      ? `<div class="msg user"><span class="who">Contexto adicionado${m.nome ? " · " + esc(m.nome) : ""}</span>${esc(m.texto)}</div>`
      : `<div class="msg claude"><span class="who">Reavaliação</span>${esc(m.texto)}${m.mudancas?.length ? `<span class="chg">${m.mudancas.map(c => `<span class="chip">${esc(c)}</span>`).join("")}</span>` : ""}</div>`).join("")}</div>` : ""}
    ${podeReavaliar ? `<button class="reply-toggle" type="button" aria-expanded="${aberto ? "true" : "false"}">Responder ou adicionar contexto</button>
    <form class="reply" ${aberto ? "" : "hidden"}>
      <label for="ctx-${n}">O que a análise não considerou? Ex.: um dado de uso, uma regra de compliance, uma decisão já tomada.</label>
      <textarea id="ctx-${n}" name="ctx-${n}"></textarea>
      <div class="reply-actions"><button class="btn" type="submit">Reavaliar este achado</button><span class="status-note" role="status"></span></div>
    </form>` : ""}`;
  const ta = el.querySelector("textarea"); if (ta) ta.value = rascunho;
}
function renderTudo() { renderSecoes(); renderResumo(); DATA.achados.forEach(a => renderFinding(a.n)); desenhar(); }

let atual = 0;
function desenhar() {
  const t = DATA.telas[atual], screen = $("screen");
  screen.querySelectorAll(".mark, .marker").forEach(e => e.remove());
  $("shot").src = t.arquivo; $("shot").alt = t.alt; $("shot").width = t.w; $("shot").height = t.h;
  DATA.achados.map(a => achado(a.n)).filter(f => f.status !== "descartado").forEach(f => f.marcas.filter(m => (m.tela ?? 0) === atual).forEach(({ box: [x0, y0, x1, y1], pos = "tl" }) => {
    const c = SEV[f.sev].c, wrap = document.createElement("div"), box = document.createElement("div"), m = document.createElement("button");
    const fora = filtro !== "todos" && !visivel(f);
    wrap.className = "mark" + (fora ? " dim" : ""); wrap.dataset.n = f.n; wrap.style.setProperty("--c", c);
    box.className = "box"; box.style.setProperty("--c", c);
    Object.assign(box.style, { left: x0 / t.w * 100 + "%", top: y0 / t.h * 100 + "%", width: (x1 - x0) / t.w * 100 + "%", height: (y1 - y0) / t.h * 100 + "%" });
    wrap.appendChild(box);
    m.className = "marker" + (fora ? " dim" : ""); m.dataset.n = f.n; m.textContent = f.n; m.style.setProperty("--c", c);
    m.setAttribute("aria-label", `Achado ${f.n}: ${f.titulo}`);
    m.style.left = (pos.includes("r") ? x1 : x0) / t.w * 100 + "%";
    m.style.top = (pos.includes("b") ? y1 : y0) / t.h * 100 + "%";
    m.addEventListener("click", () => { if (!visivel(f)) { filtro = "todos"; renderTudo(); } foco(f.n, true); });
    screen.append(wrap, m);
  }));
}
function foco(n, rolar) {
  document.querySelectorAll(".mark, .marker").forEach(e => {
    const on = n != null && e.dataset.n == n, fora = filtro !== "todos" && !visivel(achado(e.dataset.n));
    e.classList.toggle("is-active", on); e.classList.toggle("dim", (n != null && !on) || (n == null && fora));
  });
  document.querySelectorAll(".finding").forEach(e => e.classList.toggle("is-active", e.dataset.n == n));
  if (rolar) $("achado-" + n)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
}
function bindFinding(el) {
  ["mouseenter", "focusin"].forEach(ev => el.addEventListener(ev, () => foco(el.dataset.n)));
  el.addEventListener("click", e => {
    foco(el.dataset.n);
    const t = e.target.closest(".reply-toggle");
    if (t) { const form = el.querySelector(".reply"); form.hidden = !form.hidden; t.setAttribute("aria-expanded", String(!form.hidden)); if (!form.hidden) form.querySelector("textarea").focus(); }
  });
  el.addEventListener("submit", e => { e.preventDefault(); reavaliar(Number(el.dataset.n), el); });
}
$("findings-list").addEventListener("mouseleave", () => foco(null));
$("filters").addEventListener("click", e => { const b = e.target.closest("button[data-f]"); if (!b) return; filtro = b.dataset.f; renderTudo(); });

document.title = DATA.titulo;
$("eyebrow").textContent = DATA.eyebrow; $("titulo").textContent = DATA.titulo;
function renderSecoes() {
  const ctx = val("contextoItens");
  if (ctx?.length) {
    $("ctx").className = "ctx";
    $("ctx").innerHTML = ctx.map(c => `<div class="ctx-item${c.suposicao ? " suposicao" : ""}"><b>${c.rotulo}${c.suposicao ? " · suposição" : ""}</b><span>${c.texto}</span></div>`).join("");
  } else { $("ctx").className = "ctx-text"; $("ctx").innerHTML = DATA.contexto || ""; }
  $("diagnostico").innerHTML = val("diagnostico");
  [["funcionando", "funcionando"], ["quickwins", "quickWins"], ["perguntas", "perguntas"], ["validar", "validar"]]
    .forEach(([id, k]) => { $(id).innerHTML = (val(k) || []).map(t => `<li>${t}</li>`).join(""); });
  const ult = LOG[LOG.length - 1];
  ["contexto", "score", "diagnostico", "dimensoes", "funcionando", "quickWins", "perguntas", "validar"].forEach(k => {
    const el = $("upd-" + k); if (!el) return;
    const on = !!ult && (ult.secoes || []).includes(k);
    el.hidden = !on; if (on) el.textContent = `Atualizado pela reavaliação do #${ult.n}`;
  });
  $("historico").hidden = !LOG.length;
  $("historico").innerHTML = LOG.length ? `<div class="eyebrow">Reavaliações (${LOG.length})</div>` + LOG.slice().reverse().slice(0, 5).map(l => `<div class="hist-item">
      <div><b>Achado #${l.n}</b>${l.nome ? " · " + esc(l.nome) : ""} <span class="hist-when">${new Date(l.em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span></div>
      <div>${esc(l.resumo || "")}</div>
      ${l.mudancas?.length ? `<span class="chg">${l.mudancas.map(c => `<span class="chip">${esc(c)}</span>`).join("")}</span>` : ""}</div>`).join("") : "";
}
if (DATA.telas.length > 1) {
  DATA.telas.forEach((t, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("role", "tab"); b.id = "tab-" + i; b.textContent = t.nome; b.setAttribute("aria-selected", i === 0);
    b.addEventListener("click", () => { atual = i; document.querySelectorAll("#tabs button").forEach((x, j) => x.setAttribute("aria-selected", j === i)); desenhar(); });
    $("tabs").appendChild(b);
  });
} else $("tabs").remove();
renderTudo();

// ===== Reavaliação com Claude (capacidade "sample") e estado salvo (capacidade "db") =====
let sample = null, db = null, user = null;
const NOMES_SECAO = { contexto: "contexto", score: "score", diagnostico: "diagnóstico", dimensoes: "dimensões", funcionando: "o que funciona", quickWins: "quick wins", perguntas: "perguntas para o time", validar: "como validar" };
const GERAIS = [["contextoItens", "contexto"], ["notaScore", "score"], ["diagnostico", "diagnostico"], ["funcionando", "funcionando"], ["quickWins", "quickWins"], ["perguntas", "perguntas"], ["validar", "validar"]];
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const camposAchado = r => ({ sev: r.sev, status: r.status, titulo: r.titulo, oQue: r.oQue, impacto: r.impacto, recomendacao: r.recomendacao });

function estadoAtual() {
  return {
    contextoItens: val("contextoItens") || [], notaScore: val("notaScore"), diagnostico: val("diagnostico"),
    funcionando: val("funcionando"), quickWins: val("quickWins"), perguntas: val("perguntas"), validar: val("validar"),
    scoreAtual: calcular(ativos()).score,
    dimensoes: DATA.dimensoes.map(d => ({ nome: d.nome, peso: d.peso, achados: d.achados, comentario: comentario(d) })),
    achados: DATA.achados.map(a => { const f = achado(a.n); return { n: f.n, sev: f.sev, status: f.status || null, titulo: f.titulo, onde: f.onde, oQue: f.oQue, impacto: f.impacto, principio: f.principio, recomendacao: f.recomendacao }; })
  };
}

async function reavaliar(n, el) {
  const ta = el.querySelector("textarea"), btn = el.querySelector(".btn"), st = el.querySelector(".status-note");
  const texto = ta.value.trim();
  if (!texto) { st.textContent = "Escreva o contexto antes de reavaliar."; ta.focus(); return; }
  btn.disabled = true; st.textContent = "Reavaliando a análise…";
  const conv = REV[n]?.conversa || [];
  const estado = estadoAtual();
  const prompt = `Você é um especialista em arquitetura da informação e usabilidade. Você fez a análise de uma tela (estado atual abaixo, em JSON) e a pessoa responsável pelo produto respondeu ao achado nº ${n} com mais contexto. Reavalie esse achado e atualize a análise inteira para que tudo continue coerente com a nova avaliação.

Regras:
- Mude a avaliação do achado nº ${n} só se o novo contexto justificar. Se não muda o problema para o usuário final, mantenha e explique por quê, com respeito e de forma direta.
- Uma restrição (compliance, técnica, decisão de negócio) não apaga um problema de usabilidade: pode mudar a recomendação para uma que conviva com a restrição, e às vezes a severidade.
- Dados de comportamento real (funil, testes, pesquisa) pesam mais que a heurística: se mostram que o problema não acontece, ajuste a severidade ou descarte.
- Descarte ("descartado") só quando ficar claro que não é um problema para o usuário nesta tela.
- O novo contexto pode afetar outros achados (ex.: um dado de uso que muda a severidade de outro problema, uma regra que invalida outra recomendação). Ajuste outros achados só quando o contexto realmente os afeta, e diga o motivo.
- Atualize as partes gerais para refletir o novo estado: diagnóstico geral (deve citar o problema mais grave que restou), a linha do score (o score é recalculado pela página; descreva o que mais pesa agora), comentários das dimensões, o que está funcionando, quick wins (tirar o que deixou de fazer sentido, incluir o que surgiu), perguntas para o time (tirar o que a pessoa já respondeu) e como validar.
- Se o contexto traz uma informação geral sobre o fluxo, o usuário ou o comportamento, incorpore em contextoItens (marque suposicao: false no que a pessoa confirmou).
- Não mude o que não precisa mudar: mantenha textos iguais quando continuam corretos.
- Severidade (Nielsen): critico = impede ou compromete seriamente a tarefa principal, gera erro com consequência ou exclui usuários; alto = causa confusão, retrabalho ou abandono em parte relevante dos usuários; medio = atrito perceptível mas contornável; baixo = polimento, consistência ou estética.
- Português do Brasil, frases curtas, sem jargão desnecessário. Os textos podem usar <b> para negrito.

Telas: ${DATA.telas.map(t => t.alt).join(" | ")}

Estado atual da análise:
${JSON.stringify(estado)}

Conversa anterior sobre o achado nº ${n}:
${conv.length ? conv.map(m => (m.autor === "usuario" ? "Pessoa: " : "Avaliação: ") + m.texto).join("\n") : "(nenhuma)"}

Nova mensagem da pessoa sobre o achado nº ${n}:
${texto}

Responda só com um objeto JSON, sem texto fora dele, neste formato:
{
 "achado": {"status":"mantido|ajustado|descartado","sev":"critico|alto|medio|baixo","titulo":"...","oQue":"...","impacto":"...","recomendacao":"..."},
 "resposta": "2 a 4 frases para a pessoa explicando o que mudou no achado e no resto da análise, ou por que manteve",
 "outrosAchados": [{"n":0,"status":"ajustado|descartado","sev":"...","titulo":"...","oQue":"...","impacto":"...","recomendacao":"...","motivo":"1 frase"}],
 "contextoItens": [{"rotulo":"...","texto":"...","suposicao":false}],
 "notaScore": "...",
 "diagnostico": "...",
 "dimensoes": [{"nome":"...","comentario":"..."}],
 "funcionando": ["..."], "quickWins": ["..."], "perguntas": ["..."], "validar": ["..."]
}
"outrosAchados" lista só os que mudaram (pode ser vazio). As demais chaves trazem a versão completa e atualizada de cada parte.`;
  try {
    const opts = { modelTier: "default" };
    try {
      const lim = await sample.limits?.();
      if (lim?.images) { const blob = await (await fetch(DATA.telas[atual].arquivo)).blob(); opts.images = [blob]; }
    } catch (_) {}
    const r = await sample.json(prompt, opts);
    const a = r?.achado;
    if (!a || !SEV[a.sev] || !STATUS[a.status]) throw { message: "Resposta fora do formato." };

    const scoreAntes = calcular(ativos()).score, antes = achado(n), mudancas = [], secoes = [];
    if (a.status === "descartado") mudancas.push(`#${n} descartado`);
    else if (a.sev !== antes.sev) mudancas.push(`#${n}: ${SEV[antes.sev].label} → ${SEV[a.sev].label}`);
    else mudancas.push(`#${n}: avaliação ${a.status === "mantido" ? "mantida" : "ajustada"}`);
    const nome = user ? await user.name?.().catch(() => null) : null;
    const agora = new Date().toISOString();
    REV[n] = { ...(REV[n] || {}), origem: undefined,
      atual: { ...camposAchado({ ...antes, ...a }) },
      conversa: [...conv, { autor: "usuario", texto, nome: nome || undefined, em: agora }, { autor: "claude", texto: r.resposta || "", mudancas: mudancas.slice(), em: agora }] };

    const afetados = [];
    (Array.isArray(r.outrosAchados) ? r.outrosAchados : []).forEach(o => {
      const base = DATA.achados.find(x => x.n == o.n);
      if (!base || o.n == n || !SEV[o.sev] || !STATUS[o.status]) return;
      const ant = achado(o.n), novo = camposAchado({ ...ant, ...o });
      if (igual(camposAchado(ant), novo)) return;
      const chg = o.status === "descartado" ? "Descartado" : o.sev !== ant.sev ? `Severidade: ${SEV[ant.sev].label} → ${SEV[o.sev].label}` : "Texto revisto";
      REV[o.n] = { ...(REV[o.n] || {}), origem: n, atual: novo,
        conversa: [...(REV[o.n]?.conversa || []), { autor: "claude", texto: `Ajustado pela reavaliação do #${n}. ${o.motivo || ""}`.trim(), mudancas: [chg], em: agora }] };
      afetados.push(o.n);
    });
    if (afetados.length) mudancas.push(`Também ajustou #${afetados.join(", #")}`);

    GERAIS.forEach(([k, sec]) => {
      const v = r[k];
      const ok = k === "notaScore" || k === "diagnostico" ? typeof v === "string" && v.trim() : Array.isArray(v) && v.length;
      if (ok && !igual(v, val(k))) { G[k] = v; if (!secoes.includes(sec)) secoes.push(sec); }
    });
    if (Array.isArray(r.dimensoes)) {
      const novos = { ...(G.dimComentarios || {}) }; let mudou = false;
      r.dimensoes.forEach(d => { const dim = DATA.dimensoes.find(x => x.nome === d.nome); if (dim && d.comentario && d.comentario !== comentario(dim)) { novos[d.nome] = d.comentario; mudou = true; } });
      if (mudou) { G.dimComentarios = novos; secoes.push("dimensoes"); }
    }
    const scoreDepois = calcular(ativos()).score;
    if (scoreDepois !== scoreAntes) {
      mudancas.push(`Score ${fmt(scoreAntes)} → ${fmt(scoreDepois)}`);
      ["score", "dimensoes"].forEach(sx => { if (!secoes.includes(sx)) secoes.push(sx); });
    }
    const gerais = secoes.filter(sx => sx !== "score" && sx !== "dimensoes").map(sx => NOMES_SECAO[sx]);
    if (gerais.length) mudancas.push(`Atualizou ${gerais.join(", ")}`);
    LOG.push({ n, nome: nome || undefined, resumo: r.resposta || "", mudancas, secoes, afetados, em: agora });

    ta.value = "";
    renderTudo();
    const flash = e => { if (!e) return; e.classList.remove("flash"); void e.offsetWidth; e.classList.add("flash"); };
    [n, ...afetados].forEach(x => flash($("achado-" + x)));
    secoes.forEach(sx => flash(sx === "score" ? $("scorebox") : sx === "contexto" ? $("ctx") : $("sec-" + sx)));

    const nota = msg => { const s2 = $("achado-" + n)?.querySelector(".status-note"); if (s2) s2.textContent = msg; };
    const resumoNota = `Análise atualizada: ${mudancas.join(" · ")}.`;
    if (db) {
      try { await db.doc("revisoes/estado").set(JSON.parse(JSON.stringify({ rev: REV, global: G, log: LOG }))); nota(resumoNota); }
      catch (_) { nota(resumoNota + " Não foi possível salvar o histórico."); }
    } else nota(resumoNota + " O histórico não fica salvo nesta visualização.");
  } catch (e) {
    btn.disabled = false;
    st.textContent = e?.code === "rate_limited" ? "Muitas reavaliações seguidas. Tente de novo em instantes."
      : e?.code === "not_granted" ? "A reavaliação não foi autorizada nesta visualização."
      : "Não foi possível reavaliar agora. Tente de novo.";
  }
}

(async () => {
  if (!window.claude?.use) return;
  [sample, db, user] = await Promise.all([claude.use("sample"), claude.use("db"), claude.use("user")]);
  if (db) {
    try {
      const snap = await db.doc("revisoes/estado").get();
      if (snap.exists) {
        const v = JSON.parse(JSON.stringify(snap.data()));
        Object.assign(REV, v.rev || {}); G = v.global || {}; LOG = v.log || [];
      }
    } catch (_) {}
  }
  podeReavaliar = !!sample;
  $("banner").hidden = !podeReavaliar;
  renderTudo();
})();
</script>
</body>
</html>
```

**Conteúdo dos campos:** seguir a estrutura de relatório abaixo, que define o que vai em cada campo (contexto, diagnóstico, dimensões, achados, o que funciona, quick wins, perguntas, como validar).

Escrever em português, direto e específico. Sempre nomear o elemento exato ("o botão 'Continuar' no rodapé", "o rótulo 'Gestão de entidades' no menu lateral"), nunca "alguns elementos".

```
## Análise de AI e usabilidade: [nome da tela]

**Contexto considerado:** [plataforma, usuário, tarefa principal; marcar o que foi suposição]

### Score de qualidade: [XX]/100 · [faixa]
[1 linha explicando o que mais puxou o score para baixo e, se houver, qual teto foi aplicado]

### Diagnóstico geral
[3 a 5 linhas: a tela cumpre a tarefa principal? Qual é o maior problema e o maior acerto?]

### Visão por dimensão
| Dimensão | Nota (0–5) | Peso | Pontos | Problemas ligados | Comentário curto |
|---|---|---|---|---|---|
| Hierarquia e prioridade | ... | 20 | ... | #1, #4 | ... |
| Organização e rotulagem | ... | 15 | ... | ... | ... |
| Navegação e orientação | ... | 15 | ... | ... | ... |
| Interação e feedback | ... | 15 | ... | ... | ... |
| Prevenção e tratamento de erros | ... | 15 | ... | ... | ... |
| Acessibilidade | ... | 10 | ... | ... | ... |
| Consistência e estética | ... | 10 | ... | ... | ... |
| **Total** | | **100** | **XX** | | [teto aplicado, se houver] |

### Problemas priorizados
(Ordenar do mais severo para o menos severo.)

**1. 🔴 [Título curto do problema]**
- **Onde:** elemento exato na tela (marcação nº 1 no print; ou "sem marcação" quando o problema não tem local)
- **O que acontece:** o problema do ponto de vista do usuário
- **Princípio:** heurística ou princípio de AI envolvido
- **Impacto:** efeito na tarefa ou no negócio
- **Recomendação:** o que mudar, de forma concreta (com exemplo de texto, layout ou componente quando ajudar)

[repetir]

### O que está funcionando
[2 a 4 acertos específicos que devem ser preservados em mudanças futuras]

### Quick wins
[3 a 5 ajustes de baixo esforço e alto efeito]

### Perguntas para o time
[2 a 4 perguntas que a análise não consegue responder sozinha e que valem ser levadas para produto, pesquisa ou dados. Ex.: "Qual é a taxa de abandono nesta etapa?", "Os usuários entendem o termo X? Vale um teste de rótulos."]

### Como validar
[Sugestão breve de método para confirmar os problemas principais: teste de usabilidade com 5 usuários, tree testing, card sorting, teste de 5 segundos, análise de funil etc.]
```

# 8. Regras de qualidade

- **Tela e lista batem:** todo número marcado na tela existe na lista de achados, e todo achado com local tem marcação em cada tela onde aparece. Conferir antes de publicar.
- **Reavaliar com honestidade:** contexto novo muda a avaliação quando muda o problema para o usuário. Uma restrição de negócio ou técnica não apaga um problema de usabilidade; ela muda a recomendação para uma que conviva com a restrição. Dados de comportamento real pesam mais que a heurística.
- **Análise sempre coerente:** depois de qualquer reavaliação (na página ou no chat), diagnóstico, linha do score, dimensões, quick wins, perguntas e contexto precisam refletir o novo estado. Nenhuma parte da página pode continuar falando de um problema como estava antes.
- **Score coerente:** o score precisa ser consistente com os problemas listados. Um score alto com problemas críticos indica erro na conta.

- **Prioridade acima de volume:** 5 a 10 problemas bem fundamentados valem mais que 30 observações rasas. Se houver muitos de baixa severidade, agrupar.
- **Problema, não gosto pessoal:** toda crítica precisa de um princípio e de um impacto no usuário. Evitar "eu preferiria".
- **Recomendação acionável:** dizer o que fazer, não só o que está errado.
- **Equilíbrio:** sempre apontar acertos reais, para orientar o que não mexer.
- **Humildade metodológica:** a análise especialista levanta hipóteses; deixar claro que dados e testes com usuários confirmam ou refutam.
- **Contexto de negócio:** quando relevante, conectar o problema a métricas (conversão, abandono, tempo de tarefa, chamados de suporte).
- **Se o usuário pedir um foco** (só AI, só formulário, só acessibilidade, só mobile), aprofundar nessa lente e resumir as demais em poucas linhas.