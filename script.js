let currentMode = 'amora';
let isOnline = true;
let currentProfileIndex = 0;
let quizStep = 1;
let quizData = { name: '', age: '', intent: '', interests: [], bio: '' };

const profiles = [
  { name: "Sofia, 23", bio: "Fotógrafa y amante de los viajes 📸", img: "https://picsum.photos/400/600?random=1" },
  { name: "Lucía, 26", bio: "Gimnasio, vida sana y buen café ☕", img: "https://picsum.photos/400/600?random=2" },
  { name: "Elena, 24", bio: "Desarrolladora web y música 🎶", img: "https://picsum.photos/400/600?random=3" }
];

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderGrid();
  updateCarrusel();
  renderChats();
});

// 1. CAMBIO DE MODO Y CUESTIONARIO AMORA CLUB
function triggerClubSwitch() {
  if (currentMode === 'amora') {
    document.getElementById('modal-club-access').classList.remove('hidden');
  } else {
    setAppMode('amora');
  }
}

function confirmClubAccess() {
  closeClubModal();
  setAppMode('club');
}

function closeClubModal() {
  document.getElementById('modal-club-access').classList.add('hidden');
}

function setAppMode(mode) {
  currentMode = mode;
  const btnAmora = document.getElementById('btn-mode-amora');
  const btnClub = document.getElementById('btn-mode-club');
  const zap = document.getElementById('header-zap');
  const label = document.getElementById('mode-label');

  if (mode === 'amora') {
    btnAmora.className = "px-3 py-1 rounded-full text-xs font-bold bg-pink-600 text-white transition";
    btnClub.className = "px-3 py-1 rounded-full text-xs font-bold text-gray-400 hover:text-white transition";
    zap.className = "w-5 h-5 text-pink-500";
    if (label) label.innerText = "Modo Amora Estándar";
  } else {
    btnClub.className = "px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white transition";
    btnAmora.className = "px-3 py-1 rounded-full text-xs font-bold text-gray-400 hover:text-white transition";
    zap.className = "w-5 h-5 text-purple-400";
    if (label) label.innerText = "Modo Amora Club Privado 🔒";
  }
  renderGrid();
}

// 2. NAVEGACIÓN TAB
function switchTab(tab) {
  ['inicio', 'encuentros', 'chats', 'perfil'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.add('hidden');
    document.getElementById(`nav-${t}`).className = "flex flex-col items-center text-gray-400";
  });

  document.getElementById(`tab-${tab}`).classList.remove('hidden');
  document.getElementById(`nav-${tab}`).className = "flex flex-col items-center text-pink-500 font-bold";
}

// 3. MOSAICO Y DETALLES
function renderGrid() {
  const container = document.getElementById('grid-perfiles');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const card = document.createElement('div');
    card.className = "relative rounded-xl overflow-hidden aspect-[3/4] bg-slate-800 cursor-pointer hover:opacity-80";
    card.onclick = () => openProfileDetail(i);
    card.innerHTML = `
      <img src="https://picsum.photos/200/300?random=${currentMode === 'amora' ? i + 10 : i + 50}" class="w-full h-full object-cover">
      <div class="absolute bottom-0 inset-x-0 p-1 bg-black/60 text-[10px] font-bold">Usuario ${i + 1}</div>
    `;
    container.appendChild(card);
  }
}

function openProfileDetail(index) {
  const p = profiles[index % profiles.length];
  document.getElementById('detail-img').src = p.img;
  document.getElementById('detail-name').innerText = p.name;
  document.getElementById('detail-bio').innerText = p.bio;
  document.getElementById('modal-profile-detail').classList.remove('hidden');
}

function closeProfileDetail() {
  document.getElementById('modal-profile-detail').classList.add('hidden');
}

// 4. CUESTIONARIO PASO A PASO ESTILO BADOO
function startBadooQuiz() {
  quizStep = 1;
  showQuizStep(quizStep);
  document.getElementById('modal-badoo-quiz').classList.remove('hidden');
}

