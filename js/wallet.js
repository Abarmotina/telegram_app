import TonWeb from "https://cdn.jsdelivr.net/npm/tonweb@latest/dist/tonweb.min.js";

// Ініціалізуємо TonWeb з mainnet
const tonweb = new TonWeb(new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC"));

let wallet;

// Функція для ініціалізації гаманця
export async function initTelegramWallet(publicKey) {
    if (!publicKey) {
        console.error("Telegram Wallet publicKey не знайдено!");
        return null;
    }

    // Створюємо об'єкт адреси гаманця
    wallet = new tonweb.wallet.all.v4({
        publicKey: TonWeb.utils.hexToBytes(publicKey),
        workchain: 0
    });

    console.log("Telegram Wallet ініціалізовано!", wallet.address.toString(true, true, true));
    return wallet;
}

// Отримати баланс гаманця
export async function getWalletBalance() {
    if (!wallet) {
        console.error("Гаманець не ініціалізований!");
        return null;
    }

    try {
        const balance = await tonweb.getBalance(wallet.address);
        console.log("Баланс гаманця:", TonWeb.utils.fromNano(balance), "TON");
        return TonWeb.utils.fromNano(balance);
    } catch (error) {
        console.error("Помилка отримання балансу:", error);
        return null;
    }
}

// Надсилання транзакції
export async function sendTransaction(toAddress, amount) {
    if (!wallet) {
        console.error("Гаманець не ініціалізований!");
        return;
    }

    try {
        const seqno = await wallet.methods.seqno().call();
        const transfer = wallet.methods.transfer({
            secretKey: new Uint8Array([]), // Тут має бути приватний ключ користувача
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
    if (wallet && wallet.address) {
        console.log("Гаманець підключено:", wallet.address.toString(true, true, true));
        return wallet.address.toString(true, true, true);
    } else {
        console.log("Гаманець не підключено");
        return null;
    }
}
