---
name: "screen-metrics-tagging"
description: "Lê todas as telas de um fluxo (prints, Figma, URL), confirma a core action e marca nas telas, com números, os pontos a taguear nas camadas de negócio, produto e experiência, dizendo o porquê de cada um. Use para 'o que taguear aqui', 'plano de tagueamento', 'mapeia as métricas dessas telas'."
---

# Objetivo

Mapear, tela a tela, os componentes e as ações que precisam ser tagueados, usando o modelo de métricas do Gabriel (livro *Design orientado a dados* e curso *Para designers falarem de dados*). A entrega principal é uma **interface publicada** (artifact) com as telas marcadas de forma interativa, o detalhamento de cada ponto, as métricas consolidadas e um plano de tagueamento que o time de produto, analytics e BI consegue implementar. As telas marcadas também vão como imagens.

Acione esta skill quando o usuário enviar telas, prints, frames ou um link do Figma, uma URL ou um protótipo (Lovable, Figma Make, artifact) e pedir: "o que devo taguear", "plano de tagueamento", "mapeia as métricas dessas telas", "quais eventos colocar aqui", "marca as métricas na tela", "instrumentação" ou "métricas de negócio, produto e experiência dessa tela".

Regra central: **o mapeamento só começa depois que o fluxo inteiro foi entendido e a core action foi confirmada pelo usuário.** Uma tela isolada não diz o que vale medir. É o fluxo que diz.

---

# Modelo de métricas (a lente da skill)

## Cadeia de derivação de objetivos

Toda marcação precisa se encaixar nesta cadeia, que começa no negócio e chega ao componente:

1. O **componente** contribui para o objetivo da **tela**.
2. A **tela** contribui para o objetivo do **fluxo**.
3. O **fluxo** contribui para o objetivo do **produto**.
4. O **produto** contribui para o objetivo do **negócio**.

Se não for possível dizer em uma frase como um ponto marcado sobe por essa cadeia, ele não deve ser marcado.

## As camadas

O modelo tem quatro camadas: negócio, produto, experiência e operação. Esta skill mapeia as três que aparecem na tela. Operação (desempenho, velocidade e eficiência de pessoas e times) fica fora porque não se tagueia na interface.

**Negócio:** dados com impacto direto em faturamento ou custo. Exemplos: receita, ticket médio, margem, MRR/ARR, receita por plano, custo evitado (atendimento, retrabalho). Na tela, costuma aparecer onde o valor é capturado: pagamento, escolha de plano, valor do carrinho, contratação, upgrade. Em geral vira **atributo** de um evento (valor, plano, moeda, método de pagamento), não um clique.

**Produto:** desempenho do produto conforme o direcionamento estratégico. Exemplos: conversão, adoção, ativação, engajamento, retenção, churn, recorrência, uso de uma funcionalidade. Na tela, aparece nos pontos que mostram se a pessoa avançou, aderiu ou voltou: a ação que conclui a core action, a entrada no fluxo, o uso de um recurso que o produto quer fazer crescer.

**Experiência:** dados de comportamento e de percepção. São dois grupos:
- **Uso (formação):** gerados durante a interação. São classificados em relação à core action:
  - **Primária:** faz a pessoa progredir em direção à core action (ex.: buscar, selecionar, adicionar, continuar).
  - **Secundária:** impacta a atividade principal direta ou indiretamente (ex.: remover item, editar, trocar filtro, corrigir erro, abrir detalhes).
  - **Terciária:** não contribui agora, mas ajuda uma interação futura ou sinaliza intenção (ex.: favoritar, compartilhar, ver similares).
- **Percepção (lastro):** gerados depois do uso e que mostram como a pessoa avaliou a experiência: CSAT, CES, NPS, Net Easy Score, chamados de suporte, bugs reportados. Na tela, entram no ponto em que a pesquisa deve ser disparada (normalmente logo após a core action ou num erro).

As camadas se conectam. Um mesmo ponto costuma alimentar mais de uma (o CTA de pagamento é experiência primária, conversão de produto e receita de negócio). Marque cada ponto **na camada principal**, ou seja, a da pergunta mais importante que ele responde, e liste as outras camadas em "Alimenta também".

## Core action

