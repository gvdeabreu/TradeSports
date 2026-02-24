import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Image from 'next/image';
import NegociacaoModal from '../components/NegociacaoModal';
import GraficoClubeModal from '@/components/GraficoClubeModal';

function calcularPrecoLiquidacao(posicao) {
  const precoBase = 5; // Preço fixo do 20º colocado
  return precoBase * Math.pow(1.05, 20 - posicao);
}

function TabelaBrasileirao() {
    const [tabela, setTabela] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
}
export default function brasileiraoA() {
  const [clubes, setClubes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [clubeSelecionado, setClubeSelecionado] = useState({ id: null, nome: '' });
  const [graficoAberto, setGraficoAberto] = useState(false);


const abrirGrafico = (id, nome) => {
  setClubeSelecionado({ id, nome });
  setGraficoAberto(true);
};

const fecharGrafico = () => {
  setGraficoAberto(false);
};


  const abrirModal = (clube) => {
    setClubeSelecionado(clube);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setClubeSelecionado(null);
  };

 useEffect(() => {
  const fetchClassificacao = async () => {
    try {
      const res = await axios.get('http://localhost:4001/api/tabela-laliga');
      const clubesFormatados = res.data.data.map(c => ({
  ...c,
  id: c._id || c.id, // garante compatibilidade
}));
setClubes(clubesFormatados);

    } catch (e) {
      console.error('Erro ao buscar classificação:', e);
    }
  };

  fetchClassificacao();
}, []);


return (
  <Container>
    <Titulo>
      <Image
        src="/images/logos/brasileirao-serie-a.png"
        alt="Logo Brasileirão Série A"
        width={28}
        height={28}
        style={{ marginRight: '10px', verticalAlign: 'middle' }}
      />
      La Liga
    </Titulo>

    {modalAberto && clubeSelecionado && (
      <NegociacaoModal
        isOpen={modalAberto}
        onClose={fecharModal}
        clube={clubeSelecionado}
        modoInicial="compra"
      />
    )}

    <Tabela>
      <thead>
        <tr>
          <th>Posição</th>
          <th>Clube</th>
          <th>IPO/Liquidação</th>
          <th>Preço Mercado</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {clubes.map((clube) => (
          <tr key={clube.id}>
            <td>{clube.posicao}</td>
            <td
              onClick={() => abrirGrafico(clube.id, clube.nome)}
              style={{ cursor: 'pointer', color: '#60a5fa', display: 'flex', alignItems: 'center' }}
            >
              <Image
                src={clube.escudo}
                alt={`Escudo do ${clube.nome}`}
                width={24}
                height={24}
                style={{ marginRight: '8px', verticalAlign: 'middle' }}
              />
              {clube.nome}
            </td>
            <td>R$ {calcularPrecoLiquidacao(clube.posicao).toFixed(2)}</td>
<td>R$ {(clube.precoAtual ?? clube.preco ?? 0).toFixed(2)}</td>
            <td>
              <Botao onClick={() => abrirModal(clube)}>Negociar</Botao>
            </td>
          </tr>
        ))}
      </tbody>
    </Tabela>

    {graficoAberto && clubeSelecionado && (
  <GraficoClubeModal
    aberto={graficoAberto}
    fechar={fecharGrafico}
    clubeId={clubeSelecionado.id}
    clubeNome={clubeSelecionado.nome}
  />
)}

  
  </Container>
);
}

// Styled Components
const Container = styled.div`
  padding: 1rem;
  color: white;
`;

const Titulo = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #101c30;
  color: white;

  th, td {
    padding: 1rem;
    text-align: left;
  }

  th {
    background-color: #162435;
    color: #9ca3af;
    text-transform: uppercase;
    font-size: 0.85rem;
  }

  tr {
    border-bottom: 1px solid #1f2937;
  }

  tr:hover {
    background-color: #1e293b;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
    th, td {
      padding: 0.6rem;
    }
  }
`;

const Botao = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #2563eb;
  }
`;
