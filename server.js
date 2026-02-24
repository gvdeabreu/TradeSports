// server.js (Camada 1 - Segurança)
// Mantém sua arquitetura com rotas em /routes e /routes/api
require('dotenv').config();
require('./LoadEnv');

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');

const { checkLiquidacao } = require('./middleware/checkLiquidacao');
const auth = require('./middleware/auth');

const { lerUsuarios, salvarUsuarios } = require('./utils/usuarioService');
const { enviarEmailVerificacao, enviarEmailResetSenha } = require('./utils/emailService');

const adminRoutes = require('./routes/api/admin');
const loginRoute = require('./routes/api/login');

const clubeRoutes = require('./routes/clube');
const investimentoRoutes = require('./routes/investimento');
const mercadoRoutes = require('./routes/mercado');
const usuarioRoutes = require('./routes/usuario');
const ordemRoutes = require('./routes/ordens');
const classificacaoRoutes = require('./routes/classificacao');

require('./models/Clube');
require('./models/Usuario');
require('./models/Top4Rodada');

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 4001;

// =====================================================
// CAMADA 1 — SEGURANÇA (middlewares globais)
// =====================================================

// Em produção, atrás de proxy (Vercel/Render/Nginx), isso ajuda IP correto no rate-limit
app.set('trust proxy', 1);

// Helmet (hardening de headers)
let helmet;
try {
  helmet = require('helmet');
  app.use(
    helmet({
      contentSecurityPolicy: false, // evita quebrar Next/arquivos locais; ajuste depois se quiser
      crossOriginEmbedderPolicy: false,
    })
  );
} catch (e) {
  console.warn('[SEGURANCA] helmet não instalado. (ok em dev) Instale: npm i helmet');
}

// Rate limit (anti brute force / spam)
let rateLimit;
try {
  rateLimit = require('express-rate-limit');

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 900,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: 'Muitas requisições. Tente novamente em alguns minutos.' },
  });

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
  });

  const cadastroLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 12,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: 'Muitos cadastros/tentativas. Aguarde e tente novamente.' },
  });

  const resetLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 12,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: 'Muitas solicitações. Aguarde e tente novamente.' },
  });

  app.use(globalLimiter);
  app.use('/api/login', loginLimiter);
  app.use('/cadastro', cadastroLimiter);
  app.use('/esqueci-senha', resetLimiter);
  app.use('/resetar-senha', resetLimiter);
} catch (e) {
  console.warn('[SEGURANCA] express-rate-limit não instalado. (ok em dev) Instale: npm i express-rate-limit');
}

// Body limit para evitar payload gigante
app.use(express.json({ limit: '250kb' }));

// Sanitização simples: bloqueia chaves perigosas (anti prototype pollution / injection)
app.use((req, res, next) => {
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const hasBadKeys = (obj) => {
    if (!isObj(obj)) return false;
    for (const k of Object.keys(obj)) {
      if (k === '_proto_' || k === 'constructor' || k === 'prototype') return true;
      if (k.includes('_proto_') || k.includes('constructor') || k.includes('prototype')) return true;
      if (k.startsWith('$') || k.includes('.')) return true; // anti mongo-like injection
      if (hasBadKeys(obj[k])) return true;
    }
    return false;
  };
  if (hasBadKeys(req.body)) {
    return res.status(400).json({ erro: 'Payload inválido.' });
  }
  next();
});

// CORS (mantenha o origin do seu frontend)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// =====================================================
// Middleware de checagem de liquidação (já existia)
// =====================================================
app.use(checkLiquidacao);

// =====================================================
// Rotas (mantém seu padrão /routes e /routes/api)
// =====================================================
app.use('/api/admin', adminRoutes);
app.use('/api/login', loginRoute);
app.use('/api', classificacaoRoutes);

app.use('/clube', clubeRoutes);
app.use('/investimentos', investimentoRoutes);
app.use('/mercado', mercadoRoutes);
app.use('/ordens', ordemRoutes);
app.use('/usuario', usuarioRoutes);

