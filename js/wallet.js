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

function logError(message) {
    const logContainer = document.getElementById("debug-log");
    if (logContainer) {
        logContainer.innerHTML += `<p style="color:red;">❌ ${message}</p>`;
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
        if (!publicKey || publicKey.length % 2 !== 0) {
            logError("❌ Некоректний публічний ключ! Довжина має бути парною.");
            return;
        }
        logMessage(`🔑 Отримано публічний ключ: ${publicKey}`);
        

        // **Створюємо об'єкт гаманця**
        logMessage(`🛠 Перевірка отриманого ключа: "${publicKey}" (довжина: ${publicKey.length})`);
        if (publicKey.length % 2 !== 0) {
            logError("❌ Помилка: довжина публічного ключа НЕ є парною!");
            return;
        }
        wallet = new tonweb.wallet.create({
            publicKey: TonWeb.utils.hexToBytes(publicKey),
            workchain: 0
        });
        
        try {
            logMessage("🛠 Отримуємо адресу гаманця...");
            userAddress = await wallet.getAddress();
            logMessage(`✅ Адреса гаманця: ${userAddress.toString(true, true, true)}`);
        } catch (err) {
            logError("Помилка отримання адреси гаманця: " + err?.message);
        }
    } catch (error) {
        logError(`Помилка підключення гаманця: ${error?.message || "невідома помилка"}`);
        logError(`Деталі: ${JSON.stringify(error)}`);
    }
}


async function getPublicKeyFromTelegram() {
    try {
        const response = await fetch("https://wallet.tg/api/user_key", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        const data = await response.json();

        if (!data || !data.public_key) {
            logError("❌ Не вдалося отримати публічний ключ з Telegram Wallet API!");
            return null;
        }

        logMessage(`🔑 Отримано реальний публічний ключ: ${data.public_key}`);
        return data.public_key;
    } catch (error) {
        logError("❌ Помилка при отриманні ключа з Telegram Wallet API: " + error.message);
        return null;
    }
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
