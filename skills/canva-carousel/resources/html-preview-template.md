# HTML Preview Template — Carrossel Canva

Use este template para gerar o arquivo HTML de preview interativo do carrossel.
Substitua as variáveis `[TEMA]`, `[COR_PRIMARIA]`, `[COR_FUNDO]`, etc., e o array `slides` com o conteúdo real.

---

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Carrossel — [TEMA]</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0f0f0f;
      color: #fff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
    }

    h1.page-title {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 32px;
    }

    /* === CAROUSEL WRAPPER === */
    .carousel-wrapper {
      display: flex;
      align-items: center;
      gap: 24px;
      width: 100%;
      max-width: 900px;
    }

    /* === SLIDE === */
    .slide-container {
      width: 540px;
      height: 540px;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
      box-shadow: 0 32px 80px rgba(0,0,0,0.6);
    }

    .slide {
      width: 100%;
      height: 100%;
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 56px;
      background: [COR_FUNDO];
      position: relative;
    }

    .slide.active { display: flex; }

    .slide-number-badge {
      position: absolute;
      top: 24px;
      right: 24px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
    }

    .slide-tag {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: [COR_DESTAQUE];
      margin-bottom: 20px;
    }

    .slide-headline {
      font-size: 36px;
      font-weight: 800;
      line-height: 1.15;
      color: [COR_TEXTO];
      margin-bottom: 20px;
      max-width: 420px;
    }

    .slide-headline em {
      color: [COR_DESTAQUE];
      font-style: normal;
    }

    .slide-body {
      font-size: 16px;
      font-weight: 400;
      line-height: 1.6;
      color: rgba(255,255,255,0.7);
      max-width: 380px;
    }

    .slide-body ul {
      list-style: none;
      padding: 0;
      margin-top: 8px;
    }

    .slide-body ul li {
      padding: 6px 0;
      padding-left: 20px;
      position: relative;
    }

    .slide-body ul li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: [COR_DESTAQUE];
    }

    /* CTA Slide */
    .slide.cta-slide {
      background: [COR_PRIMARIA];
      align-items: center;
      text-align: center;
    }

    .slide.cta-slide .slide-headline {
      font-size: 42px;
      text-align: center;
    }

    .cta-button {
      margin-top: 28px;
      background: #fff;
      color: [COR_PRIMARIA];
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 14px 32px;
      border-radius: 100px;
    }

    /* === CONTROLS === */
    .nav-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.06);
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .nav-btn:hover {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.4);
    }

    /* === DOTS === */
    .dots {
      display: flex;
      gap: 8px;
      margin-top: 24px;
      justify-content: center;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      cursor: pointer;
      transition: all 0.2s;
    }

    .dot.active {
      background: [COR_DESTAQUE];
      width: 24px;
      border-radius: 3px;
    }

    /* === SPECS PANEL === */
    .specs-panel {
      flex: 1;
      background: #1a1a1a;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #2a2a2a;
    }

    .specs-panel h3 {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 16px;
    }

    .spec-item {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #222;
    }

    .spec-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .spec-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: [COR_DESTAQUE];
      margin-bottom: 6px;
    }

    .spec-value {
      font-size: 14px;
      color: #e0e0e0;
      line-height: 1.5;
    }

    .spec-value strong {
      color: #fff;
      display: block;
      margin-bottom: 4px;
    }

    /* === BOTTOM INFO === */
    .bottom-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 900px;
      margin-top: 32px;
      padding: 16px 0;
      border-top: 1px solid #1e1e1e;
    }

    .platform-badge {
      font-size: 12px;
      font-weight: 600;
      color: #555;
    }

    .slide-counter {
      font-size: 13px;
      font-weight: 700;
      color: #444;
      font-variant-numeric: tabular-nums;
    }

    .slide-counter span { color: [COR_DESTAQUE]; }
  </style>
</head>
<body>

<h1 class="page-title">Preview Carrossel — [TEMA]</h1>

<div class="carousel-wrapper">
  <!-- BOTÃO ANTERIOR -->
  <button class="nav-btn" id="prevBtn" onclick="changeSlide(-1)">‹</button>

  <!-- CONTAINER DE SLIDES -->
  <div class="slide-container" id="slideContainer">
    <!-- Os slides são injetados pelo JS abaixo -->
  </div>

  <!-- SPECS PANEL -->
  <div class="specs-panel" id="specsPanel">
    <h3>Especificações Canva</h3>
    <div id="specContent"></div>
  </div>

  <!-- BOTÃO PRÓXIMO -->
  <button class="nav-btn" id="nextBtn" onclick="changeSlide(1)">›</button>
</div>

<!-- DOTS -->
<div class="dots" id="dots"></div>

<!-- BOTTOM INFO -->
<div class="bottom-info">
  <span class="platform-badge">📐 [PLATAFORMA] — [DIMENSAO]</span>
  <span class="slide-counter">Slide <span id="currentNum">1</span> de <span id="totalNum">0</span></span>
</div>

