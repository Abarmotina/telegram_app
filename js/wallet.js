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
        walletsList: { wallets: walletsList } // Передаємо у правильному форматі
    });

    window.tonConnect = tonConnect;
    console.log("TonConnect успішно ініціалізовано!");
}

initTonConnect();

// Функція для підключення гаманця (з додатковими логами)
async function connectWallet() {
    try {
        console.log("Запуск connectWallet...");

        const wallets = await fetchWalletsList();
        console.log("Отриманий список гаманців:", wallets);

        const supportedWallet = wallets.find(w => w.jsBridgeKey);
        console.log("Знайдено підтримуваний гаманець:", supportedWallet);

        if (supportedWallet) {
            console.log("Підключаємося через TonConnect...");
            await tonConnect.connect({ jsBridgeKey: supportedWallet.jsBridgeKey });
            console.log("Гаманець підключено:", tonConnect.account);
        } else {
            console.log("Немає гаманця з jsBridgeKey, пробуємо universalLink...");

            const walletToOpen = wallets.find(w => w.universalLink);
            if (walletToOpen) {
                console.log(`Відкриваємо ${walletToOpen.name}:`, walletToOpen.universalLink);
                window.open(walletToOpen.universalLink, "_blank");
            } else {
                alert("Гаманці не підтримують підключення через TonConnect");
                console.log("Не знайдено жодного гаманця для підключення.");
            }
        }
    } catch (error) {
        console.error("Помилка підключення гаманця:", error);
    }
}


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

export { connectWallet, checkWalletConnection };
