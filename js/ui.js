import { game } from "./game.js";

// Оновлює картки гравця та опонента, відображає статистику
function updateUI(playerCard, opponentCard) {
    const title = document.querySelector("h1");

    document.getElementById('player-card').className = `card ${playerCard.rarity}`;
    document.getElementById('opponent-card').className = `card ${opponentCard.rarity}`;

    const turnIndicator = document.getElementById("turn-indicator");
    if (game.currentPlayer === 'player') {
        turnIndicator.innerText = "Ваш хід!";
        document.getElementById('player-card').style.border = "3px solid #ffffff";
        document.getElementById('opponent-card').style.border = "none";
    } else {
        turnIndicator.innerText = "Хід суперника!";
        document.getElementById('player-card').style.border = "none";
        document.getElementById('opponent-card').style.border = "3px solid #ffffff";
    }

    if (game.rounds === 0) {
        title.innerText = "🔥 Гра почалася!";
    } else if (game.rounds === game.maxRounds) {
        title.innerText = game.getFinalResult();
    } else {
        title.innerText = `Раунд ${game.rounds} / ${game.maxRounds}`;
    }

    // Відображення атрибутів на картках
    document.getElementById('player-card').innerHTML = `
        <h3>${playerCard.name}</h3>
        <div class="score">${game.playerScore}</div>
        ${Object.entries(playerCard.attributes).map(([key, value]) => {
            const roundResult = game.usedAttributes.get(key);
            let className = '';
            if (roundResult) {
                className = roundResult.result === 'player' ? 'highlight-win'
                          : roundResult.result === 'opponent' ? 'highlight-lose'
                          : 'highlight-draw';
            }
            return `<p class="${className}">${key}: ${value}</p>`;
        }).join('')}
    `;

    document.getElementById('opponent-card').innerHTML = `
        <h3>Hidden Card</h3>
        <div class="score">${game.opponentScore}</div>
        ${Object.keys(opponentCard.attributes).map(key => {
            const roundResult = game.usedAttributes.get(key);
            if (roundResult) {
                let className = roundResult.result === 'player' ? 'highlight-lose'
                          : roundResult.result === 'opponent' ? 'highlight-win'
                          : 'highlight-draw';
                return `<p class="${className}">${key}: ${roundResult.opponentValue}</p>`;
            }
            return `<p>${key}: ?</p>`;
        }).join('')}
    `;
}

// Створює кнопки вибору атрибутів
function createAttributeButtons() {
    const attributes = Object.keys(game.playerDeck[0].attributes);
    const container = document.getElementById('attribute-buttons');
    container.innerHTML = '';

    attributes.forEach(attr => {
        const button = document.createElement('button');
        button.innerText = attr;
        button.id = `btn-${attr}`;
        button.onclick = () => {
            if (game.currentPlayer === 'player') {
                playSound("click-sound");
                document.getElementById('player-card').classList.add('animate-turn');
                button.disabled = true;
                button.style.opacity = "0.5";
                setTimeout(() => {
                    const roundResult = game.playRound(attr);
                    updateUI(roundResult.playerCard, roundResult.opponentCard);
                    giveOpponentTurn();
                }, 500);
            }
        };
        container.appendChild(button);
    });
}

// Приховує або показує інтерфейс гри
function toggleGameInterface(show) {
    const gameInterface = document.getElementById("game-interface");
    if (show) {
        gameInterface.classList.remove("hidden");
    } else {
        gameInterface.classList.add("hidden");
    }
}

// Додає анімацію вибору картки
function animateCardSelection(cardId) {
    const card = document.getElementById(cardId);
    card.classList.add('animate-turn');
    setTimeout(() => {
        card.classList.remove('animate-turn');
    }, 300);
}

// Оновлює текст результату гри
function updateGameResult(resultText) {
    document.getElementById("result").innerText = resultText;
}

export { updateUI, createAttributeButtons, toggleGameInterface, animateCardSelection, updateGameResult };
