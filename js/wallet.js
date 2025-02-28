async function fetchWalletsList() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets.json");
        if (!response.ok) throw new Error(`Failed to load wallets list: ${response.status}`);

        const rawWallets = await response.json();
        console.log("Отриманий список гаманців (оригінал):", rawWallets);

        // 🔹 Перетворюємо список у правильний формат
        const formattedWallets = rawWallets.map(wallet => ({
            name: wallet.name || wallet.app_name, // Використовуємо name або app_name
            image: wallet.image,
            about: wallet.about || "No description available",
            homepage: wallet.homepage || "https://ton.org",
            bridge: wallet.bridge || "https://bridge.tonapi.io/bridge"
        }));

        console.log("Фінальний список гаманців перед ініціалізацією:", formattedWallets);
        return formattedWallets;
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

    let walletsList = await fetchWalletsList();

    if (!walletsList || walletsList.length === 0) {
        console.error("Список гаманців порожній! Використовуємо резервний список.");
        walletsList = fallbackWallets; // Використовуємо резервний список
    }

    console.log("Передаємо в TonConnect наступний список гаманців:", walletsList);

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
        const wallets = await tonConnect.getWallets();
        if (wallets.length === 0) {
            alert("Гаманці не знайдені. Встановіть Tonkeeper або інший підтримуваний гаманець.");
            return;
        }

        // Відкриваємо діалог підключення
        await tonConnect.connect(wallets[0].universalLink);

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