// =====================================================
// [EMAIL] CADASTRO COM TOKEN DE VERIFICAÇÃO
// =====================================================
app.post('/cadastro', async (req, res) => {
  try {
    const {
      nome,
      sobrenome,
      email,
      cpf,
      dataNascimento,
      genero,
      nomeUsuario,
      senha,
      aceitouTermos,
      versaoTermos,
      aceites, // opcional (frontend pode mandar)
    } = req.body || {};

    // validações mínimas
    if (!nome || !sobrenome || !email || !cpf || !dataNascimento || !nomeUsuario || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    }

    // Termos de Uso (obrigatório)
    if (aceitouTermos !== true) {
      return res.status(400).json({ erro: 'Você precisa aceitar os Termos de Uso para concluir o cadastro.' });
    }

    // senha minimamente forte (Camada 1)
    const senhaStr = String(senha);
    const senhaForte =
      senhaStr.length >= 8 &&
      /[a-z]/.test(senhaStr) &&
      /[A-Z]/.test(senhaStr) &&
      /\d/.test(senhaStr);

    if (!senhaForte) {
      return res.status(400).json({
        erro: 'A senha deve ter pelo menos 8 caracteres, com letra maiúscula, minúscula e número.',
      });
    }

    let usuarios = lerUsuarios();

    const emailJaExiste = usuarios.some((u) => u.email?.toLowerCase() === String(email).toLowerCase());
    if (emailJaExiste) return res.status(400).json({ erro: 'E-mail já cadastrado.' });

    const usuarioJaExiste = usuarios.some(
      (u) => u.nomeUsuario?.toLowerCase() === String(nomeUsuario).toLowerCase()
    );
    if (usuarioJaExiste) return res.status(400).json({ erro: 'Nome de usuário já em uso.' });

    const hashSenha = await bcrypt.hash(senhaStr, 10);
    const tokenVerificacao = crypto.randomBytes(32).toString('hex');

    const nowIso = new Date().toISOString();
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip;
    const userAgent = req.headers['user-agent'] || '';

    // Aceites no cadastro (Termos obrigatórios; demais opcionais)
    const aceitesCadastro = typeof aceites === 'object' && aceites ? aceites : {};
    aceitesCadastro.termosUso = aceitesCadastro.termosUso || {
      versao: versaoTermos || 'v1-beta',
      aceitoEm: nowIso,
      ip,
      userAgent,
    };

    const novoUsuario = {
      id: Date.now().toString(),
      nome,
      sobrenome,
      email,
      cpf,
      dataNascimento,
      genero,
      nomeUsuario,
      senha: hashSenha,
      saldo: 0,

      // histórico/carteira (mantém seus campos)
      carteira: [],
      historico: [],
      transacoes: [],

      // Aceites centralizados
      aceites: aceitesCadastro,

      // Termos (campos legados, se seu frontend usa)
      aceitouTermos: true,
      aceitouTermosEm: nowIso,
      versaoTermosAceita: versaoTermos || 'v1-beta',

      // verificação de e-mail
      emailVerificado: false,
      tokenVerificacao,
    };

    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    await enviarEmailVerificacao(email, tokenVerificacao);

    return res.status(201).json({
      mensagem:
        'Cadastro realizado com sucesso! Enviamos um e-mail com o link para confirmar seu cadastro.',
    });
  } catch (err) {
    console.error('[CADASTRO] Erro no cadastro:', err);
    return res.status(500).json({ erro: 'Erro interno ao realizar cadastro.' });
  }
});

// =====================================================
// [EMAIL] VERIFICAÇÃO DE E-MAIL VIA TOKEN
// =====================================================
app.get('/verificar-email', (req, res) => {
  try {
    const { token } = req.query || {};
    if (!token) return res.status(400).json({ erro: 'Token de verificação não informado.' });

    const usuarios = lerUsuarios();
    const idx = usuarios.findIndex((u) => u.tokenVerificacao === token);
    if (idx === -1) return res.status(400).json({ erro: 'Token de verificação inválido ou expirado.' });

    usuarios[idx].emailVerificado = true;
    usuarios[idx].tokenVerificacao = null;
    usuarios[idx].emailVerificadoEm = new Date().toISOString();

    salvarUsuarios(usuarios);

    return res.json({ mensagem: 'E-mail verificado com sucesso! Você já pode fazer login.' });
  } catch (err) {
    console.error('[VERIFICAR EMAIL] Erro:', err);
    return res.status(500).json({ erro: 'Erro interno ao verificar e-mail.' });
  }
});

