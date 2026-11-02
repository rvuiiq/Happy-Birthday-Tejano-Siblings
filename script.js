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
      dot.innerHTML = '<i class="fa-solid fa-heart animate-bounce text-[9px] text-white absolute inset-0 flex items-center justify-center pt-0.5"></i>';
      dot.classList.add('bg-pink-400', 'border-pink-500');
      dot.classList.remove('bg-transparent');
    } else {
      dot.innerHTML = '';
      dot.classList.remove('bg-pink-400', 'border-pink-500');
      dot.classList.add('bg-transparent');
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
      promptText.innerHTML = '<span>ENTER THE PASSCODE!</span> <i class="fa-solid fa-sparkles text-pink-400"></i>';
    }, 600);
  }
}

function lockScreen() {
  playBeep(400);
  const mainContent = document.getElementById('main-content');
  const lockscreen = document.getElementById('lockscreen');

  mainContent.classList.add('opacity-0');
  
  const robynAudio = document.getElementById('robyn-audio');
  if (robynAudio) robynAudio.pause();
  const rileyAudio = document.getElementById('riley-audio');
  if (rileyAudio) rileyAudio.pause();

  setTimeout(() => {
    mainContent.classList.add('hidden');
    backToRoomSelection();
    currentInput = "";
    updateDots();
    
    const turningInput = document.getElementById('turning-input');
    if (turningInput) turningInput.value = "";
    const turningInputRiley = document.getElementById('turning-input-riley');
    if (turningInputRiley) turningInputRiley.value = "";

    const unlockedContent = document.getElementById('unlocked-room-content');
    if (unlockedContent) unlockedContent.classList.add('hidden', 'opacity-0');
    
    const unlockedContentRiley = document.getElementById('unlocked-room-content-riley');
    if (unlockedContentRiley) unlockedContentRiley.classList.add('hidden', 'opacity-0');

    const chatView = document.getElementById('chat-room-view');
    if (chatView) chatView.classList.add('hidden');
    const foldersView = document.getElementById('gallery-folders-view');
    if (foldersView) foldersView.classList.add('hidden');
    
    const photoFrame = document.getElementById('photo-frame-wrapper');
    photoFrame.classList.remove('glow-pink');
    
    const promptText = document.getElementById('prompt-text');
    promptText.innerHTML = '<span>ENTER THE PASSCODE!</span> <i class="fa-solid fa-sparkles text-pink-400"></i>';

    lockscreen.classList.remove('hidden', 'opacity-0', '-translate-y-12');
  }, 500);
}

let activeRoomOwner = "robyn"; // "robyn" or "riley"

// Room Navigation Helpers
function openRoom(roomName, iconClass) {
  playBeep(600, 0.12);
  const selectionView = document.getElementById('room-selection-view');
  const roomContentView = document.getElementById('room-content-view');
  const roomTitle = document.getElementById('room-title');
  const mainContent = document.getElementById('main-content');
  const backBtn = document.getElementById('room-back-btn');

  roomTitle.innerHTML = `<i class="fa-solid ${iconClass} text-pink-400"></i> ${roomName}`;

  selectionView.classList.add('hidden');
  roomContentView.classList.remove('hidden');

  const robynCanvas = document.getElementById('robyn-room-canvas');
  const rileyCanvas = document.getElementById('riley-room-canvas');

  const robynAudio = document.getElementById('robyn-audio');
  const rileyAudio = document.getElementById('riley-audio');

  if (roomName.includes("Robyn")) {
    activeRoomOwner = "robyn";
    if (robynCanvas) robynCanvas.classList.remove('hidden');
    if (rileyCanvas) rileyCanvas.classList.add('hidden');

    if (mainContent) mainContent.style.backgroundColor = "rgba(224, 244, 238, 0.9)";
    if (backBtn) {
      backBtn.className = "px-4 py-2 bg-white/80 hover:bg-white text-pink-700 font-bold rounded-2xl border-2 border-pink-200 shadow-sm hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-2 cursor-pointer";
    }

    if (rileyAudio) rileyAudio.pause();
    if (robynAudio) {
      robynAudio.play().catch(e => console.log("Audio autoplay prevented:", e));
    }
  } else if (roomName.includes("Riley")) {
    activeRoomOwner = "riley";
    if (rileyCanvas) {
      rileyCanvas.classList.remove('hidden');
      rileyCanvas.classList.add('border-2', 'border-[#4e2023]');
    }
    if (robynCanvas) robynCanvas.classList.add('hidden');

    if (mainContent) mainContent.style.backgroundColor = "#1b232a";
    if (backBtn) {
      backBtn.className = "px-4 py-2 bg-[#26313b] hover:bg-[#323f4c] text-white font-bold rounded-2xl border-2 border-[#4e2023] shadow-sm hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-2 cursor-pointer";
    }

    if (robynAudio) robynAudio.pause();
    if (rileyAudio) {
      rileyAudio.play().catch(e => console.log("Audio autoplay prevented:", e));
    }
  }
}

