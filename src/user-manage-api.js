const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

// 簡単なユーザー情報（データベースがないので仮）
const users = [
  { id: 1, username: 'user1', password: 'password1' }
];

// JWT秘密鍵
const secretKey = 'your_secret_key';  // 本番環境では秘密鍵は必ず安全な場所に保存！

// /login エンドポイントでJWTを発行
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // ユーザーの認証
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  // JWTを生成して返す
  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '24h' });
  res.json({ token });
});

// 認証が必要なAPIの例（JWTトークンを確認）
// app.get('/protected', (req, res) => {
//   const token = req.headers['authorization'];
//   if (!token) {
//     return res.status(403).send('Token required');
//   }

//   // トークンを検証して認証する
//   jwt.verify(token, secretKey, (err, decoded) => {
//     if (err) {
//       console.error('JWT verification error:', err);
//       return res.status(403).send('Invalid or expired token');
//     }
//     res.json({ message: 'Protected data', user: decoded });
//   });
// });
app.get('/protected', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send('Token required');
  }

  // 'Bearer 'を削除してトークン部分だけを使う
  const tokenValue = token.split(' ')[1];

  // トークンを検証して認証する
  jwt.verify(tokenValue, secretKey, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).send('Invalid or expired token');
    }
    res.json({ message: 'Protected data', user: decoded });
  });
});


// トップページ
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the API!</h1>
    <button onclick="login()">Login</button>
    <div id="message"></div>

    <script>
      function login() {
        // サーバーにJWTトークンを送信する
        fetch('/protected', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer your_jwt_token_here' // 実際のJWTトークンに置き換えてね
          }
        })
        .then(response => {
          if (!response.ok) {
            document.getElementById('message').innerHTML = 'Authentication failed!';
            return;
          }
          return response.json();
        })
        .then(data => {
          document.getElementById('message').innerHTML = 'Protected data: ' + JSON.stringify(data);
        })
        .catch(error => {
          document.getElementById('message').innerHTML = 'Error: ' + error.message;
        });
      }
    </script>
  `);
});

app.listen(3000, () => console.log('Server running on <http://localhost:3000>'));