A core action é a principal atividade que a pessoa precisa fazer para alcançar o objetivo dela no produto, a ação que justifica o fluxo existir (ex.: no iFood, pagar a refeição; no QuintoAndar para quem aluga pela primeira vez, fazer a proposta). Cada tela do fluxo tem a sua **atividade principal**, que ajuda a pessoa a progredir rumo à core action (na lista de restaurantes, encontrar o tipo de comida; na página do restaurante, adicionar à sacola).

## Data-informed

Os dados são insumo para a decisão, não o fator que decide. Por isso cada marcação diz que **pergunta** ela ajuda a responder e que **decisão** ela pode informar, e o relatório indica onde os números precisam ser combinados com pesquisa qualitativa.

---

# Fase 1: Ler o fluxo inteiro

Antes de qualquer marcação, ler **todas** as telas. Não começar a mapear com só parte delas.

## Como obter as telas

- **Variantes da mesma tela** (ex.: estados por permissão ou perfil): tratar como uma tela só, com a mesma numeração nos mesmos elementos em cada imagem, e registrar a variante num atributo (`variante_tela`).
- **Imagens anexadas:** ler todas. Trabalhar sempre em cópias no diretório de trabalho, nunca nos arquivos enviados.
- **Figma (link de arquivo, página, seção ou frame):**
  1. Usar `get_metadata` no nó informado para listar todos os frames do fluxo, com nome, ordem e coordenadas.
  2. Usar `get_screenshot` em cada frame para ver a tela. Usar `get_design_context` quando precisar dos textos, componentes, variantes e estados.
  3. Ter cada tela também como **arquivo de imagem** (PNG) no workspace, porque a entrega é a tela marcada. Se o download pela URL do `get_screenshot` for bloqueado, chamar `get_screenshot` com `enableBase64Response: true` e copiar o arquivo do caminho indicado em "Image source". Exportar ou baixar o frame. Guardar as coordenadas dos elementos do `get_metadata` para posicionar as marcações com precisão, ajustando a escala ao tamanho da imagem exportada.
  4. Se o link apontar para um frame só, verificar se existem outros frames do mesmo fluxo na página ou seção. Se existirem, ler todos e confirmar com o usuário o recorte do fluxo.
- **URL ou protótipo (Lovable, Figma Make, site):** abrir no navegador e percorrer o fluxo, capturando cada tela como arquivo. Se houver código disponível (artifact, repositório), ler o código para descobrir estados, validações e caminhos alternativos que a interface não mostra.
- **PDF:** extrair as páginas como imagem.

Se não houver como gerar arquivos de imagem das telas, pedir os prints antes de seguir. A skill não entrega o mapeamento sem as telas marcadas.

## O que extrair de cada tela

- Nome e posição no fluxo.
- Atividade principal da tela (o que a pessoa veio fazer ali).
- Elementos de interação (CTAs, campos, filtros, navegação, links, cards, toggles).
- Momento: entrada, exploração, decisão, compromisso (pagar, enviar, contratar), confirmação, erro.
- Onde há valor sendo capturado (preço, plano, quantidade, total).
- Bifurcações, loops, telas opcionais, estados de erro, vazio e carregamento.

## Saída da Fase 1 (parar e pedir confirmação)

```
## Entendimento do fluxo

**Produto e contexto:** [o que é, plataforma, público provável; marcar o que é suposição]
**Objetivo do fluxo:** [o que a pessoa quer resolver]
**Objetivo de negócio provável:** [como esse fluxo gera receita ou reduz custo; marcar como suposição]

**Core action proposta:** [ação] - [2 a 3 linhas justificando: por que, sem ela, o fluxo perde o sentido]

| # | Tela | Momento | Atividade principal | Como leva à core action |
|---|---|---|---|---|
| 1 | ... | Entrada | ... | ... |

**Especificidades:** [bifurcações, telas opcionais, estados de erro, pontos de captura de valor]

**Cadeia de derivação (rascunho):** componente-chave → tela → fluxo → produto → negócio

---
Antes de mapear, preciso que você confirme:
1. A core action é essa mesmo?
2. A atividade principal de cada tela está certa?

Se tiver, me passe também: objetivo ou OKR que esse fluxo apoia, ferramenta de analytics (GA4, Amplitude, Mixpanel, outra) e eventos que já existem.
```

**Aguardar a resposta do usuário antes de seguir para a Fase 2.** Se ele corrigir a core action ou alguma atividade, refazer a tabela e confirmar de novo só se a mudança for grande.

Se a pessoa não estiver disponível (tarefa agendada ou sem resposta), seguir com a core action proposta e declarar no topo da entrega que ela não foi confirmada.