function backToRoomSelection() {
  playBeep(450, 0.08);
  const selectionView = document.getElementById('room-selection-view');
  const roomContentView = document.getElementById('room-content-view');
  const mainContent = document.getElementById('main-content');

  if (mainContent) mainContent.style.backgroundColor = "rgba(224, 244, 238, 0.9)";

  const robynAudio = document.getElementById('robyn-audio');
  if (robynAudio) robynAudio.pause();
  const rileyAudio = document.getElementById('riley-audio');
  if (rileyAudio) rileyAudio.pause();

  roomContentView.classList.add('hidden');
  selectionView.classList.remove('hidden');
}

function toggleRoomMusic(owner) {
  playBeep(550, 0.1);
  const audio = document.getElementById(owner === 'riley' ? 'riley-audio' : 'robyn-audio');
  if (audio) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
}

// Robyn's Friends and Messages Data
const friendsMessagesRobyn = {
  "Ayame Balili": "robyn, you are one of the nicest people ive ever met! not to mention your funny, pretty and smart😳😳 i wish you all happiness and good things in ur life, happy birthday 😳😳😳",
  "Pia Gutierrez Moreno": "Happy birthday bobune I hope u liked my cookies :DD Honestly I've been thinking long and hard about what to get you, but I'm lowkey broke so I just decided to do something for you with dedication and effort, which is the least I could do. I admire you a lot, and you helped me so many times. I'm really happy to be your friend and stay by your side throughout this school year. Being with you has really helped me learn to express myself better and open up a little to new people and new experiences. You brought so much new happiness in my life and never failed to make us smile and laugh everyday. You really deserve the world and whatever ur going through, just know that we'll always be by your side as well. Drifting away one day is inevitable, but I'll cherish these days while I still can and give you the most of what I can. Our unexpected friendship that changed me in so many ways for the better will be a bond that I'll forever love and look back to. If you ever feel unappreciated and alone, you can always enter this website again :DD",
  "Níña Karlissa J. Pepito": "When we first met again when face to face started, I always found you quiet and distant, but now you seem so vibrant and full of life. Im so so so happy that your opening yourself towards others. Even if you have new friends just know that I'll always be right here waiting😘😘",
  "Mary Vianney": "hi bynbynbynrobynn, i just want to thank you like sososo much for being the best person i know this school year, i dont say it or show it a lot but trust me i reallyyy appreciate our friendship. your the most peak treasurer ever🥰🥰🥰 thank you also for being the person i feel so free around, and always chikaing or walking around with me! i care about you n so do many other humuhumunukunuku's so pls stay very chalant mwamwaa - your nonbeliever",
  "Liam Cuambot Obina": "happy Birthday",
  "Kien Henry Solitario": "Dear Robyn,\n\nHappy Birthday! 🎉💗 I hope your special day is filled with happiness, laughter, and love. I'm really grateful to have you as my friend, and I hope our friendship lasts for a long time. Always remember that you are an amazing person who deserves the best in life. Keep smiling, stay happy, and enjoy your special day!\nOnce again, Happy Birthday, Robyn! 🥳💖\nYour friend, Kikin",
  "Joaquin Abebuag": "Hi robyn ur a bird named robyn who lives in a tree full of robyns that are made of leaves that have robyns",
  "Francheska Maglasang": "Hi robune happy birthday, I cant come to your bday at school like the nect day b4 yoyr birthday i hope you enjoy it bebe happy birthday🥰🥰",
  "Jheila Angelica Roa": "HIII ROBYN  HAPPY 14TH BIRTHDAYYYY!!\n\nYou are an unc na lagi robynn, ayh joke peace be with you 😙✌anywayss I hope you have the best birthday ever and that you enjoy your day because you deserve itt I hope this new chapter of your life brings you lots of happiness,achieve things you want , good memories, and more reasons to be happeh (cuz if you want a thing bad enough, to go out and fight for it, work day and night for it ,give up your time and your peace and your sleep for it ykykyk)\n\nANYWAYSSS, I'm really glad to have you as a friend, and I hope we get to make more memories together always remember to be you and I hope your always happy and chalant with people you are comfortable with and can lower your guard down and I hope you can enjoy your life\n\nHAPPY BIRTHDAY AGAIN ROBYNN I HOPE YOU GET TO ENJOY YOUR DAY AND BEING 14 YRS OLD UNCCC(wanna gimme food too😙✌)\n\nFROM,\n\nYJAYLAA",
  "Kae Gulane": "Happi 14th bday Robyn!!! l hope this year feels a little lighter a little brighter and a lot more full of the small things that make life worth living, happy birthdayyy!🎂🍰",
  "Leanne Omayan": "Happy Bday Robyn! I hope this year will be good to you. Thank you for being a good friend. Thank you for giving me cold water. Happy 14th bday uncle 🥹",
  "Mark Kevin": "Hi robynDear Robyn,\n\nHAPPY 14TH BIRTHDAY!! 🎉💗\n\nI hope you have the best birthday ever and enjoy your day to the fullest. You're finally turning 14, unc 😭🙏 HAHAHAHA just kidding.\n\nBut seriously, I hope this year brings you more happiness, more good memories, and more reasons to smile. I hope you achieve the things you want and that even when things get hard, you still find reasons to keep going.\n\nI'm glad to have you as a friend, and I hope we get to make more memories together. Always remember to be yourself and never think that you have to change just to make other people happy.\n\nI hope you enjoy your special day because you deserve to be happy. May your wishes come true, your gifts be fire, and your birthday food actually be good 😭🙏\n\nOnce again, HAPPY BIRTHDAY, ROBYN!! 💗🎂 Enjoy being 14, and don't become too old for us now HAHAHAHA.\n\nFrom,\n\nYour friend",
  "Níña Macay": "Happy bday robune😹 may your verities be filled with lovities and happities!!!",
  "Ronexa Talaid": "We love you Robyn and you are really fun to talk too and friendly! ❤",
  "Samantha Carmel": "Happy birthday Robyn! Thankyou you for always being so kind and for being such a great class treasurer. I hope you have an amazing birthday and enjoy your special day.",
  "Yannah Angcay": "Happy birthday Robyn, thank you for being a wonderful friend and honestly one of the few most awesome people that I have ever met. Happy birthday Robyn",
  "Yola Cataluna": "Dear Robinini,\n\nI am wishing you an awesome birthday filled with love, joy, hope(hahahahahah) and all the things that make you smile you deserve everything wonderful today and, every other day. And again, Happy Birtthday!🥳🎉🎂"
};

