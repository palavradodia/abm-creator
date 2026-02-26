// ─── State ────────────────────────────────────────────────────────────────
let CAROUSELS = [];

// ─── Navigation ───────────────────────────────────────────────────────────
function switchTab(viewId, btnEl) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    btnEl.classList.add('active');
    if (viewId === 'feed') buildDashboard();
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function hl(txt, hi) {
    if (!hi) return txt;
    const regex = new RegExp(`(${hi})`, 'gi');
    return txt.replace(regex, '<span>$1</span>');
}

function badge(idx, total) {
    return `<div class="r-badge"><div class="r-badge-logo">abm</div>${String(idx + 1).padStart(2, '0')}&nbsp;/&nbsp;${String(total).padStart(2, '0')}</div>`;
}

// ─── Layout Builders ──────────────────────────────────────────────────────
function buildSlideEl(s, idx, total) {
    const defaultImg = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    if (s.layout === 'split') return buildSplit(s, idx, total, s.imgUrl || defaultImg);
    if (s.layout === 'fullbleed') return buildFullbleed(s, idx, total, s.imgUrl || defaultImg);
    if (s.layout === 'stat') return buildStat(s, idx, total);

    const el = document.createElement('div');
    el.className = `slide-real ${s.layout}-layout ${s.bg}`;
    el.innerHTML = badge(idx, total) +
        `<div class="r-bar"></div>` +
        `<div class="r-tag">${s.tag}</div>` +
        `<div class="r-headline">${hl(s.headline, s.highlight)}</div>` +
        `<div class="r-body">${s.body || ''}</div>` +
        (s.isCta ? `<div class="r-btn">${s.ctaLabel}</div><div class="r-handle">${s.handle}</div>` : '');
    return el;
}

function buildStat(s, idx, total) {
    const el = document.createElement('div');
    el.className = `slide-real stat-layout ${s.bg}`;
    const listHtml = s.listItems ? `<ul class="r-list">${s.listItems.map(i => `<li>${i}</li>`).join('')}</ul>` : '';
    el.innerHTML = badge(idx, total) +
        `<div class="r-bar"></div>` +
        `<div class="r-tag">${s.tag}</div>` +
        (s.statNum ? `<div class="r-stat-num">${s.statNum}</div><div class="r-stat-label">${s.statLabel || ''}</div>` : '') +
        listHtml +
        `<div class="r-headline">${hl(s.headline, s.highlight)}</div>`;
    return el;
}

function buildSplit(s, idx, total, imgSrc) {
    const el = document.createElement('div');
    el.className = `slide-real split-layout ${s.bg}`;
    el.innerHTML = badge(idx, total) +
        `<div class="r-split-text">
            <div class="r-bar"></div>
            <div class="r-tag">${s.tag}</div>
            <div class="r-headline">${hl(s.headline, s.highlight)}</div>
            <div class="r-body">${s.body || ''}</div>
        </div>
        <div class="r-split-photo"><img src="${imgSrc}" alt=""></div>`;
    return el;
}

function buildFullbleed(s, idx, total, imgSrc) {
    const el = document.createElement('div');
    el.className = `slide-real fullbleed-layout ${s.bg}`;
    el.innerHTML = `<img class="r-fullbleed-bg" src="${imgSrc}" alt="">
        <div class="r-fullbleed-overlay"></div>` +
        badge(idx, total) +
        `<div class="r-bar"></div>
        <div class="r-tag">${s.tag}</div>
        <div class="r-headline">${hl(s.headline, s.highlight)}</div>
        <div class="r-body">${s.body || ''}</div>` +
        (s.isCta ? `<div class="r-btn">${s.ctaLabel}</div><div class="r-handle">${s.handle}</div>` : '');
    return el;
}

