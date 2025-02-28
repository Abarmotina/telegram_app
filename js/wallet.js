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
        walletsList: { wallets: walletsList } // Передаємо у правильному форматі
    });

    window.tonConnect = tonConnect;
    console.log("TonConnect успішно ініціалізовано!");
}

initTonConnect();

async function connectWallet() {
    try {
        const tonConnect = window.tonConnect;
        if (!tonConnect) {
            console.error("TonConnect не ініціалізовано!");
            return;
        }

        const wallets = await fetchWalletsList();
        console.log("Доступні гаманці:", wallets);

        // Шукаємо спочатку гаманець з jsBridgeKey, якщо немає - беремо з universalLink
        let supportedWallet = wallets.find(w => w.jsBridgeKey) ||
                              wallets.find(w => w.universalLink);

        if (!supportedWallet) {
            alert("Гаманці не підтримують підключення через TonConnect");
            return;
        }

        // Підключаємося через відповідний ключ або універсальне посилання
        if (supportedWallet.jsBridgeKey) {
            await tonConnect.connect({ jsBridgeKey: supportedWallet.jsBridgeKey });
        } else if (supportedWallet.universalLink) {
            window.location.href = supportedWallet.universalLink;
        }

        console.log("Гаманець підключено:", tonConnect.account);
    } catch (error) {
        console.error("Помилка підключення гаманця:", error);
    }
}

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

export { connectWallet, checkWalletConnection };