// Riley's Friends and Messages Data
const friendsMessagesRiley = {
  "Níña Karlissa J. Pepito": "Hiiii, when face to face started the first person I ever thought about was you. You were my biggest happiness back then, because you were always right there for me even when I was like rlly rlly stupid and weird. Even when we aren't classmates anymore for the longest time and we dont interact as much as before, just know that you are still the bestfriend I met since nursery",
  "Angela Faith Sarcol": "Happy birthday, Riley!! I'm so glad I was able to befriend you, and I'm so happy that we get to see each other as much as we can. I hope you have many more days to cherish and remember, and I wish you an amazing life! Sending lots of love, Angela.",
  "Pia Gutierrez Moreno": "Happy Birthday Riley! I hope Robyn didn't get all the cookies to evaporate in her stomach  I know we don't talk that much anymore, but I still wanted to put effort into doing something for someone who supported me for a long period of time. I've admired you for a long time now and it breaks my heart to see and hear about you spending most of your time alone at school. If you ever feel alone, just know that ppl will always be by your side and listen to you just as much as you listen to them. You're one of the kindest people I've ever met, and no amount of time that passed has ever changed your gentle nature. Barely speaking to you doesn't mean I care about you any less. Since we don't talk as much as we used to, I barely have any idea on what's happening in your day or what you're going through, but if you want to talk, never hesitate to reach out to me. I wish you nothing but the best and may this new year you go through be filled with nothing but happy memories. Once again, happy birthday!",
  "Zia Burgos": "Happy Birthday Riley !! I hope you have the best birthday you could possibly have, not only because you're a great friend, but also to reward your helping mindset (thank you for helping me in arts). I hope that this day can help your birthday wishes come true and help you improve in things you are especially passionate about. Just know that when you are having a hard time, there are many people around you that are willing to listen and help you, including me. I wish you well and a happy birthday!",
  "Zylee Aninon": "hihihihi siyyyyyyylee,\n\nI hope u have an amazing birthday and a wonderful dayyyyy I really appreciate u being there for me even tho we been only friends for a few months but like it’s pretty good thanks for being happiness and being afraid when a teacher calls me n u being the afraid u so cool(sometimes)I honestly look up to u kasi ur basically my twin in name and right lily?  buddy i honestly i like ur laugh its so laughable and i will forever be happy,thankful,and grateful i became ur sidekick literally i would kick ur side hehhehe but i will always bully u and hope u don’t take it personally cuz i be rlly sad if u do again happy happy bday to my twin in name siyyyyylee\n\nP.S start a siyyyyle hate campaign\n\n-siyleeeeeee",
  "Andre Patarata": "To Riley\n\nHAPPY BIRTHDAYYY!! I've never fully known you but when we started talking, I saw how caring and kind u are. Your passion for your interests, your talents and your personality have given u this unique trait that makes everyone want to be friends with u🥹IM SOOOO SOOO SOOOO GRATEFUL TO BE UR CLASSMATE,getting to know u better,bond more and making memories w our class🥳 May God bless u today and I hope ur birthday will be filled with joyful moments,blessings and love",
  "Sid Habagat": "Happy Birthday to the no. 1 Tokyo ghoul and Chase Atlantic lover ever!! Thank you for all your hard work especially during the Sabayang Pagbigkas and founders day, you’re the one of the most outgoing and funny people I know and I hope you know how much I love you. Once again, happy birthday Riley I hope you have an amazing day!!",
  "Ysabela Christianne De Guzman": "Happy birthday Riley SenpaiYou’re the absolute goat everyday. Just know that you are a very good friend to all of us, it makes anyone want to be around you. I love your vibes and everything about you that you show off to the world. Thank you so much for being my friend and giving me anime recommendations that I will eventually complete hopefully. Happy birthday queen.",
  "Níña Sipalay Lingaro": "Happy birthday, Rileyyy The realest friend, creative as ever, lowkey funny, and da besht! Stay cool and never change. Enjoy da rest of yourr dayy!!",
  "Robyn Tejano": "HAPPY BIRTHDAY RIKEY. Awch U lwk my day 1 fr. I hope that today gifts you everything you deserve to have (aura). You deserve to have more than what the world can offer. Shannaro and happy birthday!!"
};

