// controllers/MercadoSecundarioController.js
const fs = require('fs');
const { getDataFilePath } = require('./dataPaths');

const ordensPath = getDataFilePath('ordens.json');
const usuariosPath = getDataFilePath('usuarios.json');
const investimentosPath = getDataFilePath('investimentos.json');
const clubesPath = getDataFilePath('clubes.json'); // <-- para travar mercado

function lerJSON(p) { return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : []; }
function salvarJSON(p, d) { fs.writeFileSync(p, JSON.stringify(d, null, 2)); }

function getUsuarioById(id) {
  const usuarios = lerJSON(usuariosPath);
  const u = usuarios.find(u => String(u.id) === String(id));
  return [usuarios, u];
}

function registrarInvestimento(entry) {
  const investimentos = lerJSON(investimentosPath);
  investimentos.push({ id: Date.now(), ...entry });
  salvarJSON(investimentosPath, investimentos);
}

function atualizarCarteiraAposVenda(usuario, clubeId, qtd, preco) {
  const ativo = usuario.carteira.find(a => String(a.clubeId) === String(clubeId));
  if (!ativo) return;

  ativo.quantidade -= qtd;
  ativo.totalInvestido = Number((ativo.precoMedio * ativo.quantidade).toFixed(2));

  // remove ativo zerado
  if (ativo.quantidade <= 0) {
    usuario.carteira = usuario.carteira.filter(a => String(a.clubeId) !== String(clubeId));
  }
  // saldo credita
  usuario.saldo = Number((Number(usuario.saldo) + (qtd * preco)).toFixed(2));
}

function atualizarCarteiraAposCompra(usuario, clubeId, qtd, preco) {
  let ativo = usuario.carteira.find(a => String(a.clubeId) === String(clubeId));
  if (!ativo) {
    ativo = { clubeId, nomeClube: '', quantidade: 0, precoMedio: 0, totalInvestido: 0 };
    usuario.carteira.push(ativo);
  }
  const novoTotal = ativo.totalInvestido + (qtd * preco);
  const novaQtd = ativo.quantidade + qtd;
  ativo.precoMedio = Number((novoTotal / novaQtd).toFixed(2));
  ativo.quantidade = novaQtd;
  ativo.totalInvestido = Number(novoTotal.toFixed(2));

  // saldo debita
  usuario.saldo = Number((Number(usuario.saldo) - (qtd * preco)).toFixed(2));
}

function ordenarLivro(ordens, tipo) {
  // venda: menor preço primeiro; compra: maior preço primeiro
  return ordens
    .filter(o => o.tipo === tipo)
    .sort((a, b) => {
      if (tipo === 'venda') return a.preco - b.preco || a.criadoEm - b.criadoEm;
      return b.preco - a.preco || a.criadoEm - b.criadoEm;
    });
}

function mercadoAtivoPara(clubeId) {
  const clubes = lerJSON(clubesPath);
  const c = clubes.find(c => String(c.id) === String(clubeId));
  if (!c) return false;
  // Só libera se não houver mais cotas no IPO:
  return Number(c.cotasDisponiveis) === 0;
}

