import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import axios from 'axios';
import NegociacaoModal from '../../components/NegociacaoModal';

const Wrapper = styled.div`
  padding: 28px 24px;
  color: #e5e7eb;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
`;

const TitleBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin: 0;
`;

const Sub = styled.div`
  color: #9ca3af;
  font-size: 13px;
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 10px;
  padding: 14px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const Tab = styled.button`
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: ${({ active }) => (active ? '#16a34a' : 'transparent')};
  color: ${({ active }) => (active ? '#0b1220' : '#e5e7eb')};
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.12);

  &:first-child {
    border-top: 0;
  }
`;

const Label = styled.div`
  color: #9ca3af;
  font-size: 12px;
`;

const Value = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const Btn = styled.button`
  background: #3b82f6;
  color: white;
  border: 0;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
`;

function formatBRL(v) {
  const n = Number(v || 0);
  return `R$ ${n.toFixed(2)}`;
}

// SVG line chart (sem libs), “linha por operação”
function LineChart({ pontos }) {
  const w = 900;
  const h = 240;
  const pad = 22;

  const pts = Array.isArray(pontos) ? pontos : [];
  const ys = pts.map(p => Number(p.price || 0));

  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);

  const scaleX = (i) => {
    if (pts.length <= 1) return pad;
    return pad + (i * (w - pad * 2)) / (pts.length - 1);
  };
  const scaleY = (v) => {
    if (maxY === minY) return h / 2;
    return h - pad - ((v - minY) * (h - pad * 2)) / (maxY - minY);
  };

  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(2)} ${scaleY(Number(p.price || 0)).toFixed(2)}`)
    .join(' ');

  // “área” simples abaixo da linha
  const area = `${d} L ${scaleX(pts.length - 1).toFixed(2)} ${(h - pad).toFixed(2)} L ${scaleX(0).toFixed(2)} ${(h - pad).toFixed(2)} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="240" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopOpacity="0.25" />
          <stop offset="100%" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={area} fill="url(#areaGrad)" />
      <path d={d} fill="none" strokeWidth="2.5" />
    </svg>
  );
}

export default function ClubeDetalhe() {
  const router = useRouter();
  const { id } = router.query;

  const [clube, setClube] = useState(null);
  const [range, setRange] = useState('7D');
  const [hist, setHist] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const ranges = useMemo(
    () => [
      { key: '24H', label: '24h' },
      { key: '7D', label: '7 dias' },
      { key: '1M', label: '1 mês' },
      { key: '3M', label: '3 meses' },
      { key: 'ALL', label: 'Desde o início' },
    ],
    []
  );

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      setCarregando(true);
      try {
        const [resClube, resHist] = await Promise.all([
          axios.get(`http://localhost:4001/clube/${id}`),
          axios.get(`http://localhost:4001/clube/${id}/historico-precos`, { params: { range } }),
        ]);
        setClube(resClube.data);
        setHist(resHist.data);
      } catch (e) {
        console.error('Erro ao carregar clube:', e);
      } finally {
        setCarregando(false);
      }
    };

    fetchAll();
  }, [id, range]);

  const resumo = hist?.resumo;
  const pontos = hist?.pontos || [];

  const variacaoCor = (resumo?.variacaoAbs ?? 0) >= 0 ? '#22c55e' : '#ef4444';

  return (
    <Wrapper>
      <Header>
        <TitleBox>
          <Title>{clube?.nome || 'Clube'}</Title>
          <Sub>
            <Link href="/brasileirao-a" style={{ color: '#60a5fa' }}>
              Voltar ao Brasileirão A
            </Link>
          </Sub>
        </TitleBox>

        <div>
          <Btn onClick={() => setModalAberto(true)} disabled={!clube}>
            Negociar
          </Btn>
        </div>
      </Header>

      <Cards>
        <Card>
          <Tabs>
            {ranges.map((r) => (
              <Tab key={r.key} active={range === r.key} onClick={() => setRange(r.key)}>
                {r.label}
              </Tab>
            ))}
          </Tabs>

          {carregando ? (
            <div style={{ color: '#9ca3af' }}>Carregando gráfico...</div>
          ) : (
            <LineChart pontos={pontos} />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
            <div>Início: {resumo?.desde ? new Date(resumo.desde).toLocaleString() : '-'}</div>
            <div>Atual: {resumo?.ate ? new Date(resumo.ate).toLocaleString() : '-'}</div>
          </div>
        </Card>

        <Card>
          <Row>
            <Label>Preço IPO/Liquidação (estático)</Label>
            <Value>{formatBRL(hist?.ipoLiquidacao ?? clube?.preco)}</Value>
          </Row>

          <Row>
            <Label>Preço de Mercado (último negócio)</Label>
            <Value>{formatBRL(hist?.precoMercado ?? clube?.precoAtual ?? clube?.preco)}</Value>
          </Row>

          <Row>
            <Label>Variação no período</Label>
            <Value style={{ color: variacaoCor }}>
              {formatBRL(resumo?.variacaoAbs)} ({(resumo?.variacaoPct ?? 0).toFixed(2)}%)
            </Value>
          </Row>

          <Row>
            <Label>Máxima / Mínima</Label>
            <Value>
              {formatBRL(resumo?.max)} / {formatBRL(resumo?.min)}
            </Value>
          </Row>

          <Row>
            <Label>Trades / Volume (qtd)</Label>
            <Value>
              {resumo?.tradesCount ?? 0} / {resumo?.volume ?? 0}
            </Value>
          </Row>

          <div style={{ marginTop: 12, color: '#9ca3af', fontSize: 12, lineHeight: 1.4 }}>
            Dica: o <b>IPO/Liquidação</b> é o preço “teórico” da posição na tabela (fixo). O <b>Preço de Mercado</b> acompanha o último preço negociado no mercado secundário.
          </div>
        </Card>
      </Cards>

      {modalAberto && clube && (
        <NegociacaoModal
          aberto={modalAberto}
          fechar={() => setModalAberto(false)}
          clube={clube}
        />
      )}
    </Wrapper>
  );
}
