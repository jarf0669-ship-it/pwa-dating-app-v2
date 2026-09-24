let currentMode = 'amora';
let isOnline = true;
let currentProfileIndex = 0;

const profiles = [
  { name: "Sofia, 23", bio: "Fotógrafa y amante de los viajes 📸", img: "https://picsum.photos/400/600?random=1" },
  { name: "Lucía, 26", bio: "Gimnasio, vida sana y buen café ☕", img: "https://picsum.photos/400/600?random=2" },
  { name: "Elena, 24", bio: "Desarrolladora web y música 🎶", img: "https://picsum.photos/400/600?random=3" }
];

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  updateCarrusel();
  renderGrid();
  renderChats();
});

// NAVEGACIÓN ENTRE SECCIONES
function switchTab(tab) {
  document.getElementById('view-encuentros').classList.add('hidden');
  document.getElementById('view-descubre').classList.add('hidden');
  document.getElementById('view-chats').classList.add('hidden');

  document.getElementById('nav-encuentros').className = "flex flex-col items-center text-gray-400";
  document.getElementById('nav-descubre').className = "flex flex-col items-center text-gray-400";
  document.getElementById('nav-chats').className = "flex flex-col items-center text-gray-400";

  document.getElementById(`view-${tab}`).classList.remove('hidden');
  document.getElementById(`nav-${tab}`).className = "flex flex-col items-center text-pink-500 font-bold";
}

// LOGICA DEL CARRUSEL DE ENCUENTROS
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
  alert("¡Es un Match! 🎉 Se ha añadido a tus conversaciones.");
  nextCard();
}

function sendMessagePrompt() {
  const msg = prompt("Escribe tu mensaje:");
  if (msg) alert("Mensaje enviado con éxito 💬");
}

// ABRIR DETALLE DE PERFIL DESDE EL MOSAICO
function openProfileDetail(index) {
  const p = profiles[index % profiles.length];
  document.getElementById('detail-img').src = p.img;
  document.getElementById('detail-name').innerText = p.name;
  document.getElementById('detail-bio').innerText = p.bio;
  document.getElementById('modal-profile').classList.remove('hidden');
}

function closeProfileDetail() {
  document.getElementById('modal-profile').classList.add('hidden');
}

// RENDERIZAR MOSAICO Y CHATS
function renderGrid() {
  const container = document.getElementById('grid-perfiles');
  container.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const card = document.createElement('div');
    card.className = "relative rounded-xl overflow-hidden aspect-[3/4] bg-slate-800 cursor-pointer";
    card.onclick = () => openProfileDetail(i);
    card.innerHTML = `
      <img src="https://picsum.photos/200/300?random=${i + 10}" class="w-full h-full object-cover">
      <div class="absolute bottom-0 inset-x-0 p-1 bg-black/60 text-[10px] font-bold">Usuario ${i + 1}</div>
    `;
    container.appendChild(card);
  }
}

function renderChats() {
  const container = document.getElementById('chat-list');
  container.innerHTML = profiles.map(p => `
    <div onclick="sendMessagePrompt()" class="flex items-center space-x-3 bg-slate-900 p-2.5 rounded-xl cursor-pointer border border-slate-800">
      <img src="${p.img}" class="w-10 h-10 rounded-full object-cover">
      <div>
        <p class="text-xs font-bold">${p.name}</p>
        <p class="text-[10px] text-gray-400">Haz clic para chatear...</p>
      </div>
    </div>
  `).join('');
}

function setMode(mode) {
  currentMode = mode;
  alert(`Cambiado a Modo ${mode === 'amora' ? 'Amora Estándar' : 'Amora Club Privado'}`);
}

function togglePresence() {
  isOnline = !isOnline;
  document.getElementById('status-dot').className = `w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`;
  document.getElementById('status-text').innerText = isOnline ? "Conectado (Recibiendo mensajes)" : "Desconectado (Modo Invisible)";
}

function toggleFilters(show) {
  document.getElementById('modal-filters').classList.toggle('hidden', !show);
}