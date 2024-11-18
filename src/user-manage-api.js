const express = require('express');
const app = express();
app.use(express.json());

let users = []; // 簡単なデータベース代わり

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', (req, res) => {
  const user = req.body;
  users.push(user);
  res.status(201).json(user);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
