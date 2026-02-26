---
name: canva-carousel
description: Crie carrosséis profissionais para redes sociais (Instagram, LinkedIn, TikTok) prontos para uso no Canva. Use esta skill sempre que o usuário pedir para criar um carrossel, post em slides, apresentação de conteúdo para redes sociais, sequência de stories ou qualquer conteúdo visual com múltiplos slides. Também use quando o usuário quiser adaptar um conteúdo (artigo, blog post, thread, vídeo) para o formato carrossel. A skill gera um plano de slides completo, scripts de copy, diretrizes visuais e um arquivo HTML interativo de preview — tudo pronto para replicar no Canva.
---

# Canva Carousel Skill — Antigravity

Skill para criar carrosséis de alta conversão para redes sociais, com estrutura estratégica, copy persuasivo e especificações visuais prontas para montar no Canva.

---

## FLUXO DE TRABALHO

Execute **sempre** nesta ordem:

1. **Capturar briefing** (extrair do contexto ou perguntar ao usuário)
2. **Definir estratégia** (objetivo, plataforma, público)
3. **Criar estrutura de slides** com copy completo
4. **Gerar especificações visuais** por slide
5. **Produzir o preview HTML interativo**
6. **Exportar o JSON para o Antigravity** → Canva API

> ⚠️ **Integração Antigravity:** O output final desta skill é um **JSON estruturado** que o Antigravity consome para criar os slides via Canva Apps SDK (Design Editing API). Leia `resources/canva-api.md` para entender os tipos de elementos e restrições da API antes de gerar o JSON.

---

## ETAPA 1 — BRIEFING

Antes de criar, confirme (ou extraia da conversa):

| Campo | Pergunta |
|---|---|
| **Tema/Assunto** | Qual é o tema do carrossel? |
| **Objetivo** | Educar, vender, engajar, gerar leads? |
| **Plataforma** | Instagram, LinkedIn, TikTok, Pinterest? |
| **Público-alvo** | Quem vai ver? Dores, desejos, nível de consciência? |
| **Tom de voz** | Formal, casual, técnico, provocativo? |
| **CTA final** | O que o usuário deve fazer ao terminar? |
| **Referência visual** | Tem paleta, fontes ou estilo do Antigravity? |
| **Número de slides** | Livre ou fixo? (padrão: 8–12 slides) |

Se o usuário fornecer um texto/conteúdo, extraia essas informações automaticamente.

---

## ETAPA 2 — ESTRATÉGIA DO CARROSSEL

Antes de escrever os slides, defina:

### Estrutura Base (Framework HOOK-VALOR-CTA)
```
Slide 1:   HOOK      → Para o scroll, gera curiosidade ou dor
Slides 2-N: VALOR    → Entrega o conteúdo prometido
Slide Final: CTA      → Direciona a próxima ação
```

### Frameworks de Carrossel (escolha conforme objetivo)

**EDUCAR / AUTORIDADE:**
Hook → Problema → Por quê acontece → Solução → Passo a passo → Resultado → CTA

**VENDER / CONVERTER:**
Hook → Dor → Agitação → Solução → Prova social → Oferta → CTA

**ENGAJAR / VIRALIZAR:**
Hook controverso → Premissa → 5–7 razões/exemplos → Resumo → Salva e compartilha

**STORYTELLING / CONEXÃO:**
Hook narrativo → Situação → Conflito → Virada → Lição → Aplicação → CTA

---

## ETAPA 3 — CRIAÇÃO DOS SLIDES

Para cada slide, entregue:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE [N] — [NOME DA FUNÇÃO]
━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 HEADLINE:
[Título principal — máx. 8 palavras]

📄 BODY COPY:
[Texto de apoio — máx. 3 linhas / 25 palavras]

🏷️ ELEMENTO DE APOIO:
[Ícone sugerido / stat / quote / lista / emoji cta]

🎨 LAYOUT:
[Descrição do layout: posição dos elementos, destaque visual]

