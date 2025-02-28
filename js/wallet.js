import * as TonWeb from "https://cdn.jsdelivr.net/npm/tonweb@latest/dist/tonweb.min.js";

// Ініціалізуємо TonWeb для mainnet
const tonweb = new TonWeb.TonWeb(new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC"));

let wallet;
let userAddress = null;

// Функція для ініціалізації гаманця через публічний ключ
export async function connectWallet() {
    try {
        // Отримуємо публічний ключ Telegram Wallet через Telegram Web App
        if (!window.Telegram || !window.Telegram.WebApp.initDataUnsafe.user) {
            console.error("Telegram Web App не ініціалізовано або користувач не авторизований!");
            return;
        }

        // Отримуємо ID користувача Telegram (він використовується як основа для публічного ключа)
        const tgUserId = window.Telegram.WebApp.initDataUnsafe.user.id;
        const publicKey = await getPublicKeyFromTelegram(tgUserId);

        if (!publicKey) {
            console.error("Не вдалося отримати публічний ключ з Telegram Wallet!");
            return;
        }

        wallet = new tonweb.wallet.all.v4({
            publicKey: TonWeb.utils.hexToBytes(publicKey),
            workchain: 0
        });

        userAddress = await wallet.getAddress();
        console.log("Telegram Wallet підключено! Адреса:", userAddress.toString(true, true, true));
    } catch (error) {
        console.error("Помилка підключення гаманця:", error);
    }
}

// **Фейковий метод отримання публічного ключа (для тесту)**
async function getPublicKeyFromTelegram(userId) {
    // У реальному випадку цей ключ має бути отриманий через API Telegram Wallet
    return "7a28e34d4b1b654d5db2d5b5b68d..." // Фейковий публічний ключ (замінити на API-запит)
}

// Отримати баланс гаманця
export async function getWalletBalance() {
    if (!wallet || !userAddress) {
        console.error("Гаманець не підключено!");
        return null;
    }

    try {
        const balance = await tonweb.getBalance(userAddress);
        console.log("Баланс гаманця:", TonWeb.utils.fromNano(balance), "TON");
        return TonWeb.utils.fromNano(balance);
    } catch (error) {
        console.error("Помилка отримання балансу:", error);
        return null;
    }
}

// Надсилання транзакції
export async function sendTransaction(toAddress, amount) {
    if (!wallet || !userAddress) {
        console.error("Гаманець не підключено!");
        return;
    }

    try {
        const seqno = await wallet.methods.seqno().call();
        const transfer = wallet.methods.transfer({
            secretKey: new Uint8Array([]), // Тут має бути підпис користувача
            toAddress: toAddress,
            amount: TonWeb.utils.toNano(amount),
            seqno
        });

        await transfer.send();
        console.log("Транзакція відправлена!", toAddress, "на", amount, "TON");
    } catch (error) {
        console.error("Помилка відправки транзакції:", error);
    }
}

// Перевірити підключення гаманця
export function checkWalletConnection() {
    if (userAddress) {
        console.log("Гаманець підключено:", userAddress.toString(true, true, true));
        return userAddress.toString(true, true, true);
    } else {
        console.log("Гаманець не підключено");
        return null;
    }
}