// ─── Dashboard ────────────────────────────────────────────────────────────
async function buildDashboard() {
    const root = document.getElementById('cardsRoot');
    root.innerHTML = '<div class="loading-state">Carregando carrosséis...</div>';

    try {
        const res = await fetch('/api/carousels');
        CAROUSELS = await res.json();
    } catch (e) {
        root.innerHTML = '<div class="loading-state" style="color:var(--accent)">Erro ao carregar. Servidor Node rodando?</div>';
        return;
    }

    root.innerHTML = '';
    let ts = 0;

    if (CAROUSELS.length === 0) {
        root.innerHTML = '<div class="loading-state">Nenhum carrossel ainda. Crie seu primeiro!</div>';
        document.getElementById('totalCarouselBadge').textContent = '0 Carrosséis';
        return;
    }

    CAROUSELS.forEach(carousel => {
        ts += carousel.slides.length;
        const card = document.createElement('div');
        card.className = 'c-card';

        card.innerHTML = `
            <div class="c-card-hdr">
                <div>
                    <div class="c-tag">Carrossel — ${carousel.platform}</div>
                    <div class="c-title">${carousel.title}</div>
                    <div class="c-info">${carousel.tema} · ${carousel.date} · ${carousel.slides.length} slides</div>
                </div>
                <div class="actions-wrap">
                    <button class="btn-secondary" onclick="downloadAll('${carousel.id}', this)">⬇️ Baixar PNGs</button>
                    <button class="btn-ig" onclick="openPostModal('${carousel.id}')">⚡ Postar no Instagram</button>
                </div>
            </div>
            <div class="track-wrap">
                <div class="slides-track" id="track-${carousel.id}"></div>
            </div>
        `;

        root.appendChild(card);
        const track = card.querySelector('#track-' + carousel.id);

        carousel.slides.forEach((s, i) => {
            const item = document.createElement('div');
            item.className = 's-item';

            const thumb = document.createElement('div');
            thumb.className = 's-thumb';
            thumb.title = 'Clique para editar este slide';

            // Click to edit
            thumb.addEventListener('click', () => openEditModal(carousel.id, i));

            const sw = document.createElement('div');
            sw.className = 'slide-scale';
            sw.appendChild(buildSlideEl(s, i, carousel.slides.length));

            thumb.appendChild(sw);

            const footer = document.createElement('div');
            footer.className = 's-footer';
            footer.innerHTML = `<span class="s-num">Slide ${String(i + 1).padStart(2, '0')}</span>`;

            item.appendChild(thumb);
            item.appendChild(footer);
            track.appendChild(item);
        });
    });

    document.getElementById('totalCarouselBadge').textContent = `${CAROUSELS.length} Carrosséis · ${ts} Slides produzidos`;
}

// ─── Edit Slide Modal ─────────────────────────────────────────────────────
let editState = { carouselId: null, slideIdx: null };

