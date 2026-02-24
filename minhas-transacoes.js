import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import withAuth from '../components/withAuth';
import api from '../lib/api';

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatData(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleString('pt-BR');
  } catch {
    return String(d);
  }
}

function labelTipo(t) {
  switch (String(t).toUpperCase()) {
    case 'COMPRA':
      return 'Compra';
    case 'VENDA':
      return 'Venda';
    case 'LIQUIDACAO':
      return 'Liquidação';
    case 'DEPOSITO':
      return 'Depósito';
    case 'SAQUE':
      return 'Saque';
    default:
      return t;
  }
}

function corTipo(t) {
  const x = String(t).toUpperCase();
  if (x === 'COMPRA' || x === 'DEPOSITO') return '#22c55e';
  if (x === 'VENDA' || x === 'SAQUE') return '#ef4444';
  if (x === 'LIQUIDACAO') return '#38bdf8';
  return '#e2e8f0';
}

function MinhasTransacoes() {
  const [itens, setItens] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const [filtroClubeId, setFiltroClubeId] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Paginação (5/10/20 por página)
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroOrigem, setFiltroOrigem] = useState('');

  async function carregar() {
    setCarregando(true);
    try {
      const respClubes = await api.get('/clube/clubes');
      setClubes(Array.isArray(respClubes.data) ? respClubes.data : []);

      const resp = await api.get('/usuario/historico');
      setItens(Array.isArray(resp.data) ? resp.data : []);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const itensFiltrados = useMemo(() => {
    return itens.filter((x) => {
      if (filtroTipo && String(x.tipo) !== filtroTipo) return false;
      if (filtroOrigem && String(x.origem) !== filtroOrigem) return false;
      if (filtroClubeId && String(x.clubeId) !== String(filtroClubeId)) return false;
      return true;
    });
  }, [itens, filtroTipo, filtroOrigem, filtroClubeId]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroTipo, filtroOrigem, filtroClubeId, itensPorPagina]);

  const totalPaginas = Math.max(1, Math.ceil(itensFiltrados.length / itensPorPagina));
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const itensPaginados = itensFiltrados.slice(inicio, inicio + itensPorPagina);

  const irParaPagina = (p) => {
    const alvo = Math.min(Math.max(1, Number(p) || 1), totalPaginas);
    setPaginaAtual(alvo);
  };

  return (
    <Wrap>
      <Titulo>Minhas Transações</Titulo>
      <Sub>Execuções realizadas (não inclui ordens abertas)</Sub>

      <Filtros>
        <Filtro>
          <label>Clube</label>
          <select value={filtroClubeId} onChange={(e) => setFiltroClubeId(e.target.value)}>
            <option value="">Todos</option>
            {clubes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Filtro>

        <Filtro>
          <label>Tipo</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="COMPRA">Compra</option>
            <option value="VENDA">Venda</option>
            <option value="LIQUIDACAO">Liquidação</option>
            <option value="DEPOSITO">Depósito</option>
            <option value="SAQUE">Saque</option>
          </select>
        </Filtro>

        <Filtro>
          <label>Origem</label>
          <select value={filtroOrigem} onChange={(e) => setFiltroOrigem(e.target.value)}>
            <option value="">Todas</option>
            <option value="IPO">IPO</option>
            <option value="SECUNDARIO">Mercado Secundário</option>
            <option value="LIQUIDACAO">Liquidação</option>
          </select>
        </Filtro>
      </Filtros>

      <PaginacaoBar>
        <PaginacaoEsq>
          <label>
            Itens por página
            <select
              value={itensPorPagina}
              onChange={(e) => setItensPorPagina(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
          <Resumo>
            {itensFiltrados.length === 0
              ? "0 transações"
              : `${itensFiltrados.length} transações • Página ${paginaAtual} de ${totalPaginas}`}
          </Resumo>
        </PaginacaoEsq>

        <PaginacaoDir>
          <BotaoPagina
            type="button"
            onClick={() => irParaPagina(paginaAtual - 1)}
            disabled={paginaAtual <= 1}
          >
            Anterior
          </BotaoPagina>

          <BotaoPagina
            type="button"
            onClick={() => irParaPagina(paginaAtual + 1)}
            disabled={paginaAtual >= totalPaginas}
          >
            Próxima
          </BotaoPagina>
        </PaginacaoDir>
      </PaginacaoBar>

      <Card>
        {carregando ? (
          <Vazio>Carregando...</Vazio>
        ) : itensFiltrados.length === 0 ? (
          <Vazio>Nenhuma transação encontrada.</Vazio>
        ) : (
          <Tabela>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Origem</th>
                <th>Clube</th>
                <th>Qtd</th>
                <th>Preço</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {itensPaginados.map((x) => (
                <tr key={x.id}>
                  <td>{formatData(x.data)}</td>
                  <Tipo style={{ color: corTipo(x.tipo) }}>{labelTipo(x.tipo)}</Tipo>
                  <td>{x.origem || '-'}</td>
                  <td>{x.clubeNome || '-'}</td>
                  <td>{x.quantidade || '-'}</td>
                  <td>{x.valorUnitario ? formatBRL(x.valorUnitario) : '-'}</td>
                  <td>{x.totalPago ? formatBRL(x.totalPago) : formatBRL(x.valor)}</td>
                </tr>
              ))}
            </tbody>
          </Tabela>
        )}
      </Card>
    </Wrap>
  );
}

export default withAuth(MinhasTransacoes);

/* -------------------- estilos -------------------- */

const Wrap = styled.div`
  padding: 2rem;
  color: #e2e8f0;
`;

const Titulo = styled.h1`
  color: #ffffff;
  margin: 0;
`;

const Sub = styled.p`
  margin: 0.35rem 0 1.2rem;
  color: #94a3b8;
`;

const Card = styled.div`
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 1rem;
  overflow-x: auto;
`;

const Filtros = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Filtro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.85rem;
    color: #94a3b8;
  }

  select {
    min-width: 180px;
    padding: 0.55rem;
    border-radius: 8px;
    border: 1px solid #1e293b;
    background: #111827;
    color: #e2e8f0;
  }
`;

const Vazio = styled.div`
  padding: 1rem;
  color: #94a3b8;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #1e293b;
    white-space: nowrap;
  }

  th {
    color: #94a3b8;
    font-weight: 600;
    text-align: left;
  }
`;

const Tipo = styled.td`
  font-weight: 700;
`;

const PaginacaoBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 0 14px;
`;

const PaginacaoEsq = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    opacity: 0.9;
  }

  select {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fff;
    padding: 8px 10px;
    border-radius: 8px;
    outline: none;

    option {
      color: #000;
    }
  }
`;

const Resumo = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const PaginacaoDir = styled.div`
  display: flex;
  gap: 10px;
`;

const BotaoPagina = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.16);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