// Precise pfp filename handler separating all three Níñas uniquely
function getPfpFilename(fullName) {
  if (fullName.includes("Karlissa")) return "niña.jpg";      // Níña Karlissa
  if (fullName.includes("Macay")) return "niñamacay.jpg";       // Níña Macay
  if (fullName.includes("Sipalay")) return "niñasipalay.jpg";   // Níña Sipalay
  return fullName.split(' ')[0].toLowerCase() + '.jpg';
}

// Separate Folder Images Data for Robyn and Riley
const folderImagesRobyn = {
  "BJ Main Dancers": ["BJ1.jpe", "BJ2.jpe", "BJ3.jpe", "BJ4.jpe"],
  "School": ["school1.jpe", "school2.jpe", "school3.jpe", "school4.jpe"],
  "Outer world": ["out1.jpe", "out2.jpe", "out3.jpe", "out4.jpe"]
};

const folderImagesRiley = {
  "Araw ng Wika": ["practice1.jpe", "practice2.jpe", "practice3.jpe"],
  "School": ["aristotle1.jpg", "aristotle2.jpg", "aristotle3.jpg", "aristotle4.jpg", "aristotle5.jpe", "aristotle6.jpe"],
  "Outer world": ["outside1.jpe", "outside2.jpe", "outside3.jpe", "outside4.jpe"]
};

let currentFolderName = "";
let currentImageIndex = 0;

// Track read states, responses, and current open chat
const readFriends = new Set();
const userResponses = {}; 
let currentActiveFriend = "";