🖼️ IMAGEM/FUNDO:
[Tipo de visual: gradiente, foto, cor sólida, ilustração]
```

### Regras de Copy para Carrossel

**Slide 1 (HOOK) — As 3 Formas de Parar o Scroll:**
- **Promessa audaciosa**: "Como triplicar seus leads em 30 dias"
- **Curiosidade aberta**: "O erro que 90% dos founders cometem"
- **Dor direta**: "Você está perdendo vendas por isso"
- Use números sempre que possível
- Máx. 6–8 palavras no título principal
- Sub-headline opcional: reforça ou gera mais curiosidade

**Slides de Conteúdo (2 a N-1):**
- Uma ideia por slide — nunca mais de uma
- Comece com verbo ou número
- Bullets: máx. 3–4 itens curtos
- Use quebras de linha estratégicas
- Evite parágrafos longos — carrossel não é blog

**Slide Final (CTA):**
- Seja direto e específico: "Salva esse post", "Me segue", "Clica no link da bio"
- Ofereça um benefício para o CTA: "Salva para não perder"
- Pode repetir o tema do Hook para fechar o loop
- Inclua arroba / username / logo

---

## ETAPA 4 — ESPECIFICAÇÕES VISUAIS

Após os slides, entregue uma tabela com especificações para o Canva:

### Configurações Técnicas por Plataforma

| Plataforma | Dimensão | Formato |
|---|---|---|
| Instagram Feed | 1080 × 1080 px | Quadrado |
| Instagram Stories / Reels | 1080 × 1920 px | Vertical 9:16 |
| LinkedIn | 1080 × 1080 px ou 1200 × 628 px | Quadrado ou Paisagem |
| Pinterest | 1000 × 1500 px | Vertical 2:3 |
| TikTok slides | 1080 × 1920 px | Vertical 9:16 |

### Design System do Slide

```
TIPOGRAFIA:
- Headline: [fonte bold] — 48–72pt
- Subheadline: [fonte semibold] — 24–32pt
- Body: [fonte regular] — 16–22pt
- Caption/Label: [fonte light] — 12–14pt

CORES:
- Primária: [hex]
- Secundária: [hex]
- Fundo: [hex]
- Texto principal: [hex]
- Destaque/CTA: [hex]

ESPAÇAMENTO:
- Margem segura: 60–80px de cada lado
- Espaço entre elementos: mínimo 24px
- Área segura para Stories: evitar 150px topo e base
```

---

## ETAPA 5 — PREVIEW HTML INTERATIVO

Gere um arquivo HTML com preview navegável do carrossel:

```html
<!-- Template base — adapte com o conteúdo real dos slides -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Preview Carrossel — [TEMA]</title>
  <style>
    /* Ver referências/html-preview-template.md para o CSS completo */
  </style>
</head>
<body>
  <!-- Slides renderizados com navegação por setas -->
  <!-- Contador de slides -->
  <!-- Painel de especificações laterais -->
