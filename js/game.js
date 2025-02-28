class Card {
    constructor(name, attributes, rarity) {
        this.name = name;
        this.attributes = attributes;
        this.rarity = rarity;
    }
}

class Game {
    constructor(playerDeck, opponentDeck) {
        this.playerDeck = playerDeck;
        this.opponentDeck = opponentDeck;
        this.rounds = 0;
        this.maxRounds = 4;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.usedAttributes = new Map();
        this.currentPlayer = 'player';
        this.messages = [
            "Гарний вибір!", "Непоганий хід!", "Цікава стратегія!", 
            "Цей раунд був жорсткий!", "Ти на крок попереду!", "Це буде важка битва!"
        ];
    }

    playRound(chosenAttribute) {
        if (this.rounds >= this.maxRounds) {
            return 'Game Over';
        }

        if (this.usedAttributes.has(chosenAttribute)) {
            return 'Attribute already used';
        }

        const playerCard = this.playerDeck[0];
        const opponentCard = this.opponentDeck[0];
        const playerValue = playerCard.attributes[chosenAttribute] || 0;
        const opponentValue = opponentCard.attributes[chosenAttribute] || 0;

        let result;

        if (playerValue > opponentValue) {
            this.playerScore++;
            result = 'player';
        } else if (playerValue < opponentValue) {
            this.opponentScore++;
            result = 'opponent';
        } else {
            result = 'draw';
        }

        this.usedAttributes.set(chosenAttribute, { result, playerValue, opponentValue });
        this.currentPlayer = this.currentPlayer === 'player' ? 'opponent' : 'player';
        
        this.rounds++;

        return { result, playerCard, opponentCard, chosenAttribute };
    }

    getFinalResult() {
        if (this.playerScore > this.opponentScore) {
            return "🎉 Гравець переміг! 🏆";
        }
        if (this.playerScore < this.opponentScore) {
            return "💀 Опонент виграв! 💀";
        }
        return "🤝 Нічия! Обидва гідні суперники!";
    }
}

// Генерує випадкові карти
function getRandomCard(excludeCard = null) {
    let availableCards = allCards.filter(card => card !== excludeCard);
    return availableCards[Math.floor(Math.random() * availableCards.length)];
}

// Список доступних карт
const allCards = [
    new Card('Spider-Man', { intelligence: 85, strength: 75, speed: 90, agility: 88, special: 80, combat: 87 }, 'common'),
    new Card('Green Goblin', { intelligence: 80, strength: 70, speed: 78, agility: 80, special: 85, combat: 75 }, 'common'),
    new Card('Iron Man', { intelligence: 95, strength: 80, speed: 75, agility: 70, special: 85, combat: 80 }, 'common'),
    new Card('Hulk', { intelligence: 65, strength: 98, speed: 60, agility: 65, special: 75, combat: 90 }, 'common'),
    new Card('Captain America', { intelligence: 82, strength: 80, speed: 82, agility: 85, special: 75, combat: 88 }, 'common'),
    new Card('Black Widow', { intelligence: 78, strength: 70, speed: 85, agility: 90, special: 72, combat: 85 }, 'common'),
    new Card('Hawkeye', { intelligence: 75, strength: 68, speed: 83, agility: 87, special: 70, combat: 83 }, 'common'),
    new Card('Venom', { intelligence: 80, strength: 90, speed: 85, agility: 78, special: 87, combat: 90 }, 'epic'),
    new Card('Doctor Strange', { intelligence: 98, strength: 72, speed: 80, agility: 85, special: 100, combat: 85 }, 'epic'),
    new Card('Thor', { intelligence: 85, strength: 100, speed: 88, agility: 82, special: 100, combat: 95 }, 'legendary')
];

// Створюємо стартову гру
const playerDeck = [getRandomCard()];
const opponentDeck = [getRandomCard(playerDeck[0])];

const game = new Game(playerDeck, opponentDeck);

// Експортуємо клас гри та функцію генерації карт
export { game, getRandomCard };
