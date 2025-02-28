async function fetchWalletsList() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets.json");
        if (!response.ok) throw new Error("Failed to load wallets list");
        const wallets = await response.json();

        return wallets.map(w => ({
            name: w.name,
            image: w.image,
            about: w.about_url || "No description available",
            homepage: w.about_url || "https://ton.org",
            bridge: w.bridge || [],
            jsBridgeKey: w.jsBridgeKey || undefined,
            universalLink: w.universal_url || undefined
        }));
    } catch (error) {
        console.error("Помилка завантаження списку гаманців:", error);
        return [];
    }
}

async function initTonConnect() {
    while (!window.TonConnectSDK) {
        console.log("Очікуємо завантаження TonConnectSDK...");
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log("TonConnectSDK завантажено, ініціалізуємо TonConnect...");

    const walletsList = await fetchWalletsList();
    if (!walletsList || walletsList.length === 0) {
        console.error("Список гаманців порожній або не завантажився!");
        return;
    }

    const tonConnect = new window.TonConnectSDK.TonConnect({
        manifestUrl: "https://Abarmotina.github.io/telegram_app/tonconnect-manifest.json",
        walletsList: { wallets: walletsList } 
    });

    window.tonConnect = tonConnect;
    console.log("TonConnect успішно ініціалізовано!");

    renderWalletSelection(walletsList);  // Викликаємо рендеринг кнопок для вибору гаманця
}

initTonConnect();

// 🔹 Рендеримо список гаманців у вигляді кнопок
function renderWalletSelection(wallets) {
    const container = document.getElementById("wallet-selection");
    container.innerHTML = ""; // Очистити перед оновленням

    wallets.forEach(wallet => {
        const button = document.createElement("button");
        button.innerHTML = `<img src="${wallet.image}" width="30" height="30"> ${wallet.name}`;
        button.onclick = () => connectWallet(wallet);
        container.appendChild(button);
    });
}

// 🔹 Функція для підключення вибраного гаманця
async function connectWallet(selectedWallet) {
    try {
        const tonConnect = window.tonConnect;
        if (!tonConnect) {
            console.error("TonConnect не ініціалізовано!");
            return;
        }

        console.log("Обраний гаманець:", selectedWallet);

        if (selectedWallet.jsBridgeKey) {
            await tonConnect.connect({ jsBridgeKey: selectedWallet.jsBridgeKey });
        } else if (selectedWallet.universalLink) {
            window.open(selectedWallet.universalLink, "_blank"); // Відкриваємо посилання в новій вкладці
        } else {
            alert("Цей гаманець не підтримує підключення через TonConnect");
        }

        console.log("Гаманець підключено:", tonConnect.account);
    } catch (error) {
        console.error("Помилка підключення гаманця:", error);
    }
}

// 🔹 Функція для перевірки, чи вже підключений гаманець
async function checkWalletConnection() {
    const tonConnect = window.tonConnect;
    if (!tonConnect) {
        console.error("TonConnect не ініціалізовано!");
        return;
    }

    const account = tonConnect.account;
    if (account && account.address) {
        console.log("Гаманець вже підключено:", account.address);
    } else {
        console.log("Гаманець не підключено");
    }
}

// Експортуємо функції
export { connectWallet, checkWalletConnection };
