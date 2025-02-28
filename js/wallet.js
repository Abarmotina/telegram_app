import { TonConnect } from "@tonconnect/sdk";

// Ініціалізуємо TON Connect
const tonConnect = new TonConnect({
    manifestUrl: "https://Abarmotina.github.io/my-telegram_app/tonconnect-manifest.json"
});

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