function closeBadooQuiz() {
  document.getElementById('modal-badoo-quiz').classList.add('hidden');
}

function showQuizStep(step) {
  document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
  document.getElementById(`quiz-step-${step}`).classList.remove('hidden');
  document.getElementById('quiz-step-indicator').innerText = `Paso ${step} de 4`;

  document.getElementById('btn-quiz-prev').classList.toggle('hidden', step === 1);
  document.getElementById('btn-quiz-next').innerText = step === 4 ? "Finalizar Perfil" : "Siguiente";
}

function nextQuizStep() {
  if (quizStep === 1) {
    quizData.name = document.getElementById('quiz-name').value || "Carlos";
    quizData.age = document.getElementById('quiz-age').value || "24";
  } else if (quizStep === 4) {
    quizData.bio = document.getElementById('quiz-bio').value || "Buscando buenas experiencias.";
    saveUserProfile();
    closeBadooQuiz();
    return;
  }
  quizStep++;
  showQuizStep(quizStep);
}

function prevQuizStep() {
  if (quizStep > 1) {
    quizStep--;
    showQuizStep(quizStep);
  }
}

function selectQuizOption(key, val) {
  quizData[key] = val;
}

function toggleInterest(btn, val) {
  btn.classList.toggle('bg-pink-600');
  btn.classList.toggle('bg-slate-800');
  if (!quizData.interests.includes(val)) quizData.interests.push(val);
}

function saveUserProfile() {
  document.getElementById('my-username').innerText = `${quizData.name}, ${quizData.age}`;
  document.getElementById('my-user-status').innerText = "Perfil Verificado ✨";
  document.getElementById('my-user-bio').innerText = quizData.bio;
}

// 5. MENSAJES Y CHATS
function openMessageModal() { document.getElementById('modal-message').classList.remove('hidden'); }
function closeMessageModal() { document.getElementById('modal-message').classList.add('hidden'); }

function sendChatMessage() {
  const txt = document.getElementById('input-chat-msg').value;
  if (txt.trim() !== '') {
    closeMessageModal();
    document.getElementById('input-chat-msg').value = '';
    switchTab('chats');
  }
}

function updateCarrusel() {
  const p = profiles[currentProfileIndex];
  document.getElementById('carrusel-img').src = p.img;
  document.getElementById('carrusel-name').innerText = p.name;
  document.getElementById('carrusel-bio').innerText = p.bio;
}

function nextCard() {
  currentProfileIndex = (currentProfileIndex + 1) % profiles.length;
  updateCarrusel();
}

function likeCard() {
  nextCard();
}

function renderChats() {
  const container = document.getElementById('chat-list');
  if (!container) return;
  container.innerHTML = profiles.map(p => `
    <div onclick="openMessageModal()" class="flex items-center space-x-3 bg-slate-900 p-2.5 rounded-xl cursor-pointer border border-slate-800">
      <img src="${p.img}" class="w-10 h-10 rounded-full object-cover">
      <div>
        <p class="text-xs font-bold">${p.name}</p>
        <p class="text-[10px] text-gray-400">Haz clic para enviar un mensaje...</p>
      </div>
    </div>
  `).join('');
}

function togglePresence() {
  isOnline = !isOnline;
  document.getElementById('status-dot').className = `w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`;
  document.getElementById('status-text').innerText = isOnline ? "Conectado (Recibiendo mensajes)" : "Desconectado (Modo Invisible)";
}

function toggleFilters(show) {
  document.getElementById('modal-filters').classList.toggle('hidden', !show);
}

function startAd() {
  document.getElementById('avatar-preview').classList.remove('blur-md');
}

function logout() {
  document.getElementById('my-username').innerText = "Sin Sesión";
  document.getElementById('my-user-status').innerText = "Inicia sesión";
}