function openEditModal(cid, slideIdx) {
    const carousel = CAROUSELS.find(c => c.id === cid);
    if (!carousel) return;
    const s = carousel.slides[slideIdx];

    editState = { carouselId: cid, slideIdx };

    const layoutIcons = { typography: '📝', quote: '💬', stat: '📊', split: '🖼️', fullbleed: '🌆' };
    const icon = layoutIcons[s.layout] || '📄';
    const bgLabels = { 'hook-bg': 'Capa (Preto)', 'content-bg': 'Conteúdo (Escuro)', 'cta-bg': 'CTA (Preto)' };

    // Build extra fields based on layout
    let extraFields = '';
    if (s.layout === 'stat') {
        extraFields = `
        <div class="input-group">
            <label>Número de Destaque (statNum)</label>
            <input type="text" id="edit-statNum" value="${s.statNum || ''}" placeholder="Ex: 73%">
        </div>
        <div class="input-group">
            <label>Rótulo do Número (statLabel)</label>
            <input type="text" id="edit-statLabel" value="${s.statLabel || ''}" placeholder="Ex: mais pacientes por mês">
        </div>
        <div class="input-group">
            <label>Bullets (1 por linha)</label>
            <textarea id="edit-listItems" rows="4">${(s.listItems || []).join('\n')}</textarea>
        </div>`;
    }
    if (s.layout === 'split' || s.layout === 'fullbleed') {
        extraFields += `
        <div class="input-group">
            <label>URL da Imagem</label>
            <input type="text" id="edit-imgUrl" value="${s.imgUrl || ''}" placeholder="https://...">
        </div>`;
    }
    if (s.isCta) {
        extraFields += `
        <div class="edit-field-row">
            <div class="input-group">
                <label>Texto do Botão CTA</label>
                <input type="text" id="edit-ctaLabel" value="${s.ctaLabel || ''}" placeholder="Falar no WhatsApp">
            </div>
            <div class="input-group">
                <label>Handle</label>
                <input type="text" id="edit-handle" value="${s.handle || ''}" placeholder="@perfil">
            </div>
        </div>`;
    }

    const modal = document.getElementById('editSlideModal');
    modal.innerHTML = `
        <div class="edit-modal-card">
            <h2>Editar Slide ${String(slideIdx + 1).padStart(2, '0')}</h2>
            <p class="edit-subtitle">${carousel.title}</p>
            <div class="layout-badge">${icon} ${s.layout}</div>

            <div class="edit-modal-top">
                <div class="edit-preview">
                    <div class="slide-scale" id="editPreviewSlide"></div>
                </div>
                <div class="edit-modal-fields">
                    <div class="edit-field-row">
                        <div class="input-group">
                            <label>Tag / Seção</label>
                            <input type="text" id="edit-tag" value="${s.tag}" placeholder="Capa, O Problema...">
                        </div>
                        <div class="input-group">
                            <label>Fundo</label>
                            <select id="edit-bg">
                                <option value="hook-bg" ${s.bg === 'hook-bg' ? 'selected' : ''}>Capa (Preto)</option>
                                <option value="content-bg" ${s.bg === 'content-bg' ? 'selected' : ''}>Conteúdo (Escuro)</option>
                                <option value="cta-bg" ${s.bg === 'cta-bg' ? 'selected' : ''}>CTA (Preto)</option>
                            </select>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Headline Principal</label>
                        <textarea id="edit-headline" rows="3">${s.headline}</textarea>
                    </div>
                    <div class="edit-field-row">
                        <div class="input-group">
                            <label>Destaque (palavra em dourado)</label>
                            <input type="text" id="edit-highlight" value="${s.highlight || ''}" placeholder="palavra exata">
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Texto de Apoio (body)</label>
                        <textarea id="edit-body" rows="3">${s.body || ''}</textarea>
                    </div>
                </div>
            </div>

            ${extraFields}

            <div class="form-actions" style="margin-top:20px;">
                <button class="btn-secondary" onclick="closeEditModal()">Cancelar</button>
                <button class="btn-primary" onclick="saveSlideEdit()">💾 Salvar Alterações</button>
            </div>
        </div>
    `;

    // Render preview
    const prevEl = modal.querySelector('#editPreviewSlide');
    if (prevEl) prevEl.appendChild(buildSlideEl(s, slideIdx, carousel.slides.length));

    modal.style.display = 'flex';
    // Close on backdrop click
    modal.onclick = (e) => { if (e.target === modal) closeEditModal(); };
}

function closeEditModal() {
    document.getElementById('editSlideModal').style.display = 'none';
}

function saveSlideEdit() {
    const { carouselId, slideIdx } = editState;
    const carousel = CAROUSELS.find(c => c.id === carouselId);
    if (!carousel) return;

    const s = carousel.slides[slideIdx];

    // Apply edits
    s.tag = document.getElementById('edit-tag').value;
    s.bg = document.getElementById('edit-bg').value;
    s.headline = document.getElementById('edit-headline').value;
    s.highlight = document.getElementById('edit-highlight').value;
    s.body = document.getElementById('edit-body').value;

    // Layout-specific
    if (s.layout === 'stat') {
        s.statNum = document.getElementById('edit-statNum').value;
        s.statLabel = document.getElementById('edit-statLabel').value;
        const raw = document.getElementById('edit-listItems').value;
        s.listItems = raw.split('\n').map(l => l.trim()).filter(Boolean);
    }
    if (s.layout === 'split' || s.layout === 'fullbleed') {
        s.imgUrl = document.getElementById('edit-imgUrl').value;
    }
    if (s.isCta) {
        s.ctaLabel = document.getElementById('edit-ctaLabel').value;
        s.handle = document.getElementById('edit-handle').value;
    }

    // Save to server
    fetch('/api/update-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: carouselId, slides: carousel.slides })
    }).catch(e => console.error('Erro ao salvar:', e));

    closeEditModal();
    showToast('Slide atualizado!');
    buildDashboard(); // Rebuild feed
}

