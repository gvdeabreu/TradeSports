const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = Number(process.env.PORT || 4001);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const USUARIOS_PATH = path.join(__dirname, 'usuarios.json');

app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  next();
});
app.use(express.json({ limit: '250kb' }));

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_ORIGIN,
  process.env.PROD_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origem não permitida pelo CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const loginAttempts = new Map();

function loginLimiter(req, res, next) {
  const key = `${req.ip}:${String((req.body || {}).identifier || (req.body || {}).email || (req.body || {}).nomeUsuario || '')}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  const current = loginAttempts.get(key) || [];
  const filtered = current.filter((ts) => now - ts < windowMs);

  if (filtered.length >= maxAttempts) {
    return res.status(429).json({ erro: 'Muitas tentativas de login. Aguarde alguns minutos.' });
  }

  req.recordFailedLogin = () => {
    const arr = loginAttempts.get(key) || [];
    arr.push(Date.now());
    loginAttempts.set(key, arr.filter((ts) => Date.now() - ts < windowMs));
  };

  req.clearFailedLogin = () => loginAttempts.delete(key);

  return next();
}

function lerUsuarios() {
  try {
    if (!fs.existsSync(USUARIOS_PATH)) return [];
    const raw = fs.readFileSync(USUARIOS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function salvarUsuarios(usuarios) {
  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2), 'utf8');
}

function validarValorMonetario(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0;
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ erro: 'Token ausente.' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

app.get('/health', (_, res) => res.status(200).json({ ok: true }));

app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, nomeUsuario, identifier, senha } = req.body || {};
  const loginInput = String(identifier || email || nomeUsuario || '').trim().toLowerCase();
  const senhaInput = String(senha || '');

  if (!loginInput || !senhaInput) {
    return res.status(400).json({ erro: 'Informe usuário/e-mail e senha.' });
  }

  const usuarios = lerUsuarios();
  const usuario = usuarios.find((u) => {
    const emailMatch = String(u.email || '').toLowerCase() === loginInput;
    const nomeMatch = String(u.nomeUsuario || '').toLowerCase() === loginInput;
    return emailMatch || nomeMatch;
  });

  if (!usuario) {
    req.recordFailedLogin();
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  const senhaHash = String(usuario.senha || '');
  const isHash = senhaHash.startsWith('$2a$') || senhaHash.startsWith('$2b$') || senhaHash.startsWith('$2y$');
  const senhaOk = isHash ? await bcrypt.compare(senhaInput, senhaHash) : senhaInput === senhaHash;

  if (!senhaOk) {
    req.recordFailedLogin();
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  req.clearFailedLogin();

  const token = jwt.sign(
    { sub: usuario.id || usuario.email || usuario.nomeUsuario, email: usuario.email, nomeUsuario: usuario.nomeUsuario },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );

  return res.status(200).json({ token, expiresIn: TOKEN_EXPIRES_IN });
});

app.get('/api/protected', auth, (req, res) => {
  res.status(200).json({ ok: true, user: req.user });
});

app.post('/api/deposito', auth, (req, res) => {
  const { valor } = req.body || {};
  if (!validarValorMonetario(valor)) return res.status(400).json({ erro: 'Valor de depósito inválido.' });

  const usuarios = lerUsuarios();
  const idx = usuarios.findIndex((u) => (u.id || u.email) === (req.user.sub || req.user.email));
  if (idx < 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  usuarios[idx].saldo = Number(usuarios[idx].saldo || 0) + valor;
  salvarUsuarios(usuarios);
  return res.status(200).json({ saldo: usuarios[idx].saldo });
});

app.post('/api/saque', auth, (req, res) => {
  const { valor } = req.body || {};
  if (!validarValorMonetario(valor)) return res.status(400).json({ erro: 'Valor de saque inválido.' });

  const usuarios = lerUsuarios();
  const idx = usuarios.findIndex((u) => (u.id || u.email) === (req.user.sub || req.user.email));
  if (idx < 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const saldo = Number(usuarios[idx].saldo || 0);
  if (valor > saldo) return res.status(400).json({ erro: 'Saldo insuficiente.' });

  usuarios[idx].saldo = saldo - valor;
  salvarUsuarios(usuarios);
  return res.status(200).json({ saldo: usuarios[idx].saldo });
});

app.post('/api/ordens', auth, (req, res) => {
  const { clubeId, tipo, quantidade, preco } = req.body || {};

  if (!clubeId || !['compra', 'venda'].includes(tipo)) {
    return res.status(400).json({ erro: 'Dados da ordem inválidos.' });
  }

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: 'Quantidade inválida.' });
  }

  if (!validarValorMonetario(preco)) {
    return res.status(400).json({ erro: 'Preço inválido.' });
  }

  return res.status(201).json({ ok: true, ordem: { clubeId, tipo, quantidade, preco } });
});

app.use((err, _req, res, _next) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(403).json({ erro: err.message });
  }
  return res.status(500).json({ erro: 'Erro interno.' });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
