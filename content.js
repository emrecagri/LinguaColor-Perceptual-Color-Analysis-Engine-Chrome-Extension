// ==========================================
// 1. GLOBAL YAPILANDIRMA
// ==========================================
const CONFIG = {
    IDLE_TIMEOUT: 1000,    // 1 saniye hareketsizlikte gizle
    API_DEBOUNCE: 400,
    APIS: [
        "https://www.thecolorapi.com/id?hex=",
        "https://api.color.pizza/v1/"
    ]
};

const STATE = {
    isActive: false,
    lang: 'en',
    tooltip: null,
    lastX: -1000, // Ekran dışından başlat (Sıçramayı önlemek için)
    lastY: -1000,
    isProcessing: false,
    idleTimer: null,
    apiTimer: null,
    corsCache: new Map()
};

// Yüksek Performanslı Canvas
const sysCanvas = document.createElement('canvas');
const sysCtx = sysCanvas.getContext('2d', { willReadFrequently: true });

// ==========================================
// 2. ÇOK DİLLİ ARAYÜZ ETİKETLERİ
// ==========================================
const UI_DICT = {
    en: { text: "Text", img: "Image", vid: "Video", canvas: "Canvas", bg: "Background", protected: "Protected Media" },
    tr: { text: "Metin", img: "Resim", vid: "Video", canvas: "Tuval", bg: "Arkaplan", protected: "Korumalı İçerik" },
    es: { text: "Texto", img: "Imagen", vid: "Video", canvas: "Lienzo", bg: "Fondo", protected: "Medios Protegidos" }
};

// ==========================================
// 3. GELİŞMİŞ RENK VERİTABANI (CIELAB)
// ==========================================
const COLOR_DB = [
    { hex: "#000000", tr: "Siyah", en: "Black", es: "Negro" },
    { hex: "#FFFFFF", tr: "Beyaz", en: "White", es: "Blanco" },
    { hex: "#808080", tr: "Gri", en: "Gray", es: "Gris" },
    { hex: "#C0C0C0", tr: "Gümüş", en: "Silver", es: "Plata" },
    { hex: "#36454F", tr: "Kömür Grisi", en: "Charcoal", es: "Carbón" },
    { hex: "#FF0000", tr: "Kırmızı", en: "Red", es: "Rojo" },
    { hex: "#8B0000", tr: "Koyu Kırmızı", en: "Dark Red", es: "Rojo Oscuro" },
    { hex: "#DC143C", tr: "Kıpkırmızı", en: "Crimson", es: "Carmesí" },
    { hex: "#FF4500", tr: "Kızıl Turuncu", en: "Orange Red", es: "Rojo Naranja" },
    { hex: "#FA8072", tr: "Somon", en: "Salmon", es: "Salmón" },
    { hex: "#800000", tr: "Bordo", en: "Maroon", es: "Granate" },
    { hex: "#FFA500", tr: "Turuncu", en: "Orange", es: "Naranja" },
    { hex: "#FF8C00", tr: "Koyu Turuncu", en: "Dark Orange", es: "Naranja Oscuro" },
    { hex: "#FFD700", tr: "Altın Sarısı", en: "Gold", es: "Oro" },
    { hex: "#D2691E", tr: "Çikolata", en: "Chocolate", es: "Chocolate" },
    { hex: "#8B4513", tr: "Eyer Kahvesi", en: "Saddle Brown", es: "Marrón Cuero" },
    { hex: "#A52A2A", tr: "Kahverengi", en: "Brown", es: "Marrón" },
    { hex: "#FFFF00", tr: "Sarı", en: "Yellow", es: "Amarillo" },
    { hex: "#F0E68C", tr: "Haki", en: "Khaki", es: "Caqui" },
    { hex: "#008000", tr: "Yeşil", en: "Green", es: "Verde" },
    { hex: "#00FF00", tr: "Limon Yeşili", en: "Lime", es: "Lima" },
    { hex: "#2E8B57", tr: "Deniz Yeşili", en: "Sea Green", es: "Verde Mar" },
    { hex: "#006400", tr: "Koyu Yeşil", en: "Dark Green", es: "Verde Oscuro" },
    { hex: "#808000", tr: "Zeytin", en: "Olive", es: "Oliva" },
    { hex: "#0000FF", tr: "Mavi", en: "Blue", es: "Azul" },
    { hex: "#000080", tr: "Lacivert", en: "Navy", es: "Azul Marino" },
    { hex: "#87CEEB", tr: "Gökyüzü Mavisi", en: "Sky Blue", es: "Azul Cielo" },
    { hex: "#00FFFF", tr: "Camgöbeği", en: "Cyan", es: "Cian" },
    { hex: "#008080", tr: "Teal", en: "Teal", es: "Verde Azulado" },
    { hex: "#40E0D0", tr: "Turkuaz", en: "Turquoise", es: "Turquesa" },
    { hex: "#800080", tr: "Mor", en: "Purple", es: "Púrpura" },
    { hex: "#FF00FF", tr: "Eflatun", en: "Magenta", es: "Magenta" },
    { hex: "#4B0082", tr: "Çivit Mavisi", en: "Indigo", es: "Índigo" },
    { hex: "#FFC0CB", tr: "Pembe", en: "Pink", es: "Rosa" },
    { hex: "#FF1493", tr: "Koyu Pembe", en: "Deep Pink", es: "Rosa Profundo" }
];

