// frontend/components/LivroDeOrdens.js
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../lib/api'; // <- importante: caminho certo a partir de /components

/**
 * Props:
 *  - clubeId: number|string
 *  - lado: 'compra' | 'venda'  (lado atualmente selecionado no modal)
 *  - onSelecionarPreco: (preco:number) => void   // define o preço no modal
 *  - onResumoChange?: ({ bestBid, bestAsk, mid, spreadPct }) => void
 */
// LivroDeOrdens.js (assinatura segura)
export default function LivroDeOrdens({
  clubeId,
  lado,
  onSelecionarPreco,
  onResumoChange,
  ordensCompra = [],
  ordensVenda = [],
  onCancelar,                // opcional também
  meuId, 
}) {
  // ...
  // quando for desenhar o botão:
  // só mostra se meuId existir e a ordem for do usuário
  const isMinha = (o) => meuId && String(o.usuarioId) === String(meuId);
  // se não tiver meuId, o botão nunca aparece — nada quebra

  const [compras, setCompras] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(false);
  

  // carrega o book
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!clubeId) return;
      setLoading(true);
      try {
        const { data } = await api.get('/mercado/livro', { params: { clubeId } });
        if (!alive) return;
        setCompras(Array.isArray(data?.compras) ? data.compras : []);
        setVendas(Array.isArray(data?.vendas) ? data.vendas : []);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    // atualiza a cada 3s (simples polling)
    const t = setInterval(load, 3000);
    return () => { alive = false; clearInterval(t); };
  }, [clubeId]);

  // agrupa por preço (2 casas) e soma quantidade restante
  const agrupaNiveis = (ordens) => {
    const mapa = new Map();
    for (const o of ordens || []) {
      const p = Number(o.preco);
      const r = Number(o.restante ?? o.quantidade ?? 0);
      if (!Number.isFinite(p) || r <= 0) continue;
      const key = p.toFixed(2);
      mapa.set(key, (mapa.get(key) ?? 0) + r);
    }
    // retorna ordenado: compras desc, vendas asc (o caller decide)
    return [...mapa.entries()].map(([precoStr, qtd]) => ({
      preco: Number(precoStr),
      qtd
    }));
  };

  const niveisCompra = useMemo(() => {
    const arr = agrupaNiveis(compras);
    // book de compra: melhor preço primeiro (desc)
    return arr.sort((a, b) => b.preco - a.preco);
  }, [compras]);

  const niveisVenda = useMemo(() => {
    const arr = agrupaNiveis(vendas);
    // book de venda: menor preço primeiro (asc)
    return arr.sort((a, b) => a.preco - b.preco);
  }, [vendas]);

  const bestBid = niveisCompra[0]?.preco ?? null;
  const bestAsk = niveisVenda[0]?.preco ?? null;
  const mid = (bestBid != null && bestAsk != null) ? (bestBid + bestAsk) / 2 : null;
  const spreadPct = (bestBid != null && bestAsk != null && bestAsk > 0)
    ? ((bestAsk - bestBid) / bestAsk) * 100
    : null;

  useEffect(() => {
    onResumoChange?.({ bestBid, bestAsk, mid, spreadPct });
  }, [bestBid, bestAsk, mid, spreadPct, onResumoChange]);

  // profundidade: largura relativa baseada no maior nível de cada lado
  const maxQtdBuy = useMemo(() => Math.max(1, ...niveisCompra.map(n => n.qtd)), [niveisCompra]);
  const maxQtdSell = useMemo(() => Math.max(1, ...niveisVenda.map(n => n.qtd)), [niveisVenda]);

  const usarMelhor = () => {
    if (lado === 'compra' && bestAsk != null) onSelecionarPreco?.(bestAsk);
    if (lado === 'venda' && bestBid != null) onSelecionarPreco?.(bestBid);

  };

 return (
  <Wrap>
    <Header>
      <div>
        <small>Melhor Compra</small>
        <strong>{bestBid != null ? `R$ ${bestBid.toFixed(2)}` : '—'}</strong>
      </div>
      <div>
        <small>Mid</small>
        <strong>{mid != null ? `R$ ${mid.toFixed(2)}` : '—'}</strong>
      </div>
      <div>
        <small>Melhor Venda</small>
        <strong>{bestAsk != null ? `R$ ${bestAsk.toFixed(2)}` : '—'}</strong>
      </div>
    </Header>

    <Toolbar>
      <button
        type="button"
        onClick={usarMelhor}
        disabled={loading || (lado === 'compra' ? bestAsk == null : bestBid == null)}
        title={lado === 'compra' ? 'Usar melhor preço de venda' : 'Usar melhor preço de compra'}
      >
        Usar melhor preço
      </button>

      <span className="spread">
        {spreadPct != null ? `Spread: ${spreadPct.toFixed(2)}%` : 'Spread: —'}
      </span>
    </Toolbar>

    <Grid>
      <Col>
        <h4>Ordens de Compra</h4>
        {niveisCompra.length === 0 && <Empty>Nenhuma ordem de compra</Empty>}
        {niveisCompra.map((n, i) => (
          <Row key={`b-${i}`} onClick={() => onSelecionarPreco?.(n.preco)}>
            <LevelBar
              style={{ width: `${(n.qtd / maxQtdBuy) * 100}%`, background: '#1E6F43' }}
            />
            <span className="preco">R$ {n.preco.toFixed(2)}</span>
            <span className="qtd">{n.qtd} cotas</span>
          </Row>
        ))}

        {/* ---- SUAS ORDENS DE COMPRA (individuais) ---- */}
        {Array.isArray(ordensCompra) && Array.isArray(ordensCompra) && ordensCompra.length > 0 && (
          <>
            <h4 style={{ marginTop: 10 }}>Suas ordens de compra</h4>
            {ordensCompra.map((o) => {
              const minha = String(o.usuarioId) === String(meuId);
              if (!minha) return null;
              return (
                <Linha key={`myb-${o.id}`} $minha={minha}>
                  <span>{o.quantidade} cotas</span>
                  <strong>R$ {Number(o.preco).toFixed(2)}</strong>
                  <BotaoCancelar onClick={() => onCancelar?.(o.id)}>Cancelar</BotaoCancelar>
                </Linha>
              );
            })}
          </>
        )}
      </Col>

      <Col>
        <h4>Ordens de Venda</h4>
        {niveisVenda.length === 0 && <Empty>Nenhuma ordem de venda</Empty>}
        {niveisVenda.map((n, i) => (
          <Row key={`a-${i}`} onClick={() => onSelecionarPreco?.(n.preco)}>
            <LevelBar
              style={{ width: `${(n.qtd / maxQtdSell) * 100}%`, background: '#7A1D2A' }}
            />
            <span className="preco">R$ {n.preco.toFixed(2)}</span>
            <span className="qtd">{n.qtd} cotas</span>
          </Row>
        ))}

        {/* ---- SUAS ORDENS DE VENDA (individuais) ---- */}
        {Array.isArray(ordensVenda) && ordensVenda.length > 0 && (
          <>
            <h4 style={{ marginTop: 10 }}>Suas ordens de venda</h4>
            {ordensVenda.map((o) => {
              const minha = String(o.usuarioId) === String(meuId);
              if (!minha) return null;
              return (
                <Linha key={`mya-${o.id}`} $minha={minha}>
                  <span>{o.quantidade} cotas</span>
                  <strong>R$ {Number(o.preco).toFixed(2)}</strong>
                  <BotaoCancelar onClick={() => onCancelar?.(o.id)}>Cancelar</BotaoCancelar>
                </Linha>
              );
            })}
          </>
        )}
      </Col>
    </Grid>
  </Wrap>
);

}

