// Ініціалізуємо TonWeb для mainnet
const tonweb = new TonWeb();

let wallet;
let userAddress = null;

function logMessage(message) {
    const logContainer = document.getElementById("debug-log");
    if (logContainer) {
        logContainer.innerHTML += `<p>${message}</p>`;
    }
}

// **Функція для підключення гаманця**
export async function connectWallet() {
    logMessage("🔄 Починаємо підключення гаманця...");

    if (!window.Telegram || !window.Telegram.WebApp) {
        logMessage("❌ Telegram Web App НЕ ініціалізований!");
        return;
    } else {
        logMessage("✅ Telegram Web App ініціалізований!");
    }

    try {
        if (!window.Telegram.WebApp.initDataUnsafe?.user) {
            logMessage("❌ Користувач НЕ авторизований у Telegram Web App!");
            return;
        }

        const tgUserId = window.Telegram.WebApp.initDataUnsafe.user.id;
        logMessage(`🆔 ID користувача: ${tgUserId}`);

        // **Отримуємо публічний ключ користувача**
        const publicKey = await getPublicKeyFromTelegram(tgUserId);
        if (!publicKey) {
            logMessage("❌ Не вдалося отримати публічний ключ Telegram Wallet!");
            return;
        }
        logMessage(`🔑 Отримано публічний ключ: ${publicKey}`);

        // **Створюємо об'єкт гаманця**
        wallet = new tonweb.wallet.create({
            publicKey: TonWeb.utils.hexToBytes(publicKey),
            workchain: 0
        });

        userAddress = await wallet.getAddress();
        logMessage(`✅ Telegram Wallet підключено! Адреса: ${userAddress.toString(true, true, true)}`);
    } catch (error) {
        logMessage(`❌ Помилка підключення гаманця: ${error?.message || "невідома помилка"}`);
    }
}


// **Фейковий метод отримання публічного ключа (для тесту)**
async function getPublicKeyFromTelegram(userId) {
    // 🚨 ВАЖЛИВО: У реальному випадку цей ключ має бути отриманий через API Telegram Wallet
    return "7a28e34d4b1b654d5db2d5b5b68d..." // 🔴 Фейковий публічний ключ (замінити на API-запит)
}

// **Отримати баланс гаманця**
export async function getWalletBalance() {
    if (!wallet || !userAddress) {
        logMessage("❌ Гаманець не підключено!");
        return null;
    }

    try {
        const balance = await tonweb.getBalance(userAddress);
        logMessage("💰 Баланс гаманця:", TonWeb.utils.fromNano(balance), "TON");
        return TonWeb.utils.fromNano(balance);
    } catch (error) {
        logMessage("❌ Помилка отримання балансу:", error);
        return null;
    }
}

// **Надсилання транзакції**
export async function sendTransaction(toAddress, amount) {
    if (!wallet || !userAddress) {
        logMessage("❌ Гаманець не підключено!");
        return;
    }

    try {
        const seqno = await wallet.methods.seqno().call();
        const transfer = wallet.methods.transfer({
            secretKey: new Uint8Array([]), // ❗ Тут має бути підпис користувача
            toAddress: toAddress,
            amount: TonWeb.utils.toNano(amount),
            seqno
        });

        await transfer.send();
        logMessage(`✅ Транзакція відправлена: ${amount} TON → ${toAddress}`);
    } catch (error) {
        logMessage("❌ Помилка відправки транзакції:", error);
    }
}

// **Перевірити підключення гаманця**
export function checkWalletConnection() {
    if (userAddress) {
        logMessage("✅ Гаманець підключено:", userAddress.toString(true, true, true));
        return userAddress.toString(true, true, true);
    } else {
        logMessage("❌ Гаманець не підключено");
        return null;
    }
}
