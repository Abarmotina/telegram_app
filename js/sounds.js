// Функція для відтворення звуку
function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0; // Скидає звук, щоб грало навіть при швидкому натисканні
        sound.play();
    }
}

// Функції для відтворення конкретних звуків
function playClickSound() {
    playSound("click-sound");
}

function playWinSound() {
    playSound("win-sound");
}

function playLoseSound() {
    playSound("lose-sound");
}

function playDrawSound() {
    playSound("draw-sound");
}

// Експортуємо функції для використання в інших файлах
export { playClickSound, playWinSound, playLoseSound, playDrawSound };