// ==========================================
// 4. MATEMATİK VE RENK BİLİMİ
// ==========================================

function hexToRgb(hex) {
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return res ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) } : { r:0, g:0, b:0 };
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToLab(r, g, b) {
    let r_ = r / 255, g_ = g / 255, b_ = b / 255;
    r_ = r_ > 0.04045 ? Math.pow((r_ + 0.055) / 1.055, 2.4) : r_ / 12.92;
    g_ = g_ > 0.04045 ? Math.pow((g_ + 0.055) / 1.055, 2.4) : g_ / 12.92;
    b_ = b_ > 0.04045 ? Math.pow((b_ + 0.055) / 1.055, 2.4) : b_ / 12.92;

    let x = (r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805) * 100;
    let y = (r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722) * 100;
    let z = (r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505) * 100;

    x /= 95.047; y /= 100.000; z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);

    return { l: (116 * y) - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

function deltaE(labA, labB) {
    return Math.sqrt(Math.pow(labA.l - labB.l, 2) + Math.pow(labA.a - labB.a, 2) + Math.pow(labA.b - labB.b, 2));
}

function findBestColorMatch(r, g, b) {
    const targetLab = rgbToLab(r, g, b);
    let minDelta = Infinity;
    let match = COLOR_DB[0];

    for (let i = 0; i < COLOR_DB.length; i++) {
        const dbColor = COLOR_DB[i];
        const dbRgb = hexToRgb(dbColor.hex);
        const dbLab = rgbToLab(dbRgb.r, dbRgb.g, dbRgb.b);
        const diff = deltaE(targetLab, dbLab);
        if (diff < minDelta) {
            minDelta = diff;
            match = dbColor;
        }
    }
    return { name: match[STATE.lang] || match['en'], hex: match.hex };
}

// ==========================================
// 5. GÖRÜNTÜ İŞLEME (CORS BYPASS)
// ==========================================

function calculateNaturalCoordinates(target, clientX, clientY) {
    const rect = target.getBoundingClientRect();
    const naturalW = target.naturalWidth || target.videoWidth || target.width;
    const naturalH = target.naturalHeight || target.videoHeight || target.height;

    if (!naturalW || !naturalH) return null;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const style = window.getComputedStyle(target);
    const fit = style.objectFit || 'fill';
    const w = rect.width, h = rect.height;

    let sx, sy;

    if (fit === 'cover') {
        const scale = Math.max(w / naturalW, h / naturalH);
        const nw = naturalW * scale, nh = naturalH * scale;
        sx = (x - (w - nw) / 2) / scale;
        sy = (y - (h - nh) / 2) / scale;
    } else if (fit === 'contain') {
        const scale = Math.min(w / naturalW, h / naturalH);
        const nw = naturalW * scale, nh = naturalH * scale;
        sx = (x - (w - nw) / 2) / scale;
        sy = (y - (h - nh) / 2) / scale;
    } else {
        sx = x * (naturalW / w);
        sy = y * (naturalH / h);
    }

    if (sx < 0 || sx >= naturalW || sy < 0 || sy >= naturalH) return null;
    return { x: Math.floor(sx), y: Math.floor(sy) };
}

async function tryReadPixel(target, clientX, clientY) {
    const coords = calculateNaturalCoordinates(target, clientX, clientY);
    if (!coords) return null;

    try {
        sysCanvas.width = 1; sysCanvas.height = 1;
        sysCtx.clearRect(0, 0, 1, 1);
        sysCtx.drawImage(target, coords.x, coords.y, 1, 1, 0, 0, 1, 1);
        const p = sysCtx.getImageData(0, 0, 1, 1).data;
        if (p[3] < 10) return null;
        return { r: p[0], g: p[1], b: p[2], success: true };
    } catch (e) {
        if (target.src && !STATE.corsCache.has(target.src)) {
            fetchImageAsBlob(target.src); // Arka planda dene
        }
        return { error: 'protected' };
    }
}

async function fetchImageAsBlob(url) {
    try {
        STATE.corsCache.set(url, 'PENDING');
        await fetch(url);
        STATE.corsCache.set(url, 'FAIL'); // Tarayıcı güvenliği için genelde bloklanır
    } catch (e) {
        STATE.corsCache.set(url, 'FAIL');
    }
}

// ==========================================
// 6. YAŞAM DÖNGÜSÜ
// ==========================================

chrome.storage.sync.get(['isEnabled', 'appLanguage'], (res) => {
    STATE.isActive = res.isEnabled || false;
    STATE.lang = res.appLanguage || 'en';
    if (STATE.isActive) initSystem();
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "TOGGLE") {
        STATE.isActive = msg.payload;
        STATE.isActive ? initSystem() : killSystem();
    }
    if (msg.type === "LANG_UPDATE") STATE.lang = msg.payload;
});

