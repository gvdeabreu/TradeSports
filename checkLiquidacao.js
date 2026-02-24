// middleware/checkLiquidacao.js
const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos JSON principais
const configPath        = path.join(__dirname, '..', 'data', 'configCampeonato.json');
const usuariosPath      = path.join(__dirname, '..', 'data', 'usuarios.json');
const clubesPath        = path.join(__dirname, '..', 'data', 'clubes.json');
const investimentosPath = path.join(__dirname, '..', 'data', 'investimentos.json');
const classificacaoPath = path.join(__dirname, '..', 'data', 'classificacaoFinal.json'); // NOVO

function lerJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('[LER JSON]', p, e.message);
    return fallback;
  }
}

function salvarJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Calcula o preço da cota a partir da POSIÇÃO final do clube.
 *
 * Regra:
 * - 20º lugar = R$ 5,00
 * - cada posição ACIMA aumenta 5% em relação à anterior
 *   (ex.: 19º = 5 * 1.05, 18º = 5 * 1.05^2, ..., 1º = 5 * 1.05^19)
 */
function calcularPrecoPorPosicao(posicao) {
  const basePosicao   = 20;     // última posição da tabela
  const basePreco20   = 5.00;   // preço do 20º colocado
  const fatorAumento  = 1.05;   // +5% por posição

  if (!posicao || posicao < 1 || posicao > 20) {
    // fallback de segurança: usa o preço do 20º
    return basePreco20;
  }

  const passos = basePosicao - posicao;   // quantas posições acima do 20º
  const preco  = basePreco20 * Math.pow(fatorAumento, passos);

  return Number(preco.toFixed(2));
}

/**
 * Lê data/classificacaoFinal.json e monta um mapa { clubeId: posicao }.
 *
 * Estrutura esperada (exemplo):
 * [
 *   { "clubeId": 125, "posicao": 10 },
 *   { "clubeId": 13,  "posicao": 1  },
 *   ...
 * ]
 *
 * Se o arquivo não existir ou estiver inválido, devolve null.
 * Nesse caso, a liquidação cai no fallback usando clubes.json.preco.
 */
function obterMapaPosicoesFinais() {
  const tabela = lerJSON(classificacaoPath, null);
  if (!Array.isArray(tabela)) {
    console.warn('[LIQ] classificação final não encontrada em classificacaoFinal.json. Usando fallback de preco dos clubes.');
    return null;
  }

  const mapa = {};
  for (const item of tabela) {
    if (!item) continue;
    const id  = item.clubeId ?? item.id ?? item.timeId;
    const pos = item.posicao ?? item.pos ?? item.position;
    if (id == null || pos == null) continue;
    mapa[id] = Number(pos);
  }

  return mapa;
}

/**
 * Liquida todas as cotas em carteira.
 *
 * CAMINHO 2:
 *  - Usa a POSIÇÃO final do clube (classificacaoFinal.json) para calcular
 *    o valor da cota via calcularPrecoPorPosicao(posicao).
 *  - Se não houver classificação final, faz fallback para clubes.json.preco.
 *  - Credita o valor correspondente no saldo do usuário.
 *  - Registra uma linha em investimentos.json com tipo "Liquidação".
 *  - Zera a carteira dos usuários.
 *  - Atualiza configCampeonato.json (dispararLiquidacao=false, liquidado=true).
 */
async function liquidarBrasileirao() {
  const config = lerJSON(configPath, {
    campeonato: 'Brasileirao',
    temporada:  2023,
    dispararLiquidacao: false,
    liquidado: false,
  });

  if (config.liquidado) {
    console.log('🔵 [LIQ] Campeonato já liquidado. Nenhuma ação tomada.');
    return { ok: true, totalGeral: 0, jaLiquidado: true };
  }

  const clubes           = lerJSON(clubesPath, []);
  const usuarios         = lerJSON(usuariosPath, []);
  const investimentosAnt = lerJSON(investimentosPath, []);

  const mapaClubePorId = {};
  for (const c of clubes) {
    if (!c || c.id == null) continue;
    mapaClubePorId[c.id] = c;
  }

  // NOVO: mapa de posições finais
  const mapaPosicoes = obterMapaPosicoesFinais();

  const novosLancamentos = [];
  let totalGeral = 0;
  const agoraISO = new Date().toISOString();

  for (const usuario of usuarios) {
    const carteira = Array.isArray(usuario.carteira) ? usuario.carteira : [];
    if (!carteira.length) continue;

    for (const ativo of carteira) {
      const clube = mapaClubePorId[ativo.clubeId];
      if (!clube) {
        console.warn('[LIQ] Clube não encontrado em clubes.json para ativo:', ativo.clubeId);
        continue;
      }

      const qtd = Number(ativo.quantidade || 0);
      if (!qtd || qtd <= 0) continue;

      let valorUnitario;

      if (mapaPosicoes && mapaPosicoes[ativo.clubeId] != null) {
        const posicaoFinal = mapaPosicoes[ativo.clubeId];
        valorUnitario = calcularPrecoPorPosicao(posicaoFinal);
      } else {
        // Fallback: se não houver classificação final, usa o preco já gravado no clube
        valorUnitario = Number(clube.preco || clube.precoAtual || 0);
      }

      if (!valorUnitario) {
        console.warn('[LIQ] Valor unitário nulo para clube', ativo.clubeId, '- pulando ativo.');
        continue;
      }

      const total = Number((qtd * valorUnitario).toFixed(2));

      usuario.saldo = Number(usuario.saldo || 0) + total;
      totalGeral   += total;

      novosLancamentos.push({
        id:          `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        usuarioId:   usuario.id,
        tipo:        'Liquidação',
        clubeId:     ativo.clubeId,
        clubeNome:   ativo.nome || ativo.nomeClube || clube.nome || '',
        quantidade:  qtd,
        valorUnitario,
        totalPago:   total,
        data:        agoraISO,
      });
    }

    // zera a carteira
    usuario.carteira = [];
  }

  salvarJSON(usuariosPath, usuarios);
  salvarJSON(investimentosPath, [...investimentosAnt, ...novosLancamentos]);

  config.dispararLiquidacao = false;
  config.liquidado          = true;
  salvarJSON(configPath, config);

  console.log('🟢 [LIQ] Liquidação concluída. Total pago:', totalGeral);

  return { ok: true, totalGeral };
}

// --------- MIDDLEWARE ----------
// Dispara a liquidação quando config.dispararLiquidacao == true e ainda não foi liquidado.
function checkLiquidacao(req, res, next) {
  (async () => {
    try {
      const config = lerJSON(configPath, {
        dispararLiquidacao: false,
        liquidado: false,
      });

      if (config.dispararLiquidacao && !config.liquidado) {
        await liquidarBrasileirao();
      }
    } catch (e) {
      console.error('[LIQ] Erro na verificação de liquidação:', e);
    } finally {
      next();
    }
  })();
}

module.exports = {
  checkLiquidacao,
  liquidarBrasileirao,
};
