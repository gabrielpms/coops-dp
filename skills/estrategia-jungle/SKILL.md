---
name: "estrategia-jungle"
description: "Analisa PDF, PPT ou fluxo do Figma pela lente estratégica de Gabriel Pinheiro (UX Estratégico, Estratégia Jungle): problema, gaps, cenários negativos, horizontes, dicas e provocações, numa interface com telas marcadas e score 0–100."
---

# Objetivo

Fazer uma análise estratégica crítica e acionável de um material de proposta (deck, PDF, PPT, fluxo ou protótipo do Figma),
usando o método de Gabriel Pinheiro: os livros **UX Estratégico: design aplicado a ecossistema de produtos** e
**Estratégia Jungle: bases para um ecossistema de experiências eficazes**, o guia **Estratégia para Product Designers**
e a palestra **Criar é fácil, decidir é estratégico**. A entrega principal é uma **interface publicada** (artifact) com as
telas marcadas de forma interativa, o score e as seis análises; as telas marcadas também vão como imagens.

A análise responde a seis perguntas, nesta ordem:
1. **Existe um entendimento claro do problema** que estamos tentando resolver?
2. **A solução tem gaps ou questionamentos** em aberto?
3. **Que cenários negativos** podem acontecer com base no material?
4. **Como a solução pode evoluir** numa visão de horizontes?
5. **Como melhorar a ideia** (dicas)?
6. **Que provocações** levar sobre problema, cenário, contexto e solução?

Ela serve para o designer, PM ou liderança melhorar a proposta antes de levá-la ao time e a stakeholders.
Deve ser específica (apontar a página/tela e o trecho exato), fundamentada (citar a lente do método) e priorizada.

Acione esta skill sempre que o usuário enviar um PDF, PPT/PPTX, Google Slides exportado, link do Figma (fluxo, protótipo,
FigJam), Figma Make, Lovable ou artifact e pedir: "analisa essa proposta", "analisa estrategicamente", "review estratégico",
"o que falta nessa solução", "esse problema está claro?", "quais riscos você vê", "como evoluir essa ideia",
"me provoca sobre isso", "analisa como o Gabriel faria".

# 1. Obter o material

**É obrigatório ter cada página/tela como imagem (PNG) no workspace**, porque a saída inclui as telas marcadas.

- **PDF:** `pdftoppm -r 110 -png arquivo.pdf pagina` (gera pagina-01.png, pagina-02.png…). Ler o texto com `pdftotext -layout`.
- **PPT/PPTX:** converter para PDF com `soffice --headless --convert-to pdf arquivo.pptx` e seguir como PDF.
  Ler também as **notas do apresentador** com python-pptx (costumam ter a intenção por trás do slide).
  Se a conversão falhar, pedir ao usuário o PDF exportado.
- **Figma (fluxo/protótipo/FigJam):** usar as ferramentas do Figma — `get_metadata` para a estrutura e as coordenadas dos frames,
  `get_screenshot` para ver, e exportar cada frame relevante como imagem. Seguir as conexões do protótipo para entender a ordem do fluxo.
  Se o download pela URL do `get_screenshot` for bloqueado, chamar `get_screenshot` com `enableBase64Response: true` (e `contentsOnly: true`)
  e copiar o arquivo do caminho indicado em "Image source". A exportação vem com uma margem de sombra: o frame começa
  em cerca de (28, 18) px na imagem; somar esse deslocamento às coordenadas do `get_metadata`.
- **Imagens com transparência** (PNG do Figma): compor sobre fundo branco antes de usar, senão o fundo vira ruído:
  `bg = Image.new("RGBA", im.size, "white"); bg.alpha_composite(im.convert("RGBA"))`.
- **URL / Lovable / Figma Make / artifact:** abrir no navegador, navegar pelas telas principais e capturar screenshots como arquivo.
  Se a ferramenta não gerar arquivo, pedir os prints.
- Trabalhar sempre em cópias, fora da pasta de uploads.
- Se não for possível obter imagens, pedir o material exportado antes de analisar. Não entregar sem as telas marcadas.

