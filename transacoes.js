import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:4001/usuario/transacoes-completas', {
          headers: {
            authorization: `Bearer ${token}`
          }
        });
        setTransacoes(res.data);
      } catch (err) {
        setErro('Erro ao carregar transações.');
        console.error(err);
      }
    };

    fetchTransacoes();
  }, []);

  return (
    <Container>
      <h1>Histórico de Transações</h1>

      {erro && <Erro>{erro}</Erro>}

      {transacoes.length === 0 ? (
        <p>Nenhuma transação registrada até o momento.</p>
      ) : (
        <Tabela>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Clube</th>
              <th>Quantidade</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.slice().reverse().map((t, i) => (
              <tr key={i}>
                <td style={{ color: t.tipo === 'deposito' || t.tipo === 'venda' ? '#22c55e' : '#ef4444' }}>
                  {t.tipo.toUpperCase()}
                </td>
                <td>R$ {t.valor.toFixed(2)}</td>
                <td>{t.clubeNome || '-'}</td>
                <td>{t.quantidade || '-'}</td>
                <td>{new Date(t.data).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  color: white;
`;

const Tabela = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background-color: #1e293b;
  font-size: 0.95rem;

  th, td {
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background-color: #0f172a;
    color: #94a3b8;
    text-transform: uppercase;
    font-size: 0.85rem;
  }

  tr {
    border-bottom: 1px solid #334155;
  }

  tr:hover {
    background-color: #0f172a;
  }
`;

const Erro = styled.p`
  color: #f87171;
  margin-top: 1rem;
`;