// =====================================================
// ESQUECI MINHA SENHA / RESETAR SENHA
// =====================================================

// 1) Usuário pede reset de senha
app.post('/esqueci-senha', (req, res) => {
  try {
    const { emailOuUsuario } = req.body || {};
    if (!emailOuUsuario) {
      return res.status(400).json({ erro: 'Informe seu e-mail ou nome de usuário.' });
    }

    const usuarios = lerUsuarios();
    const usuarioIndex = usuarios.findIndex(
      (u) =>
        u.email?.toLowerCase() === String(emailOuUsuario).toLowerCase() ||
        u.nomeUsuario?.toLowerCase() === String(emailOuUsuario).toLowerCase()
    );

    // Nunca revela se existe ou não
    if (usuarioIndex === -1) {
      return res.json({
        mensagem: 'Se o usuário existir, enviaremos um e-mail com instruções para redefinir a senha.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const umaHora = 60 * 60 * 1000;

    usuarios[usuarioIndex].resetSenhaToken = token;
    usuarios[usuarioIndex].resetSenhaExpiraEm = Date.now() + umaHora;

    salvarUsuarios(usuarios);

    enviarEmailResetSenha(usuarios[usuarioIndex].email, token)
      .then(() =>
        res.json({
          mensagem: 'Se o usuário existir, enviaremos um e-mail com instruções para redefinir a senha.',
        })
      )
      .catch((err) => {
        console.error('[RESET SENHA] Erro ao enviar e-mail:', err);
        return res.status(500).json({ erro: 'Erro ao enviar e-mail de redefinição.' });
      });
  } catch (err) {
    console.error('[RESET SENHA] Erro no /esqueci-senha:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

// 2) Usuário envia nova senha com token
app.post('/resetar-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body || {};
    if (!token || !novaSenha) {
      return res.status(400).json({ erro: 'Token e nova senha são obrigatórios.' });
    }

    const senhaStr = String(novaSenha);
    const senhaForte =
      senhaStr.length >= 8 && /[a-z]/.test(senhaStr) && /[A-Z]/.test(senhaStr) && /\d/.test(senhaStr);

    if (!senhaForte) {
      return res.status(400).json({
        erro: 'A senha deve ter pelo menos 8 caracteres, com letra maiúscula, minúscula e número.',
      });
    }

    let usuarios = lerUsuarios();
    const agora = Date.now();

    const idx = usuarios.findIndex(
      (u) =>
        u.resetSenhaToken === token &&
        typeof u.resetSenhaExpiraEm === 'number' &&
        u.resetSenhaExpiraEm > agora
    );

    if (idx === -1) {
      return res.status(400).json({
        erro: 'Token inválido ou expirado. Solicite uma nova redefinição de senha.',
      });
    }

    const hash = await bcrypt.hash(senhaStr, 10);

    usuarios[idx].senha = hash;
    usuarios[idx].resetSenhaToken = null;
    usuarios[idx].resetSenhaExpiraEm = null;
    usuarios[idx].senhaAlteradaEm = new Date().toISOString();

    salvarUsuarios(usuarios);

    return res.json({ mensagem: 'Senha alterada com sucesso! Você já pode fazer login.' });
  } catch (err) {
    console.error('[RESET SENHA] Erro no /resetar-senha:', err);
    return res.status(500).json({ erro: 'Erro interno ao redefinir senha.' });
  }
});

// =====================================================
// Endpoint: Saldo (mantém exatamente sua rota existente)
// =====================================================
function autenticarToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ erro: 'Token inválido ou expirado' });
    req.usuario = decoded;
    next();
  });
}

app.get('/usuario/saldo', autenticarToken, (req, res) => {
  const usuarios = lerUsuarios();
  const usuario = usuarios.find((u) => u.id === req.usuario.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json({ saldo: usuario.saldo });
});

app.listen(PORT, () => {
  console.log ('Servidor rodando em http://localhost:${PORT}');
});