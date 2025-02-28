import { TonClient, WalletContractV4, internal } from "../libs/ton-core/core/dist/index.js";


const tonClient = new TonClient({ endpoint: "https://toncenter.com/api/v2/jsonRPC" });

let wallet;

// Ініціалізація гаманця через публічний ключ
export async function initTelegramWallet(publicKey) {
    if (!publicKey) {
        console.error("Telegram Wallet publicKey не знайдено!");
        return null;
    }
    
    wallet = WalletContractV4.create({
        publicKey: Buffer.from(publicKey, 'hex'),
        workchain: 0,
    });
    console.log("Telegram Wallet ініціалізовано!");
    return wallet;
}

// Отримати баланс гаманця
export async function getWalletBalance() {
    if (!wallet) {
        console.error("Гаманець не ініціалізований!");
        return null;
    }
    
    const balance = await tonClient.getBalance(wallet.address);
    console.log("Баланс гаманця:", balance / 10 ** 9, "TON");
    return balance / 10 ** 9; // Перетворюємо в TON
}

// Надсилання транзакції
export async function sendTransaction(toAddress, amount) {
    if (!wallet) {
        console.error("Гаманець не ініціалізований!");
        return;
    }
    
    const seqno = await wallet.getSeqno(tonClient);
    const transfer = wallet.createTransfer({
        secretKey: "ПРИВАТНИЙ_КЛЮЧ", // Тут має бути підпис транзакції
        to: toAddress,
        amount: amount * 10 ** 9, // Перетворюємо з TON у нанотони
        seqno,
        payload: "Оплата у грі",
    });
    
    await tonClient.sendExternalMessage(wallet, transfer);
    console.log("Транзакція відправлена на адресу:", toAddress, "Сума:", amount, "TON");
}