---

# Fase 2: Mapear os pontos de tagueamento

Com a core action confirmada, percorrer as telas na ordem do fluxo.

## Como escolher os pontos

Para cada tela:
1. Marcar primeiro o elemento que conclui a **atividade principal** da tela (experiência primária, quase sempre).
2. Marcar onde a pessoa pode **desviar, voltar ou travar** (secundárias: editar, remover, voltar, erro de validação).
3. Marcar sinais de **intenção futura** só quando ajudam a explicar a core action (terciárias: favoritar, compartilhar, ver similares).
4. Na tela da core action, marcar o ponto de **conversão de produto** e os **atributos de negócio** (valor, plano, método de pagamento).
5. Marcar o ponto de disparo de **pesquisa de percepção** (CSAT/CES) quando fizer sentido, normalmente na tela de confirmação ou de erro.

Regras:
- De 3 a 7 marcações por tela. O fluxo inteiro deve ficar em torno de 10 a 25 pontos. Menos é mais.
- Toda marcação precisa responder a uma pergunta real ("quantas pessoas que veem o preço desistem?"). Se a pergunta não muda nenhuma decisão, não marcar.
- Diferenciar **evento** (algo que acontece: clique, envio, visualização, erro) de **atributo** (informação que acompanha o evento: valor, plano, posição do card, origem). Atributos de negócio entram como propriedade do evento, não como evento novo.
- Visualização de tela (`screen_view`/`page_view`) não ganha marcação. Ela entra no plano de tagueamento como evento da tela.
- O mesmo componente repetido em várias telas usa o mesmo nome de evento, com um atributo de tela (`screen_name`).
- Estados que não aparecem na tela (erro, vazio, carregando, timeout) entram no relatório como "sem marcação", com o evento sugerido.
- Nome de evento em `objeto_acao` no passado, em snake_case e em português, a não ser que o usuário use outra convenção (ex.: `proposta_enviada`, `filtro_aplicado`, `plano_selecionado`). Se o usuário informar a ferramenta (GA4, Amplitude, Mixpanel), adaptar à convenção dela.

## Numeração e cores

- Numeração **contínua no fluxo inteiro** (Tela 1: 1 a 4; Tela 2: 5 a 9 ...), para que cada número seja único no relatório e no plano.
- Cor da marcação pela **camada principal**:
  - Negócio: roxo `#7C3AED`
  - Produto: azul `#2563EB`
  - Experiência: verde `#0E9F6E`
- Selo ao lado do número para os pontos de experiência de uso: **P** (primária), **S** (secundária), **T** (terciária). Pontos de negócio e produto podem receber o selo quando também forem P, S ou T em relação à core action.

## Gerar as telas marcadas

1. Salvar os dois scripts abaixo no diretório de trabalho (fora da pasta de uploads).
2. Rodar `grade.py` em cada tela para gerar uma cópia com grade de coordenadas, e olhar essa cópia para estimar a caixa (x0, y0, x1, y1) de cada elemento em pixels da imagem original. Com Figma, usar as coordenadas do `get_metadata`, convertidas para a escala da imagem exportada.
3. Escrever um `marcacoes-telaN.json` por tela, com `n`, `camada` (`negocio`, `produto`, `experiencia`), `nivel` opcional (`primaria`, `secundaria`, `terciaria`), `box` e `pos` opcional (`"tr"` coloca o número no canto superior direito da caixa, útil quando o canto esquerdo cobre texto, como em textos de apoio de campos).
4. Rodar `python3 anotar.py telaN.png marcacoes-telaN.json telaN-marcada.png "Tela N · Nome da tela"`.
5. **Abrir cada imagem gerada e conferir** se cada marcação está sobre o elemento certo e se nenhum número cobre uma informação importante. Corrigir as coordenadas e gerar de novo quando necessário.
6. Enviar as imagens marcadas ao usuário como arquivos, na ordem do fluxo.

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