// ─── Settings ─────────────────────────────────────────────────────────────
async function loadSettings() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.igUser) document.getElementById('igUser').value = data.igUser;
        if (data.handle) {
            document.getElementById('configHandle').value = data.handle;
            document.getElementById('aiHandle').value = data.handle;
        }
    } catch (e) {
        console.warn('Servidor offline ao carregar settings:', e);
    }
}

async function saveSettings() {
    const btn = event.target;
    btn.textContent = 'Salvando...';

    const payload = {};
    const key = document.getElementById('geminiKey').value;
    const handle = document.getElementById('configHandle').value;
    const user = document.getElementById('igUser').value;
    const pass = document.getElementById('igPass').value;

    if (key) payload.geminiKey = key;
    if (handle) payload.handle = handle;
    if (user) payload.igUser = user;
    if (pass) payload.igPass = pass;

    try {
        await fetch('/api/save-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (handle) document.getElementById('aiHandle').value = handle;
        showToast('Configurações salvas!');
    } catch (e) {
        showToast('Erro ao salvar. Servidor Node rodando?');
    }

    btn.textContent = 'Salvar Configurações';
}

// ─── AI Generate ──────────────────────────────────────────────────────────
async function generateAiCarousel() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    const handle = document.getElementById('aiHandle').value.trim();
    const tema = document.getElementById('aiTema').value.trim();
    const platform = document.getElementById('aiPlatform').value;
    const numSlides = document.getElementById('aiNumSlides').value;

    if (!prompt) return showToast('Descreva a ideia do carrossel.');

    const btn = document.getElementById('btnGenerate');
    const status = document.getElementById('aiStatus');

    btn.textContent = 'Gerando...';
    btn.disabled = true;
    status.innerHTML = '⏳ Conectando ao Gemini... (pode levar 15–30s)';

    try {
        const res = await fetch('/api/generate-carousel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, handle, tema, platform, numSlides })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        status.innerHTML = '<span style="color:#D4AF37">✅ Carrossel gerado e salvo com sucesso!</span>';

        setTimeout(() => {
            status.innerHTML = '';
            document.getElementById('aiPrompt').value = '';
            document.getElementById('aiTema').value = '';
            const feedBtn = document.querySelector('.nav-item');
            switchTab('feed', feedBtn);
        }, 2000);

    } catch (e) {
        console.error(e);
        status.innerHTML = `<span style="color:var(--accent)">❌ Erro: ${e.message}</span>`;
    } finally {
        btn.textContent = '✨ Gerar com Gemini';
        btn.disabled = false;
    }
}

// ─── html2canvas capture ──────────────────────────────────────────────────
async function captureSlideHelper(s, idx, total) {
    const wrap = document.getElementById('renderZone');
    wrap.innerHTML = '';
    const fresh = buildSlideEl(s, idx, total);
    wrap.appendChild(fresh);

    await Promise.all([...fresh.querySelectorAll('img')].map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
    ));

    const canvas = await html2canvas(fresh, { width: 1080, height: 1080, scale: 1, backgroundColor: null, useCORS: true });
    return canvas.toDataURL('image/png');
}

// ─── Downloads ────────────────────────────────────────────────────────────
async function downloadAll(cid, btn) {
    const c = CAROUSELS.find(x => x.id === cid);
    if (!c) return showToast('Carrossel não encontrado.');
    const originalText = btn.textContent;
    btn.textContent = 'Aguarde...';
    btn.disabled = true;

    for (let i = 0; i < c.slides.length; i++) {
        btn.textContent = `Capturando ${i + 1}/${c.slides.length}...`;
        try {
            const dataUrl = await captureSlideHelper(c.slides[i], i, c.slides.length);
            const a = document.createElement('a');
            a.download = `${cid}-slide-${String(i + 1).padStart(2, '0')}.png`;
            a.href = dataUrl;
            a.click();
        } catch (e) { console.error(e); }
        await new Promise(r => setTimeout(r, 600));
    }

    btn.textContent = originalText;
    btn.disabled = false;
    showToast('Download concluído.');
}

