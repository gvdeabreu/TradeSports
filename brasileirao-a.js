import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import axios from 'axios';
import Image from 'next/image';
import NegociacaoModal from '../components/NegociacaoModal';

function calcularPrecoLiquidacao(posicao) {
  const precoBase = 5; // Preço fixo do 20º colocado
  return precoBase * Math.pow(1.05, 20 - posicao);
}

export default function BrasileiraoA() {
  const router = useRouter();

  const [clubes, setClubes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [clubeSelecionado, setClubeSelecionado] = useState({ id: null, nome: '' });

  const abrirModal = (clube) => {
    setClubeSelecionado(clube);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setClubeSelecionado(null);
  };

  // ✅ Clique no nome do clube abre a página do clube
  const abrirPaginaClube = (clubeId) => {
    router.push(`/clube/${clubeId}`);
  };

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [resTabela, resClubes] = await Promise.all([
          axios.get('http://localhost:4001/api/tabela-brasileirao'),
          // 🔹 Usa o clubes.json do backend (o mesmo que recebe precoAtual)
          axios.get('http://localhost:4001/clube/clubes'),
        ]);

        const clubesApi = resTabela.data.data;
        const clubesJson = resClubes.data;

        const clubesCruzados = clubesApi
          .map((clubeApi) => {
            // 🔹 Casamento por NOME
            const clubeLocal = clubesJson.find(
              (c) =>
                (c.nome || '').toLowerCase().replace(/\s/g, '') ===
                (clubeApi.nome || '').toLowerCase().replace(/\s/g, '')
            );

            if (!clubeLocal) return null;

            return {
              id: clubeLocal.id,
              nome: clubeLocal.nome,
              escudo: clubeApi.escudo || '',
              posicao: clubeApi.posicao,

              // Preço "teórico" armazenado no clubes.json (IPO/Liquidação fixo por posição inicial)
              preco: Number(clubeLocal.preco || 0),

              // Último preço negociado salvo no clubes.json
              precoAtual: clubeLocal.precoAtual != null ? Number(clubeLocal.precoAtual) : undefined,

              cotasDisponiveis: clubeLocal.cotasDisponiveis,
              ipoEncerrado: clubeLocal.ipoEncerrado,
            };
          })
          .filter(Boolean);

        setClubes(clubesCruzados);
      } catch (e) {
        console.error('Erro ao buscar dados:', e);
      }
    };

    fetchDados();
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
        Brasileirão Série A
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

              {/* ✅ Clique no nome abre página do clube (não mexe no modal) */}
              <td
                onClick={() => abrirPaginaClube(clube.id)}
                style={{
                  cursor: 'pointer',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                }}
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

              {/* IPO/Liquidação mostrado pela posição atual da API (só display) */}
              <td>R$ {calcularPrecoLiquidacao(clube.posicao).toFixed(2)}</td>

              {/* Preço Mercado = precoAtual (último trade); fallback pra preco */}
              <td>R$ {(clube.precoAtual ?? clube.preco ?? 0).toFixed(2)}</td>

              <td>
                <Botao onClick={() => abrirModal(clube)}>Negociar</Botao>
              </td>
            </tr>
          ))}
        </tbody>
      </Tabela>
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

  th,
  td {
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
    th,
    td {
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
