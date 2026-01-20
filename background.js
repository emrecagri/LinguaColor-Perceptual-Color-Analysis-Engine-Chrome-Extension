chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-feature") {
        chrome.storage.sync.get(['isEnabled'], (res) => {
            const newState = !res.isEnabled;
            chrome.storage.sync.set({ isEnabled: newState });
            
            // Aktif sekmeye durumu bildir
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0] && tabs[0].id) {
                    chrome.tabs.sendMessage(tabs[0].id, { 
                        type: "TOGGLE", 
                        payload: newState 
                    }).catch(() => {}); // Hata olursa yut (Sekme hazır değildir)
                }
            });
        });
    }
});