// Input check for "14" and generate Friends lists
window.addEventListener('DOMContentLoaded', () => {
  createParticles();

  // Robyn turning check
  const turningInput = document.getElementById('turning-input');
  const unlockedContent = document.getElementById('unlocked-room-content');
  if (turningInput && unlockedContent) {
    turningInput.addEventListener('input', (e) => {
      if (e.target.value.trim() === "14") {
        playSuccessSound();
        unlockedContent.classList.remove('hidden');
        setTimeout(() => unlockedContent.classList.remove('opacity-0'), 50);
      } else {
        unlockedContent.classList.add('opacity-0');
        setTimeout(() => unlockedContent.classList.add('hidden'), 300);
      }
    });
  }

  // Riley turning check
  const turningInputRiley = document.getElementById('turning-input-riley');
  const unlockedContentRiley = document.getElementById('unlocked-room-content-riley');
  if (turningInputRiley && unlockedContentRiley) {
    turningInputRiley.addEventListener('input', (e) => {
      if (e.target.value.trim() === "14") {
        playSuccessSound();
        unlockedContentRiley.classList.remove('hidden');
        setTimeout(() => unlockedContentRiley.classList.remove('opacity-0'), 50);
      } else {
        unlockedContentRiley.classList.add('opacity-0');
        setTimeout(() => unlockedContentRiley.classList.add('hidden'), 300);
      }
    });
  }

  generateFriendsList('robyn');
  generateFriendsList('riley');
});

