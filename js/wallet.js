import { TonClient4, fromNano, beginCell } from "https://cdn.jsdelivr.net/npm/@ton/ton@latest/dist/index.js"; 
import { Address } from "https://cdn.jsdelivr.net/npm/@ton/core@latest/dist/index.js";

// Ініціалізуємо TonClient для роботи з mainnet
const client = new TonClient4({
    endpoint: "https://mainnet-v4.tonhubapi.com",
});

let wallet;

// Функція для ініціалізації гаманця
export async function initTelegramWallet(publicKey) {
    if (!publicKey) {
        console.error("Telegram Wallet publicKey не знайдено!");
        return null;
    }

    // Створюємо об'єкт адреси гаманця
    const address = Address.parse(publicKey);
    wallet = {
        address,
        client
    };

    console.log("Telegram Wallet ініціалізовано!", address.toString());
    return wallet;
}

// Отримати баланс гаманця
export async function getWalletBalance() {
    if (!wallet) {
        console.error("Гаманець не ініціалізований!");
        return null;
    }

    try {
        const balance = await client.getBalance(wallet.address);
        console.log("Баланс гаманця:", fromNano(balance), "TON");
        return fromNano(balance); // Перетворюємо в TON
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
        const transaction = await client.sendTransaction({
            to: Address.parse(toAddress),
            value: amount * 10 ** 9, // Перетворюємо з TON у нанотони
            payload: beginCell().storeString("Оплата у грі").endCell(),
        });

        console.log("Транзакція відправлена!", transaction);
        return transaction;
    } catch (error) {
        console.error("Помилка відправки транзакції:", error);
    }
}

// Перевірити підключення гаманця
export function checkWalletConnection() {
    if (wallet && wallet.address) {
        console.log("Гаманець підключено:", wallet.address.toString());
        return wallet.address.toString();
    } else {
        console.log("Гаманець не підключено");
        return null;
    }
}
