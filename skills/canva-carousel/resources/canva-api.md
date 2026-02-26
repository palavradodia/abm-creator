# Referência Canva API — Antigravity

Guia de integração entre o JSON gerado pelo Claude e a Canva Apps SDK (Design Editing API).

Documentação oficial: https://www.canva.dev/docs/apps/design-editing/

---

## Como o Antigravity usa este JSON

1. Claude gera o JSON completo do carrossel (schema definido na Etapa 6 do SKILL.md)
2. Antigravity lê o JSON e abre uma sessão com `openDesign({ type: "all_pages" })`
3. Para cada slide no array `slides[]`, o Antigravity cria uma página e insere os elementos
4. Chama `session.sync()` uma única vez ao final (nunca por slide — para evitar rate limit)
5. O design é exportado ou retornado ao usuário

---

## Design Editing API — Conceitos essenciais

### Abertura de sessão
```typescript
import { openDesign } from "@canva/design";

await openDesign({ type: "all_pages" }, async (session) => {
  // Todas as edições acontecem aqui
  // IMPORTANTE: sessão expira em 1 minuto
  await session.sync(); // Chamar apenas uma vez no final
});
```

### Tipos de contexto
| Contexto | Uso |
|---|---|
| `current_page` | Editar só a página atual |
| `all_pages` | Editar todas as páginas (carrossel inteiro) — **usar este** |

---

## Tipos de Elementos Suportados

### 1. TEXT — Elemento de texto
Mapeamento do JSON `type: "text"` para a API:

```typescript
const textElement = session.helpers.elementStateBuilder.createTextElement({
  top: element.position.top,
  left: element.position.left,
  width: element.position.width,
  // height é calculada automaticamente pelo Canva
  text: {
    regions: [
      {
        text: element.content,
        formatting: {
          fontSize: element.style.fontSize,
          // fontFamily: element.style.fontFamily, // ver seção Fontes
          color: element.style.color,        // hex string ex: "#FFFFFF"
          bold: element.style.fontWeight >= "700",
          italic: false,
          textAlign: element.style.textAlign, // "left" | "center" | "right"
        },
      },
    ],
  },
});

session.page.elements.insertAfter(undefined, textElement);
```

**Limitações de texto:**
- `height` não pode ser definida explicitamente — o Canva calcula com base no conteúdo
- Não há suporte a `letterSpacing` ou `textTransform` via API — aplicar apenas visualmente no preview HTML
- Máximo de 1 região por elemento de texto para simplificar (não misturar estilos inline)

---

### 2. RECT — Retângulo com cor sólida
Mapeamento do JSON `type: "rect"` para a API:

```typescript
const rectElement = session.helpers.elementStateBuilder.createRectElement({
  top: element.position.top,
  left: element.position.left,
  width: element.position.width,
  height: element.position.height,
  fill: {
    color: element.style.backgroundColor, // hex
  },
});

session.page.elements.insertAfter(undefined, rectElement);
```

**Uso típico:**
- Fundo de slide com cor sólida (`role: "background"`)
- Blocos decorativos de cor
- Separadores visuais

---

### 3. BACKGROUND — Fundo da página
Para definir o fundo diretamente na página (mais eficiente que um rect full-canvas):

```typescript
// Fundo cor sólida
session.page.background = {
  type: "solid",
  color: slide.background.color,
};

// Fundo com imagem (asset já carregado no Canva)
session.page.background = {
  type: "image",
  ref: assetRef, // referência obtida via Canva Asset API
};
```

> ⚠️ **Gradiente no fundo**: A API não suporta gradiente nativo no `page.background`. Para gradiente, use um `rect` full-canvas com `opacity` e sobreponha os elementos de texto acima dele. O Antigravity deve converter `background.type = "gradient"` em um rect 1080×1080 com CSS gradient simulado por duas cores sobrepostas.

---

### 4. SHAPE — Formas vetoriais (uso avançado)
```typescript
const shapeElement = session.helpers.elementStateBuilder.createShapeElement({
  top: 0,
  left: 0,
  width: 100,
  height: 100,
  paths: [
    {
      d: "M 0 0 L 100 0 L 100 100 L 0 100 Z", // SVG path syntax
      fill: {
        type: "solid",
        color: "#F5C842",
      },
    },
  ],
});
```

**Uso típico:** elementos decorativos geométricos, divisores estilizados.
Evitar para carrosséis simples — preferir `rect`.

---

## Ordem de renderização (z-index)

A API insere elementos na ordem de chamada de `insertAfter`. O primeiro elemento inserido fica **atrás** (fundo), o último fica **na frente**.

**Ordem correta para um slide:**
1. Background (rect ou page.background) — inserir primeiro
2. Elementos decorativos (shapes, rects menores)
3. Textos (label, headline, body, cta) — inserir por último

No JSON, os elementos em `slide.elements[]` devem estar **nesta ordem** para que o Antigravity insira corretamente.

---

## Fontes disponíveis no Canva

Use apenas fontes da lista abaixo no campo `fontFamily` do JSON. Fontes fora desta lista podem não estar disponíveis para todos os usuários.

