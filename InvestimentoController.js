const { readJson, writeJson } = require('../dataPaths');

const CLUBES_FILE = 'clubes.json';
const INVESTIMENTOS_FILE = 'investimentos.json';
const USUARIOS_FILE = 'usuarios.json';

// Funções auxiliares
function salvarJSON(fileName, dados) {
  writeJson(fileName, dados);
}

function lerJSON(fileName) {
  return readJson(fileName, []);
}

function buscarClubePorId(id) {
  const clubes = lerJSON(CLUBES_FILE);
  // Converta ambos para número para garantir comparação correta
  const idNum = Number(id);
  return clubes.find(c => Number(c.id) === idNum);
}

function atualizarClube(clubeAtualizado) {
  const clubes = lerJSON(CLUBES_FILE);
  const index = clubes.findIndex(c => String(c.id) === String(clubeAtualizado.id));
  if (index !== -1) {
    clubes[index] = clubeAtualizado;
    salvarJSON(CLUBES_FILE, clubes);
  }
}

async function comprarCota(req, res) {
  try {
    const { clubeId, quantidade, usuarioId } = req.body;

    console.log('BODY RECEBIDO:', req.body);

    if (!clubeId || !quantidade || quantidade <= 0 || !usuarioId) {
      return res.status(400).json({ erro: 'Dados inválidos para compra.' });
    }

    const clube = buscarClubePorId(clubeId);
    if (!clube) {
      return res.status(404).json({ erro: 'Clube não encontrado.' });
    }

    const preco = Number(clube.preco || 0);

    if (Number(clube.ipoEncerrado) || Number(clube.cotasDisponiveis || 0) <= 0) {
      return res.status(400).json({ erro: 'IPO encerrado para este clube.' });
    }

    if (clube.cotasDisponiveis < quantidade) {
      return res.status(400).json({ erro: 'Cotas insuficientes no IPO.' });
    }

    clube.cotasDisponiveis -= quantidade;
    if (Number(clube.cotasDisponiveis) <= 0) {
      clube.cotasDisponiveis = 0;
      clube.ipoEncerrado = true;
      if (!clube.precoAtual) clube.precoAtual = preco;
    }
    atualizarClube(clube);

    const usuarios = lerJSON(USUARIOS_FILE);
    const usuarioIndex = usuarios.findIndex(u => String(u.id) === String(usuarioId));
    if (usuarioIndex === -1) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const total = quantidade * preco;
    if (Number(usuarios[usuarioIndex].saldo || 0) < total) {
      return res.status(400).json({ erro: 'Saldo insuficiente para compra no IPO.' });
    }
    usuarios[usuarioIndex].saldo = Number((usuarios[usuarioIndex].saldo || 0) - total);
    salvarJSON(USUARIOS_FILE, usuarios);
    
    // Atualizar a carteira do usuário
    if (!usuarios[usuarioIndex].carteira) {
    usuarios[usuarioIndex].carteira = [];
    }

    // Verifica se o usuário já possui cotas desse clube
    const cotaExistente = usuarios[usuarioIndex].carteira.find(c => String(c.clubeId) === String(clubeId));

    if (cotaExistente) {
    cotaExistente.quantidade += quantidade;
    cotaExistente.totalInvestido += total;
    } else {
    usuarios[usuarioIndex].carteira.push({
    clubeId: clube.id,
    nomeClube: clube.nome,
    quantidade,
    precoMedio: preco,
    totalInvestido: total
    });
    }
    
    salvarJSON(USUARIOS_FILE, usuarios);

    const investimentos = lerJSON(INVESTIMENTOS_FILE);
    investimentos.push({
      id: Date.now(),
      usuarioId,
      clubeId: clube.id,
      quantidade,
      precoUnitario: preco,
      tipo: 'IPO',
      data: new Date().toISOString()
    });
    salvarJSON(INVESTIMENTOS_FILE, investimentos);

    return res.status(201).json({
      mensagem: 'Compra realizada com sucesso!',
      usuario: usuarios[usuarioIndex]
    });

  } catch (err) {
    console.error('Erro ao comprar cota:', err);
    res.status(500).json({ erro: 'Erro interno ao comprar cota.' });
  }
}


async function venderCota(req, res) {
  try {
    const { clubeId, quantidade, precoDesejado } = req.body;
    const usuarioId = req.usuario?.id;

    if (!clubeId || !quantidade || quantidade <= 0 || !precoDesejado) {
      return res.status(400).json({ erro: 'Dados inválidos para venda.' });
    }

    const investimentos = lerJSON(INVESTIMENTOS_FILE);
    investimentos.push({
      id: Date.now(),
      usuarioId,
      clubeId,
      quantidade: -Math.abs(quantidade),
      precoUnitario: precoDesejado,
      tipo: 'mercado_secundario',
      data: new Date().toISOString()
    });

    salvarJSON(INVESTIMENTOS_FILE, investimentos);

    res.status(201).json({ mensagem: 'Oferta de venda registrada com sucesso!' });
  } catch (err) {
    console.error('Erro ao vender cota:', err);
    res.status(500).json({ erro: 'Erro interno ao vender cota.' });
  }
}

module.exports = {
  comprarCota,
  venderCota
};
