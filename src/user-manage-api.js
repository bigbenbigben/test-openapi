const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');  // bcrypt追加！
const app = express();
app.use(express.json());

// 静的ファイルを提供
app.use(express.static('public'));

// MongoDBに接続
mongoose.connect('mongodb://localhost:27017/my_database', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Connection failed!', err));

// スキーマとモデルを作成
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// パスワードをハッシュ化して保存する
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    console.log('Before hash:', this.password);
    this.password = await bcrypt.hash(this.password, 10);
    console.log('After hash:', this.password);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// JWT秘密鍵
const secretKey = 'your_secret_key';  // 本番環境では秘密鍵は必ず安全な場所に保存！

// /register エンドポイントで新しいユーザーを登録
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // ユーザーがすでに存在するか確認
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // 新しいユーザーを作成
  const newUser = new User({ username, password });
  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// ログイン時にパスワード照合とJWT発行
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // ユーザーを検索
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // bcryptでパスワードを照合
  const isMatch = await bcrypt.compare(password, user.password);

  // トークン発行前チェック
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // JWT発行
  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

// 認証が必要なAPIの例（JWTトークンを確認）
app.get('/protected', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'Token required' });
  }

  const tokenValue = token.split(' ')[1];

  jwt.verify(tokenValue, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    res.json({ message: 'Protected data', user: decoded });
  });
});

app.listen(3000, () => console.log('Server running on <http://localhost:3000>'));