function initSystem() {
    if (document.getElementById('loruv-capsule')) return;
    const el = document.createElement('div');
    el.id = 'loruv-capsule';
    el.innerHTML = `
        <div id="loruv-preview-dot"></div>
        <div class="loruv-info-group">
            <span id="loruv-source-tag">...</span>
            <span id="loruv-color-name">...</span>
        </div>
        <div id="loruv-hex-tag">#...</div>
    `;
    document.body.appendChild(el);
    STATE.tooltip = el;
    document.addEventListener('mousemove', onUserMove, { passive: true });
    document.addEventListener('scroll', onUserMove, { passive: true, capture: true });
}

function killSystem() {
    if (STATE.tooltip) STATE.tooltip.remove();
    document.removeEventListener('mousemove', onUserMove);
    document.removeEventListener('scroll', onUserMove);
}

// ==========================================
// 7. ANA İŞLEM DÖNGÜSÜ (BUGFIXED)
// ==========================================

function onUserMove(e) {
    // KRİTİK DÜZELTME: Sadece MouseMove olayında koordinat güncelle
    // Scroll olayında "e.clientX" undefined olduğu için sıfıra düşüyordu.
    if (e && e.type === 'mousemove') {
        STATE.lastX = e.clientX;
        STATE.lastY = e.clientY;
    }
    // Scroll olayında lastX ve lastY'yi ESKİ DEĞERİNDE TUTUYORUZ.
    
    // --- OTO GİZLENME MANTIĞI ---
    if (STATE.tooltip) {
        // Hareket algılandı (veya scroll), göster
        STATE.tooltip.style.opacity = '1';
        
        clearTimeout(STATE.idleTimer);
        STATE.idleTimer = setTimeout(() => {
            if (STATE.tooltip) {
                // Hareketsizlik süresi doldu, gizle
                STATE.tooltip.style.opacity = '0';
            }
        }, CONFIG.IDLE_TIMEOUT);
    }

    if (!STATE.isProcessing) {
        STATE.isProcessing = true;
        requestAnimationFrame(renderFrame);
    }
}

