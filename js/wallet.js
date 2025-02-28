import { TonWeb } from "https://cdn.jsdelivr.net/npm/tonweb@0.0.49/dist/tonweb.js";

// ���������� TonWeb ��� mainnet
const tonweb = new TonWeb(new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC"));

let wallet;
let userAddress = null;

// **������� ��� ���������� �������**
export async function connectWallet() {
    try {
        // **����������, �� ������������ Telegram Web App**
        if (!window.Telegram || !window.Telegram.WebApp) {
            console.error("? Telegram Web App �� ������������!");
            return;
        }

        if (!window.Telegram.WebApp.initDataUnsafe?.user) {
            console.error("? ���������� �� ������������� � Telegram Web App!");
            return;
        }

        // �������� ID ����������� Telegram (�� ��������������� ��� ��������� ��������� �����)
        const tgUserId = window.Telegram.WebApp.initDataUnsafe.user.id;
        console.log("? Telegram Web App ������������. ID �����������:", tgUserId);

        // **�������� �������� ���� �����������**
        const publicKey = await getPublicKeyFromTelegram(tgUserId);
        if (!publicKey) {
            console.error("? �� ������� �������� �������� ���� Telegram Wallet!");
            return;
        }

        // **��������� ��'��� �������**
        wallet = new tonweb.wallet.all.v4({
            publicKey: TonWeb.utils.hexToBytes(publicKey),
            workchain: 0
        });

        userAddress = await wallet.getAddress();
        console.log("? Telegram Wallet ���������! ������:", userAddress.toString(true, true, true));
    } catch (error) {
        console.error("? ������� ���������� �������:", error);
    }
}

// **�������� ����� ��������� ��������� ����� (��� �����)**
async function getPublicKeyFromTelegram(userId) {
    // ?? �������: � ��������� ������� ��� ���� �� ���� ��������� ����� API Telegram Wallet
    return "7a28e34d4b1b654d5db2d5b5b68d..." // ?? �������� �������� ���� (������� �� API-�����)
}

// **�������� ������ �������**
export async function getWalletBalance() {
    if (!wallet || !userAddress) {
        console.error("? �������� �� ���������!");
        return null;
    }

    try {
        const balance = await tonweb.getBalance(userAddress);
        console.log("?? ������ �������:", TonWeb.utils.fromNano(balance), "TON");
        return TonWeb.utils.fromNano(balance);
    } catch (error) {
        console.error("? ������� ��������� �������:", error);
        return null;
    }
}

// **���������� ����������**
export async function sendTransaction(toAddress, amount) {
    if (!wallet || !userAddress) {
        console.error("? �������� �� ���������!");
        return;
    }

    try {
        const seqno = await wallet.methods.seqno().call();
        const transfer = wallet.methods.transfer({
            secretKey: new Uint8Array([]), // ? ��� �� ���� ����� �����������
            toAddress: toAddress,
            amount: TonWeb.utils.toNano(amount),
            seqno
        });

        await transfer.send();
        console.log(`? ���������� ����������: ${amount} TON ? ${toAddress}`);
    } catch (error) {
        console.error("? ������� �������� ����������:", error);
    }
}

// **��������� ���������� �������**
export function checkWalletConnection() {
    if (userAddress) {
        console.log("? �������� ���������:", userAddress.toString(true, true, true));
        return userAddress.toString(true, true, true);
    } else {
        console.log("? �������� �� ���������");
        return null;
    }
}