### Fontes seguras (disponíveis para todos os planos)
| Fonte | Pesos disponíveis | Estilo |
|---|---|---|
| **Inter** | 400, 500, 600, 700, 800 | Geométrica moderna |
| **Montserrat** | 400, 500, 600, 700, 800, 900 | Geométrica forte |
| **Lato** | 300, 400, 700, 900 | Humanista clean |
| **Open Sans** | 300, 400, 600, 700, 800 | Legível, versátil |
| **Raleway** | 300, 400, 600, 700, 800 | Elegante |
| **Oswald** | 400, 500, 600, 700 | Condensada, impactante |
| **Playfair Display** | 400, 700, 900 | Serif editorial |
| **Merriweather** | 300, 400, 700, 900 | Serif legível |
| **Roboto** | 300, 400, 500, 700, 900 | Neutro, versátil |
| **Source Sans Pro** | 300, 400, 600, 700 | Clean, corpo de texto |
| **DM Sans** | 400, 500, 700 | Contemporânea |
| **Space Grotesk** | 300, 400, 500, 600, 700 | Tech/startup |
| **Poppins** | 300, 400, 500, 600, 700, 800 | Geométrica amigável |

### Fontes Canva Pro (requer plano pago)
`Canva Sans`, `Freight Display`, `TT Commons`, `Recoleta`

> **Regra:** Se não houver instrução de marca específica, usar **Inter** ou **Montserrat** como padrão.

---

## Limites e Boas Práticas

| Limite | Valor | Notas |
|---|---|---|
| Expiração de sessão | 1 minuto | Gerar todos os slides antes de sync |
| Sync por operação | 1x ao final | Múltiplos syncs = múltiplos undos + mais lento |
| Elementos por slide | ≤ 6 recomendado | API suporta mais, mas prejudica performance |
| Tamanho mínimo de fonte | 8pt | Abaixo disso Canva pode ignorar |
| Cores | Formato hex `#RRGGBB` | Sem suporte a `rgba` na API |
| Dimensões mínimas de elemento | 1×1 px | Evitar `width: 0` ou `height: 0` |

### Práticas recomendadas para o Antigravity

1. **Criar todas as páginas primeiro**, depois editar elemento por elemento — evita conflitos de sessão
2. **Nunca usar `sync()` dentro de loop** — sempre sync único ao final da callback
3. **Verificar `page.locked`** antes de editar: `if (session.page.locked) return;`
4. **Verificar `page.type === "absolute"`** antes de acessar elementos
5. **Tratamento de erro**: envolver operações em try/catch e registrar qual slide falhou para reprocessar

---

## Fluxo de integração completo (pseudocódigo)

```typescript
import { openDesign } from "@canva/design";

async function createCarouselFromJSON(carouselJSON) {
  const { slides, designSystem } = carouselJSON.carousel;

  await openDesign({ type: "all_pages" }, async (session) => {
    // Iterar sobre cada slide
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];

      // Abrir/criar a página correspondente
      await session.helpers.openPage(session.pageRefs.toArray()[i], async (pageResult) => {
        if (pageResult.page.type !== "absolute" || pageResult.page.locked) return;

        // 1. Definir fundo
        if (slide.background.type === "solid") {
          pageResult.page.background = { type: "solid", color: slide.background.color };
        } else if (slide.background.type === "gradient") {
          // Inserir rect full-canvas simulando gradiente
          const bgRect = pageResult.helpers.elementStateBuilder.createRectElement({
            top: 0, left: 0,
            width: carouselJSON.carousel.meta.dimensions.width,
            height: carouselJSON.carousel.meta.dimensions.height,
            fill: { color: slide.background.gradientStart },
          });
          pageResult.page.elements.insertAfter(undefined, bgRect);
        }

        // 2. Inserir elementos na ordem do array
        for (const el of slide.elements) {
          if (el.type === "text") {
            const textEl = pageResult.helpers.elementStateBuilder.createTextElement({
              top: el.position.top,
              left: el.position.left,
              width: el.position.width,
              text: {
                regions: [{
                  text: el.content,
                  formatting: {
                    fontSize: el.style.fontSize,
                    color: el.style.color,
                    bold: parseInt(el.style.fontWeight) >= 700,
                    textAlign: el.style.textAlign,
                  },
                }],
              },
            });
            pageResult.page.elements.insertAfter(undefined, textEl);

          } else if (el.type === "rect") {
            const rectEl = pageResult.helpers.elementStateBuilder.createRectElement({
              top: el.position.top,
              left: el.position.left,
              width: el.position.width,
              height: el.position.height,
              fill: { color: el.style.backgroundColor },
            });
            pageResult.page.elements.insertAfter(undefined, rectEl);
          }
        }
      });
    }

    // 3. Sync único ao final
    await session.sync();
  });
}
```

---

## Erros comuns

| Erro | Causa | Solução |
|---|---|---|
| Sessão expirada | Operações > 1 minuto | Reduzir elementos por slide; processar em lotes menores |
| Elemento não aparece | `sync()` não chamado | Garantir `await session.sync()` ao final |
| Fonte não encontrada | Nome de fonte inválido | Usar apenas fontes da lista acima |
| Cor inválida | Formato `rgba` ou `hsl` | Converter para `#RRGGBB` |
| Página bloqueada | `page.locked === true` | Verificar antes de editar e pular se necessário |
