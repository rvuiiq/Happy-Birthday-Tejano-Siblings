// Audio Synthesizer for Cute Sound Effects
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
}

// Cute high-pitched chime sound on keypad press
function playBeep(freq = 520, duration = 0.08) {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e){}
}

// Success Melody
function playSuccessSound() {
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => playBeep(freq, 0.15), idx * 100);
  });
}

// Error Sound Tone
function playErrorSound() {
  playBeep(220, 0.2);
  setTimeout(() => playBeep(180, 0.25), 120);
}

// --- Floating Background Particles Removed ---
function createParticles() {
  // Left intentionally blank
}

// --- Passcode Core Logic ---
const TARGET_PASSCODE = "10312";
let currentInput = "";

function updateDots() {
  const dots = document.querySelectorAll('#dots-container .dot');
  dots.forEach((dot, index) => {
    if (index < currentInput.length) {
      dot.innerHTML = '<i class="fa-solid fa-heart animate-bounce"></i>';
      dot.classList.add('bg-pink-400', 'border-pink-500', 'text-white');
      dot.classList.remove('bg-pink-100');
    } else {
      dot.innerHTML = '';
      dot.classList.remove('bg-pink-400', 'border-pink-500', 'text-white');
      dot.classList.add('bg-pink-100');
    }
  });
}

function pressKey(num) {
  if (currentInput.length >= 5) return;
  playBeep(450 + currentInput.length * 50);
  currentInput += num;
  updateDots();

  if (currentInput.length === 5) {
    setTimeout(verifyPasscode, 200);
  }
}

function backspaceKey() {
  if (currentInput.length > 0) {
    playBeep(350);
    currentInput = currentInput.slice(0, -1);
    updateDots();
  }
}

function clearKey() {
  if (currentInput.length > 0) {
    playBeep(300);
    currentInput = "";
    updateDots();
  }
}

function verifyPasscode() {
  const lockscreen = document.getElementById('lockscreen');
  const photoFrame = document.getElementById('photo-frame-wrapper');
  const promptText = document.getElementById('prompt-text');

  if (currentInput === TARGET_PASSCODE) {
    playSuccessSound();
    promptText.innerHTML = '<span class="text-green-500">Unlocked! ✨</span>';
    photoFrame.classList.add('glow-pink');
    
    setTimeout(() => {
      lockscreen.classList.add('opacity-0', '-translate-y-12');
      setTimeout(() => {
        lockscreen.classList.add('hidden');
        const mainContent = document.getElementById('main-content');
        mainContent.classList.remove('hidden');
        setTimeout(() => {
          mainContent.classList.remove('opacity-0');
        }, 50);
      }, 500);
    }, 600);

  } else {
    playErrorSound();
    promptText.innerHTML = '<span class="text-rose-500 animate-pulse">Try Again! ❌</span>';
    lockscreen.classList.add('shake-anim');

    setTimeout(() => {
      lockscreen.classList.remove('shake-anim');
      currentInput = "";
      updateDots();
      promptText.innerHTML = '<span>Enter the passcode!</span> <i class="fa-solid fa-sparkles text-pink-400"></i>';
    }, 600);
  }
}

// Re-Lock Functionality
function lockScreen() {
  playBeep(400);
  const mainContent = document.getElementById('main-content');
  const lockscreen = document.getElementById('lockscreen');

  mainContent.classList.add('opacity-0');
  
  const audio = document.getElementById('robyn-audio');
  if (audio) audio.pause();

  setTimeout(() => {
    mainContent.classList.add('hidden');
    backToRoomSelection();
    currentInput = "";
    updateDots();
    
    const turningInput = document.getElementById('turning-input');
    if (turningInput) turningInput.value = "";
    const unlockedContent = document.getElementById('unlocked-room-content');
    if (unlockedContent) {
      unlockedContent.classList.add('hidden', 'opacity-0');
    }
    
    const photoFrame = document.getElementById('photo-frame-wrapper');
    photoFrame.classList.remove('glow-pink');
    
    const promptText = document.getElementById('prompt-text');
    promptText.innerHTML = '<span>Enter the passcode!</span> <i class="fa-solid fa-sparkles text-pink-400"></i>';

    lockscreen.classList.remove('hidden', 'opacity-0', '-translate-y-12');
  }, 500);
}

// Room Navigation Helpers
function openRoom(roomName, iconClass) {
  playBeep(600, 0.12);
  const selectionView = document.getElementById('room-selection-view');
  const roomContentView = document.getElementById('room-content-view');
  const roomTitle = document.getElementById('room-title');

  roomTitle.innerHTML = `<i class="fa-solid ${iconClass} text-pink-400"></i> ${roomName}`;

  selectionView.classList.add('hidden');
  roomContentView.classList.remove('hidden');

  const audio = document.getElementById('robyn-audio');
  if (audio) {
    audio.play().catch(e => console.log("Audio autoplay prevented by browser policy:", e));
  }
}

function backToRoomSelection() {
  playBeep(450, 0.08);
  const selectionView = document.getElementById('room-selection-view');
  const roomContentView = document.getElementById('room-content-view');

  const audio = document.getElementById('robyn-audio');
  if (audio) audio.pause();

  roomContentView.classList.add('hidden');
  selectionView.classList.remove('hidden');
}

// --- Robyn's Room Specific Interactions ---

function toggleRoomMusic() {
  playBeep(550, 0.1);
  const audio = document.getElementById('robyn-audio');
  if (audio) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
}

// Robust input check setup when page loads
window.addEventListener('DOMContentLoaded', () => {
  createParticles();

  const turningInput = document.getElementById('turning-input');
  const unlockedContent = document.getElementById('unlocked-room-content');

  if (turningInput && unlockedContent) {
    turningInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val === "14") {
        playSuccessSound();
        unlockedContent.classList.remove('hidden');
        setTimeout(() => {
          unlockedContent.classList.remove('opacity-0');
        }, 50);
      } else {
        unlockedContent.classList.add('opacity-0');
        setTimeout(() => {
          unlockedContent.classList.add('hidden');
        }, 300);
      }
    });
  }
});

function openGallery() {
  playBeep(620, 0.1);
  const unlockedContent = document.getElementById('unlocked-room-content');
  const galleryView = document.getElementById('gallery-sub-view');

  unlockedContent.classList.add('hidden');
  galleryView.classList.remove('hidden');
}

function backToRobynRoom() {
  playBeep(480, 0.08);
  const unlockedContent = document.getElementById('unlocked-room-content');
  const galleryView = document.getElementById('gallery-sub-view');

  galleryView.classList.add('hidden');
  unlockedContent.classList.remove('hidden');
}

// Physical Keyboard Listener Support
document.addEventListener('keydown', (e) => {
  const lockscreen = document.getElementById('lockscreen');
  if (lockscreen.classList.contains('hidden')) return;

  if (e.key >= '0' && e.key <= '9') {
    pressKey(e.key);
  } else if (e.key === 'Backspace') {
    backspaceKey();
  } else if (e.key === 'Escape') {
    clearKey();
  }
});