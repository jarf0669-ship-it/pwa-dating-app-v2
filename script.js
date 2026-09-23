// Configuración de Supabase
const SUPABASE_URL = 'https://stackblitzstartersm4ejeehz-mdto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función ejecutada cuando la ventana carga completamente
window.onload = () => {
  const authSection = document.getElementById('auth-section');
  const appSection = document.getElementById('app-section');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const authStatus = document.getElementById('auth-status');
  const userDisplay = document.getElementById('user-display');
  const btnLogout = document.getElementById('btn-logout');

  const profileCard = document.getElementById('profile-card');
  const chatCard = document.getElementById('chat-card');
  const btnChat = document.getElementById('btn-chat');
  const btnBack = document.getElementById('btn-back');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const messagesContainer = document.getElementById('messages-container');

  let currentUser = null;

  // Lógica directa para alternar pestañas
  function setTab(activeTab) {
    if (activeTab === 'login') {
      tabLogin.style.backgroundColor = '#f43f5e'; // rojo rose-500
      tabLogin.style.color = '#ffffff';
      tabRegister.style.backgroundColor = 'transparent';
      tabRegister.style.color = '#94a3b8';

      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
    } else {
      tabRegister.style.backgroundColor = '#f43f5e'; // rojo rose-500
      tabRegister.style.color = '#ffffff';
      tabLogin.style.backgroundColor = 'transparent';
      tabLogin.style.color = '#94a3b8';

      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
    }
    if (authStatus) authStatus.classList.add('hidden');
  }

  tabLogin.onclick = () => setTab('login');
  tabRegister.onclick = () => setTab('register');

  function showStatus(message, isError = true) {
    if (!authStatus) return;
    authStatus.textContent = message;
    authStatus.style.display = 'block';
    authStatus.style.backgroundColor = isError ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)';
    authStatus.style.color = isError ? '#f87171' : '#34d399';
  }

  // Registro
  formRegister.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    showStatus('Creando cuenta...', false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } }
    });

    if (error) {
      showStatus(error.message, true);
    } else {
      showStatus('¡Cuenta creada! Inicia sesión ahora.', false);
    }
  };

  // Login
  formLogin.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showStatus('Iniciando sesión...', false);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showStatus('Error al entrar: ' + error.message, true);
    } else {
      updateUI(data.user);
    }
  };

  // Logout
  btnLogout.onclick = async () => {
    await supabase.auth.signOut();
    updateUI(null);
  };

  function updateUI(user) {
    currentUser = user;
    if (user) {
      authSection.classList.add('hidden');
      appSection.classList.remove('hidden');
      userDisplay.textContent = user.email;
      loadMessages();
    } else {
      authSection.classList.remove('hidden');
      appSection.classList.add('hidden');
      userDisplay.textContent = '';
    }
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      updateUI(session.user);
    } else {
      updateUI(null);
    }
  });

  // Chat
  if (btnChat) {
    btnChat.onclick = () => {
      profileCard.classList.add('hidden');
      chatCard.classList.remove('hidden');
      chatCard.classList.add('flex');
    };
  }

  if (btnBack) {
    btnBack.onclick = () => {
      chatCard.classList.add('hidden');
      chatCard.classList.remove('flex');
      profileCard.classList.remove('hidden');
    };
  }

  async function loadMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) return;

    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      data.forEach(msg => appendMessage(msg));
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function appendMessage(msg) {
    if (!messagesContainer) return;
    const isMe = currentUser && (msg.sender_id === currentUser.id || msg.sender === currentUser.email);
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgHTML = `
      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
        <div class="${isMe ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-100'} px-3 py-2 rounded-xl max-w-[80%] text-sm">
          ${msg.text || msg.content}
        </div>
        <span class="text-[10px] text-slate-500 mt-0.5 px-1">${time}</span>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
  }

  if (chatForm) {
    chatForm.onsubmit = async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text || !currentUser) return;

      chatInput.value = '';

      const newMessage = {
        text: text,
        sender: currentUser.email,
        sender_id: currentUser.id
      };

      await supabase.from('messages').insert([newMessage]);
    };
  }

  supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      appendMessage(payload.new);
      if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    })
    .subscribe();
};