// ─── Instagram ────────────────────────────────────────────────────────────
let currentTargetIgCarouselId = null;

function openPostModal(cid) {
    currentTargetIgCarouselId = cid;
    document.getElementById('postCaption').value = '';
    document.getElementById('postStatus').innerHTML = '';
    document.getElementById('postModal').style.display = 'flex';
}

async function confirmPostInstagram() {
    if (!currentTargetIgCarouselId) return;

    const c = CAROUSELS.find(x => x.id === currentTargetIgCarouselId);
    const btn = document.getElementById('btnConfirmPost');
    const status = document.getElementById('postStatus');
    const caption = document.getElementById('postCaption').value;

    btn.textContent = 'Processando Imagens...';
    btn.disabled = true;

    try {
        const base64Images = [];
        for (let i = 0; i < c.slides.length; i++) {
            status.innerHTML = `Renderizando slide ${i + 1} de ${c.slides.length}...`;
            const b64 = await captureSlideHelper(c.slides[i], i, c.slides.length);
            base64Images.push(b64);
        }

        status.innerHTML = 'Enviando para o Instagram...';

        const res = await fetch('/api/post-instagram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imagesBase64: base64Images, caption })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        status.innerHTML = '<span style="color:#D4AF37">🚀 Publicado com sucesso no feed!</span>';
        setTimeout(() => document.getElementById('postModal').style.display = 'none', 3000);

    } catch (e) {
        console.error(e);
        status.innerHTML = `<span style="color:var(--accent)">❌ Erro: ${e.message}</span>`;
    } finally {
        btn.textContent = 'Publicar Agora';
        btn.disabled = false;
    }
}

// ─── Toast ────────────────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── Reports Module ───────────────────────────────────────────────────────
const PLATFORMS = ['google-ads', 'meta-ads', 'analytics'];
const uploadedFiles = { 'google-ads': [], 'meta-ads': [], 'analytics': [] };

function triggerFileInput(platform) {
    document.getElementById(`input-${platform}`).click();
}

function handleFiles(input, platform) {
    const files = Array.from(input.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedFiles[platform].push({ name: file.name, base64: e.target.result });
            updateUploadUI(platform);
        };
        reader.readAsDataURL(file);
    });
    input.value = '';
}

function updateUploadUI(platform) {
    const files = uploadedFiles[platform];
    const zone = document.getElementById(`zone-${platform}`);
    const preview = document.getElementById(`preview-${platform}`);
    const badge = document.getElementById(`count-${platform}`);

    badge.textContent = `${files.length} print${files.length !== 1 ? 's' : ''}`;

    if (files.length > 0) {
        zone.classList.add('has-files');
        zone.innerHTML = `
            <input type="file" id="input-${platform}" multiple accept="image/*" style="display:none" onchange="handleFiles(this,'${platform}')">
            <div class="upload-zone-icon">✅</div>
            <div class="upload-zone-text">${files.length} arquivo${files.length !== 1 ? 's' : ''} carregado${files.length !== 1 ? 's' : ''}</div>
            <div class="upload-zone-sub">Clique para adicionar mais</div>
        `;
        zone.onclick = () => triggerFileInput(platform);
    }

    preview.innerHTML = '';
    files.forEach((f, i) => {
        const item = document.createElement('div');
        item.className = 'upload-preview-item';
        item.innerHTML = `
            <img src="${f.base64}" alt="${f.name}">
            <button class="remove-btn" onclick="removeFile('${platform}',${i})" title="Remover">✕</button>
        `;
        preview.appendChild(item);
    });
}

function removeFile(platform, idx) {
    uploadedFiles[platform].splice(idx, 1);
    updateUploadUI(platform);
}

