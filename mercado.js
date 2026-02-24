// routes/mercado.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const auth = require('../middleware/auth');

const ordensPath        = path.join(__dirname, '../data/ordens.json');
const clubesPath        = path.join(__dirname, '../data/clubes.json');
const usuariosPath      = path.join(__dirname, '../data/usuarios.json');
const investimentosPath = path.join(__dirname, '../data/investimentos.json');

function lerJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return [];
  }
}

function salvarJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

// checa se o IPO terminou para esse clube
function ipoEncerrado(clubeId) {
  const clubes = lerJSON(clubesPath);
  const clube  = clubes.find(c => String(c.id) === String(clubeId));
  return !!(clube && (clube.ipoEncerrado || Number(clube.cotasDisponiveis) === 0));
}

// ---------------------------------------------------------------------
// GET /mercado/livro?clubeId=123  -> book de compras/vendas
// ---------------------------------------------------------------------
router.get('/livro', auth, (req, res) => {
  const { clubeId } = req.query;
  if (!clubeId) return res.status(400).json({ erro: 'clubeId é obrigatório' });

  const ordens = lerJSON(ordensPath);

  const compras = ordens
    .filter(o => String(o.clubeId) === String(clubeId) && o.tipo === 'compra' && o.restante > 0)
    .sort((a, b) => b.preco - a.preco || a.criadoEm - b.criadoEm);

  const vendas = ordens
    .filter(o => String(o.clubeId) === String(clubeId) && o.tipo === 'venda' && o.restante > 0)
    .sort((a, b) => a.preco - b.preco || a.criadoEm - b.criadoEm);

  return res.json({ compras, vendas });
});

// ---------------------------------------------------------------------
// GET /mercado/ofertas?clubeId=123  -> apenas ofertas de venda (legado)
// ---------------------------------------------------------------------
router.get('/ofertas', auth, (req, res) => {
  const { clubeId } = req.query;
  if (!clubeId) return res.status(400).json({ erro: 'clubeId é obrigatório' });

  const ordens = lerJSON(ordensPath)
    .filter(o => String(o.clubeId) === String(clubeId) && o.tipo === 'venda' && o.restante > 0)
    .sort((a, b) => a.preco - b.preco || a.criadoEm - b.criadoEm);

  return res.json(ordens);
});

