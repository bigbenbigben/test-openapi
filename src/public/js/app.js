// パスワード表示切替処理
const toggleRegisterPasswordButton = document.getElementById('toggleResistorPassword');
const registerPasswordInput = document.getElementById('registerPassword');
toggleRegisterPasswordButton.addEventListener('mousedown', function() {
  registerPasswordInput.type = 'text';  // パスワードを表示
});
toggleRegisterPasswordButton.addEventListener('mouseup', function() {
  registerPasswordInput.type = 'password';  // パスワードを隠す
});

const toggleLoginPasswordButton = document.getElementById('toggleLoginPassword');
const loginPasswordInput = document.getElementById('password');
toggleLoginPasswordButton.addEventListener('mousedown', function() {
  loginPasswordInput.type = 'text';  // パスワードを表示
});
toggleLoginPasswordButton.addEventListener('mouseup', function() {
  loginPasswordInput.type = 'password';  // パスワードを隠す
});

// ユーザー登録処理
document.getElementById('registerForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.text()) // レスポンスをテキストで受け取る
  .then(data => {
    document.getElementById('registerMessage').innerText = 'Registration successful!';
  })
  .catch(error => {
    document.getElementById('registerMessage').innerText = 'Registration failed: ' + error.message;
  });
});

// ログインフォーム処理
document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      const token = data.token;
      localStorage.setItem('jwt', token);
      document.getElementById('loginMessage').innerText = 'Login successful!';
    } else {
      document.getElementById('loginMessage').innerText = 'Login failed: ' + (data.message || 'Unknown error');
    }
  })
  .catch(error => {
    document.getElementById('loginMessage').innerText = 'Login failed: ' + error.message;
  });
});