function clearAllUploads() {
    PLATFORMS.forEach(p => {
        uploadedFiles[p] = [];
        const zone = document.getElementById(`zone-${p}`);
        const icons = { 'google-ads': '📈', 'meta-ads': '📱', 'analytics': '🔍' };
        const names = { 'google-ads': 'Google Ads', 'meta-ads': 'Meta Ads', 'analytics': 'Analytics' };
        zone.className = 'upload-zone';
        zone.onclick = () => triggerFileInput(p);
        zone.innerHTML = `
            <input type="file" id="input-${p}" multiple accept="image/*" style="display:none" onchange="handleFiles(this,'${p}')">
            <div class="upload-zone-icon">${icons[p]}</div>
            <div class="upload-zone-text">Clique ou arraste prints do ${names[p]}</div>
            <div class="upload-zone-sub">PNG, JPG ou WEBP — múltiplos arquivos</div>
        `;
        document.getElementById(`preview-${p}`).innerHTML = '';
        document.getElementById(`count-${p}`).textContent = '0 prints';
    });
    document.getElementById('reportOutput').innerHTML = '';
    document.getElementById('rptStatus').innerHTML = '';
}

function initDragDrop() {
    PLATFORMS.forEach(platform => {
        const zone = document.getElementById(`zone-${platform}`);
        if (!zone) return;
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    uploadedFiles[platform].push({ name: file.name, base64: ev.target.result });
                    updateUploadUI(platform);
                };
                reader.readAsDataURL(file);
            });
        });
    });
}

