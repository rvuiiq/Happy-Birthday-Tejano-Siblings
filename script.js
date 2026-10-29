// Audio Synthesizer for Cute Sound Effects
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
}

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

function playSuccessSound() {
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    setTimeout(() => playBeep(freq, 0.15), idx * 100);
  });
}

function playErrorSound() {
  playBeep(220, 0.2);
  setTimeout(() => playBeep(180, 0.25), 120);
}

function createParticles() {
  // Left blank to remove floating emojis as requested
}

// Passcode Logic
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
    const chatView = document.getElementById('chat-room-view');
    if (chatView) chatView.classList.add('hidden');
    const foldersView = document.getElementById('gallery-folders-view');
    if (foldersView) foldersView.classList.add('hidden');
    
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

  const robynCanvas = document.getElementById('robyn-room-canvas');
  const defaultCanvas = document.getElementById('default-room-canvas');

  if (roomName.includes("Robyn")) {
    if (robynCanvas) robynCanvas.classList.remove('hidden');
    if (defaultCanvas) defaultCanvas.classList.add('hidden');

    const audio = document.getElementById('robyn-audio');
    if (audio) {
      audio.play().catch(e => console.log("Audio autoplay prevented by browser policy:", e));
    }
  } else {
    if (robynCanvas) robynCanvas.classList.add('hidden');
    if (defaultCanvas) defaultCanvas.classList.remove('hidden');

    const audio = document.getElementById('robyn-audio');
    if (audio) audio.pause();
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

// Specific 18 Friends and Messages Data
const friendsMessages = {
  "Ayame Balili": "robyn, you are one of the nicest people ive ever met! not to mention your funny, pretty and smart  i wish you all happiness and good things in ur life, happy birthday",
  "Pia Gutierrez Moreno": "Happy birthday bobune I hope u liked my cookies :DD Honestly I've been thinking long and hard about what to get you, but I'm lowkey broke so I just decided to do something for you with dedication and effort, which is the least I could do. I admire you a lot, and you helped me so many times. I'm really happy to be your friend and stay by your side throughout this school year. Being with you has really helped me learn to express myself better and open up a little to new people and new experiences. You brought so much new happiness in my life and never failed to make us smile and laugh everyday. You really deserve the world and whatever ur going through, just know that we'll always be by your side as well. Drifting away one day is inevitable, but I'll cherish these days while I still can and give you the most of what I can. Our unexpected friendship that changed me in so many ways for the better will be a bond that I'll forever love and look back to. If you ever feel unappreciated and alone, you can always enter this website again :DD",
  "Nina Karlisssa J Pepito": "When we first met again when face to face started, I always found you quiet and distant, but now you seem so vibrant and full of life. Im so so so happy that your opening yourself towards others. Even if you have new friends just know that I'll always be right here waiting😘😘",
  "Mary Vianney": "happy birthday",
  "Liam Cuambot Obina": "happy Birthday",
  "Kien Henry Solitario": "Dear Robyn,\n\nHappy Birthday! 🎉💗 I hope your special day is filled with happiness, laughter, and love. I'm really grateful to have you as my friend, and I hope our friendship lasts for a long time. Always remember that you are an amazing person who deserves the best in life. Keep smiling, stay happy, and enjoy your special day!\nOnce again, Happy Birthday, Robyn! 🥳💖\nYour friend, Kikin",
  "Joaquin Abebuag": "happy BIRTHDAY",
  "Francheska Maglasang": "HAPPY BIRTHDAY",
  "Jheila Angelica Roa": "Happy Birthday",
  "Kae Gulane": "HAPPY birthday",
  "Leanne Omayan": "HAPPY Birthday",
  "Mark Kevin": "Hi robynDear Robyn,\n\nHAPPY 14TH BIRTHDAY!! 🎉💗\n\nI hope you have the best birthday ever and enjoy your day to the fullest. You're finally turning 14, unc 😭🙏 HAHAHAHA just kidding.\n\nBut seriously, I hope this year brings you more happiness, more good memories, and more reasons to smile. I hope you achieve the things you want and that even when things get hard, you still find reasons to keep going.\n\nI'm glad to have you as a friend, and I hope we get to make more memories together. Always remember to be yourself and never think that you have to change just to make other people happy.\n\nI hope you enjoy your special day because you deserve to be happy. May your wishes come true, your gifts be fire, and your birthday food actually be good 😭🙏\n\nOnce again, HAPPY BIRTHDAY, ROBYN!! 💗🎂 Enjoy being 14, and don't become too old for us now HAHAHAHA.",
  "Nina Macay": "Happy Bday",
  "Ronexa Talaid": "happy BDAY",
  "Samantha Carmel": "HAPPY BDAY",
  "Yannah Angcay": "Happy birthday Robyn, thank you for being a wonderful friend and honestly one of the few most awesome people that I have ever met. Happy birthday Robyn",
  "Yola Cataluna": "eeee"
};

// Folder Images Data mapped to your requested files
const folderImages = {
  "BJ Main Dancers": [
    "BJ1.jpe",
    "BJ2.jpe",
    "BJ3.jpe",
    "BJ4.jpe"
  ],
  "School": [
    "school1.jpe",
    "school2.jpe",
    "school3.jpe",
    "school4.jpe"
  ],
  "Outer world": [
    "out1.jpe",
    "out2.jpe",
    "out3.jpe",
    "out4.jpe"
  ]
};

let currentFolderName = "";
let currentImageIndex = 0;

// Track read states, responses, and current open chat
const readFriends = new Set();
const userResponses = {}; 
let currentActiveFriend = "";

// Input check for "14" and generate Friends list
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

  generateFriendsList();
});