<script>
  // =============================================
  // DADOS DOS SLIDES — edite aqui!
  // =============================================
  const slides = [
    {
      tag: "Hook",
      headline: "[Título do Slide 1]",
      headlineHighlight: "", // palavra a destacar com cor
      body: "[Copy do Slide 1]",
      bullets: [], // ["item 1", "item 2"] — deixe vazio para texto corrido
      isCta: false,
      specs: {
        layout: "Texto centralizado, fundo escuro",
        fonte: "Headline 72pt Bold / Body 18pt Regular",
        cor: "Fundo: #[hex] / Texto: #[hex]",
        destaque: "[elemento visual de destaque]",
      }
    },
    {
      tag: "Conteúdo #1",
      headline: "[Título do Slide 2]",
      headlineHighlight: "",
      body: "[Copy do Slide 2]",
      bullets: [],
      isCta: false,
      specs: {
        layout: "Layout dividido: número à esquerda, texto à direita",
        fonte: "Número 120pt / Headline 36pt / Body 16pt",
        cor: "Fundo: #[hex] / Accent: #[hex]",
        destaque: "Número grande decorativo",
      }
    },
    // ... adicione mais slides
    {
      tag: "CTA",
      headline: "[Título do CTA]",
      headlineHighlight: "",
      body: "[Copy do CTA]",
      bullets: [],
      isCta: true,
      ctaLabel: "Salvar post",
      specs: {
        layout: "Centralizado, destaque total na ação",
        fonte: "Headline 48pt Bold / CTA button 14pt",
        cor: "Fundo: [COR_PRIMARIA] / Botão: #fff",
        destaque: "Arroba / username visível",
      }
    },
  ];

  // =============================================
  // ENGINE — não precisa editar abaixo
  // =============================================
  let current = 0;

  function buildSlides() {
    const container = document.getElementById('slideContainer');
    const dots = document.getElementById('dots');
    document.getElementById('totalNum').textContent = slides.length;

    slides.forEach((s, i) => {
      // Slide
      const el = document.createElement('div');
      el.className = `slide${s.isCta ? ' cta-slide' : ''}${i === 0 ? ' active' : ''}`;
      el.dataset.index = i;

      let bodyHtml = '';
      if (s.bullets && s.bullets.length > 0) {
        bodyHtml = `<ul>${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
      } else {
        bodyHtml = s.body;
      }

      let headlineHtml = s.headline;
      if (s.headlineHighlight) {
        headlineHtml = s.headline.replace(
          s.headlineHighlight,
          `<em>${s.headlineHighlight}</em>`
        );
      }

      el.innerHTML = `
        <div class="slide-number-badge">${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</div>
        <div class="slide-tag">${s.tag}</div>
        <h2 class="slide-headline">${headlineHtml}</h2>
        <div class="slide-body">${bodyHtml}</div>
        ${s.isCta && s.ctaLabel ? `<div class="cta-button">${s.ctaLabel}</div>` : ''}
      `;

      container.appendChild(el);

      // Dot
      const dot = document.createElement('div');
      dot.className = `dot${i === 0 ? ' active' : ''}`;
      dot.onclick = () => goTo(i);
      dots.appendChild(dot);
    });

    updateSpecs();
  }

  function updateSpecs() {
    const s = slides[current];
    document.getElementById('currentNum').textContent = current + 1;

    const html = Object.entries(s.specs).map(([k, v]) => `
      <div class="spec-item">
        <div class="spec-label">${k}</div>
        <div class="spec-value">${v}</div>
      </div>
    `).join('');

    document.getElementById('specContent').innerHTML = html;
  }

  function goTo(n) {
    document.querySelectorAll('.slide')[current].classList.remove('active');
    document.querySelectorAll('.dot')[current].classList.remove('active');
    current = n;
    document.querySelectorAll('.slide')[current].classList.add('active');
    document.querySelectorAll('.dot')[current].classList.add('active');
    updateSpecs();
  }

  function changeSlide(dir) {
    let n = (current + dir + slides.length) % slides.length;
    goTo(n);
  }

  // Teclado
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') changeSlide(1);
    if (e.key === 'ArrowLeft') changeSlide(-1);
  });

  buildSlides();
</script>
</body>
</html>
```

---

## Variáveis para substituir

| Variável | O que colocar |
|---|---|
| `[TEMA]` | Tema do carrossel |
| `[PLATAFORMA]` | Ex: Instagram, LinkedIn |
| `[DIMENSAO]` | Ex: 1080 × 1080 px |
| `[COR_PRIMARIA]` | Hex da cor principal da marca |
| `[COR_FUNDO]` | Hex do fundo dos slides |
| `[COR_TEXTO]` | Hex do texto principal |
| `[COR_DESTAQUE]` | Hex da cor de acento/CTA |

## Instrução de uso

1. Substitua todas as variáveis acima com os valores reais do briefing
2. Preencha o array `slides[]` com o conteúdo gerado na Etapa 3
3. Salve como `preview-carrossel-[tema].html`
4. Apresente ao usuário via `present_files`
