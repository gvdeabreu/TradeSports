import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import withAuth from '../components/withAuth';
import api from '../lib/api';

function formatBRL(n) {
  const v = Number(n || 0);
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatData(d) {
  if (!d) return '-';
  try {
    const dt = new Date(d);
    return dt.toLocaleString('pt-BR');
  } catch {
    return String(d);
  }
}

function statusLabel(st) {
  const s = String(st || '').toLowerCase();
  if (s === 'aberta') return 'Aberta';
  if (s === 'executada') return 'Executada';
  if (s === 'cancelada') return 'Cancelada';
  return st || '-';
}

function MinhasOrdens() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [clubes, setClubes] = useState([]);
  const [itens, setItens] = useState([]);

  const [filtroClubeId, setFiltroClubeId] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');

  const [editandoId, setEditandoId] = useState(null);
  const [editPreco, setEditPreco] = useState('');
  const [editQtd, setEditQtd] = useState('');

  // -------- Paginação --------
  const [pageSize, setPageSize] = useState(10); // 5 | 10 | 20
  const [page, setPage] = useState(1);

  async function carregarTudo() {
    setCarregando(true);
    setErro('');

    try {
      const respClubes = await api.get('/clube/clubes');
      const listaClubes = Array.isArray(respClubes.data) ? respClubes.data : [];
      setClubes(listaClubes);

      const respOrdens = await api.get('/mercado/minhas-ordens?todas=true');
      const ordens = Array.isArray(respOrdens.data) ? respOrdens.data : [];

      const respHist = await api.get('/usuario/historico');
      const historico = Array.isArray(respHist.data) ? respHist.data : [];

      const mapClubeNome = (clubeId) => {
        const c = listaClubes.find((x) => String(x.id) === String(clubeId));
        return c?.nome || c?.nomeClube || '—';
      };

      const itensOrdens = ordens.map((o) => {
        const st =
          o.status || (Number(o.restante || 0) <= 0 ? 'executada' : 'aberta');
        return {
          fonte: 'ORDEM',
          id: o.id,
          origem: 'SECUNDARIO',
          tipo: o.tipo, // compra|venda
          clubeId: o.clubeId,
          clubeNome: mapClubeNome(o.clubeId),
          preco: Number(o.preco || 0),
          quantidade: Number(o.quantidade || 0),
          restante: Number(o.restante || 0),
          status: st,
          criadoEm: o.criadoEm,
        };
      });

      const itensHist = historico.map((h) => {
        const tipoRaw = String(h.tipo || '').toUpperCase();
        const tipo =
          tipoRaw === 'COMPRA' ? 'compra' : tipoRaw === 'VENDA' ? 'venda' : 'outro';
        return {
          fonte: 'HISTORICO',
          id: h.id,
          origem:
            h.origem || (h.tipo === 'LIQUIDACAO' ? 'LIQUIDACAO' : 'IPO/HISTÓRICO'),
          tipo,
          clubeId: h.clubeId,
          clubeNome: h.clubeNome || mapClubeNome(h.clubeId),
          preco: Number(h.valorUnitario ?? h.preco ?? 0),
          quantidade: Number(h.quantidade || 0),
          restante: 0,
          status: 'executada',
          criadoEm: h.data || h.criadoEm || Date.now(),
          tipoHistorico: h.tipo,
        };
      });

      const tudo = [...itensOrdens, ...itensHist].sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );
      setItens(tudo);
    } catch (e) {
      console.error(e);
      setErro(
        e?.response?.data?.erro ||
          e?.response?.data?.message ||
          'Erro ao carregar suas ordens.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const itensFiltrados = useMemo(() => {
    return itens.filter((x) => {
      if (filtroClubeId && String(x.clubeId) !== String(filtroClubeId)) return false;
      if (filtroTipo && String(x.tipo) !== String(filtroTipo)) return false;
      if (filtroStatus && String(x.status) !== String(filtroStatus)) return false;
      if (filtroOrigem && String(x.origem) !== String(filtroOrigem)) return false;
      return true;
    });
  }, [itens, filtroClubeId, filtroTipo, filtroStatus, filtroOrigem]);

  // Sempre que filtros/tamanho mudarem, volta para página 1
  useEffect(() => {
    setPage(1);
  }, [filtroClubeId, filtroTipo, filtroStatus, filtroOrigem, pageSize]);

  const totalItens = itensFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItens / Number(pageSize || 10)));

  // Garante page dentro do intervalo caso a lista diminua
  useEffect(() => {
    if (page > totalPaginas) setPage(totalPaginas);
    if (page < 1) setPage(1);
  }, [page, totalPaginas]);

  const itensPaginados = useMemo(() => {
    const size = Number(pageSize || 10);
    const start = (page - 1) * size;
    const end = start + size;
    return itensFiltrados.slice(start, end);
  }, [itensFiltrados, page, pageSize]);

  async function cancelarOrdem(ordemId) {
    try {
      await api.post('/mercado/ordem/cancelar', { ordemId });
      await carregarTudo();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.erro || 'Não foi possível cancelar.');
    }
  }

  function iniciarEdicao(item) {
    setEditandoId(item.id);
    setEditPreco(String(Number(item.preco || 0)));
    setEditQtd(String(Number(item.quantidade || 0)));
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEditPreco('');
    setEditQtd('');
  }

  async function salvarEdicao(ordemId) {
    const qtd = Number(editQtd);
    const preco = Number(editPreco);
    if (!Number.isFinite(qtd) || qtd <= 0 || !Number.isFinite(preco) || preco <= 0) {
      alert('Quantidade e preço precisam ser válidos.');
      return;
    }
    try {
      await api.put('/mercado/ordem/editar', { ordemId, quantidade: qtd, preco });
      cancelarEdicao();
      await carregarTudo();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.erro || 'Não foi possível editar.');
    }
  }

  return (
    <Container>
      <Titulo>Minhas Ordens</Titulo>

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
            <option value="compra">Compra</option>
            <option value="venda">Venda</option>
          </select>
        </Filtro>

        <Filtro>
          <label>Status</label>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="aberta">Aberta</option>
            <option value="executada">Executada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </Filtro>

        <Filtro>
          <label>Origem</label>
          <select value={filtroOrigem} onChange={(e) => setFiltroOrigem(e.target.value)}>
            <option value="">Todas</option>
            <option value="SECUNDARIO">Mercado Secundário</option>
            <option value="IPO/HISTÓRICO">IPO/Histórico</option>
            <option value="LIQUIDACAO">Liquidação</option>
          </select>
        </Filtro>

        <Filtro>
          <label>Por página</label>
          <select
            value={String(pageSize)}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </Filtro>

        <Botao onClick={carregarTudo} disabled={carregando}>
          {carregando ? 'Atualizando…' : 'Atualizar'}
        </Botao>
      </Filtros>

      {erro && <Erro>{erro}</Erro>}

      <Card>
        {itensFiltrados.length === 0 ? (
          <Vazio>Nenhuma ordem encontrada com esses filtros.</Vazio>
        ) : (
          <>
            <ResumoTopo>
              <span>
                Exibindo{' '}
                <b>
                  {Math.min((page - 1) * pageSize + 1, totalItens)}–
                  {Math.min(page * pageSize, totalItens)}
                </b>{' '}
                de <b>{totalItens}</b>
              </span>

              <Paginacao>
                <MiniSec
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </MiniSec>

                <PaginaInfo>
                  Página <b>{page}</b> de <b>{totalPaginas}</b>
                </PaginaInfo>

                <MiniSec
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                  disabled={page >= totalPaginas}
                >
                  Próxima
                </MiniSec>
              </Paginacao>
            </ResumoTopo>

            <Tabela>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Origem</th>
                  <th>Tipo</th>
                  <th>Clube</th>
                  <th>Preço</th>
                  <th>Qtd</th>
                  <th>Restante</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensPaginados.map((x) => {
                  const tipoHist = String(x.tipoHistorico || '').toUpperCase();
                  const isCompra = x.tipo === 'compra' || tipoHist === 'COMPRA';

                  const podeEditar =
                    x.fonte === 'ORDEM' &&
                    x.status === 'aberta' &&
                    Number(x.restante || 0) === Number(x.quantidade || 0);

                  const podeCancelar =
                    x.fonte === 'ORDEM' &&
                    x.status === 'aberta' &&
                    Number(x.restante || 0) > 0;

                  const emEdicao = editandoId === x.id;

                  return (
                    <tr key={`${x.fonte}-${x.id}`}>
                      <td>{formatData(x.criadoEm)}</td>
                      <td>{x.origem}</td>
                      <Tipo $compra={isCompra}>
                        {x.tipo === 'outro' ? tipoHist || '—' : isCompra ? 'COMPRA' : 'VENDA'}
                      </Tipo>
                      <td>{x.clubeNome}</td>

                      <td>
                        {emEdicao ? (
                          <Input
                            type="number"
                            value={editPreco}
                            onChange={(e) => setEditPreco(e.target.value)}
                          />
                        ) : (
                          formatBRL(x.preco)
                        )}
                      </td>

                      <td>
                        {emEdicao ? (
                          <Input
                            type="number"
                            value={editQtd}
                            onChange={(e) => setEditQtd(e.target.value)}
                          />
                        ) : (
                          x.quantidade
                        )}
                      </td>

                      <td>{x.restante ?? '-'}</td>
                      <td>{statusLabel(x.status)}</td>

                      <td>
                        {emEdicao ? (
                          <AcoesLinha>
                            <Mini type="button" onClick={() => salvarEdicao(x.id)}>
                              Salvar
                            </Mini>
                            <MiniSec type="button" onClick={cancelarEdicao}>
                              Cancelar
                            </MiniSec>
                          </AcoesLinha>
                        ) : (
                          <AcoesLinha>
                            {podeEditar && (
                              <Mini type="button" onClick={() => iniciarEdicao(x)}>
                                Editar
                              </Mini>
                            )}
                            {podeCancelar && (
                              <MiniDanger type="button" onClick={() => cancelarOrdem(x.id)}>
                                Cancelar ordem
                              </MiniDanger>
                            )}
                            {!podeEditar && !podeCancelar && (
                              <span style={{ color: '#64748b' }}>—</span>
                            )}
                          </AcoesLinha>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Tabela>

            <ResumoRodape>
              <Paginacao>
                <MiniSec
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                >
                  Primeira
                </MiniSec>
                <MiniSec
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </MiniSec>
                <PaginaInfo>
                  Página <b>{page}</b> de <b>{totalPaginas}</b>
                </PaginaInfo>
                <MiniSec
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                  disabled={page >= totalPaginas}
                >
                  Próxima
                </MiniSec>
                <MiniSec
                  type="button"
                  onClick={() => setPage(totalPaginas)}
                  disabled={page >= totalPaginas}
                >
                  Última
                </MiniSec>
              </Paginacao>
            </ResumoRodape>
          </>
        )}
      </Card>

      <Nota>
        * Edição só é permitida enquanto a ordem estiver <b>aberta</b> e <b>ainda não tiver execução parcial</b>.
      </Nota>
    </Container>
  );
}

export default withAuth(MinhasOrdens);

// -------------------- estilos --------------------

const Container = styled.div`
  padding: 2rem;
  color: #e2e8f0;
`;

const Titulo = styled.h1`
  color: #ffffff;
  margin: 0 0 1.25rem;
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
  align-items: flex-end;
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
    padding: 0.55rem 0.65rem;
    border-radius: 8px;
    border: 1px solid #1e293b;
    background: #111827;
    color: #e2e8f0;
    outline: none;
  }
`;

const Botao = styled.button`
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
  height: 40px;

  &:hover {
    background: #2563eb;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Erro = styled.div`
  margin: 0.75rem 0;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  padding: 0.75rem;
  border-radius: 10px;
  color: #fecaca;
`;

const Vazio = styled.div`
  padding: 1rem;
  color: #94a3b8;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;

  th, td {
    padding: 0.75rem;
    border-bottom: 1px solid #1e293b;
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: #94a3b8;
    font-weight: 600;
  }
`;

const Tipo = styled.td`
  font-weight: 700;
  color: ${({ $compra }) => ($compra ? '#22c55e' : '#ef4444')};
`;

const AcoesLinha = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Mini = styled.button`
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #111827;
  color: #e2e8f0;
  cursor: pointer;

  &:hover {
    background: #0b1220;
  }
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const MiniSec = styled(Mini)`
  border-color: #334155;
  color: #cbd5e1;
`;

const MiniDanger = styled(Mini)`
  border-color: rgba(239, 68, 68, 0.55);
  color: #fecaca;
`;

const Input = styled.input`
  width: 110px;
  padding: 0.45rem 0.55rem;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #111827;
  color: #e2e8f0;
  outline: none;
`;

const Nota = styled.p`
  margin-top: 0.85rem;
  color: #94a3b8;
  font-size: 0.9rem;
`;

const ResumoTopo = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.25rem 0.9rem;
  color: #94a3b8;

  b {
    color: #e2e8f0;
  }
`;

const ResumoRodape = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 0.9rem;
`;

const Paginacao = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const PaginaInfo = styled.div`
  color: #94a3b8;
  padding: 0 0.25rem;

  b {
    color: #e2e8f0;
  }
`;
