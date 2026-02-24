const express = require('express');
const fs = require('fs');
const router = express.Router();
const auth = require('../middleware/auth');

const { getDataFilePath } = require('./dataPaths');

const ordensPath = getDataFilePath('ordens.json');

// Função para ler o arquivo de ordens
function lerOrdens() {
  try {
    const data = fs.readFileSync(ordensPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[ERRO LEITURA ORDENS]', err);
    return [];
  }
}

router.get('/:clubeId', (req, res) => {
  try {
    const { clubeId } = req.params;
    const todasOrdens = lerOrdens();

    const ordensCompra = todasOrdens
      .filter(ordem => ordem.clubeId === clubeId && ordem.tipo === 'compra')
      .sort((a, b) => b.preco - a.preco);

    const ordensVenda = todasOrdens
      .filter(ordem => ordem.clubeId === clubeId && ordem.tipo === 'venda')
      .sort((a, b) => a.preco - b.preco);

    res.json({ compras: ordensCompra, vendas: ordensVenda });
  } catch (err) {
    console.error('[ERRO ORDENS]', err);
    res.status(500).json({ erro: 'Erro interno ao buscar ordens.' });
  }
});

router.post('/:id/cancelar', (req, res) => {
  try {
    const ordemId = req.params.id; // **NÃO** usar Number/parseInt
    let ordens = carregarOrdens();

    const index = ordens.findIndex((o) => o.id === ordemId);

    if (index === -1) {
      return res.status(404).json({ erro: 'Ordem não encontrada.' });
    }

    const ordem = ordens[index];

    // Não permitir cancelar ordens já totalmente executadas
    if (ordem.restante <= 0) {
      return res
        .status(400)
        .json({ erro: 'Não é possível cancelar uma ordem já executada.' });
    }

    // "Cancelar" = zerar o restante e marcar como cancelada (se quiser)
    ordens[index] = {
      ...ordem,
      restante: 0,
      canceladaEm: Date.now(),
      status: 'cancelada', // opcional, mas ajuda no frontend
    };

    salvarOrdens(ordens);

    return res.json(ordens[index]);
  } catch (err) {
    console.error('Erro ao cancelar ordem:', err);
    return res.status(500).json({ erro: 'Erro interno ao cancelar ordem.' });
  }
});
module.exports = router;

