async function fetchWalletsList() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets.json");
        if (!response.ok) throw new Error("Failed to load wallets list");
        const wallets = await response.json();

        // Фільтруємо правильні гаманці
        return wallets.map(w => ({
            name: w.name,
            image: w.image,
            about: w.about_url || "No description available",
            homepage: w.about_url || "https://ton.org",
            bridge: w.bridge || [],
            jsBridgeKey: w.jsBridgeKey || undefined,  // деякі гаманці можуть не мати цього параметра
            universalLink: w.universal_url || undefined
        }));
    } catch (error) {
        console.error("Помилка завантаження списку гаманців:", error);
        return [];
    }
}

async function initTonConnect() {
    // Чекаємо, поки SDK буде доступний
    while (!window.TonConnectSDK) {
        console.log("Очікуємо завантаження TonConnectSDK...");
        await new Promise(resolve => setTimeout(resolve, 100)); // Затримка 100 мс
    }

    console.log("TonConnectSDK завантажено, ініціалізуємо TonConnect...");

    const walletsList = await fetchWalletsList();
    console.log(walletsList);

    const tonConnect = new window.TonConnectSDK.TonConnect({
        manifestUrl: "https://Abarmotina.github.io/telegram_app/tonconnect-manifest.json",
        walletsList: walletsList
    });

    window.tonConnect = tonConnect;
    console.log("TonConnect успішно ініціалізовано!");
}

initTonConnect();

// Функція для підключення гаманця
async function connectWallet() {
    try {
        const wallets = await fetchWalletsList();
        const supportedWallet = wallets.find(w => w.jsBridgeKey);
        if (!supportedWallet) {
            alert("Гаманці не підтримують підключення через TonConnect");
            return;
        }

        await tonConnect.connect({ jsBridgeKey: supportedWallet.jsBridgeKey });

        console.log("Гаманець підключено:", tonConnect.account);
    } catch (error) {
        console.error("Помилка підключення гаманця:", error);
    }
}

// Функція для перевірки підключення гаманця
async function checkWalletConnection() {
    const account = tonConnect.account;
    if (account) {
        console.log("Гаманець вже підключено:", account);
    } else {
        console.log("Гаманець не підключено");
    }
}

// Експортуємо функції
export { connectWallet, checkWalletConnection };