`anotar.py` (uso: `python3 anotar.py entrada.png marcacoes.json saida.png ["Título"]`):
```python
import json, sys
from PIL import Image, ImageDraw, ImageFont
CORES = {"negocio": "#7C3AED", "produto": "#2563EB", "experiencia": "#0E9F6E"}
NOMES = {"negocio": "Negócio", "produto": "Produto", "experiencia": "Experiência"}
NIVEL = {"primaria": "P", "secundaria": "S", "terciaria": "T"}
def fonte(t):
    for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVuSans-Bold.ttf"]:
        try: return ImageFont.truetype(f, t)
        except OSError: pass
    return ImageFont.load_default()
entrada, marcas_json, saida = sys.argv[1:4]
titulo = sys.argv[4] if len(sys.argv) > 4 else None
img = Image.open(entrada).convert("RGB")
fator = 1
if max(img.size) < 1000:
    fator = 2
    img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
W, H = img.size
e = max(W, H) / 1000
s = W / 1000
rodape = int(110 * s)
tela = Image.new("RGB", (W, H + rodape), "white")
tela.paste(img, (0, 0))
d = ImageDraw.Draw(tela)
d.line([0, H, W, H], fill="#DDDDDD", width=2)
r = max(14, int(18 * e))
for m in json.load(open(marcas_json)):
    x0, y0, x1, y1 = [v * fator for v in m["box"]]
    cor = CORES[m["camada"]]
    d.rounded_rectangle([x0, y0, x1, y1], radius=int(6 * e), outline=cor, width=max(3, int(3 * e)))
    cx = min(max(x1 if m.get("pos") == "tr" else x0, r + 2), W - r - 2)
    cy = min(max(y0, r + 2), H - r - 2)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=cor, outline="white", width=max(2, int(2.5 * e)))
    d.text((cx, cy), str(m["n"]), fill="white", font=fonte(int(r * 1.05)), anchor="mm")
    nv = NIVEL.get(m.get("nivel", ""), "")
    if nv:
        fs = fonte(int(r * 0.8)); tx = cx + r + int(3 * e)
        tx = min(tx, W - int(r * 1.6))
        bw = int(r * 1.2); bh = int(r * 1.1)
        d.rounded_rectangle([tx, cy - bh // 2, tx + bw, cy + bh // 2], radius=int(4 * e), fill="white", outline=cor, width=max(2, int(2 * e)))
        d.text((tx + bw // 2, cy), nv, fill=cor, font=fs, anchor="mm")
f = fonte(int(18 * s)); y1 = H + int(35 * s); y2 = H + int(78 * s); x = int(20 * s)
if titulo:
    d.text((x, y1), titulo, fill="#111", font=fonte(int(22 * s)), anchor="lm")
for k in ["negocio", "produto", "experiencia"]:
    d.ellipse([x, y2 - int(9 * s), x + int(18 * s), y2 + int(9 * s)], fill=CORES[k])
    d.text((x + int(26 * s), y2), NOMES[k], fill="#333", font=f, anchor="lm")
    x += int(170 * s)
d.text((x + int(10 * s), y2), "P = primária · S = secundária · T = terciária", fill="#555", font=f, anchor="lm")
tela.save(saida)
print(saida, tela.size)
```

As caixas são sempre em pixels da imagem original. O script amplia imagens pequenas sozinho.

---

# Fase 3: Entrega

A entrega tem três partes, nesta ordem:
1. **A interface publicada** (Fase 4), que é a entrega principal e traz todo o conteúdo do relatório abaixo.
2. **As telas marcadas**, enviadas como arquivos, na ordem do fluxo, para colar no Figma ou num documento.
3. **Uma resposta curta no chat:** core action, número de pontos por camada, as duas perguntas mais importantes para o time e uma linha sobre a interface. Não repetir o relatório inteiro no chat, porque ele está na interface.

O modelo abaixo define o conteúdo de cada parte do mapeamento. É ele que preenche a interface.

Escrever em português, direto e específico. Nomear sempre o elemento exato ("o botão 'Fazer proposta' fixo no rodapé", "o chip de filtro 'Aceita pet'"), nunca "alguns elementos".

