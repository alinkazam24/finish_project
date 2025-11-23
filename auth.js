// Simple client-side auth helper using localStorage and SubtleCrypto SHA-256
// Note: client-side storage is NOT secure for production. This is for demo/learning only.

async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers() {
  const raw = localStorage.getItem('fp_users');
  return raw ? JSON.parse(raw) : {};
}

function saveUsers(users) {
  localStorage.setItem('fp_users', JSON.stringify(users));
}

async function registerUser({ username, password, email = '', firstName = '', lastName = '' }) {
  const users = getUsers();
  if (users[username]) {
    return { success: false, message: 'Пользователь с таким именем уже существует' };
  }
  const passHash = await sha256(password + username); 
  users[username] = {
    hash: passHash,
    email,
    firstName,
    lastName,
    createdAt: new Date().toISOString()
  };
  saveUsers(users);
  return { success: true };
}

async function verifyLogin(username, password) {
  const users = getUsers();
  const user = users[username];
  if (!user) return { success: false, message: 'Пользователь не найден' };
  const passHash = await sha256(password + username);
  if (passHash === user.hash) {
    return { success: true, user };
  }
  return { success: false, message: 'Неверный пароль' };
}

window.auth = {
  sha256,
  registerUser,
  verifyLogin,
  getUsers
};

window.authLogout = function () {
  localStorage.removeItem('fp_currentUser');
};
