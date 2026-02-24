const fs = require('fs');
const path = require('path');

const clubesPath = path.join(__dirname, '../data/clubes.json');
const investimentosPath = path.join(__dirname, '../data/investimentos.json');

// Funções auxiliares
function salvarJSON(caminho, dados) {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf-8');
}

function lerJSON(caminho) {
  if (!fs.existsSync(caminho)) return [];
  return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
}

function buscarClubePorId(id) {
  const clubes = lerJSON(clubesPath);
  // Converta ambos para número para garantir comparação correta
  const idNum = Number(id);
  return clubes.find(c => Number(c.id) === idNum);
}

function atualizarClube(clubeAtualizado) {
  const clubes = lerJSON(clubesPath);
  const index = clubes.findIndex(c => String(c.id) === String(clubeAtualizado.id));
  if (index !== -1) {
    clubes[index] = clubeAtualizado;
    salvarJSON(clubesPath, clubes);
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

    const preco = clube.preco;

    if (clube.cotasDisponiveis < quantidade) {
      return res.status(400).json({ erro: 'Cotas insuficientes no IPO.' });
    }

    clube.cotasDisponiveis -= quantidade;
    atualizarClube(clube);

    const usuariosPath = path.join(__dirname, '../data/usuarios.json');
    const usuarios = lerJSON(usuariosPath);
    const usuarioIndex = usuarios.findIndex(u => String(u.id) === String(usuarioId));
    if (usuarioIndex === -1) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const total = quantidade * preco;
    usuarios[usuarioIndex].saldo = (usuarios[usuarioIndex].saldo || 0) - total;
    salvarJSON(usuariosPath, usuarios);
    
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
    
    salvarJSON(usuariosPath, usuarios);

    const investimentos = lerJSON(investimentosPath);
    investimentos.push({
      id: Date.now(),
      usuarioId,
      clubeId: clube.id,
      quantidade,
      precoUnitario: preco,
      tipo: 'IPO',
      data: new Date().toISOString()
    });
    salvarJSON(investimentosPath, investimentos);

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

    const investimentos = lerJSON(investimentosPath);
    investimentos.push({
      id: Date.now(),
      usuarioId,
      clubeId,
      quantidade: -Math.abs(quantidade),
      precoUnitario: precoDesejado,
      tipo: 'mercado_secundario',
      data: new Date().toISOString()
    });

    salvarJSON(investimentosPath, investimentos);

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