</body>
</html>
```

> **Leia o arquivo** `resources/html-preview-template.md` para o template HTML completo com estilos, navegação e estrutura de slide.

---

## ETAPA 6 — JSON OUTPUT PARA O ANTIGRAVITY

Após o preview HTML, gere o JSON final que o Antigravity vai consumir para criar o design via Canva API.

> Leia `resources/canva-api.md` para detalhes completos dos tipos de elementos, limites e propriedades da API antes de gerar este JSON.

### Schema do JSON

```json
{
  "carousel": {
    "meta": {
      "title": "string — título do carrossel",
      "platform": "instagram | linkedin | tiktok | pinterest",
      "dimensions": {
        "width": 1080,
        "height": 1080,
        "unit": "px"
      },
      "totalSlides": 8,
      "createdAt": "ISO 8601 timestamp"
    },
    "designSystem": {
      "colors": {
        "background": "#hex",
        "primary": "#hex",
        "secondary": "#hex",
        "text": "#hex",
        "textMuted": "#hex",
        "accent": "#hex"
      },
      "typography": {
        "headline": {
          "family": "string — nome da fonte",
          "weight": "800 | 700 | 600",
          "sizePt": 48
        },
        "body": {
          "family": "string — nome da fonte",
          "weight": "400 | 500",
          "sizePt": 18
        },
        "label": {
          "family": "string — nome da fonte",
          "weight": "700",
          "sizePt": 12
        }
      },
      "spacing": {
        "marginSafePx": 72,
        "elementGapPx": 24
      }
    },
    "slides": [
      {
        "index": 0,
        "role": "hook | content | cta",
        "layout": "centered | split-left | split-right | stat | before-after | list",
        "background": {
          "type": "solid | gradient | image",
          "color": "#hex",
          "gradientStart": "#hex",
          "gradientEnd": "#hex",
          "gradientAngle": 135,
          "imagePrompt": "string — descrição para geração de imagem (se type=image)"
        },
        "elements": [
          {
            "id": "string — ex: slide0_label",
            "type": "text | rect | shape",
            "role": "label | headline | body | accent | cta-button | decorative",
            "content": "string — texto (somente para type=text)",
            "position": {
              "top": 80,
              "left": 72,
              "width": 936,
              "height": 60
            },
            "style": {
              "fontSize": 12,
              "fontFamily": "string",
              "fontWeight": "700",
              "color": "#hex",
              "backgroundColor": "#hex",
              "letterSpacing": 0.15,
              "textTransform": "uppercase | none",
              "textAlign": "left | center | right",
              "borderRadius": 0,
              "opacity": 1.0
            }
          }
        ]
      }
    ]
  }
}
```

### Regras para geração do JSON

1. **Posicionamento**: todas as coordenadas `top`, `left`, `width`, `height` em pixels absolutos dentro do canvas de `meta.dimensions`
2. **Margem segura**: nenhum elemento com `left < spacing.marginSafePx` ou `top < 60` (topo) / `bottom > height - 60` (base)
3. **IDs únicos**: cada elemento deve ter `id` único no formato `slide{index}_{role}_{n}`
4. **Máximo de elementos por slide**: 6 elementos (Canva API tem limite de sessão de 1 minuto — slides simples são mais rápidos de renderizar)
5. **Fontes**: usar apenas fontes disponíveis no Canva (ver `resources/canva-api.md` para lista completa)
6. **Gradiente**: quando `background.type = "gradient"`, o Antigravity cria um `rect` full-canvas com gradiente CSS convertido para Canva fill
7. **imagePrompt**: preenchido apenas quando o slide requer imagem de fundo — o Antigravity irá gerar ou buscar a imagem antes de chamar a Canva API

### Exemplo mínimo (Slide Hook)

```json
{
  "index": 0,
  "role": "hook",
  "layout": "centered",
  "background": {
    "type": "solid",
    "color": "#0A0A0A"
  },
  "elements": [
    {
      "id": "slide0_label_0",
      "type": "text",
      "role": "label",
      "content": "PRODUTIVIDADE",
      "position": { "top": 380, "left": 72, "width": 936, "height": 32 },
      "style": {
        "fontSize": 12, "fontFamily": "Inter", "fontWeight": "700",
        "color": "#F5C842", "letterSpacing": 0.15,
        "textTransform": "uppercase", "textAlign": "center"
      }
    },
    {
      "id": "slide0_headline_0",
      "type": "text",
      "role": "headline",
      "content": "Você está perdendo tempo por causa disso",
      "position": { "top": 424, "left": 72, "width": 936, "height": 180 },
      "style": {
        "fontSize": 52, "fontFamily": "Inter", "fontWeight": "800",
        "color": "#FFFFFF", "textAlign": "center"
      }
    },
    {
      "id": "slide0_body_0",
      "type": "text",
      "role": "body",
      "content": "Descubra os 7 hábitos que sabotam sua produtividade",
      "position": { "top": 624, "left": 72, "width": 936, "height": 60 },
      "style": {
        "fontSize": 18, "fontFamily": "Inter", "fontWeight": "400",
        "color": "#888888", "textAlign": "center"
      }
    }
  ]
}
```

---

## PADRÕES DE QUALIDADE

Antes de entregar, verifique:

- [ ] Hook para o scroll (slide 1 gera curiosidade/dor?)
- [ ] Uma ideia por slide
- [ ] Progressão lógica entre slides
- [ ] CTA claro e específico no último slide
- [ ] Copy conciso (sem parágrafos longos)
- [ ] Consistência visual (mesma paleta/fonte em todos os slides)
- [ ] Números e dados concretos quando possível
- [ ] Nenhum slide "óbvio demais" para ser pulado

---

## REFERÊNCIAS

Leia os seguintes arquivos conforme necessário:

- `resources/html-preview-template.md` — Template HTML completo para o preview interativo
- `resources/copy-formulas.md` — Fórmulas de copy testadas por categoria de conteúdo
- `resources/visual-guidelines.md` — Diretrizes visuais e exemplos de paletas
- `resources/canva-api.md` — **Leia antes de gerar o JSON**: tipos de elementos, fontes disponíveis, limites da Design Editing API e como o Antigravity chama a API do Canva

---

## EXEMPLO DE OUTPUT RESUMIDO

```
Tema: "5 erros de copy que matam suas conversões"
Plataforma: Instagram
Objetivo: Autoridade + engajamento

SLIDE 1 — HOOK
Headline: "Você está perdendo vendas por essas 5 palavras"
Body: Descubra os erros de copy que nenhum guru te conta
Layout: Texto centralizado, fundo escuro, destaque em amarelo

SLIDE 2 — ERRO #1
Headline: "1. Falar de features, não de benefícios"
Body: Ninguém compra um colchão de molas. Todo mundo compra uma boa noite de sono.
Layout: Número grande à esquerda, texto à direita

[...]

SLIDE 8 — CTA
Headline: "Salva esse post"
Body: Cole no seu próximo copy e veja a diferença
Layout: Chamada de ação centralizada, arroba visível, fundo primário
```
