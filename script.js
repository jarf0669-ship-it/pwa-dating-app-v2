// ESTADOS GLOBALES DE LA APLICACIÓN
let currentMode = 'amora'; // 'amora' o 'club'
let isOnline = true; // true (verde) o false (gris)
let adTimerInterval = null;
let secondsLeft = 30;

// Inicializa iconos de Lucide al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderPerfiles();
});

// 1. CAMBIO DE MODO: AMORA (ROSA) VS AMORA CLUB (PÚRPURA)
function setMode(mode) {
  currentMode = mode;
  const btnAmora = document.getElementById('btn-amora');
  const btnClub = document.getElementById('btn-club');
  const headerZap = document.getElementById('header-zap');
  const quizTags = document.getElementById('quiz-tags');

  if (mode === 'amora') {
    btnAmora.className = "px-3 py-1 rounded-full text-xs font-bold transition-all bg-pink-600 text-white shadow-lg shadow-pink-600/30";
    btnClub.className = "px-3 py-1 rounded-full text-xs font-bold transition-all text-gray-400 hover:text-white";
    headerZap.className = "w-5 h-5 text-pink-500";
    
    quizTags.innerHTML = `
      <span class="px-2.5 py-1 rounded-full text-[11px] bg-pink-600 text-white font-medium cursor-pointer">Citas casuales</span>
      <span class="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 border border-slate-700 text-gray-300 cursor-pointer">Relación seria</span>
      <span class="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 border border-slate-700 text-gray-300 cursor-pointer">Amistad</span>
    `;
  } else {
    btnClub.className = "px-3 py-1 rounded-full text-xs font-bold transition-all bg-purple-600 text-white shadow-lg shadow-purple-600/50";
    btnAmora.className = "px-3 py-1 rounded-full text-xs font-bold transition-all text-gray-400 hover:text-white";
    headerZap.className = "w-5 h-5 text-purple-400";
    
    quizTags.innerHTML = `
      <span class="px-2.5 py-1 rounded-full text-[11px] bg-purple-600 text-white font-medium cursor-pointer">Experiencias Club</span>
      <span class="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 border border-slate-700 text-gray-300 cursor-pointer">Discreción total</span>
      <span class="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 border border-slate-700 text-gray-300 cursor-pointer">Eventos Privados</span>
    `;
  }

  renderPerfiles();
}

// 2. CAMBIO DE ESTADO DE CONEXIÓN (VERDE Y GRIS)
function togglePresence() {
  isOnline = !isOnline;
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');

  if (isOnline) {
    dot.className = "w-2.5 h-2.5 rounded-full bg-green-500 shadow-md shadow-green-500/50";
    text.innerText = "Conectado (Recibiendo mensajes)";
  } else {
    dot.className = "w-2.5 h-2.5 rounded-full bg-gray-500";
    text.innerText = "Desconectado (Modo Invisible)";
  }
}

// 3. RENDERIZAR MOSAICO DE PERFILES (3 COLUMNAS)
function renderPerfiles() {
  const container = document.getElementById('grid-perfiles');
  container.innerHTML = '';

  for (let i = 1; i <= 9; i++) {
    const seed = currentMode === 'amora' ? i : i + 20;
    const card = document.createElement('div');
    card.className = "relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-800 border border-slate-800/80 group cursor-pointer hover:border-slate-600 transition";
    
    card.innerHTML = `
      <img src="https://picsum.photos/200/300?random=${seed}" class="w-full h-full object-cover">
      <div class="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
        <p class="text-[11px] font-semibold truncate flex items-center gap-1">
          Usuario ${seed}, ${20 + i}
          <span class="w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-gray-400'} inline-block"></span>
        </p>
      </div>
    `;
    container.appendChild(card);
  }
}

// 4. CONTROL DE MODALES (FILTROS)
function toggleFilters(show) {
  const modal = document.getElementById('modal-filters');
  if (show) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

// 5. TEMPORIZADOR DEL ANUNCIO DE VIDEO (30 SEGUNDOS)
function startAd() {
  const modalAd = document.getElementById('modal-ad');
  const timerText = document.getElementById('ad-timer');
  
  modalAd.classList.remove('hidden');
  secondsLeft = 30;
  timerText.innerText = `00:${secondsLeft}`;

  adTimerInterval = setInterval(() => {
    secondsLeft--;
    timerText.innerText = `00:${secondsLeft < 10 ? '0' + secondsLeft : secondsLeft}`;

    if (secondsLeft <= 0) {
      clearInterval(adTimerInterval);
      modalAd.classList.add('hidden');
      
      // Revelar perfil desenfocado
      const preview = document.getElementById('avatar-preview');
      const btnUnlock = document.getElementById('btn-unlock-perfil');
      if (preview) preview.classList.remove('blur-md');
      if (btnUnlock) {
        btnUnlock.innerText = "Revelado ✓";
        btnUnlock.className = "text-[10px] bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full border border-green-500/30 font-bold";
        btnUnlock.onclick = null;
      }
    }
  }, 1000);
}