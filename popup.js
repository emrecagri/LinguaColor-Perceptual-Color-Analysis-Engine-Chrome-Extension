// --- DİL SÖZLÜĞÜ ---
const DICT = {
    en: { title: "LinguaColor - Color Picker", on: "Active", off: "Inactive", lang: "Language - Dil - Idioma" },
    tr: { title: "LinguaColor - Renk Seçici", on: "Aktif", off: "Pasif", lang: "Dil - Language - Idioma" },
    es: { title: "LinguaColor - Selector de Color", on: "Activo", off: "Inactivo", lang: "Idioma - Dil - Language" }
};

// --- DOM ELEMANLARI ---
const ui = {
    title: document.getElementById('t-title'),
    status: document.getElementById('status-text'),
    langLabel: document.getElementById('t-lang'),
    langSelect: document.getElementById('lang-select'),
    toggle: document.getElementById('toggle')
};

// --- BAŞLATMA ---
chrome.storage.sync.get(['isEnabled', 'appLanguage'], (res) => {
    const isEnabled = res.isEnabled || false;
    const lang = res.appLanguage || 'en';

    ui.toggle.checked = isEnabled;
    ui.langSelect.value = lang;
    updateUI(lang, isEnabled);
});

// --- OLAYLAR ---
ui.toggle.addEventListener('change', (e) => {
    const isOn = e.target.checked;
    const lang = ui.langSelect.value;
    chrome.storage.sync.set({ isEnabled: isOn });
    updateUI(lang, isOn);
    sendMessage("TOGGLE", isOn);
});

ui.langSelect.addEventListener('change', (e) => {
    const newLang = e.target.value;
    const isOn = ui.toggle.checked;
    chrome.storage.sync.set({ appLanguage: newLang });
    updateUI(newLang, isOn);
    sendMessage("LANG_UPDATE", newLang);
});

// --- YARDIMCI FONKSİYONLAR ---
function updateUI(lang, isOn) {
    const t = DICT[lang] || DICT['en'];
    ui.title.innerText = t.title;
    ui.langLabel.innerText = t.lang;
    ui.status.innerText = isOn ? t.on : t.off;
    ui.status.style.color = isOn ? '#22c55e' : '#94a3b8';
}

function sendMessage(type, payload) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type, payload }).catch(() => {});
        }
    });
}