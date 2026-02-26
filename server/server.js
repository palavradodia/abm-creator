const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { IgApiClient } = require('instagram-private-api');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const CONFIG_PATH = path.join(__dirname, 'config.json');
const CAROUSELS_PATH = path.join(__dirname, 'carousels.json');

// ─── Seed data (used only when carousels.json doesn't exist) ───────────────
const SEED_CAROUSELS = [
    {
        id: "lotar-agenda",
        title: "Lotar agenda sem depender de indicação",
        tema: "Dono de clínica",
        platform: "Instagram Feed · 1080×1080",
        date: "24/02/2026",
        slides: [
            { tag: "Capa", layout: "typography", bg: "hook-bg", headline: "Sua agenda não está vazia por falta de paciente.", highlight: "", body: "Está vazia porque você terceirizou o crescimento para quem te conhece." },
            { tag: "O Comportamento Real", layout: "typography", bg: "content-bg", headline: "Você apostou que excelência era suficiente.", highlight: "excelência", body: "Esperou que quem saísse satisfeito indicasse o próximo. Funcionou até parar de funcionar." },
            { tag: "A Consequência", layout: "typography", bg: "content-bg", headline: "Agenda imprevisível não é azar. É estrutura.", highlight: "estrutura", body: "Um mês cheio, uma semana vazia, um desconto pra fechar. Você tem um problema de distribuição." },
            { tag: "Como É Quando Funciona", layout: "typography", bg: "content-bg", headline: "Você sabe exatamente quantos pacientes entram no mês que vem.", highlight: "exatamente", body: "Quem controla a entrada controla o negócio — e não aceita qualquer coisa porque a conta aperta." },
            { tag: "O Que Exigimos", layout: "quote", bg: "content-bg", headline: "Não trabalhamos com quem quer testar com R$ 300 pra ver se funciona.", highlight: "", body: "Trabalhamos com quem entende que resultado exige processo." },
            { tag: "CTA", layout: "typography", bg: "cta-bg", headline: "Diagnóstico gratuito. Sem proposta genérica.", highlight: "gratuito", body: "Manda uma mensagem agora. A gente analisa sua clínica e o que faz sentido.", isCta: true, ctaLabel: "Falar no Direct / WhatsApp", handle: "@brottoandre" }
        ]
    },
    {
        id: "concorrente-menor",
        title: "Por que seu concorrente menor está faturando mais que você",
        tema: "Dono de clínica / médico",
        platform: "Instagram Feed · 1080×1080",
        date: "24/02/2026",
        slides: [
            { tag: "Capa", layout: "split", bg: "hook-bg", headline: "Seu concorrente menor está faturando mais do que você.", highlight: "", body: "Ele não tem médicos melhores. Não tem mais experiência. Não tem o dobro de estrutura.", imgUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            { tag: "A Verdade Incômoda", layout: "quote", bg: "content-bg", headline: "A diferença não é qualidade. É visibilidade.", highlight: "visibilidade", body: "Ele aparece quando o paciente pesquisa. Você não aparece." },
            { tag: "O Sistema Deles", layout: "stat", bg: "content-bg", headline: "3 pilares que ele usa. Você provavelmente tem zero.", highlight: "", statNum: "3×", statLabel: "mais pacientes novos por mês", listItems: ["Tráfego pago rodando todos os dias", "Conteúdo que filtra e educa o cliente certo", "Follow-up automático com lead que não converteu"] },
            { tag: "Sua Realidade", layout: "fullbleed", bg: "content-bg", headline: "Todo mês você começa do zero. Todo mês ele escala o que já funciona.", highlight: "escala", body: "Isso não é falta de competência. É falta de estrutura de aquisição.", imgUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            { tag: "O Que Muda", layout: "typography", bg: "content-bg", headline: "Com o sistema certo, você para de perder para quem deveria aprender com você.", highlight: "perder", body: "Tráfego que converte. Conteúdo que filtra. Agenda cheia com quem você quer atender." },
            { tag: "CTA", layout: "typography", bg: "cta-bg", headline: "Chega de perder paciente para quem faz menos mas aparece mais.", highlight: "mais", body: "Manda uma mensagem. A gente analisa onde você está invisível e o que fazer primeiro.", isCta: true, ctaLabel: "Quero parar de perder pacientes", handle: "@brottoandre" }
        ]
    }
];

// ─── Config helpers ────────────────────────────────────────────────────────
const getConfig = () => {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')); } catch (e) { return {}; }
};
const saveConfig = (data) => fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));