function generateFriendsList(owner = "robyn") {
  const isRiley = owner === "riley";
  const listContainer = document.getElementById(isRiley ? 'greeters-list-riley' : 'greeters-list');
  if (!listContainer) return;

  listContainer.innerHTML = "";
  const messagesObj = isRiley ? friendsMessagesRiley : friendsMessagesRobyn;
  const names = Object.keys(messagesObj);

  names.forEach((name, index) => {
    const key = `${owner}_${name}`;
    const isRead = readFriends.has(key);
    const hasResponded = !!userResponses[key];
    const time = `${(index % 12) + 1}:0${index % 9} pm`;
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const pfpFilename = getPfpFilename(name);

    const item = document.createElement('div');
    item.className = isRiley 
      ? "flex items-center justify-between p-3 rounded-2xl bg-[#1b232a] hover:bg-[#232d36] border-2 border-[#4e2023] shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-95 text-white"
      : "flex items-center justify-between p-3 rounded-2xl bg-white/80 hover:bg-white border-2 border-purple-100 shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-95";
    item.onclick = () => openChatRoom(name, owner);
    
    const previewText = hasResponded ? "Seen" : "You have a message";
    
    item.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full ${isRead ? 'bg-transparent' : (isRiley ? 'bg-rose-400' : 'bg-blue-500')} inline-block"></span>
          <div class="w-12 h-12 rounded-full ${isRiley ? 'bg-[#2b3743] border-rose-400 text-rose-300' : 'bg-purple-200 border-purple-300 text-purple-700'} border-2 overflow-hidden flex items-center justify-center font-bold text-sm">
            <img src="${pfpFilename}" alt="${name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.innerText='${initials}';">
          </div>
        </div>
        <div>
          <h5 class="text-sm font-extrabold ${isRiley ? 'text-rose-300' : 'text-purple-700'}">${name}</h5>
          <p class="text-xs font-semibold ${hasResponded ? (isRiley ? 'text-rose-300/80' : 'text-purple-300') : (isRiley ? 'text-rose-300' : 'text-purple-400')}">${previewText}</p>
        </div>
      </div>
      <span class="text-xs font-bold ${isRiley ? 'text-rose-300' : 'text-blue-500'}">${time}</span>
    `;
    listContainer.appendChild(item);
  });
}

// Gallery Folder Navigation & Dynamic Generation
function openGalleryFolders() {
  playBeep(600, 0.1);
  const unlockedContent = document.getElementById(activeRoomOwner === 'riley' ? 'unlocked-room-content-riley' : 'unlocked-room-content');
  const foldersView = document.getElementById('gallery-folders-view');
  const isRiley = (activeRoomOwner === 'riley');

  const headerBar = document.getElementById('gallery-header-bar');
  const backBtn = document.getElementById('gallery-back-btn');
  const titleText = document.getElementById('gallery-title-text');
  const foldersContainer = document.getElementById('gallery-folders-container');

  // Disable "Lock Screen" and "Back to Rooms" buttons while in Gallery
  const lockScreenBtn = document.getElementById('lock-screen-btn');
  const backToRoomsBtn = document.getElementById('back-to-rooms-btn');

  if (lockScreenBtn) {
    lockScreenBtn.classList.add('pointer-events-none', 'opacity-50');
    lockScreenBtn.setAttribute('disabled', 'true');
  }
  if (backToRoomsBtn) {
    backToRoomsBtn.classList.add('pointer-events-none', 'opacity-50');
    backToRoomsBtn.setAttribute('disabled', 'true');
  }

  // Apply room-specific styling
  if (isRiley) {
    if (headerBar) headerBar.className = "flex items-center justify-between pb-2 border-b border-[#4e2023]";
    if (backBtn) backBtn.className = "px-4 py-2 bg-[#1b232a] hover:bg-[#232d36] text-rose-300 font-bold rounded-2xl border-2 border-[#4e2023] shadow-sm text-xs flex items-center gap-2 cursor-pointer";
    if (titleText) titleText.className = "text-lg font-extrabold text-rose-300 flex items-center gap-2";
    if (foldersContainer) foldersContainer.className = "grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 min-h-[300px] items-center justify-items-center bg-[#632428]/80 backdrop-blur-md rounded-2xl border-2 border-[#4e2023]";
  } else {
    if (headerBar) headerBar.className = "flex items-center justify-between pb-2 border-b border-pink-200";
    if (backBtn) backBtn.className = "px-4 py-2 bg-white hover:bg-pink-50 text-pink-700 font-bold rounded-2xl border-2 border-pink-200 shadow-sm text-xs flex items-center gap-2 cursor-pointer";
    if (titleText) titleText.className = "text-lg font-extrabold text-pink-800 flex items-center gap-2";
    if (foldersContainer) foldersContainer.className = "grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 min-h-[300px] items-center justify-items-center bg-white/80 rounded-2xl border-2 border-pink-200";
  }

  // Dynamically generate folders based on active owner
  const activeFoldersObj = isRiley ? folderImagesRiley : folderImagesRobyn;
  const folderNames = Object.keys(activeFoldersObj);

  if (foldersContainer) {
    foldersContainer.innerHTML = "";
    folderNames.forEach(folderName => {
      const folderDiv = document.createElement('div');
      folderDiv.className = "flex flex-col items-center gap-2 cursor-pointer group";
      folderDiv.onclick = () => openFolderViewer(folderName);

      const folderImgSrc = isRiley ? "riley folder.png" : "folder.jpg";
      const textColorClass = isRiley ? "text-xs font-extrabold text-rose-200 text-center" : "text-xs font-extrabold text-pink-900 text-center";

      folderDiv.innerHTML = `
        <div class="w-24 h-20 relative flex items-center justify-center group-hover:scale-105 transition-transform">
          <img src="${folderImgSrc}" alt="Folder" class="w-full h-full object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div style="display:none;" class="w-24 h-20 bg-amber-400 rounded-lg relative shadow-md border-2 border-amber-500 items-center justify-center">
            <div class="absolute -top-3 left-2 w-10 h-4 bg-amber-400 rounded-t-md border-t-2 border-x-2 border-amber-500"></div>
          </div>
        </div>
        <span class="${textColorClass}">${folderName}</span>
      `;
      foldersContainer.appendChild(folderDiv);
    });
  }

  if (unlockedContent) unlockedContent.classList.add('hidden');
  foldersView.classList.remove('hidden');
}

function backToRoomFromGallery() {
  playBeep(450, 0.08);
  const unlockedContent = document.getElementById(activeRoomOwner === 'riley' ? 'unlocked-room-content-riley' : 'unlocked-room-content');
  const foldersView = document.getElementById('gallery-folders-view');

  // Re-enable "Lock Screen" and "Back to Rooms" buttons when leaving Gallery
  const lockScreenBtn = document.getElementById('lock-screen-btn');
  const backToRoomsBtn = document.getElementById('back-to-rooms-btn');

  if (lockScreenBtn) {
    lockScreenBtn.classList.remove('pointer-events-none', 'opacity-50');
    lockScreenBtn.removeAttribute('disabled');
  }
  if (backToRoomsBtn) {
    backToRoomsBtn.classList.remove('pointer-events-none', 'opacity-50');
    backToRoomsBtn.removeAttribute('disabled');
  }

  foldersView.classList.add('hidden');
  if (unlockedContent) unlockedContent.classList.remove('hidden');
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
  const activeFoldersObj = activeRoomOwner === 'riley' ? folderImagesRiley : folderImagesRobyn;
  const images = activeFoldersObj[currentFolderName];
  if (!images || images.length === 0) return;

  const imgElem = document.getElementById('modal-current-image');
  const counterElem = document.getElementById('modal-image-counter');

  if (imgElem) imgElem.src = images[currentImageIndex];
  if (counterElem) counterElem.innerText = `${currentImageIndex + 1} / ${images.length}`;
}

function nextFolderImage() {
  playBeep(500, 0.06);
  const activeFoldersObj = activeRoomOwner === 'riley' ? folderImagesRiley : folderImagesRobyn;
  const images = activeFoldersObj[currentFolderName];
  if (!images) return;

  currentImageIndex = (currentImageIndex + 1) % images.length;
  updateModalImage();
}

function prevFolderImage() {
  playBeep(500, 0.06);
  const activeFoldersObj = activeRoomOwner === 'riley' ? folderImagesRiley : folderImagesRobyn;
  const images = activeFoldersObj[currentFolderName];
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
function openChatRoom(name, owner = activeRoomOwner) {
  playBeep(650, 0.1);
  activeRoomOwner = owner;
  currentActiveFriend = name;
  
  const key = `${owner}_${name}`;
  readFriends.add(key); 
  generateFriendsList(owner); 

  // Disable "Lock Screen" and "Back to Rooms" buttons while in any chat
  const lockScreenBtn = document.getElementById('lock-screen-btn');
  const backToRoomsBtn = document.getElementById('back-to-rooms-btn');

  if (lockScreenBtn) {
    lockScreenBtn.classList.add('pointer-events-none', 'opacity-50');
    lockScreenBtn.setAttribute('disabled', 'true');
  }
  if (backToRoomsBtn) {
    backToRoomsBtn.classList.add('pointer-events-none', 'opacity-50');
    backToRoomsBtn.setAttribute('disabled', 'true');
  }

  const unlockedContent = document.getElementById(owner === 'riley' ? 'unlocked-room-content-riley' : 'unlocked-room-content');
  const chatView = document.getElementById('chat-room-view');
  const title = document.getElementById('chat-greeter-title');
  const avatar = document.getElementById('chat-avatar');
  const messageText = document.getElementById('chat-message-text');
  const responseOptionsArea = document.getElementById('response-options-area');
  const buttonsContainer = document.getElementById('chat-buttons-container');
  const userResponseContainer = document.getElementById('user-response-container');
  const userResponseText = document.getElementById('user-response-text');
  const seenLabel = document.getElementById('seen-label');
  const chatCanvas = chatView.querySelector('.bg-white\\/90');

  if (title) title.innerText = name;
  
  const messagesObj = owner === 'riley' ? friendsMessagesRiley : friendsMessagesRobyn;
  if (messageText) messageText.innerText = messagesObj[name];
  
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const pfpFilename = getPfpFilename(name);
  
  if (avatar) {
    avatar.innerHTML = `<img src="${pfpFilename}" alt="${name}" class="w-full h-full object-cover rounded-full" onerror="this.style.display='none'; this.parentElement.innerText='${initials}';">`;
  }

  const isRiley = (owner === 'riley');

  if (chatCanvas) {
    chatCanvas.className = isRiley
      ? "p-6 min-h-[380px] flex flex-col justify-between border-2 border-rose-900 bg-white/95 rounded-2xl shadow-inner space-y-6"
      : "p-6 min-h-[380px] flex flex-col justify-between border-2 border-purple-200 bg-white/90 rounded-2xl shadow-inner space-y-6";
  }

  const chatBackButton = chatView.querySelector('button');
  if (chatBackButton) {
    chatBackButton.className = isRiley
      ? "px-4 py-2 bg-white hover:bg-rose-50 text-rose-900 font-bold rounded-2xl border-2 border-rose-300 shadow-sm text-xs flex items-center gap-2 cursor-pointer"
      : "px-4 py-2 bg-white hover:bg-purple-50 text-purple-500 font-bold rounded-2xl border-2 border-purple-200 shadow-sm text-xs flex items-center gap-2 cursor-pointer";
  }

  if (title) {
    title.className = isRiley ? "text-lg font-extrabold text-rose-950" : "text-lg font-extrabold text-purple-600";
  }

  if (avatar) {
    avatar.className = isRiley
      ? "w-10 h-10 rounded-full bg-rose-200 border-2 border-rose-400 overflow-hidden flex items-center justify-center text-rose-950 font-bold text-xs flex-shrink-0"
      : "w-10 h-10 rounded-full bg-purple-200 border-2 border-purple-300 overflow-hidden flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0";
  }

  if (messageText) {
    messageText.className = isRiley
      ? "relative bg-rose-100 border-2 border-rose-300 p-4 rounded-2xl rounded-tl-none shadow-sm text-rose-950 text-sm font-medium leading-relaxed max-w-[85%] whitespace-pre-line"
      : "relative bg-orange-100 border-2 border-orange-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-purple-900 text-sm font-medium leading-relaxed max-w-[85%] whitespace-pre-line";
  }

  if (userResponseText) {
    userResponseText.className = isRiley
      ? "relative bg-rose-200 border-2 border-rose-400 p-4 rounded-2xl rounded-tr-none shadow-sm text-rose-950 text-sm font-medium leading-relaxed max-w-[85%] text-right"
      : "relative bg-pink-200 border-2 border-pink-300 p-4 rounded-2xl rounded-tr-none shadow-sm text-purple-900 text-sm font-medium leading-relaxed max-w-[85%] text-right";
  }

  if (seenLabel) {
    seenLabel.className = isRiley ? "text-[11px] font-bold text-rose-500 opacity-0 transition-opacity duration-500 pr-1" : "text-[11px] font-bold text-purple-400 opacity-0 transition-opacity duration-500 pr-1";
  }

  const responseLabel = responseOptionsArea.querySelector('p');
  if (responseLabel) {
    responseLabel.className = isRiley ? "text-xs font-bold text-rose-900" : "text-xs font-bold text-purple-400";
    responseLabel.innerText = "Response:";
  }

  if (buttonsContainer) {
    buttonsContainer.innerHTML = "";
    const options = isRiley 
      ? ['Aww thank you!', 'I was crazy once'] 
      : ['Awh thank you!', 'Aura or laura'];

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = isRiley
        ? "w-full py-3 px-4 bg-rose-200 hover:bg-rose-300 text-rose-950 font-extrabold rounded-2xl border-2 border-rose-400 shadow-sm text-sm transition-all text-center cursor-pointer"
        : "w-full py-3 px-4 bg-purple-200 hover:bg-purple-300 text-purple-700 font-extrabold rounded-2xl border-2 border-purple-300 shadow-sm text-sm transition-all text-center cursor-pointer";
      btn.innerText = opt;
      btn.onclick = () => selectResponse(opt);
      buttonsContainer.appendChild(btn);
    });
  }

  if (userResponses[key]) {
    userResponseContainer.classList.remove('hidden');
    userResponseText.innerText = userResponses[key];
    responseOptionsArea.classList.add('hidden');
    seenLabel.classList.remove('opacity-0'); 
  } else {
    userResponseContainer.classList.add('hidden');
    responseOptionsArea.classList.remove('hidden');
    seenLabel.classList.add('opacity-0');
  }

  if (unlockedContent) unlockedContent.classList.add('hidden');
  chatView.classList.remove('hidden');
}

function selectResponse(responseOption) {
  playSuccessSound();
  const key = `${activeRoomOwner}_${currentActiveFriend}`;
  userResponses[key] = responseOption;

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

  generateFriendsList(activeRoomOwner);
}

function backToGalleryList() {
  playBeep(450, 0.08);
  const chatView = document.getElementById('chat-room-view');
  const unlockedContent = document.getElementById(activeRoomOwner === 'riley' ? 'unlocked-room-content-riley' : 'unlocked-room-content');

  // Re-enable "Lock Screen" and "Back to Rooms" buttons when leaving chat
  const lockScreenBtn = document.getElementById('lock-screen-btn');
  const backToRoomsBtn = document.getElementById('back-to-rooms-btn');

  if (lockScreenBtn) {
    lockScreenBtn.classList.remove('pointer-events-none', 'opacity-50');
    lockScreenBtn.removeAttribute('disabled');
  }
  if (backToRoomsBtn) {
    backToRoomsBtn.classList.remove('pointer-events-none', 'opacity-50');
    backToRoomsBtn.removeAttribute('disabled');
  }

  chatView.classList.add('hidden');
  if (unlockedContent) unlockedContent.classList.remove('hidden');
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