```
## Mapeamento de métricas: [nome do fluxo]

**Core action:** [ação] ([confirmada pelo usuário / não confirmada])
**Cadeia de derivação:** [componente-chave] → [objetivo da tela] → [objetivo do fluxo] → [objetivo do produto] → [objetivo do negócio]

### Tela 1 · [nome] · Atividade principal: [...]

**1. [Elemento exato]** · Experiência · Primária
- **Por que mapear:** [o que esse ponto revela sobre o avanço rumo à core action]
- **Pergunta que responde:** [pergunta concreta]
- **Evento:** `nome_do_evento` · **Gatilho:** [quando dispara: clique, envio com sucesso, exibição, erro]
- **Atributos:** `screen_name`, [outros relevantes]
- **Métrica que alimenta:** [ex.: taxa de avanço da Tela 1 para a Tela 2 = eventos / visualizações da tela]
- **Alimenta também:** [Produto: ... / Negócio: ...] (se houver)

[repetir para cada marcação]

**Sem marcação nesta tela:** [estados ou eventos sem local visível, com o evento sugerido]

[repetir por tela]

### Métricas consolidadas por camada

| Camada | Métrica | Como calcular | Pontos que alimentam |
|---|---|---|---|
| Negócio | [ex.: receita gerada pelo fluxo] | [soma de `valor` em `pagamento_concluido`] | #12 |
| Produto | [ex.: conversão do fluxo] | [core action / entradas no fluxo] | #1, #12 |
| Experiência · uso | [ex.: taxa de erro no formulário] | [...] | #7 |
| Experiência · percepção | [ex.: CES pós-core action] | [...] | #14 |

### Plano de tagueamento

| # | Tela | Evento | Tipo | Gatilho | Atributos | Camada | Nível |
|---|---|---|---|---|---|---|---|
| 1 | ... | `...` | clique / envio / visualização / erro | ... | ... | ... | P/S/T |

### Alinhamentos com o time
- **Quem acompanha cada camada:** Negócio: stakeholder responsável, PM envolvido, designer informado. Produto: PM responsável, designer envolvido, stakeholder informado. Experiência: designer responsável, PM envolvido, stakeholder informado.
- **Implementação:** validar com o time de desenvolvimento e analytics quais componentes disparam eventos e quais informações viram atributos.
- **Acompanhamento:** definir com PM, analytics e BI a frequência e o formato (report do PM, report recorrente de analytics ou dashboard em tempo real) e o baseline antes de qualquer mudança.

### Perguntas para o time
[2 a 4 perguntas que o mapeamento não responde sozinho. Ex.: "Qual é a definição de adoção desse recurso para o negócio (quantas vezes, em que prazo)?", "Já existe baseline de conversão desse fluxo?", "Que pesquisa qualitativa ajudaria a explicar o abandono na Tela 3?"]
```

Depois da entrega, oferecer em uma linha transformar o plano de tagueamento numa planilha (Sheets) ou o relatório num documento para levar ao time.

---

# Fase 4: Interface publicada

A interface segue o padrão da review de arquitetura da informação: resumo no topo, tela interativa fixa à esquerda, pontos filtráveis à direita e seções de fechamento. Cada ponto pode receber contexto da pessoa e ser reavaliado ali mesmo, com histórico salvo.

O que a página mostra:
- **Topo:** core action (confirmada ou não), cadeia de derivação em 5 passos, contexto considerado (suposições com borda tracejada) e um resumo com número de pontos, número de eventos no plano, distribuição por camada e por nível.
- **Tela:** abas por tela ou variante, com caixas e números coloridos pela camada e selo P/S/T. Passar o mouse num ponto destaca a marcação, e tocar num número leva ao ponto.
- **Pontos:** filtros por camada; cada card traz camada, nível, selo de core action, o texto de cada variante quando muda, por que mapear, pergunta que responde, métrica que alimenta, eventos com gatilho e atributos e "Alimenta também".
- **Reavaliação:** "Responder ou adicionar contexto" em cada ponto. Claude reavalia o ponto, ajusta os outros afetados (ex.: convenção de nomes, evento que já existe) e atualiza contexto, sem marcação, métricas e perguntas. O histórico fica salvo.
- **Fechamento:** sem marcação, métricas consolidadas por camada, plano de tagueamento (gerado automaticamente a partir dos pontos, com botão "Copiar para planilha"), quem acompanha cada camada e perguntas para o time.

## Como gerar