function generateFriendsList() {
  const listContainer = document.getElementById('greeters-list');
  if (!listContainer) return;

  listContainer.innerHTML = "";
  const names = Object.keys(friendsMessages);

  names.forEach((name, index) => {
    const isRead = readFriends.has(name);
    const time = `${(index % 12) + 1}:0${index % 9} pm`;
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const pfpFilename = name.split(' ')[0].toLowerCase() + '.jpg';

    const item = document.createElement('div');
    item.className = "flex items-center justify-between p-3 rounded-2xl bg-white/80 hover:bg-white border-2 border-purple-100 shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-95";
    item.onclick = () => openChatRoom(name);
    
    item.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full ${isRead ? 'bg-transparent' : 'bg-blue-500'} inline-block"></span>
          <div class="w-12 h-12 rounded-full bg-purple-200 border-2 border-purple-300 overflow-hidden flex items-center justify-center text-purple-700 font-bold text-sm">
            <img src="${pfpFilename}" alt="${name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.innerText='${initials}';">
          </div>
        </div>
        <div>
          <h5 class="text-sm font-extrabold text-purple-700">${name}</h5>
          <p class="text-xs font-semibold text-purple-400">You have a message</p>
        </div>
      </div>
      <span class="text-xs font-bold text-blue-500">${time}</span>
    `;
    listContainer.appendChild(item);
  });
}

// Gallery Folder Navigation
function openGalleryFolders() {
  playBeep(600, 0.1);
  const unlockedContent = document.getElementById('unlocked-room-content');
  const foldersView = document.getElementById('gallery-folders-view');

  unlockedContent.classList.add('hidden');
  foldersView.classList.remove('hidden');
}

function backToRobynRoomFromGallery() {
  playBeep(450, 0.08);
  const unlockedContent = document.getElementById('unlocked-room-content');
  const foldersView = document.getElementById('gallery-folders-view');

  foldersView.classList.add('hidden');
  unlockedContent.classList.remove('hidden');
}

// Open Folder Image Viewer Modal
function openFolderViewer(folderName) {
  playBeep(650, 0.1);
  currentFolderName = folderName;
  currentImageIndex = 0;

  const modal = document.getElementById('folder-modal');
  const title = document.getElementById('modal-folder-title');
  
  if (title) title.innerText = folderName;
  updateModalImage();

  modal.classList.remove('hidden');
}

function closeFolderModal() {
  playBeep(450, 0.08);
  const modal = document.getElementById('folder-modal');
  modal.classList.add('hidden');
}

function updateModalImage() {
  const images = folderImages[currentFolderName];
  if (!images || images.length === 0) return;

  const imgElem = document.getElementById('modal-current-image');
  const counterElem = document.getElementById('modal-image-counter');

  if (imgElem) imgElem.src = images[currentImageIndex];
  if (counterElem) counterElem.innerText = `${currentImageIndex + 1} / ${images.length}`;
}

function nextFolderImage() {
  playBeep(500, 0.06);
  const images = folderImages[currentFolderName];
  if (!images) return;

  currentImageIndex = (currentImageIndex + 1) % images.length;
  updateModalImage();
}

function prevFolderImage() {
  playBeep(500, 0.06);
  const images = folderImages[currentFolderName];
  if (!images) return;

  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  updateModalImage();
}

function toggleImageFullscreen() {
  playBeep(550, 0.08);
  const container = document.getElementById('image-frame-container');
  if (!document.fullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Chat Room Helpers
function openChatRoom(name) {
  playBeep(650, 0.1);
  currentActiveFriend = name;
  readFriends.add(name); 
  generateFriendsList(); 

  const unlockedContent = document.getElementById('unlocked-room-content');
  const chatView = document.getElementById('chat-room-view');
  const title = document.getElementById('chat-greeter-title');
  const avatar = document.getElementById('chat-avatar');
  const messageText = document.getElementById('chat-message-text');
  const responseOptionsArea = document.getElementById('response-options-area');
  const userResponseContainer = document.getElementById('user-response-container');
  const userResponseText = document.getElementById('user-response-text');
  const seenLabel = document.getElementById('seen-label');

  if (title) title.innerText = name;
  if (messageText) messageText.innerText = friendsMessages[name];
  
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const pfpFilename = name.split(' ')[0].toLowerCase() + '.jpe';
  if (avatar) {
    avatar.innerHTML = `<img src="${pfpFilename}" alt="${name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.innerText='${initials}';">`;
  }

  if (userResponses[name]) {
    userResponseContainer.classList.remove('hidden');
    userResponseText.innerText = userResponses[name];
    responseOptionsArea.classList.add('hidden');
    seenLabel.classList.remove('opacity-0'); 
  } else {
    userResponseContainer.classList.add('hidden');
    responseOptionsArea.classList.remove('hidden');
    seenLabel.classList.add('opacity-0');
  }

  unlockedContent.classList.add('hidden');
  chatView.classList.remove('hidden');
}

function selectResponse(responseOption) {
  playSuccessSound();
  userResponses[currentActiveFriend] = responseOption;

  const responseOptionsArea = document.getElementById('response-options-area');
  const userResponseContainer = document.getElementById('user-response-container');
  const userResponseText = document.getElementById('user-response-text');
  const seenLabel = document.getElementById('seen-label');

  responseOptionsArea.classList.add('hidden');
  userResponseContainer.classList.remove('hidden');
  userResponseText.innerText = responseOption;

  setTimeout(() => {
    seenLabel.classList.remove('opacity-0');
  }, 1000);
}

function backToGalleryList() {
  playBeep(450, 0.08);
  const chatView = document.getElementById('chat-room-view');
  const unlockedContent = document.getElementById('unlocked-room-content');

  chatView.classList.add('hidden');
  unlockedContent.classList.remove('hidden');
}

// Keyboard Support
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