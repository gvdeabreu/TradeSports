// routes/clube.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Mantém o fluxo de IPO já existente
let comprarCota;
try {
  ({ comprarCota } = require('../controllers/InvestimentoController'));
} catch (e) {
  // Se o controller não existir nesse ambiente, não quebrar o require do router.
  comprarCota = null;
}

const clubesPath = path.join(__dirname, '../data/clubes.json');
const investimentosPath = path.join(__dirname, '../data/investimentos.json');

function lerJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

function toMs(d) {
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : null;
}

function rangeToMs(range) {
  const r = String(range || '').toUpperCase();
  if (r === '24H') return 24 * 60 * 60 * 1000;
  if (r === '7D') return 7 * 24 * 60 * 60 * 1000;
  if (r === '1M') return 30 * 24 * 60 * 60 * 1000;
  if (r === '3M') return 90 * 24 * 60 * 60 * 1000;
  if (r === 'ALL' || r === 'TUDO' || r === 'TEMPORADA') return null;
  return 7 * 24 * 60 * 60 * 1000;
}

function normalizarPontos(trades, fallbackPreco) {
  // trades: [{ts, price}]
  if (!trades.length) {
    const now = Date.now();
    return [{ ts: now, price: Number(fallbackPreco || 0) }];
  }
  return trades;
}

// POST /clube/:id/comprar  (IPO)
router.post('/:id/comprar', (req, res) => {
  if (!comprarCota) {
    return res.status(500).json({ erro: 'Controller de IPO não encontrado.' });
  }
  req.body.clubeId = req.params.id;
  return comprarCota(req, res);
});

// GET /clube/clubes   (lista, com filtro ?id=)
router.get('/clubes', (req, res) => {
  try {
    let clubes = lerJSON(clubesPath, []);
    if (req.query.id) {
      const id = Number(req.query.id);
      clubes = clubes.filter(c => Number(c.id) === id);
    }
    return res.json(clubes);
  } catch (error) {
    console.error('Erro ao ler clubes:', error);
    return res.status(500).json({ erro: 'Erro ao carregar clubes.' });
  }
});

// GET /clube/:id  (detalhes do clube)
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const clubes = lerJSON(clubesPath, []);
  const clube = clubes.find(c => Number(c.id) === id);
  if (!clube) return res.status(404).json({ erro: 'Clube não encontrado.' });
  return res.json(clube);
});

/**
 * GET /clube/:id/historico-precos?range=24H|7D|1M|3M|ALL
 * Retorna pontos (linha por operação) do mercado secundário (tipo COMPRA),
 * e métricas do período para exibição na página do clube.
 */
router.get('/:id/historico-precos', (req, res) => {
  const clubeId = Number(req.params.id);
  const range = req.query.range || '7D';
  const durMs = rangeToMs(range);

  const clubes = lerJSON(clubesPath, []);
  const clube = clubes.find(c => Number(c.id) === clubeId);
  if (!clube) return res.status(404).json({ erro: 'Clube não encontrado.' });

  const investimentos = lerJSON(investimentosPath, []);

  // Mercado secundário: usamos COMPRA como “trade canônico” (evita duplicar por ter VENDA espelhada)
  const tradesAll = investimentos
    .filter(t => Number(t.clubeId) === clubeId && String(t.tipo).toUpperCase() === 'COMPRA')
    .map(t => ({
      ts: toMs(t.data) ?? Date.now(),
      price: Number(t.valorUnitario ?? t.preco ?? 0),
      qtd: Number(t.quantidade ?? 0),
    }))
    .filter(t => Number.isFinite(t.price) && t.price > 0)
    .sort((a, b) => a.ts - b.ts);

  const now = Date.now();
  const startTs = durMs == null ? (tradesAll[0]?.ts ?? now) : (now - durMs);

  const trades = tradesAll.filter(t => t.ts >= startTs);

  const fallbackPreco = (clube.precoAtual != null ? Number(clube.precoAtual) : Number(clube.preco || 0));

  const pts = normalizarPontos(trades.map(t => ({ ts: t.ts, price: t.price })), fallbackPreco);

  const first = pts[0]?.price ?? fallbackPreco;
  const last = pts[pts.length - 1]?.price ?? fallbackPreco;

  const variacaoAbs = last - first;
  const variacaoPct = first > 0 ? (variacaoAbs / first) * 100 : 0;

  const max = pts.reduce((acc, p) => Math.max(acc, p.price), -Infinity);
  const min = pts.reduce((acc, p) => Math.min(acc, p.price), Infinity);

  // volume (somatório de quantidade) no período
  const volume = trades.reduce((acc, t) => acc + (Number(t.qtd) || 0), 0);
  const tradesCount = trades.length;

  return res.json({
    ok: true,
    clubeId,
    range: String(range).toUpperCase(),
    ipoLiquidacao: Number(clube.preco || 0),          // estático
    precoMercado: Number(clube.precoAtual ?? clube.preco ?? 0),
    pontos: pts,
    resumo: {
      first,
      last,
      variacaoAbs,
      variacaoPct,
      max: Number.isFinite(max) ? max : last,
      min: Number.isFinite(min) ? min : last,
      volume,
      tradesCount,
      desde: new Date(startTs).toISOString(),
      ate: new Date(now).toISOString(),
    },
  });
});

module.exports = router;
