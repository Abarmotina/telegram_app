// ������� ��� ���������� �����
function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0; // ����� ����, ��� ����� ����� ��� �������� ���������
        sound.play();
    }
}

// ������� ��� ���������� ���������� �����
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

// ���������� ������� ��� ������������ � ����� ������
export { playClickSound, playWinSound, playLoseSound, playDrawSound };
