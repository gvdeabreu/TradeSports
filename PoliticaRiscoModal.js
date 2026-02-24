import React, { useRef, useState } from "react";

export default function PoliticaRiscoModal({ onClose, onAceitar, exigirAceite = false }) {
  const conteudoRef = useRef(null);
  const [chegouAoFim, setChegouAoFim] = useState(false);

  function handleScroll() {
    const el = conteudoRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setChegouAoFim(true);
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>Política de Risco – TradeSports</h2>

        <div ref={conteudoRef} onScroll={handleScroll} style={conteudo}>
          <p><strong>1. Risco de perda total</strong></p>
          <p>O usuário pode perder total ou parcialmente os valores utilizados na plataforma.</p>

          <p><strong>2. Volatilidade esportiva</strong></p>
          <p>Os preços variam conforme desempenho esportivo, eventos imprevisíveis e mercado.</p>

          <p><strong>3. Liquidez limitada</strong></p>
          <p>Não há garantia de execução de ordens ou liquidez imediata.</p>

          <p><strong>4. Dividendos não garantidos</strong></p>
          <p>Dividendos são condicionais e podem não ocorrer.</p>

          <p><strong>5. Alteração de regras</strong></p>
          <p>A plataforma pode alterar regras para garantir sustentabilidade.</p>

          <p><strong>6. Ausência de regulação financeira</strong></p>
          <p>A TradeSports não é instituição financeira nem produto regulado.</p>

          <p><strong>7. Responsabilidade do usuário</strong></p>
          <p>O usuário assume total responsabilidade por suas decisões.</p>
        </div>

        <div style={{ marginTop: 15, textAlign: "right" }}>
          {!exigirAceite && (
            <button onClick={onClose}>Fechar</button>
          )}

          {exigirAceite && (
            <button onClick={onAceitar} disabled={!chegouAoFim}>
              Li e compreendo os riscos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  width: "600px",
  maxHeight: "80vh",
  padding: "20px",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
};

const conteudo = {
  overflowY: "auto",
  border: "1px solid #ddd",
  padding: "10px",
  marginTop: "10px",
  flexGrow: 1,
};