**Leia o material inteiro antes de julgar.** Monte um mapa rápido: página/tela → o que ela apresenta
(contexto, dados, problema, solução, roadmap, métricas, telas).

# 2. Entender o contexto (antes de julgar)

Identificar, a partir do material e da conversa:
1. **Organização e produto:** segmento, modelo de negócio, momento (transformação, crescimento, sustentação).
2. **Público e atores:** quem usa, quem opera, intermediadores.
3. **Tipo de material:** proposta inicial, discovery, solução detalhada, roadmap, pitch para stakeholder.
4. **Para quem é a análise:** o autor quer melhorar a proposta ou avaliar a de outra pessoa?

Se não estiver informado, inferir e **declarar as suposições no topo** ("Assumi que este deck é uma proposta de solução para
o time de produto de um e-commerce"). Só perguntar antes se a ambiguidade mudar o diagnóstico — no máximo 2 perguntas curtas.

Avalie o material pelo que ele **é**: um discovery inicial não precisa ter roadmap detalhado, mas precisa ter um problema claro.
Diga o que é esperado para aquele estágio.

# 3. As seis lentes de análise

## Lente 1 — Entendimento do problema
Reconstrua, com as palavras do material, as três declarações. Se não existirem, escreva "ausente".
- **Necessidade:** descreve uma necessidade, não um objetivo nem uma feature.
  ✗ "Unificar a experiência de compra para aumentar o faturamento" → ✓ "Hoje a experiência de compra é fragmentada".
- **Objetivo:** metrificável e acompanhável ao longo do tempo ("aumentar a recompra em 5% no semestre").
- **Estratégia:** o caminho para atender a necessidade e alcançar o objetivo.

Verifique:
- **Problema x necessidade:** o problema é o furo na parede; a necessidade é pendurar os quadros e se sentir em casa.
  O material para no problema descrito ou chega à motivação?
- **Causa x efeito:** ataca a causa ou um sintoma (queda de métrica, reclamação pontual)? Métricas brutas e falas literais de
  clientes geram reatividade.
- **Resolve x Tem:** a necessidade que motiva a iniciativa (ligada ao propósito) está separada dos problemas que o produto já tem?
- **Evidência:** dados, pesquisa, dores de negócio, benchmarking, tendências — ou opinião/"a concorrência tem"?
- **Para quem e em que momento:** público, jornada e contexto de uso estão claros?
- **Conexão com o negócio:** que dimensão estratégica a iniciativa move?
  (Desempenho: faturamento, aquisição, retenção, custo, fraude, engajamento, alcance · Experiência: consistência, facilidade,
  qualidade · Estratégia: antecipação, competitividade, governança, relacionamento, visibilidade, personalização, inovação.)

Veredito: **Claro**, **Parcial** ou **Ausente**, com uma linha de justificativa.

## Lente 2 — Gaps e questionamentos da solução
- **Aderência:** a solução atende à necessidade declarada ou a outra coisa? Há features sem necessidade ligada?
- **Três lentes:** Necessidade → Estratégia → Solução estão encadeadas? Se a solução falhar, sabemos se trocamos a solução ou a estratégia?
- **Ecossistema:** quais estruturas vizinhas são afetadas (produtos, subprodutos, estruturas, mecanismos, times)?
  Aproveita **troca de valor real** (valor para A · valor para B · novo valor) ou cria algo isolado que aumenta custo e inconsistência?
- **Camadas do produto:** o que a solução faz em **inovação, sustentação, comportamento e alcance**? Está concentrada só em sustentação?
- **Formação e lastro:** pensou o primeiro contato **e** a repetição de uso? Há mecanismos (gatilho → ação → recompensa) que
  coloquem a experiência na rotina, ou só o lançamento?
- **5 restrições:** operacional, tecnológica, financeira, tempo, maturidade (do cliente e da equipe).
- **Sinais de sucesso:** indicadores definidos **antes** de construir, em camadas — L1 Experiência (tempo de tarefa, satisfação, erro)
  · L2 Produto (adoção, ativação, retenção) · L3 Negócio (receita, custo de servir, LTV, CAC, recompra). Fala de output ou outcome?
- **Estados e exceções** (em fluxos): erro, vazio, primeiro uso, recorrência, cancelamento, suporte.
- **Inovação x novidade:** é algo propositivo e difícil de copiar, ou reação à concorrência que vira commodity rápido?
- **Visão compartilhada:** quem participou da construção? Times e áreas impactadas aparecem?

## Lente 3 — Cenários negativos (pre-mortem)
Imagine que a iniciativa foi lançada e deu errado. Gere de 4 a 6 cenários **específicos do material**, nunca genéricos.
Use o **Cone da Plausibilidade** para classificar: **Provável**, **Plausível**, **Possível** — e inclua **1 cenário surpresa**.
Varie as frentes: adoção, comportamento/lastro (uso inesperado, cansaço na repetição), operação, negócio/métricas,
ecossistema (efeito colateral em outra estrutura ou time), reputação/confiança, e — se houver IA — velocidade sem aprendizado.
Para cada um: gatilho, **sinal de alerta** (o que medir para perceber cedo), impacto, mitigação e achados ligados.

## Lente 4 — Evolução por horizontes
Projete como a ideia pode evoluir, sem perder a necessidade original:
- **H1 · Agora / Versioning:** o menor passo que entrega valor e gera aprendizado; o que dá para validar já.
- **H2 · Médio prazo / Visioning:** passos maiores em direção à visão; integração com outras estruturas e mecanismos de recorrência.
- **H3 · Longo prazo / Venturing:** expansão do ecossistema, novos públicos (camada de alcance), novas trocas de valor,
  personalização/contextualização.
Para cada horizonte: o que muda, estruturas envolvidas e trocas de valor, indicador que sinaliza avanço e pré-requisito.
Aponte se a proposta atual está presa só em versioning (sinal de postura reativa e fácil de copiar).

## Lente 5 — Dicas para melhorar
Recomendações concretas, divididas em **Quick wins** (ajustes no material/proposta, baixo esforço) e **Estruturantes**
(mudam a força da proposta: reescrever a necessidade, conectar outra estrutura, definir indicadores, rodar um Jungle,
um discovery específico, um Camping Fire para o plano tático). Sempre que possível, dê o texto sugerido
(ex.: a declaração de necessidade reescrita).

## Lente 6 — Provocações
Perguntas que tiram o time do lugar, em quatro grupos: **Problema**, **Cenário**, **Contexto** e **Solução**
(2 a 3 por grupo), mais 2 a 3 perguntas no formato **"Como nós podemos…?"**. Boas provocações:
reenquadram o problema (o concorrente do milk-shake não é outro milk-shake), testam crenças da organização,
trazem o tempo para a conversa (como isso estará daqui a 1–2 anos?), questionam o que **não** deveria ser construído
("o que merece existir?") e a facilidade como critério ("já que é fácil, vamos fazer").

# 4. Severidade dos achados

Achados são os pontos das lentes 1 e 2 (problema e solução). Classifique cada um:
- 🔴 **Crítico:** compromete a razão de existir da iniciativa — problema ausente ou errado, solução que não atende à necessidade,
  risco sério ao negócio ou às pessoas. Resolver antes de seguir.
- 🟠 **Alto:** gap que pode derrubar adoção ou resultado, gerar retrabalho grande ou efeito negativo em outra parte do ecossistema.
- 🟡 **Médio:** lacuna relevante, mas contornável; entra no plano.
- ⚪ **Baixo:** refinamento de clareza, narrativa ou consistência.

Para decidir: impacto (quanto compromete o objetivo), abrangência (quantas pessoas/estruturas) e reversibilidade (dá para corrigir depois?).

# 5. Score de maturidade estratégica (0–100)

O score sai da rubrica, não de impressão geral, para permitir comparar versões da mesma proposta.

**Passo 1: nota de 0 a 5 por dimensão, a partir dos achados ligados a ela**

| Nota | Critério |
|---|---|
| 5 | Nenhum achado relevante; boas práticas aplicadas |
| 4 | Só achados de severidade baixa |
| 3 | Pelo menos um achado médio, nenhum alto ou crítico |
| 2,5 | Dois ou mais achados médios, nenhum alto ou crítico |
| 2 | Pelo menos um achado alto |
| 1 | Pelo menos um achado crítico |

**Passo 2: aplicar os pesos**

| Dimensão | Peso |
|---|---|
| Clareza do problema e da necessidade | 25 |
| Conexão problema → solução | 20 |
| Completude e consistência da solução | 15 |
| Visão de ecossistema | 15 |
| Sinais de sucesso (métricas) | 10 |
| Visão de tempo e evolução | 10 |
| Viabilidade (5 restrições) | 5 |

Score = soma de (nota ÷ 5 × peso). Se uma dimensão não se aplicar ao estágio do material ou não for avaliável por ele
(ex.: viabilidade num fluxo de telas), marcar "N/A" e redistribuir o peso proporcionalmente — e dizer isso.

**Passo 3: tetos**
- Qualquer achado crítico: score máximo 59.
- Clareza do problema com nota ≤ 2: score máximo 64.
- Três ou mais achados altos: score máximo 74.

**Faixas:** 90–100 Excelente · 75–89 Bom · 60–74 Regular · 40–59 Fraco · 0–39 Crítico.

Calcular com código (não de cabeça). A interface recalcula o score com essa mesma regra, então o número precisa bater.

# 6. Telas marcadas (imagens)

Cada página/tela com achados também é entregue como imagem com marcações numeradas. O número na imagem é o número do achado.

**Regras**
- Retângulo em volta do trecho exato (título, frase, gráfico, componente, etapa do fluxo) e círculo numerado no canto superior esquerdo.
- Cor pela severidade: vermelho = crítico, laranja = alto, amarelo = médio, cinza = baixo.
- Numerar na ordem de prioridade (1 = mais severo), numa única sequência para todo o material.
- O mesmo achado em vários lugares usa o mesmo número.
- Achados sem local (ex.: "não há indicadores em nenhuma página") ficam sem marcação.
- Só gerar imagens das páginas que têm marcações.
- Rodapé com o score e a legenda de cores.

**Processo**
1. Salvar os dois scripts abaixo no diretório de trabalho.
2. Rodar `grade.py` em cada página para gerar uma cópia com grade de coordenadas e estimar as caixas (x0, y0, x1, y1) em pixels
   da imagem original. Com Figma, usar as coordenadas do `get_metadata`, ajustadas à escala e à margem da exportação.
3. Escrever um `marcacoes-<pagina>.json` por página com `n`, `sev` (critico, alto, medio, baixo) e `box`.
4. Rodar `anotar.py pagina-03.png marcacoes-pagina-03.json pagina-03-anotada.png SCORE`.
5. **Abrir as imagens geradas e conferir** se as marcações estão no trecho certo e não cobrem informação importante. Corrigir e gerar de novo quando necessário.
6. Enviar as imagens anotadas ao usuário como arquivos, na ordem do material.

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

`anotar.py` (uso: `python3 anotar.py entrada.png marcacoes.json saida.png [score]`):
```python
import json, sys
from PIL import Image, ImageDraw, ImageFont
CORES = {"critico": "#E5484D", "alto": "#F76B15", "medio": "#E2A400", "baixo": "#8B8D98"}
NOMES = {"critico": "Crítico", "alto": "Alto", "medio": "Médio", "baixo": "Baixo"}
def fonte(t):
    for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVuSans-Bold.ttf"]:
        try: return ImageFont.truetype(f, t)
        except OSError: pass
    return ImageFont.load_default()
entrada, marcas_json, saida = sys.argv[1:4]
score = sys.argv[4] if len(sys.argv) > 4 else None
im0 = Image.open(entrada).convert("RGBA")
img = Image.new("RGBA", im0.size, "white"); img.alpha_composite(im0); img = img.convert("RGB")
fator = 1
if max(img.size) < 1200:
    fator = 2
    img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
W, H = img.size
e = max(W, H) / 1000
rodape = int(70 * W / 1000)
tela = Image.new("RGB", (W, H + rodape), "white")
tela.paste(img, (0, 0))
d = ImageDraw.Draw(tela)
d.line([0, H, W, H], fill="#DDDDDD", width=2)
r = max(14, int(18 * e))
for m in json.load(open(marcas_json)):
    x0, y0, x1, y1 = [v * fator for v in m["box"]]
    cor = CORES[m["sev"]]
    d.rounded_rectangle([x0, y0, x1, y1], radius=int(6 * e), outline=cor, width=max(3, int(3 * e)))
    cx = min(max(x1 if m.get("pos") == "tr" else x0, r + 2), W - r - 2)
    cy = min(max(y0, r + 2), H - r - 2)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=cor, outline="white", width=max(2, int(2.5 * e)))
    d.text((cx, cy), str(m["n"]), fill="white", font=fonte(int(r * 1.1)), anchor="mm")
s = W / 1000
f = fonte(int(20 * s)); y = H + rodape // 2; x = int(20 * s)
if score:
    d.text((x, y), f"Score {score}/100", fill="#111", font=fonte(int(24 * s)), anchor="lm")
    x += int(210 * s)
for k in ["critico", "alto", "medio", "baixo"]:
    d.ellipse([x, y - int(9 * s), x + int(18 * s), y + int(9 * s)], fill=CORES[k])
    d.text((x + int(26 * s), y), NOMES[k], fill="#333", font=f, anchor="lm")
    x += int(130 * s)
tela.save(saida)
print(saida, tela.size)
```

As coordenadas são sempre em pixels da imagem original; o script compõe o fundo branco e amplia imagens pequenas sozinho.
`pos: "tr"` coloca o número no canto superior direito da caixa, útil quando o canto esquerdo cobre texto.

# 7. Formato da saída

A entrega tem três partes, nesta ordem:
1. **A interface publicada** (seção 8), que é a entrega principal e traz todo o conteúdo da análise.
2. **As telas marcadas** (uma por página/tela com achados), enviadas como arquivo, para colar no Figma ou num documento.
3. **Uma resposta curta no chat:** score e faixa, veredito do problema, os 2 ou 3 achados mais graves e uma linha sobre a interface.
   Não repetir o relatório inteiro no chat, porque ele está na interface.

O modelo abaixo define o conteúdo de cada parte da análise. É ele que preenche a interface.

Português do Brasil, direto e específico. Sempre nomear o trecho exato ("o título 'Nova jornada de onboarding' na página 4",
"a etapa 'Confirmar dados' do fluxo"), nunca "alguns slides".

```
## Análise estratégica: [nome do material]

**Contexto considerado:** [organização, produto, público, estágio do material; marcar o que foi suposição]

### Score de maturidade estratégica: [XX]/100 · [faixa]
[1 linha: o que mais puxou o score para baixo e qual teto foi aplicado, se houver]

### 1. Entendimento do problema · [Claro | Parcial | Ausente]
| Declaração | O que o material diz (ou "ausente") | Sugestão de reescrita |
|---|---|---|
| Necessidade | ... | ... |
| Objetivo | ... | ... |
| Estratégia | ... | ... |
**Evidências apresentadas:** [dados, pesquisa, dores de negócio… ou falta delas]

### 2. Gaps e questionamentos (achados do problema e da solução, do mais severo para o menos severo)
**[n]. [severidade] [Título curto]**
- **Onde:** página/tela e trecho exato (ou "sem marcação")
- **O que falta ou preocupa:** o gap explicado
- **Lente:** princípio do método (ex.: causa x efeito, troca de valor real, formação e lastro, restrição de maturidade)
- **Impacto:** efeito no objetivo, nas pessoas, no negócio ou em outra parte do ecossistema
- **Recomendação:** o que fazer, de forma concreta

### 3. Cenários negativos
C1…C6: cenário, plausibilidade (Provável, Plausível, Possível, Surpresa), gatilho, sinal de alerta, impacto, mitigação, achados ligados.

### 4. Evolução por horizontes
H1 (versioning), H2 (visioning), H3 (venturing): o que muda, estruturas e trocas de valor, indicador de avanço, pré-requisito.
[1–2 linhas: onde a proposta atual está e o que falta para avançar]

### 5. Dicas para melhorar
Quick wins (3 a 5) e estruturantes (2 a 4).

### 6. Provocações
Problema · Cenário · Contexto · Solução (2 a 3 cada) + "Como nós podemos…?" (2 a 3).

### Diagnóstico geral
[3 a 5 linhas: a proposta sabe qual problema resolve? A solução responde a ele? Maior risco e maior acerto.]

### Score por dimensão
[nota, peso, pontos, achados ligados e comentário por dimensão]

### O que está funcionando
[2 a 4 acertos específicos que devem ser preservados]

### Próximos passos
[2 a 3 ações: ex. reescrever as declarações, discovery sobre X, rodar um Jungle com as áreas Y e Z, Camping Fire para o plano tático]
```

# 8. Interface publicada

A interface segue o padrão das skills de review de arquitetura da informação e de mapeamento de métricas: resumo no topo,
tela interativa fixa à esquerda, achados filtráveis à direita e seções de fechamento. Cada achado pode receber contexto da
pessoa e ser reavaliado ali mesmo, com histórico salvo.

O que a página mostra:
- **Topo:** contexto considerado (suposições com borda tracejada) e o score com anel, faixa, distribuição por severidade e as 3 dimensões mais fracas.
- **1 · Entendimento do problema:** veredito (Claro, Parcial, Ausente), texto curto, tabela Necessidade / Objetivo / Estratégia com "o que o material diz" e "sugestão de reescrita", e as evidências.
- **2 · Gaps e questionamentos:** abas por tela ou página (com o número de achados de cada uma), marcações coloridas por severidade; passar o mouse num achado troca para a tela dele e destaca a marcação; tocar num número leva ao achado. Filtro por severidade. Cada card traz severidade, telas, onde, o que falta, impacto, lente e recomendação.
- **3 · Cenários negativos:** cards com plausibilidade (Provável, Plausível, Possível, Surpresa), gatilho, sinal de alerta, impacto, mitigação e atalho para os achados ligados.
- **4 · Evolução por horizontes:** H1, H2 e H3 lado a lado, com o que muda, estruturas e trocas de valor, indicador e pré-requisito, mais uma nota sobre onde a proposta está hoje.
- **5 · Dicas:** quick wins numerados e mudanças estruturantes.
- **6 · Provocações:** grupos Problema, Cenário, Contexto e Solução, e o bloco "Como nós podemos…?".
- **Fechamento:** diagnóstico geral, score por dimensão (calculado pela página, com N/A e tetos), o que está funcionando e próximos passos.
- **Reavaliação:** "Responder ou adicionar contexto" em cada achado. Claude reavalia o achado e atualiza o resto (outros achados, problema, cenários, horizontes, dicas, provocações, diagnóstico, contexto). O score é recalculado e o histórico fica salvo.

## Como gerar

1. **Pegar o modelo.** Ler o artifact modelo `3b051ee5-d563-40ca-bab3-1a891da842f7` ("Análise estratégica: fluxo de Pausa") com
   `read_artifact` e salvar o HTML como `index.html` no diretório de trabalho. Nunca republicar em cima do modelo: cada análise vira um artifact novo.
2. **Trocar só o bloco de dados.** Substituir o conteúdo entre `/* ============ DADOS DA ANÁLISE: preencher só este bloco ============ */`
   e a linha `/* ==== ... */` seguinte pelo `const DATA = {...}` da nova análise. Não mexer no CSS nem no resto do script.
3. **Telas sem marcação.** A página desenha as marcações sozinha, então as imagens publicadas são as telas originais
   (com fundo branco), nomeadas `tela-1.png`, `tela-2.png`... Em `telas`, `w` e `h` são o tamanho em pixels de cada imagem,
   e as caixas usam essas mesmas coordenadas (as mesmas dos `marcacoes-*.json`).
4. **Conferir antes de publicar.** Se houver navegador headless no workspace (Playwright ou Chrome), abrir a página por um
   servidor local, tirar print e verificar se as marcações caem nos trechos certos e se não há erro de script.
5. **Publicar e declarar.** Publicar com `publish_files` (index.html e as imagens), com título "Análise estratégica: [nome do material]"
   e ícone `strategy`. Depois declarar as capacidades com `declare_capabilities`, usando a versão devolvida na publicação como
   `base_version`: `{"db": {}, "sample": {"images": true}, "user": {}}`. Sem essa declaração, a reavaliação e o histórico não funcionam.

## Estrutura do bloco DATA

```js
const DATA = {
  titulo: "Análise estratégica: ...",
  eyebrow: "Análise estratégica · [arquivo] / [fluxo]",
  notaScore: "1 linha: o que mais puxa o score",
  contextoItens: [ { rotulo: "Produto", texto: "...", suposicao: false } ],
  problema: {
    veredito: "claro|parcial|ausente", texto: "...",
    declaracoes: [ { rotulo: "Necessidade", atual: "" /* vazio = ausente */, sugestao: "..." }, { rotulo: "Objetivo", ... }, { rotulo: "Estratégia", ... } ],
    evidencias: "<b>Evidências apresentadas:</b> ..."
  },
  telas: [ { nome: "01 Entrada", arquivo: "tela-1.png", w: 446, h: 829, alt: "descrição da tela" } ],
  dimensoes: [   // as 7 da rubrica; marque clareza: true na de clareza; nota: null para N/A
    { nome: "Clareza do problema e da necessidade", peso: 25, achados: [4], clareza: true, comentario: "..." },
    { nome: "Viabilidade (5 restrições)", peso: 5, achados: [], nota: null, comentario: "..." }
  ],
  achados: [ { n: 1, sev: "critico|alto|medio|baixo", titulo: "...", onde: "...",
    marcas: [ { tela: 0, box: [x0, y0, x1, y1], pos: "tr" } ],   // [] = sem marcação; pos é opcional
    oQue: "...", lente: "...", impacto: "...", recomendacao: "..." } ],
  cenarios: [ { id: "C1", plaus: "provavel|plausivel|possivel|surpresa", titulo: "...", gatilho: "...", sinal: "...", impacto: "...", mitigacao: "...", achados: [1] } ],
  horizontes: [ { h: "H1", nome: "Agora · Versioning", muda: "...", estruturas: "...", indicador: "...", pre: "..." } ],
  horizontesNota: "...",
  dicas: { quickWins: ["..."], estruturantes: ["..."] },
  provocacoes: { grupos: [ { rotulo: "Problema", itens: ["..."] }, { rotulo: "Cenário", ... }, { rotulo: "Contexto", ... }, { rotulo: "Solução", ... } ], hmw: ["Como nós podemos...?"] },
  diagnostico: "...",
  funcionando: ["..."],
  proximos: ["..."]
};
```

Na resposta do chat, dizer em uma frase o que a interface traz. O card do artifact já mostra o link.

# 9. Base do método (referência para as lentes)

- **Estratégia** é a habilitação de um cenário capaz de escalar, se adaptar e sustentar a entrega de valor competitivo a partir
  da inovação no longo prazo — não um caminho linear do ponto A ao B. É habilidade, não cargo.
- **Mentalidade estratégica:** pensamento crítico e sistêmico (questionar, correlacionar, causa x efeito, reação x proposição) ·
  tomada de decisão (colaboração, interconexões, tempo, restrições) · articulação de valor (comunicação efetiva, atuação parceira).
- **Tático é um recorte na linha do tempo da estratégia.** Estratégia sem tática = plano das ideias; tática sem estratégia =
  acumular funcionalidades. Sinal clássico: estratégia que é um slide com a lista de features da concorrência.
- **Inovação x novidade:** inovação é propositiva, de longo prazo, camada de alcance e muda o sistema; novidade é reativa,
  de curto prazo, sustenta indicadores e é fácil de copiar. Cuidado com "novidade em pele de inovação".
- **Troca de valor real:** integrar o que já existe gerando benefício mútuo e uma nova fonte de valor (ex.: Gmail + Drive).
- **Anatomia do ecossistema:** camada de negócio (propósito) · produtos (camadas inovação, sustentação, comportamento, alcance) ·
  subprodutos · estruturas · hubs e emissores · células · mecanismos. Classificar estruturas por complexidade, autonomia e relevância.
- **Formação e lastro:** a primeira percepção (visceral, comportamental, reflexiva) e como ela muda a cada repetição de uso;
  expectativa sobe com o uso; o fim e os momentos negativos pesam mais na memória.
- **Seis aprendizados:** necessidades mudam · as pessoas usam de forma não prevista · algo vai dar errado · percepção é dinâmica ·
  a causa influencia, não o efeito · processos não se copiam.
- **5 princípios de UX Strategy:** uma boa experiência se sustenta no tempo · se adapta · vai além do incremento · conecta-se ao
  quadro geral · só inova quando o sistema colabora.
- **5 princípios ecossistêmicos:** considerar o todo · valor imediato e ao longo do tempo · diversidade de pensamento ·
  adaptação contra a linearidade · experimentação como base de aprendizado.
- **Era da IA:** IA é capacidade; estratégia é escolha. O gargalo saiu de "como construir?" para "o que merece existir?".
  Nunca foi tão barato construir — nem tão caro construir a coisa errada. Velocidade não é aprendizado; complexidade é
  matéria-prima; IA pode fortalecer silos; interface virou commodity, experiência não
  (integração, consistência, personalização, contextualização).
- **Ferramentas para recomendar como próximo passo:** visão compartilhada (cenário, necessidade, consequências, objetivo,
  estratégia, anatomia de valor, dimensões, ecossistema, "Como nós podemos", roadmap, atividades, indicadores, próximos passos) ·
  **Jungle** (dinâmica colaborativa de ~2h com 11 módulos: contextualização, necessidades, objetivos, como habilitar objetivos,
  roadmap, outcomes, discovery, riscos, mitigação, dimensões, certezas e dúvidas) · **Camping Fire** (contexto, restrições,
  abordagem fazer/não fazer, atividades rainha/bispo/cavalo/peão, profundidade, sequenciador, "e se").

# 10. Regras de qualidade

- **Imagens, interface e relatório batem:** todo número marcado existe na interface e todo achado com local tem marcação. Conferir antes de entregar.
- **Score coerente** com os achados e igual ao que a interface calcula; score alto com achado crítico indica erro na conta.
- **Específico ao material:** cenários, horizontes e provocações precisam citar elementos do material. Se servirem para qualquer
  proposta, reescrever.
- **Prioridade acima de volume:** 5 a 12 achados bem fundamentados valem mais que 30 observações rasas.
- **Crítica com lente e impacto,** nunca gosto pessoal. Sempre dizer o que fazer.
- **Equilíbrio:** apontar acertos reais.
- **Humildade metodológica:** a análise levanta hipóteses; dados, discovery e conversa com o time confirmam.
- **Estágio do material:** cobrar o que é esperado para aquele momento e dizer o que ficou fora por isso.
- **Não inventar dados da organização;** quando faltar, virar pergunta ou provocação.
- **Se o usuário pedir foco** (ex.: só cenários negativos, só provocações), aprofundar nessa lente e resumir as demais em poucas linhas.
- Ao citar os livros, parafrasear; não reproduzir trechos longos.