async function fetchWalletsList() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets.json");
        if (!response.ok) throw new Error(`Failed to load wallets list: ${response.status}`);

        const data = await response.json();
        console.log("Отриманий список гаманців:", data); // 🔹 Додаємо лог

        return data;
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