// ─── Carousel persistence ──────────────────────────────────────────────────
const getCarousels = () => {
    if (!fs.existsSync(CAROUSELS_PATH)) {
        // First run: seed with examples
        fs.writeFileSync(CAROUSELS_PATH, JSON.stringify(SEED_CAROUSELS, null, 2));
        return SEED_CAROUSELS;
    }
    try { return JSON.parse(fs.readFileSync(CAROUSELS_PATH, 'utf-8')); } catch (e) { return []; }
};

const prependCarousel = (carousel) => {
    const list = getCarousels();
    list.unshift(carousel);
    fs.writeFileSync(CAROUSELS_PATH, JSON.stringify(list, null, 2));
};

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/api/carousels', (req, res) => {
    res.json(getCarousels());
});

app.post('/api/update-carousel', (req, res) => {
    try {
        const { id, slides } = req.body;
        if (!id || !slides) return res.status(400).json({ error: 'id e slides são obrigatórios.' });
        const list = getCarousels();
        const idx = list.findIndex(c => c.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Carrossel não encontrado.' });
        list[idx].slides = slides;
        fs.writeFileSync(CAROUSELS_PATH, JSON.stringify(list, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate-report', async (req, res) => {
    try {
        const { clientName, period, uploads } = req.body;
        const config = getConfig();
        const apiKey = config.geminiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(400).json({ error: 'Chave da API Gemini não configurada em Configurações.' });
        if (!uploads || uploads.length === 0) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const platformInstructions = {
            'google-ads': `Para prints do Google Ads, extraia: impressões, cliques, CTR (%), CPC médio (R$), custo total (R$), conversões, custo por conversão (R$), ROAS, taxa de conversão (%).`,
            'meta-ads': `Para prints do Meta Ads (Facebook/Instagram Ads), extraia: alcance, impressões, frequência, cliques no link, CTR (%), CPM (R$), CPC (R$), resultados/conversões, custo por resultado (R$), gasto total (R$).`,
            'analytics': `Para prints do Google Analytics (GA4 ou Universal), extraia: sessões, usuários ativos, novos usuários, visualizações de página, duração média da sessão, taxa de rejeição (%), principais canais de tráfego com % de cada um.`
        };

        // Build parts for Gemini multimodal request
        const parts = [];

        const systemInstruction = `Você é um analista de mídia paga especialista em Google Ads, Meta Ads e Google Analytics.
Analise os prints de tela fornecidos e extraia todas as métricas visíveis.

REGRAS:
1. Retorne APENAS um JSON válido, sem markdown.
2. Para cada plataforma presente, extraia as métricas disponíveis nos prints.
3. Se um valor não estiver visível no print, use null.
4. Valores monetários devem ser strings com o símbolo (ex: "R$ 1.234,56") ou extraia como aparece no print.
5. Gere também um campo "insights" com 2-3 observações estratégicas relevantes sobre os dados.
6. Estrutura obrigatória:

{
  "clientName": "${clientName || 'Cliente'}",
  "period": "${period || 'Período não informado'}",
  "generatedAt": "${new Date().toLocaleDateString('pt-BR')}",
  "platforms": {
    "googleAds": {
      "present": true/false,
      "impressoes": "...",
      "cliques": "...",
      "ctr": "...",
      "cpc": "...",
      "custo": "...",
      "conversoes": "...",
      "custoConversao": "...",
      "roas": "...",
      "taxaConversao": "...",
      "insights": ["insight 1", "insight 2"]
    },
    "metaAds": {
      "present": true/false,
      "alcance": "...",
      "impressoes": "...",
      "frequencia": "...",
      "cliques": "...",
      "ctr": "...",
      "cpm": "...",
      "cpc": "...",
      "resultados": "...",
      "custoResultado": "...",
      "gasto": "...",
      "insights": ["insight 1", "insight 2"]
    },
    "analytics": {
      "present": true/false,
      "sessoes": "...",
      "usuarios": "...",
      "novosUsuarios": "...",
      "visualizacoes": "...",
      "duracaoMedia": "...",
      "taxaRejeicao": "...",
      "canais": [{"nome": "Organic Search", "percentual": "45%"}, ...],
      "insights": ["insight 1", "insight 2"]
    }
  },
  "resumoGeral": "Parágrafo de 2-3 linhas com uma análise geral do desempenho das campanhas no período."
}`;

        parts.push({ text: systemInstruction });

        // Add each image with its platform context
        for (const upload of uploads) {
            const { platform, imageBase64 } = upload;
            const instruction = platformInstructions[platform] || 'Extraia todas as métricas de tráfego e anúncios visíveis.';
            parts.push({ text: `\n--- Print da plataforma: ${platform.toUpperCase()} ---\n${instruction}` });

            // Remove data:image/...;base64, prefix
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const mimeType = imageBase64.match(/data:(image\/\w+);base64,/)?.[1] || 'image/png';

            parts.push({
                inlineData: {
                    mimeType,
                    data: base64Data
                }
            });
        }

        const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
        let responseText = result.response.text();
        responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const reportData = JSON.parse(responseText);
        res.json(reportData);

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ error: error.message || 'Erro ao gerar relatório.' });
    }
});

app.post('/api/save-settings', (req, res) => {
    const config = getConfig();
    const newConfig = { ...config, ...req.body };
    saveConfig(newConfig);
    res.json({ success: true });
});

app.get('/api/settings', (req, res) => {
    const config = getConfig();
    res.json({
        hasGeminiKey: !!config.geminiKey,
        igUser: config.igUser || '',
        handle: config.handle || '@brottoandre'
    });
});

app.post('/api/generate-carousel', async (req, res) => {
    try {
        const { prompt, handle, tema, platform, numSlides } = req.body;
        const config = getConfig();
        const apiKey = config.geminiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(400).json({ error: 'Chave da API Gemini não configurada em Configurações.' });
        if (!prompt) return res.status(400).json({ error: 'Prompt é obrigatório.' });

        const resolvedHandle = handle || config.handle || '@brottoandre';
        const resolvedTema = tema || 'Público geral';
        const resolvedPlatform = platform || 'Instagram Feed · 1080×1080';
        const resolvedSlides = parseInt(numSlides) || 6;
        const today = new Date().toLocaleDateString('pt-BR');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `Você é um estrategista de conteúdo e curador visual especialista em carrosséis de alta conversão para redes sociais.
O usuário enviará uma ideia, tema ou texto base e você vai transformar em um carrossel premium em preto e dourado.

══════════════════════════════════
FRAMEWORK OBRIGATÓRIO: HOOK-VALOR-CTA
══════════════════════════════════
• Slide 1 (HOOK): Para o scroll. Use dor direta, curiosidade aberta ou promessa audaciosa. Máx 8 palavras no headline.
• Slides 2 a ${resolvedSlides - 1} (VALOR): Uma ideia por slide. Progressão lógica. Comece com verbo ou número. Nunca parágrafos longos.
• Último slide (CTA): Claro, específico, com handle e benefício para o leitor.

REGRAS DE LAYOUT (use conforme o conteúdo):
• "typography" → slide de texto centrado. Use para hook, conteúdo denso, CTA.
• "quote" → citação poderosa ou declaração provocativa. Sem tag visível.
• "stat" → dado ou número de impacto. Requer statNum + statLabel + listItems (array de 3 bullets).
• "split" → texto + imagem lado a lado. Use para slides de contraste ou prova.
• "fullbleed" → imagem de fundo com texto sobreposto. Use para impacto visual máximo.

PALETA DARK PREMIUM:
• "hook-bg" → fundo #111 (preto). Para capa e slides de impacto.
• "content-bg" → fundo #1a1a1a (preto suave). Para conteúdo.
• "cta-bg" → fundo #111. Para CTA final.

REGRAS RÍGIDAS DE RETORNO:
1. Retorne EXATAMENTE UM JSON válido e NADA MAIS. Sem markdown, sem texto extra.
2. A estrutura DEVE ser exatamente:

{
  "id": "slug-curto-3-palavras",
  "title": "Título legível do carrossel",
  "tema": "${resolvedTema}",
  "platform": "${resolvedPlatform}",
  "date": "${today}",
  "slides": [
    {
      "tag": "Nome da seção (ex: Capa, O Problema, A Solução, CTA)",
      "layout": "typography | quote | stat | split | fullbleed",
      "bg": "hook-bg | content-bg | cta-bg",
      "headline": "Headline principal — máx 8 palavras para hook, 10 para conteúdo",
      "highlight": "uma ou duas palavras EXATAS do headline para destacar em dourado (ou string vazia)",
      "body": "Texto de apoio — máx 25 palavras, direto e persuasivo",
      "statNum": "(apenas para stat) número grande ex: 73%",
      "statLabel": "(apenas para stat) rótulo do número",
      "listItems": ["(apenas para stat) bullet 1", "bullet 2", "bullet 3"],
      "isCta": true,
      "ctaLabel": "(apenas no CTA) texto do botão de ação",
      "handle": "(apenas no CTA) ${resolvedHandle}"
    }
  ]
}

CHECKLIST ANTES DE RETORNAR:
• O hook vai parar o scroll? (dor, curiosidade ou promessa forte)
• Cada slide tem UMA ideia?
• O CTA é específico e inclui handle "${resolvedHandle}"?
• O JSON é 100% válido sem markdown?`;

        const result = await model.generateContent(`${systemPrompt}\n\nConteúdo/Ideia do usuário: ${prompt}\n\nGere exatamente ${resolvedSlides} slides.`);
        let responseText = result.response.text();

        // Strip markdown delimiters if present
        responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const carouselData = JSON.parse(responseText);

        // Persist to disk
        prependCarousel(carouselData);

        res.json(carouselData);

    } catch (error) {
        console.error("Erro ao gerar com Gemini:", error);
        res.status(500).json({ error: error.message || "Erro desconhecido ao gerar carrossel" });
    }
});

app.post('/api/post-instagram', async (req, res) => {
    try {
        const { imagesBase64, caption } = req.body;
        const config = getConfig();
        const { igUser, igPass } = config;

        if (!igUser || !igPass) {
            return res.status(400).json({ error: 'Credenciais do Instagram não configuradas em Configurações.' });
        }
        if (!imagesBase64 || imagesBase64.length === 0) {
            return res.status(400).json({ error: 'Nenhuma imagem recebida.' });
        }

        const ig = new IgApiClient();
        ig.state.generateDevice(igUser);
        await ig.account.login(igUser, igPass);

        const items = imagesBase64.map(b64 => {
            const base64Data = b64.replace(/^data:image\/\w+;base64,/, "");
            return { file: Buffer.from(base64Data, 'base64') };
        });

        if (items.length === 1) {
            await ig.publish.photo({ file: items[0].file, caption: caption || '' });
        } else {
            await ig.publish.album({ items, caption: caption || '' });
        }

        res.json({ success: true, message: 'Post publicado com sucesso!' });
    } catch (error) {
        console.error("Erro no Instagram:", error);
        res.status(500).json({ error: error.message || "Falha ao publicar no Instagram." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 ABM Creator App rodando em http://localhost:${PORT}`);
    // Ensure carousels.json exists on startup
    getCarousels();
});
