import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://iyazkymfqyaidupqkkkg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5YXpreW1mcXlhaWR1cHFra2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjAwOTMsImV4cCI6MjEwNTM5NjA5M30.VhSJePG2tmijiNNIh1xD0NfsUmyoFlQHj_n6cKNuU3w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let profiles = [];
let currentIndex = 0;
let activeSubscription = null;

async function loadProfiles() {
  const nameEl = document.getElementById('user-name');
  const bioEl = document.getElementById('user-bio');

  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;

    if (data && data.length > 0) {
      profiles = data;
      currentIndex = 0;
      renderCurrentProfile();
    } else {
      nameEl.textContent = 'No hay perfiles';
      bioEl.textContent = 'Crea usuarios en Supabase para verlos aquí.';
    }
  } catch (err) {
    console.error('Error cargando perfiles:', err);
    nameEl.textContent = 'Error de conexión';
    bioEl.textContent = err.message || 'Error al conectar';
  }
}

function renderCurrentProfile() {
  const user = profiles[currentIndex];
  document.getElementById('user-name').textContent = user.alias || 'Usuario sin nombre';
  document.getElementById('user-bio').textContent = user.bio || 'Sin biografía disponible';
  document.getElementById('user-avatar').src = (user.photos && user.photos.length > 0) ? user.photos[0] : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500';
}

window.nextProfile = function() {
  if (profiles.length === 0) return;
  currentIndex = (currentIndex + 1) % profiles.length;
  renderCurrentProfile();
};

window.startChat = async function() {
  if (profiles.length === 0) return;
  const user = profiles[currentIndex];

  document.getElementById('profile-card').classList.add('hidden');
  document.getElementById('chat-card').classList.remove('hidden');
  document.getElementById('chat-name').textContent = user.alias || 'Usuario';
  document.getElementById('chat-avatar').src = (user.photos && user.photos.length > 0) ? user.photos[0] : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500';

  await loadMessages(user.id);
  subscribeToNewMessages(user.id);
};

window.closeChat = function() {
  if (activeSubscription) {
    supabase.removeChannel(activeSubscription);
    activeSubscription = null;
  }
  document.getElementById('chat-card').classList.add('hidden');
  document.getElementById('profile-card').classList.remove('hidden');
};

async function loadMessages(receiverId) {
  const messagesContainer = document.getElementById('chat-messages');
  messagesContainer.innerHTML = '<p class="text-xs text-slate-500 text-center">Cargando historial...</p>';

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('content, receiver_id, created_at')
      .order('created_at', { ascending: true });

    messagesContainer.innerHTML = '';
    if (error) throw error;

    if (data && data.length > 0) {
      const filtered = data.filter(m => m.receiver_id === receiverId);
      const listToShow = filtered.length > 0 ? filtered : data;
      listToShow.forEach(msg => appendMessageUI(msg.content, msg.created_at));
    } else {
      messagesContainer.innerHTML = '<p class="text-xs text-slate-400 text-center">¡Inicia la conversación enviando un mensaje!</p>';
    }
  } catch (err) {
    console.error('Error cargando mensajes:', err);
    messagesContainer.innerHTML = '<p class="text-xs text-slate-400 text-center">¡Inicia la conversación enviando un mensaje!</p>';
  }
}

function appendMessageUI(content, timestamp) {
  const messagesContainer = document.getElementById('chat-messages');
  if (messagesContainer.querySelector('p')) messagesContainer.innerHTML = '';

  const msgDiv = document.createElement('div');
  msgDiv.className = 'bg-rose-600 text-white p-2.5 rounded-2xl rounded-br-none self-end max-w-[80%] my-1 text-sm shadow-sm flex flex-col items-end gap-1';

  const textSpan = document.createElement('span');
  textSpan.textContent = content;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'text-[10px] text-rose-200 self-end opacity-80';
  const dateObj = timestamp ? new Date(timestamp) : new Date();
  timeSpan.textContent = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgDiv.appendChild(textSpan);
  msgDiv.appendChild(timeSpan);
  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

window.sendMessage = async function() {
  const input = document.getElementById('message-input');
  const text = input.value.trim();
  if (!text) return;

  const currentUser = profiles[currentIndex];
  input.value = '';

  try {
    const { error } = await supabase
      .from('messages')
      .insert([{ content: text, receiver_id: currentUser.id, sender_id: currentUser.id }]);

    if (error) appendMessageUI(text, new Date().toISOString());
  } catch (err) {
    appendMessageUI(text, new Date().toISOString());
  }
};

function subscribeToNewMessages(receiverId) {
  if (activeSubscription) supabase.removeChannel(activeSubscription);

  activeSubscription = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      if (payload.new.receiver_id === receiverId) {
        appendMessageUI(payload.new.content, payload.new.created_at);
      }
    })
    .subscribe();
}

loadProfiles();