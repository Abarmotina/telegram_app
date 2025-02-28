// Завантажуємо список доступних гаманців
async function fetchWalletsList() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets.json");
        if (!response.ok) throw new Error("Failed to load wallets list");
        const wallets = await response.json();

        return wallets.map(w => ({
            name: w.name,
            image: w.image,
            about: w.about_url || "No description available",
            homepage: w.about_url || "https://ton.org",
            bridge: w.bridge || [],
            jsBridgeKey: w.jsBridgeKey || undefined,
            universalLink: w.universal_url || undefined
        }));
    } catch (error) {
        console.error("Помилка завантаження списку гаманців:", error);
        return [];
    }
}

// Ініціалізація TonConnect
async function initTonConnect() {
    while (!window.TonConnectSDK) {
        console.log("Очікуємо завантаження TonConnectSDK...");
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log("TonConnectSDK завантажено, ініціалізуємо TonConnect...");

    const walletsList = await fetchWalletsList();
    if (!walletsList || walletsList.length === 0) {
        console.error("Список гаманців порожній або не завантажився!");
        return;
    }

    const tonConnect = new window.TonConnectSDK.TonConnect({
        manifestUrl: "https://Abarmotina.github.io/telegram_app/tonconnect-manifest.json",
        walletsList: { wallets: walletsList }
    });

    window.tonConnect = tonConnect;
    console.log("TonConnect успішно ініціалізовано!");
    displayWallets(walletsList);
}

initTonConnect();

// Відображення кнопок для вибору гаманця
function displayWallets(wallets) {
    const walletContainer = document.getElementById("wallets");
    walletContainer.innerHTML = "";
    
    wallets.forEach(wallet => {
        const btn = document.createElement("button");
        btn.innerHTML = `<img src="${wallet.image}" width="30" height="30" /> ${wallet.name}`;
        btn.style.margin = "5px";
        btn.onclick = () => connectWallet(wallet);
        walletContainer.appendChild(btn);
    });
}

// Функція для підключення вибраного гаманця
async function connectWallet(wallet) {
    try {
        const tonConnect = window.tonConnect;
        if (!tonConnect) {
            console.error("TonConnect не ініціалізовано!");
            return;
        }

        console.log("Обраний гаманець:", wallet);
        
        if (wallet.jsBridgeKey) {
            await tonConnect.connect({ jsBridgeKey: wallet.jsBridgeKey });
        } else if (wallet.universalLink) {
            window.location.href = wallet.universalLink;
        } else {
            alert("Цей гаманець не підтримує підключення через TonConnect");
            return;
        }

        console.log("Гаманець підключено:", tonConnect.account);
    } catch (error) {
        console.error("Помилка підключення гаманця:", error);
    }
}

// Функція для перевірки підключення гаманця
async function checkWalletConnection() {
    const tonConnect = window.tonConnect;
    if (!tonConnect) {
        console.error("TonConnect не ініціалізовано!");
        return;
    }

    const account = tonConnect.account;
    if (account && account.address) {
        console.log("Гаманець вже підключено:", account.address);
    } else {
        console.log("Гаманець не підключено");
    }
}

// Експортуємо функції
export { connectWallet, checkWalletConnection };