async function renderFrame() {
    STATE.isProcessing = false;
    if (!STATE.isActive || !STATE.tooltip) return;

    // Koordinat hafızasından oku
    const { lastX, lastY } = STATE;
    
    // Eğer koordinatlar hala başlangıç değerindeyse (-1000) veya geçersizse çizim yapma
    if (lastX < 0 || lastY < 0) return;

    const labels = UI_DICT[STATE.lang] || UI_DICT['en'];
    STATE.tooltip.style.pointerEvents = 'none';

    let target = document.elementFromPoint(lastX, lastY);
    if (!target) return;

    let r, g, b, hex;
    let uiSource = labels.bg;
    let isError = false;

    // 1. METİN
    const sel = window.getSelection();
    if (sel.toString().trim().length > 0 && sel.anchorNode) {
        const range = sel.getRangeAt(0);
        const rects = range.getClientRects();
        for (let rect of rects) {
            if (lastX >= rect.left && lastX <= rect.right && lastY >= rect.top && lastY <= rect.bottom) {
                const style = window.getComputedStyle(sel.anchorNode.parentElement);
                const rgb = style.color.match(/\d+/g);
                if (rgb) { r=+rgb[0]; g=+rgb[1]; b=+rgb[2]; uiSource = labels.text; }
                break;
            }
        }
    }

    // 2. MEDYA
    if (!r && ['IMG', 'VIDEO', 'CANVAS'].includes(target.tagName)) {
        const result = await tryReadPixel(target, lastX, lastY);
        if (result && result.success) {
            r = result.r; g = result.g; b = result.b;
            uiSource = labels[target.tagName.toLowerCase()] || labels.img;
        } else if (result && result.error === 'protected') {
            isError = true;
            uiSource = labels.protected;
        }
    }

    // 3. ARKAPLAN
    if (!r && !isError) {
        let el = target;
        while (el) {
            const bg = window.getComputedStyle(el).backgroundColor;
            if (bg && !bg.includes('rgba(0, 0, 0, 0)') && !bg.includes('transparent')) {
                const rgb = bg.match(/\d+/g);
                if (rgb) { r=+rgb[0]; g=+rgb[1]; b=+rgb[2]; break; }
            }
            el = el.parentElement;
            if (el === document.body) break;
        }
    }

    // UI UPDATE
    const els = {
        dot: document.getElementById('loruv-preview-dot'),
        tag: document.getElementById('loruv-source-tag'),
        name: document.getElementById('loruv-color-name'),
        hex: document.getElementById('loruv-hex-tag')
    };

    if (isError) {
        els.dot.style.backgroundColor = '#333';
        els.dot.style.border = '2px solid red';
        els.tag.textContent = 'ERROR';
        els.tag.style.color = '#ef4444';
        els.name.textContent = uiSource;
        els.hex.textContent = '---';
    } else {
        if (!r && r!==0) { r=255; g=255; b=255; }
        hex = rgbToHex(r, g, b);
        const info = findBestColorMatch(r, g, b);

        els.dot.style.backgroundColor = hex;
        els.dot.style.border = 'none';
        els.tag.textContent = uiSource;
        els.tag.style.color = '#94a3b8';
        els.name.textContent = info.name;
        els.hex.textContent = hex;

        // API
        clearTimeout(STATE.apiTimer);
        if (STATE.lang === 'en' && !isError) {
            STATE.apiTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`${CONFIG.APIS[0]}${hex.replace('#','')}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (document.getElementById('loruv-hex-tag').textContent === hex) {
                            els.name.textContent = data.name.value;
                        }
                    }
                } catch (e) {}
            }, CONFIG.API_DEBOUNCE);
        }
    }

    // KONUMLANDIRMA
    const capW = 180, capH = 50, off = 15;
    let left = lastX + off, top = lastY + off;
    if (left + capW > window.innerWidth) left = lastX - capW - off;
    if (top + capH > window.innerHeight) top = lastY - capH - off;

    STATE.tooltip.style.transform = `translate(${left}px, ${top}px)`;
}