// ---------------------------------------------------------------------
// POST /mercado/ordem { tipo, clubeId, quantidade, preco }
// Cria ordem E já tenta casar com o book oposto
// ---------------------------------------------------------------------
router.post('/ordem', auth, (req, res) => {
  const { tipo, clubeId, quantidade, preco } = req.body;
  const usuario = req.usuario;

  if (!ipoEncerrado(clubeId)) {
    return res.status(400).json({ erro: 'Mercado secundário indisponível enquanto o IPO não terminou.' });
  }

  if (!['compra', 'venda'].includes(tipo)) {
    return res.status(400).json({ erro: 'tipo inválido' });
  }

  const qtd = Number(quantidade);
  const p   = Number(preco);

  if (!qtd || qtd <= 0 || !p || p <= 0) {
    return res.status(400).json({ erro: 'quantidade/preço inválidos' });
  }

  const usuarios = lerJSON(usuariosPath);
  const idxUsuario = usuarios.findIndex(u => String(u.id) === String(usuario.id));

  if (idxUsuario < 0) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  if (tipo === 'venda') {
    const ativo = (usuarios[idxUsuario].carteira || []).find(a => String(a.clubeId) === String(clubeId));
    if (!ativo || ativo.quantidade < qtd) {
      return res.status(400).json({ erro: 'Quantidade insuficiente para vender' });
    }
  } else {
    const total = p * qtd;
    if (Number(usuarios[idxUsuario].saldo || 0) < total) {
      return res.status(400).json({ erro: 'Saldo insuficiente para comprar' });
    }
  }

  const agora = Date.now();
  const novaOrdem = {
    id: `${agora}-${Math.random().toString(36).slice(2)}`,
    usuarioId: usuario.id,
    tipo,
    clubeId: Number(clubeId),
    preco: p,
    quantidade: qtd,
    restante: qtd,
    criadoEm: agora,
  };

  const ordens = lerJSON(ordensPath);
  ordens.push(novaOrdem);

  // ------------------------ MATCHING / EXECUÇÃO ----------------------
  function casar() {
    const oposto = tipo === 'compra' ? 'venda' : 'compra';
    let houveNegocio = false;
    let ultimoPrecoNegociado = null;

    const investimentos = lerJSON(investimentosPath);
    const clubes = lerJSON(clubesPath);
    const clubeInfo = clubes.find(c => String(c.id) === String(clubeId));
    const clubeNome = clubeInfo?.nome || '';

    const bookOposto = ordens
      .filter(o => o.tipo === oposto && String(o.clubeId) === String(clubeId) && o.restante > 0)
      .sort((a, b) =>
        oposto === 'venda'
          ? a.preco - b.preco || a.criadoEm - b.criadoEm
          : b.preco - a.preco || a.criadoEm - b.criadoEm
      );

    for (const o of bookOposto) {
      if (novaOrdem.restante <= 0) break;

      const condOK =
        tipo === 'compra'
          ? novaOrdem.preco >= o.preco
          : novaOrdem.preco <= o.preco;

      if (!condOK) break;

      const exec = Math.min(novaOrdem.restante, o.restante);
      if (exec <= 0) continue;

      const users = lerJSON(usuariosPath);

      const buyerId  = tipo === 'compra' ? usuario.id : o.usuarioId;
      const sellerId = tipo === 'venda' ? usuario.id : o.usuarioId;

      const buyerIx  = users.findIndex(u => String(u.id) === String(buyerId));
      const sellerIx = users.findIndex(u => String(u.id) === String(sellerId));

      if (buyerIx < 0 || sellerIx < 0) continue;

      const price = o.preco; // preço da ordem passiva
      const total = price * exec;

      // --- BUYER: saldo -, carteira + ---
      users[buyerIx].saldo = Number(users[buyerIx].saldo || 0) - total;
      if (!Array.isArray(users[buyerIx].carteira)) users[buyerIx].carteira = [];

      const posBuy = users[buyerIx].carteira.find(a => String(a.clubeId) === String(clubeId));
      if (posBuy) {
        const novoTotalInv = Number(posBuy.totalInvestido || 0) + total;
        const novaQtd      = Number(posBuy.quantidade || 0) + exec;
        posBuy.quantidade     = novaQtd;
        posBuy.totalInvestido = novoTotalInv;
        posBuy.precoMedio     = novoTotalInv / novaQtd;
      } else {
        users[buyerIx].carteira.push({
          clubeId: Number(clubeId),
          nomeClube: clubeNome,
          quantidade: exec,
          precoMedio: price,
          totalInvestido: total,
        });
      }

      // --- SELLER: saldo +, carteira - ---
      users[sellerIx].saldo = Number(users[sellerIx].saldo || 0) + total;
      if (!Array.isArray(users[sellerIx].carteira)) users[sellerIx].carteira = [];
      const posSell = users[sellerIx].carteira.find(a => String(a.clubeId) === String(clubeId));
      if (posSell) {
        posSell.quantidade = Number(posSell.quantidade || 0) - exec;
        if (posSell.quantidade <= 0) {
          users[sellerIx].carteira = users[sellerIx].carteira.filter(
            a => String(a.clubeId) !== String(clubeId)
          );
        } else {
          const novoTotalInvSell = posSell.precoMedio * posSell.quantidade;
          posSell.totalInvestido = novoTotalInvSell;
        }
      }

      salvarJSON(usuariosPath, users);

      // atualiza ordens
      novaOrdem.restante -= exec;
      o.restante -= exec;
      houveNegocio = true;
      ultimoPrecoNegociado = price;

      // --- Histórico para comprador e vendedor ---
      const dataIso = new Date().toISOString();

      investimentos.push(
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          usuarioId: buyerId,
          tipo: 'COMPRA',
          clubeId: Number(clubeId),
          clubeNome,
          quantidade: exec,
          valorUnitario: price,
          totalPago: total,
          data: dataIso,
        },
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          usuarioId: sellerId,
          tipo: 'VENDA',
          clubeId: Number(clubeId),
          clubeNome,
          quantidade: exec,
          valorUnitario: price,
          totalPago: total,
          data: dataIso,
        }
      );

      salvarJSON(ordensPath, ordens);
    }

    if (houveNegocio) {
      // grava histórico
      salvarJSON(investimentosPath, investimentos);

      // atualiza preço de mercado (precoAtual) no clubes.json
      if (ultimoPrecoNegociado != null && clubeInfo) {
        const clubesAtual = lerJSON(clubesPath);
        const idxClube = clubesAtual.findIndex(c => String(c.id) === String(clubeId));
        if (idxClube >= 0) {
          clubesAtual[idxClube].precoAtual = ultimoPrecoNegociado;
          salvarJSON(clubesPath, clubesAtual);
        }
      }
    }

    return houveNegocio;
  }

  casar();
  salvarJSON(ordensPath, ordens);

  return res.json({ ok: true, ordem: novaOrdem });
});