async function generateReport() {
    const clientName = document.getElementById('rpt-client').value.trim() || 'Cliente';
    const period = document.getElementById('rpt-period').value.trim() || 'Período não informado';

    // Build uploads array
    const uploads = [];
    PLATFORMS.forEach(p => {
        uploadedFiles[p].forEach(f => uploads.push({ platform: p, imageBase64: f.base64 }));
    });

    if (uploads.length === 0) return showToast('Adicione pelo menos um print antes de gerar.');

    const btn = document.getElementById('btnGenerateReport');
    const status = document.getElementById('rptStatus');

    btn.textContent = 'Analisando...';
    btn.disabled = true;
    status.innerHTML = `⏳ Enviando ${uploads.length} imagem${uploads.length !== 1 ? 's' : ''} para o Gemini Vision...`;

    try {
        const res = await fetch('/api/generate-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientName, period, uploads })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        status.innerHTML = '<span style="color:#D4AF37">✅ Relatório gerado com sucesso!</span>';
        renderReport(data);

    } catch (e) {
        console.error(e);
        status.innerHTML = `<span style="color:var(--accent)">❌ Erro: ${e.message}</span>`;
    } finally {
        btn.textContent = '📊 Gerar Relatório';
        btn.disabled = false;
    }
}

function renderReport(data) {
    const output = document.getElementById('reportOutput');

    const platformConfig = {
        googleAds: {
            label: 'Google Ads', logoClass: 'google-ads-logo', letter: 'G',
            metrics: [
                { key: 'cliques', label: 'Cliques', highlight: false },
                { key: 'impressoes', label: 'Impressões', highlight: false },
                { key: 'ctr', label: 'CTR', highlight: false },
                { key: 'cpc', label: 'CPC Médio', highlight: false },
                { key: 'custo', label: 'Custo Total', highlight: true },
                { key: 'conversoes', label: 'Conversões', highlight: false },
                { key: 'custoConversao', label: 'Custo/Conversão', highlight: false },
                { key: 'roas', label: 'ROAS', highlight: true },
                { key: 'taxaConversao', label: 'Taxa Conv.', highlight: false },
            ]
        },
        metaAds: {
            label: 'Meta Ads', logoClass: 'meta-ads-logo', letter: 'M',
            metrics: [
                { key: 'alcance', label: 'Alcance', highlight: false },
                { key: 'impressoes', label: 'Impressões', highlight: false },
                { key: 'frequencia', label: 'Frequência', highlight: false },
                { key: 'cliques', label: 'Cliques', highlight: false },
                { key: 'ctr', label: 'CTR', highlight: false },
                { key: 'cpm', label: 'CPM', highlight: false },
                { key: 'cpc', label: 'CPC', highlight: false },
                { key: 'resultados', label: 'Resultados', highlight: false },
                { key: 'custoResultado', label: 'Custo/Resultado', highlight: false },
                { key: 'gasto', label: 'Gasto Total', highlight: true },
            ]
        },
        analytics: {
            label: 'Google Analytics', logoClass: 'analytics-logo', letter: 'A',
            metrics: [
                { key: 'sessoes', label: 'Sessões', highlight: false },
                { key: 'usuarios', label: 'Usuários', highlight: false },
                { key: 'novosUsuarios', label: 'Novos Usuários', highlight: false },
                { key: 'visualizacoes', label: 'Visualizações', highlight: false },
                { key: 'duracaoMedia', label: 'Duração Média', highlight: false },
                { key: 'taxaRejeicao', label: 'Taxa de Rejeição', highlight: false },
            ]
        }
    };

    const platformSectionsHTML = Object.entries(platformConfig).map(([key, cfg]) => {
        const pData = data.platforms?.[key];
        if (!pData || !pData.present) return '';

        const metricsHTML = cfg.metrics.map(m => {
            const val = pData[m.key];
            return `
                <div class="metric-card ${m.highlight ? 'highlight' : ''}">
                    <div class="metric-label">${m.label}</div>
                    <div class="metric-value ${!val ? 'metric-null' : ''}">${val || '—'}</div>
                </div>`;
        }).join('');

        // Analytics channels
        const channelsHTML = key === 'analytics' && pData.canais?.length ? `
            <div class="channels-list">
                ${pData.canais.map(c => {
            const pct = parseFloat(c.percentual) || 0;
            return `
                    <div class="channel-item">
                        <div class="channel-name">${c.nome}</div>
                        <div class="channel-bar-wrap"><div class="channel-bar" style="width:${pct}%"></div></div>
                        <div class="channel-pct">${c.percentual}</div>
                    </div>`;
        }).join('')}
            </div>` : '';

        const insightsHTML = pData.insights?.length ? `
            <div class="insights-box">
                <div class="insights-box-title">💡 Insights</div>
                <ul>${pData.insights.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>` : '';

        return `
            <div class="report-platform-section">
                <div class="report-platform-title">
                    <div class="platform-logo ${cfg.logoClass}">${cfg.letter}</div>
                    <h2>${cfg.label}</h2>
                </div>
                <div class="metric-grid">${metricsHTML}</div>
                ${channelsHTML}
                ${insightsHTML}
            </div>`;
    }).join('');

    const summaryHTML = data.resumoGeral ? `
        <div class="report-summary-section">
            <div class="report-summary-title">📋 Resumo Executivo</div>
            <div class="report-summary-text">${data.resumoGeral}</div>
        </div>` : '';

    output.innerHTML = `
        <div class="report-container" id="reportContent">
            <div class="report-header">
                <div>
                    <div class="report-brand">
                        <div class="report-brand-logo">ABM</div>
                        <div class="report-brand-name">ABM Creator · Relatório de Tráfego</div>
                    </div>
                    <div class="report-client-name">${data.clientName}</div>
                    <div class="report-period">📅 ${data.period}</div>
                </div>
                <div class="report-meta">
                    <div class="report-date-label">Gerado em</div>
                    <div class="report-date-value">${data.generatedAt}</div>
                </div>
            </div>
            <div class="report-body">
                ${summaryHTML}
                ${platformSectionsHTML}
            </div>
            <div class="report-actions">
                <button class="btn-secondary" onclick="downloadReport()">⬇️ Baixar HTML</button>
            </div>
        </div>
    `;

    // Smooth scroll to report
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadReport() {
    const content = document.getElementById('reportContent');
    if (!content) return;

    // Get all styles
    const styles = Array.from(document.styleSheets).map(ss => {
        try { return Array.from(ss.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; }
    }).join('\n');

    const fonts = '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">';
    const vars = `:root{--bg-dark:#0a0a0c;--sidebar-bg:#111114;--card-bg:#18181b;--gold:#d4af37;--gold-hover:#e8c555;--text-main:#f4f4f5;--text-muted:#a1a1aa;--border-color:#27272a;--accent:#E1306C;}body{background:var(--bg-dark);color:var(--text-main);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;padding:40px;}`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Relatório ABM Creator</title>
${fonts}
<style>${vars}\n${styles}</style>
</head>
<body>
${content.outerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `relatorio-abm-${Date.now()}.html`;
    a.click();
    showToast('Relatório baixado!');
}

// ─── Init ─────────────────────────────────────────────────────────────────
window.onload = () => {
    buildDashboard();
    loadSettings();
    initDragDrop();
};