1. **Pegar o modelo.** Ler o artifact modelo `a1ebda7c-8e2c-4726-b02a-b2e89b87992d` ("Mapeamento de métricas: tela de Depósito") com `read_artifact` e salvar o HTML como `index.html` no diretório de trabalho. Nunca republicar em cima do modelo: cada análise vira um artifact novo.
2. **Trocar só o bloco de dados.** Substituir o conteúdo entre `/* ============ DADOS DO MAPEAMENTO: preencher só este bloco ============ */` e a linha `/* ==== ... */` seguinte pelo `const DATA = {...}` da nova análise. Não mexer no CSS nem no resto do script.
3. **Telas sem marcação.** A página desenha as marcações sozinha, então as imagens publicadas são as telas originais (`tela-1.png`, `tela-2.png`...). Em `telas`, `w` e `h` são o tamanho em pixels de cada imagem, e as caixas usam essas mesmas coordenadas (as mesmas do `marcacoes-telaN.json`).
4. **Conferir antes de publicar.** Se houver navegador headless no workspace (Playwright ou Chrome), abrir a página por um servidor local, tirar print e verificar se as marcações caem nos elementos certos e se não há erro de script.
5. **Publicar e declarar.** Publicar com `publish_files` (index.html e as imagens), com título "Mapeamento de métricas: [nome do fluxo]" e ícone `chart`. Depois declarar as capacidades com `declare_capabilities`, usando a versão devolvida na publicação como `base_version`: `{"db": {}, "sample": {"images": true}, "user": {}}`. Sem essa declaração, a reavaliação e o histórico não funcionam.

## Estrutura do bloco DATA

```js
const DATA = {
  titulo: "Métricas da tela de ...",
  eyebrow: "Mapeamento de métricas · [arquivo] / [fluxo]",
  coreAction: { acao: "...", confirmada: true, texto: "justificativa e suposições (aceita <code> e <b>)" },
  cadeia: [ { rotulo: "Componente", texto: "..." }, { rotulo: "Tela", ... }, { rotulo: "Fluxo", ... }, { rotulo: "Produto", ... }, { rotulo: "Negócio", ... } ],
  contextoItens: [ { rotulo: "Produto", texto: "...", suposicao: true } ],
  telas: [ { nome: "A · Biometria", arquivo: "tela-1.png", w: 412, h: 917, alt: "descrição da tela" } ],
  pontos: [ {
    n: 1, camada: "negocio|produto|experiencia", nivel: "primaria|secundaria|terciaria", core: false,
    titulo: "elemento exato", onde: "localização", variantes: { A: "...", B: "..." },   // variantes é opcional
    marcas: [ { tela: 0, box: [x0, y0, x1, y1], pos: "tr" } ],                     // pos é opcional
    porque: "...", pergunta: "...", metrica: "...", alimenta: "",
    eventos: [ { nome: "objeto_acao", tipo: "clique|interação|erro|sistema|visualização", gatilho: "...", atributos: ["..."] } ]
  } ],
  semMarcacao: [ { titulo: "...", texto: "...", evento: { nome, tipo, gatilho, atributos } } ],   // evento pode ser null
  metricas: [ { camada: "negocio", nome: "...", calculo: "...", pontos: [6, 7] } ],
  alinhamentos: [ "<b>Implementação:</b> ...", "<b>Acompanhamento:</b> ..." ],
  perguntas: [ "..." ]
};
```

Regras do bloco: o mesmo evento usado em vários pontos tem o mesmo nome e os mesmos atributos (o plano junta os dois numa linha só); a visualização de tela vai em `semMarcacao` com `tipo: "visualização"`, para abrir o plano; marque `core: true` só no ponto da core action.

Na resposta do chat, dizer em uma frase o que a interface traz. O card do artifact já mostra o link.

---

# Regras de qualidade

- **Fluxo antes da tela:** nunca marcar nada antes de ler todas as telas e ter a core action confirmada (ou declarada como não confirmada).
- **Imagem e relatório batem:** todo número marcado existe no relatório e no plano de tagueamento, com a mesma camada e cor. Conferir antes de entregar.
- **Cada ponto sobe pela cadeia:** se não der para explicar como o ponto chega ao objetivo do produto ou do negócio, tirar o ponto.
- **Camada principal coerente:** o CTA da core action não deve ser marcado só como experiência se ele é o ponto de conversão do produto. Escolher a camada da pergunta mais importante e citar as demais em "Alimenta também".
- **Negócio é atributo:** valor, plano, quantidade e método de pagamento são atributos do evento de conversão, não eventos soltos.
- **Sem excesso:** 10 a 25 pontos bem justificados valem mais que 50 eventos sem pergunta.
- **Contexto do produto:** a mesma métrica muda de significado de produto para produto (adoção pode ser "primeira compra em até uma semana" ou "cinco favoritos em dois meses"). Quando a definição depender do negócio, deixar como pergunta para o time em vez de inventar o critério.
- **Data-informed:** deixar claro que os números mostram o que acontece, e que entender por que acontece pede pesquisa qualitativa.