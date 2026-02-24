import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export default function GraficoClubeModal({ aberto, fechar, clubeId, clubeNome }) {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (aberto && clubeId) {
      fetch(`http://localhost:4001/clubes/${clubeId}/historico`)
        .then(res => res.json())
        .then(setHistorico)
        .catch(() => setHistorico([]));
    }
  }, [aberto, clubeId]);

  if (!aberto) return null;

  const dados = {
    labels: historico.map(h => new Date(h.data).toLocaleDateString()),
    datasets: [{
      label: 'Preço da cota',
      data: historico.map(h => h.preco),
      borderColor: '#16a34a',
      tension: 0.3,
      fill: false
    }]
  };

  return (
    <Overlay onClick={fechar}>
      <Modal onClick={e => e.stopPropagation()}>
        <h3>{clubeNome} – Histórico de Valorização</h3>
        <Line data={dados} />
        <BotaoFechar onClick={fechar}>Fechar</BotaoFechar>
      </Modal>
    </Overlay>
  );
}

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const Modal = styled.div`
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  color: white;
`;

const BotaoFechar = styled.button`
  margin-top: 1rem;
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
`;
