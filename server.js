const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Inicializa o banco de dados SQLite
// Rota para listar todos os usuários
app.get('/usuarios', (req, res) => {
  db.all('SELECT id, usuario FROM usuarios', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
    res.json(rows);
  });
});

// Rota para excluir usuário
app.delete('/usuarios/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM usuarios WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
    if (this.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  });
});

const db = new sqlite3.Database('./usuarios.db', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE,
      senha TEXT
    )`);
  }
});

// Rota de cadastro
app.post('/register', (req, res) => {
  const { usuario, senha } = req.body;
  db.run('INSERT INTO usuarios (usuario, senha) VALUES (?, ?)', [usuario, senha], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Usuário já existe ou erro no cadastro.' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Rota de login
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  db.get('SELECT * FROM usuarios WHERE usuario = ? AND senha = ?', [usuario, senha], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro no login.' });
    }
    if (row) {
      res.json({ success: true, usuario: row.usuario, redirect: 'https://www.instagram.com/' });
    } else {
      res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
