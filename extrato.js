import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../lib/api';
import { useToast } from '../components/ToastProvider';

function formatBRL(v) {
  const n = Number(v || 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function yyyyMMdd(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Extrato() {
  const { adicionarToast } = useToast();

  const [itens, setItens] = useState([]);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [tipos, setTipos] = useState({
    DEPOSITO: true,
    SAQUE: true,
    COMPRA: true,
    VENDA: true,
    LIQUIDACAO: true,
    DIVIDENDO: true,
    AJUSTE: true,
  });

  const tiposQuery = useMemo(() => {
    return Object.entries(tipos)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(',');
  }, [tipos]);

  const aplicarRange = (dias) => {
    const hoje = new Date();
    const ini = new Date();
    ini.setDate(hoje.getDate() - dias);
    setFrom(yyyyMMdd(ini));
    setTo(yyyyMMdd(hoje));
  };

  const limparRange = () => {
    setFrom('');
    setTo('');
  };

  const carregar = async () => {
    setCarregando(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (tiposQuery) params.tipos = tiposQuery;

      const res = await api.get('/usuario/extrato', { params });

      setItens(res.data?.itens || []);
      setSaldoAtual(Number(res.data?.saldoAtual || 0));
    } catch (err) {
      const msg =
        err?.response?.data?.erro ||
        err?.response?.data?.message ||
        'Erro ao carregar extrato.';
      adicionarToast(msg, 'erro');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrap>
      <Header>
        <H1>Extrato</H1>
        <Sub>Movimentações do seu saldo (créditos e débitos)</Sub>
      </Header>

      <Resumo>
        <LinhaResumo>
          <ItemResumo>
            <Label>Saldo atual</Label>
            <Valor>{formatBRL(saldoAtual)}</Valor>
          </ItemResumo>

          <AcoesResumo>
            <BtnPill onClick={() => aplicarRange(1)}>24h</BtnPill>
            <BtnPill onClick={() => aplicarRange(7)}>7 dias</BtnPill>
            <BtnPill onClick={() => aplicarRange(30)}>1 mês</BtnPill>
            <BtnPill onClick={() => aplicarRange(90)}>3 meses</BtnPill>
            <BtnPill onClick={limparRange}>Desde o início</BtnPill>

            <BtnPrimary onClick={carregar} disabled={carregando}>
              {carregando ? 'Carregando...' : 'Aplicar'}
            </BtnPrimary>
          </AcoesResumo>
        </LinhaResumo>

        <LinhaFiltros>
          <Campo>
            <CampoLabel>De</CampoLabel>
            <CampoInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Campo>

          <Campo>
            <CampoLabel>Até</CampoLabel>
            <CampoInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Campo>
        </LinhaFiltros>

        <LinhaChecks>
          {Object.keys(tipos).map((t) => (
            <Check key={t}>
              <input
                type="checkbox"
                checked={tipos[t]}
                onChange={(e) => setTipos((p) => ({ ...p, [t]: e.target.checked }))}
              />
              <span>{t}</span>
            </Check>
          ))}
        </LinhaChecks>
      </Resumo>

      <CardTabela>
        <Tabela>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th style={{ textAlign: 'right' }}>Valor</th>
              <th style={{ textAlign: 'right' }}>Saldo após</th>
            </tr>
          </thead>

          <tbody>
            {!carregando && itens.length === 0 && (
              <tr>
                <td colSpan={5} className="vazio">
                  Nenhuma movimentação encontrada.
                </td>
              </tr>
            )}

            {itens.map((i, idx) => (
              <tr key={`${i.data}-${idx}`}>
                <td>{new Date(i.data).toLocaleString('pt-BR')}</td>
                <td>{i.tipo}</td>
                <td>{i.descricao}</td>

                <td style={{ textAlign: 'right', fontWeight: 700 }}>
                  <Badge dir={i.direcao}>
                    {i.direcao === 'C' ? '+' : '-'} {formatBRL(i.valor)}
                  </Badge>
                </td>

                <td style={{ textAlign: 'right' }}>{formatBRL(i.saldoApos)}</td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      </CardTabela>
    </Wrap>
  );
}

/* ===================== ESTILO (theme Carteira) ===================== */

const Wrap = styled.div`
  padding: 28px;
  color: #e5e7eb;
`;

const Header = styled.div`
  margin-bottom: 16px;
`;

const H1 = styled.h1`
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  color: #ffffff;
`;

const Sub = styled.p`
  margin: 6px 0 0 0;
  color: #94a3b8;
  font-size: 14px;
`;

const Resumo = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 10px;
  padding: 16px;
`;

const LinhaResumo = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
`;

const ItemResumo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.span`
  font-size: 13px;
  color: #94a3b8;
`;

const Valor = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
`;

const AcoesResumo = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const BtnPill = styled.button`
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #cfe3ff;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: rgba(59, 130, 246, 0.18);
  }
`;

const BtnPrimary = styled.button`
  background: #3b82f6;
  border: none;
  color: #fff;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LinhaFiltros = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Campo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CampoLabel = styled.label`
  color: #94a3b8;
  font-size: 12px;
`;

const CampoInput = styled.input`
  background: rgba(2, 6, 23, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  padding: 10px 10px;
  color: #e5e7eb;

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.55);
  }
`;

const LinhaChecks = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const Check = styled.label`
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  color: #cbd5e1;

  input {
    transform: translateY(1px);
  }
`;

const CardTabela = styled.div`
  margin-top: 14px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 10px;
  overflow: hidden;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 12px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    font-size: 13px;
    color: #e5e7eb;
    white-space: nowrap;
  }

  th {
    text-align: left;
    color: #cbd5e1;
    background: rgba(2, 6, 23, 0.35);
    font-weight: 800;
  }

  tbody tr:hover {
    background: rgba(2, 6, 23, 0.25);
  }

  td.vazio {
    padding: 16px;
    color: #94a3b8;
  }

  @media (max-width: 900px) {
    display: block;
    overflow: auto;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  color: #fff;
  background: ${(p) => (p.dir === 'C' ? '#16a34a' : '#ef4444')};
`;