// ---------------------------------------------------------------------
// POST /mercado/ordem/cancelar
// ---------------------------------------------------------------------
router.post('/ordem/cancelar', auth, (req, res) => {
  try {
    const { ordemId } = req.body;
    if (!ordemId) {
      return res.status(400).json({ erro: 'ordemId é obrigatório.' });
    }

    const ordens = lerJSON(ordensPath);
    const index = ordens.findIndex(o => o.id === ordemId);

    if (index === -1) {
      return res.status(404).json({ erro: 'Ordem não encontrada.' });
    }

    const ordem = ordens[index];
    if (ordem.restante <= 0) {
      return res.status(400).json({ erro: 'Não é possível cancelar uma ordem já executada.' });
    }

    ordens[index] = {
      ...ordem,
      restante: 0,
      status: 'cancelada',
      canceladaEm: Date.now(),
    };

    salvarJSON(ordensPath, ordens);
    return res.json(ordens[index]);
  } catch (err) {
    console.error('Erro ao cancelar ordem:', err);
    return res.status(500).json({ erro: 'Erro interno ao cancelar ordem.' });
  }
});

// ---------------------------------------------------------------------
// GET /mercado/minhas-ordens
// ---------------------------------------------------------------------
router.get('/minhas-ordens', auth, (req, res) => {
  const uid = String(req.usuario.id);
  const ordens = lerJSON(ordensPath)
    .filter(o => String(o.usuarioId) === uid && o.restante > 0)
    .sort((a, b) => b.criadoEm - a.criadoEm);

  return res.json(ordens);
});


// GET /mercado/historico-precos/:clubeId
// Retorna série (por operação) de preços negociados do clube, baseada em investimentos.json
router.get('/historico-precos/:clubeId', (req, res) => {
  try {
    const clubeId = Number(req.params.clubeId);
    if (!clubeId) return res.status(400).json({ error: 'clubeId inválido' });

    const investimentos = lerJSON(investimentosPath, []);
    const serie = investimentos
      .filter((t) => Number(t.clubeId) === clubeId)
      .filter((t) => {
        const tipo = String(t.tipo || '').toUpperCase();
        // Mantém trades e IPO como pontos de preço; exclui liquidação/ajustes financeiros
        return ['IPO', 'COMPRA', 'VENDA'].includes(tipo);
      })
      .map((t) => ({
        ts: new Date(t.data).getTime(),
        preco: Number(t.precoUnitario || 0),
      }))
      .filter((p) => Number.isFinite(p.ts) && p.ts > 0 && Number.isFinite(p.preco))
      .sort((a, b) => a.ts - b.ts);

    return res.json({ clubeId, serie });
  } catch (e) {
    console.error('Erro ao montar histórico de preços:', e);
    return res.status(500).json({ error: 'Erro ao montar histórico de preços' });
  }
});


module.exports = router;