/* === styles === */

const Wrap = styled.div`
  margin-top: 16px;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 8px;
  margin-bottom: 8px;

  div {
    background: #0F1524;
    border: 1px solid #20263a;
    border-radius: 8px;
    padding: 8px 10px;
    display:flex; flex-direction:column; gap:4px;
    small { color: #98a2b3; font-size: 11px; }
    strong { color:#e4e7ec; font-weight:600; }
  }
`;

const Toolbar = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  gap: 8px; margin-bottom: 10px;

  button {
    background:#1f6feb;
    color:#fff; border:0; border-radius:8px; padding:6px 10px; cursor:pointer;
  }
  button:disabled { opacity:.6; cursor:not-allowed; }
  .spread { color:#98a2b3; font-size: 12px; }
`;

const Grid = styled.div`
  display:grid; grid-template-columns: 1fr 1fr; gap: 12px;
`;

const Col = styled.div`
  background:#0F1524; border:1px solid #20263a; border-radius:10px; padding:10px;

  h4 { margin:0 0 8px 0; color:#cbd5e1; font-size:14px; }
`;

const Row = styled.div`
  position:relative;
  display:flex; align-items:center; gap:10px;
  border:1px solid #1E2638; background:#0b0f1a; border-radius:8px;
  padding:8px; margin:6px 0; cursor:pointer; overflow:hidden;

  .preco { color:#e4e7ec; font-variant-numeric: tabular-nums; }
  .qtd { margin-left:auto; color:#94a3b8; font-size:12px; }
`;

const LevelBar = styled.span`
  position:absolute; inset:0; height:100%; opacity:.2; pointer-events:none;
`;

const Empty = styled.div`
  color:#94a3b8; font-size:12px; padding:12px; border:1px dashed #223;
  border-radius:8px; text-align:center;
`;

const Linha = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:.5rem;
  padding:.35rem .5rem; border-radius:6px;
  background: ${({$minha}) => $minha ? 'rgba(255,255,255,.06)' : 'transparent'};
`;
const BotaoCancelar = styled.button`
  font-size:.75rem; padding:.25rem .5rem; border-radius:4px; border:0;
  background:#ef4444; color:#fff; cursor:pointer;
  &:hover{ filter:brightness(.95); }
`;
