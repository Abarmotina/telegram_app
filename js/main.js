import { game, getRandomCard } from "./game.js";
import { updateUI, createAttributeButtons, toggleGameInterface, updateGameResult } from "./ui.js";
import { playClickSound, playWinSound, playLoseSound, playDrawSound } from "./sounds.js";
import { connectWallet, checkWalletConnection } from "./wallet.js";

// ������ ���� ���
function restartGame() {
    playClickSound();
    toggleGameInterface(true);

    // ��������� ������ ������ �� ��������
    const newPlayerCard = getRandomCard();
    const newOpponentCard = getRandomCard(newPlayerCard);

    game.playerDeck = [newPlayerCard];
    game.opponentDeck = [newOpponentCard];
    game.rounds = 0;
    game.playerScore = 0;
    game.opponentScore = 0;
    game.usedAttributes.clear();
    game.currentPlayer = 'player';

    // ³��������� ��������� ������
    document.querySelectorAll('#attribute-buttons button').forEach(button => {
        button.disabled = false;
        button.style.opacity = "1";
    });

    // ��������� UI
    createAttributeButtons();
    updateUI(newPlayerCard, newOpponentCard);
}

// ������ ��� �������� ����� ��������
function giveOpponentTurn() {
    if (game.rounds >= game.maxRounds) {
        handleGameEnd();
        return;
    }
    
    if (game.currentPlayer === 'opponent' && game.rounds < game.maxRounds && game.usedAttributes.size < game.maxRounds) {
        setTimeout(opponentTurn, 1000);
    }
}

// ����� ���� �������� (���� ����������� ��������)
function opponentTurn() {
    const availableAttributes = Object.keys(game.playerDeck[0].attributes).filter(attr => !game.usedAttributes.has(attr));

    if (availableAttributes.length > 0) {
        const chosenAttribute = availableAttributes[Math.floor(Math.random() * availableAttributes.length)];

        setTimeout(() => {
            const roundResult = game.playRound(chosenAttribute);
            updateUI(roundResult.playerCard, roundResult.opponentCard);
            if (game.rounds >= game.maxRounds) {
                handleGameEnd();
            } else {
                giveOpponentTurn();
            }
        }, 1000);
    }
}

// ������� ������ �������� �������
document.getElementById('attribute-buttons').addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && game.currentPlayer === 'player') {
        const chosenAttribute = event.target.innerText.toLowerCase();
        playClickSound();
        event.target.disabled = true;
        event.target.style.opacity = "0.5";

        setTimeout(() => {
            const roundResult = game.playRound(chosenAttribute);
            updateUI(roundResult.playerCard, roundResult.opponentCard);
            giveOpponentTurn();
        }, 500);
    }
});

// ������� ���������� ���
function handleGameEnd() {
    const resultText = game.getFinalResult();
    updateGameResult(resultText);

    if (resultText.includes("������� ������")) {
        playWinSound();
    } else if (resultText.includes("������� ������")) {
        playLoseSound();
    } else {
        playDrawSound();
    }

    setTimeout(() => toggleGameInterface(false), 2000);
}

// ���������� ������ "���� ���"
document.getElementById('new-game').addEventListener('click', restartGame);

// ������� ������ "ϳ�������� TON ��������"
document.getElementById("connect-wallet").addEventListener("click", async () => {
    await connectWallet();
    checkWalletConnection();
});

// ��������� ������ �� ��������� ���������� ��� �����
createAttributeButtons();
updateUI(game.playerDeck[0], game.opponentDeck[0]);
giveOpponentTurn();