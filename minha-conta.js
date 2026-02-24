// pages/minha-conta.js
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
import withAuth from '../components/withAuth';

export default function withAuth(MinhaConta) {
  const [usuario, setUsuario] = useState(null);
  const [carteira, setCarteira] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [erro, setErro] = useState('');
  const [patrimonio, setPatrimonio] = useState([]);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const usuarioLocal = localStorage.getItem('usuario');
    if (usuarioLocal && usuarioLocal !== 'undefined') {
      try {
        setUsuario(JSON.parse(usuarioLocal));
      } catch (e) {
        console.warn('Erro ao carregar usuário:', e);
      }
    }
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resHistorico, resTransacoes, resCarteira, resPatrimonio] = await Promise.all([
          axios.get('http://localhost:4001/usuario/historico', {
            headers: { authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:4001/usuario/transacoes', {
            headers: { authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:4001/usuario/carteira', {
            headers: { authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:4001/usuario/patrimonio', {
            headers: { authorization: `Bearer ${token}` },
          }),
        ]);

        setHistorico(resHistorico.data || []);
        setTransacoes(resTransacoes.data || []);
        setCarteira(resCarteira.data || []);
        setPatrimonio(resPatrimonio.data || []);
      } catch (err) {
        setErro('Erro ao carregar dados da conta');
        console.error(err);
      }
    };

    carregarDados();
  }, []);

  const totalInvestido = carteira.reduce((acc, ativo) => acc + ativo.quantidade * ativo.precoMedio, 0);
  const totalAtual = carteira.reduce((acc, ativo) => acc + ativo.quantidade * ativo.precoAtual, 0);
  const lucro = totalAtual - totalInvestido;
  return (
    <Container>
      <h1>Minha Conta</h1>

      {erro && <Erro>{erro}</Erro>}

      {usuario && (
        <Resumo>
          <Linha><strong>Usuário:</strong> {usuario.nome}</Linha>
          <Linha><strong>Saldo:</strong> R$ {usuario.saldo?.toFixed(2)}</Linha>
          <Linha><strong>Total em Carteira:</strong> R$ {totalAtual.toFixed(2)}</Linha>
          <Linha style={{ color: lucro >= 0 ? '#22c55e' : '#ef4444' }}>
            <strong>Lucro/Prejuízo:</strong> R$ {lucro.toFixed(2)}
          </Linha>
        </Resumo>
      )}

      {patrimonio.length > 0 && (
        <GraficoContainer>
          <h2>Evolução do Patrimônio</h2>
          <Line
            data={{
              labels: patrimonio.map(p => new Date(p.data).toLocaleDateString('pt-BR')),
              datasets: [
                {
                  label: 'Patrimônio Total (R$)',
                  data: patrimonio.map(p => p.valor),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                }
              ]
            }}
            options={{
              responsive: true,
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </GraficoContainer>
      )}

      <Secao>
        <h2>Últimas Ordens</h2>
        {historico.length === 0 ? (
          <p>Nenhuma ordem registrada.</p>
        ) : (
          <Lista>
            {historico.slice(-5).reverse().map((ordem, i) => (
              <li key={i}>
                [{ordem.tipo.toUpperCase()}] {ordem.clubeNome} - {ordem.quantidade} cotas a R$ {ordem.preco.toFixed(2)} em {new Date(ordem.data).toLocaleString('pt-BR')}
              </li>
            ))}
          </Lista>
        )}
      </Secao>

      <Secao>
        <h2>Transações Financeiras</h2>
        {transacoes.length === 0 ? (
          <p>Nenhuma transação realizada.</p>
        ) : (
          <Lista>
            {transacoes.slice(-5).reverse().map((t, i) => (
              <li key={i}>
                [{t.tipo.toUpperCase()}] R$ {t.valor.toFixed(2)} - {new Date(t.data).toLocaleString('pt-BR')}
              </li>
            ))}
          </Lista>
        )}
      </Secao>

      <AcoesRapidas>
        <Botao onClick={() => router.push('/carteira')}>Ver Carteira</Botao>
        <Botao onClick={() => router.push('/minhas-ordens')}>Ver Ordens</Botao>
        <Botao onClick={() => router.push('/deposito')}>Depositar</Botao>
        <Botao onClick={() => router.push('/saque')}>Sacar</Botao>
      </AcoesRapidas>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  color: white;
`;

const Resumo = styled.div`
  background-color: #1e293b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Linha = styled.p`
  margin: 0.4rem 0;
  strong {
    color: #94a3b8;
  }
`;

const GraficoContainer = styled.div`
  background-color: #1e293b;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;

  h2 {
    color: #38bdf8;
    margin-bottom: 1rem;
  }
`;

const Secao = styled.div`
  margin-top: 2rem;

  h2 {
    margin-bottom: 0.5rem;
    color: #38bdf8;
  }
`;

const Lista = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 0.4rem 0;
    border-bottom: 1px solid #334155;
    color: #e2e8f0;
  }
`;

const AcoesRapidas = styled.div`
  margin-top: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Botao = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;

const Erro = styled.p`
  color: #f87171;
  margin-top: 1rem;
`;