async function criarOuCasarOrdem(req, res) {
  try {
    const { tipo, clubeId, quantidade, preco } = req.body;
    const usuarioId = req.usuario.id;
    if (!mercadoAtivoPara(clubeId)) {
      return res.status(400).json({ erro: 'Mercado secundário ainda não está ativo para este clube (IPO não zerou).' });
    }
    if (!['compra','venda'].includes(tipo)) return res.status(400).json({ erro: 'Tipo inválido' });
    if (!clubeId || !quantidade || !preco) return res.status(400).json({ erro: 'Dados incompletos' });

    const ordens = lerJSON(ordensPath);
    const [usuarios, user] = getUsuarioById(usuarioId);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });

    // validações básicas
    if (tipo === 'venda') {
      const ativo = user.carteira.find(a => String(a.clubeId) === String(clubeId));
      if (!ativo || ativo.quantidade < quantidade) {
        return res.status(400).json({ erro: 'Quantidade indisponível para venda' });
      }
    } else { // compra
      const custo = quantidade * preco;
      if (Number(user.saldo) < custo) return res.status(400).json({ erro: 'Saldo insuficiente' });
    }

    const novaOrdem = {
      id: Date.now(),
      usuarioId,
      tipo, // 'compra' | 'venda'
      clubeId: Number(clubeId),
      quantidade: Number(quantidade),
      preco: Number(preco),
      criadoEm: Date.now(),
      aberto: true
    };

    // matching simples
    let restante = novaOrdem.quantidade;

    const contraparteTipo = tipo === 'venda' ? 'compra' : 'venda';
    const livro = ordenarLivro(ordens, contraparteTipo);

    for (const cp of livro) {
      if (!cp.aberto || String(cp.clubeId) !== String(clubeId)) continue;

      // regra de preço: compra >= venda
      const atendePreco = tipo === 'venda' ? (cp.preco >= novaOrdem.preco) : (cp.preco <= novaOrdem.preco);
      if (!atendePreco) continue;

      const tradeQtd = Math.min(restante, cp.quantidade);
      const tradePreco = cp.preco; // usa preço da contraparte (time/price priority)

      // atualiza usuários
      const [usuariosAll, vendedor] = getUsuarioById(tipo === 'venda' ? usuarioId : cp.usuarioId);
      const [usuariosAll2, comprador] = getUsuarioById(tipo === 'venda' ? cp.usuarioId : usuarioId);

      // vendedor sai de carteira, recebe saldo
      atualizarCarteiraAposVenda(vendedor, clubeId, tradeQtd, tradePreco);
      // comprador entra na carteira, paga saldo
      atualizarCarteiraAposCompra(comprador, clubeId, tradeQtd, tradePreco);

      // persiste usuários
      salvarJSON(usuariosPath, usuariosAll); // vendedores
      salvarJSON(usuariosPath, usuariosAll2); // compradores (mesmo arquivo, mas garantimos última gravação)

      // registra operações (auditoria)
      registrarInvestimento({
        usuarioId: vendedor.id, clubeId, quantidade: tradeQtd,
        precoUnitario: tradePreco, tipo: 'VENDA', data: new Date().toISOString()
      });
      registrarInvestimento({
        usuarioId: comprador.id, clubeId, quantidade: tradeQtd,
        precoUnitario: tradePreco, tipo: 'COMPRA', data: new Date().toISOString()
      });

      // atualiza ordens
      cp.quantidade -= tradeQtd;
      if (cp.quantidade <= 0) cp.aberto = false;
      restante -= tradeQtd;

      if (restante <= 0) break;
    }

    // se sobrou quantidade, entra no livro
    if (restante > 0) {
      novaOrdem.quantidade = restante;
      ordens.push(novaOrdem);
    }

    salvarJSON(ordensPath, ordens);

    return res.json({
      ok: true,
      preenchido: novaOrdem.quantidade - restante,
      emAberto: restante,
    });
  } catch (err) {
    console.error('Erro ao criar/casar ordem:', err);
    return res.status(500).json({ erro: 'Erro no livro de ordens' });
  }
}
// NOVO: listar livro do clube (separado por compra/venda)
function getLivro(req, res) {
  try {
    const { clubeId } = req.params;
    const ordens = lerJSON(ordensPath).filter(o => String(o.clubeId) === String(clubeId) && o.aberto);

    const compras = ordens
      .filter(o => o.tipo === 'compra')
      .sort((a, b) => (b.preco - a.preco) || (a.criadoEm - b.criadoEm)); // maior preço primeiro

    const vendas = ordens
      .filter(o => o.tipo === 'venda')
      .sort((a, b) => (a.preco - b.preco) || (a.criadoEm - b.criadoEm)); // menor preço primeiro

    res.json({ compras, vendas });
  } catch (err) {
    console.error('Erro ao obter livro:', err);
    res.status(500).json({ erro: 'Erro ao obter livro de ordens.' });
  }
}

module.exports = { criarOuCasarOrdem, getLivro };

