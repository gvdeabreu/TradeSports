import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

export default function MensagensSuporte() {
  const [mensagens, setMensagens] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchMensagens = async () => {
      try {
        const res = await axios.get('http://localhost:4001/suporte/mensagens', {
          headers: { authorization: `Bearer ${token}` }
        });
        setMensagens(res.data);
      } catch (err) {
        setErro('Erro ao carregar mensagens');
      }
    };

    fetchMensagens();
  }, []);

  return (
    <Container>
      <h1>Minhas Mensagens</h1>

      {erro && <Erro>{erro}</Erro>}

      {mensagens.length === 0 ? (
        <p>Você ainda não enviou nenhuma mensagem.</p>
      ) : (
        <Lista>
          {mensagens.map((msg, i) => (
            <Item key={i}>
              <strong>{new Date(msg.data).toLocaleString('pt-BR')}</strong>
              <p>{msg.mensagem}</p>
              {msg.resposta && (
                <Resposta>
                  <span>Resposta do suporte:</span>
                  <p>{msg.resposta}</p>
                </Resposta>
              )}
            </Item>
          ))}
        </Lista>
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  color: white;
`;

const Erro = styled.p`
  color: #ef4444;
`;

const Lista = styled.ul`
  list-style: none;
  padding: 0;
`;

const Item = styled.li`
  background-color: #1e293b;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;

  strong {
    color: #38bdf8;
  }

  p {
    margin: 0.5rem 0;
    color: #e2e8f0;
  }
`;

const Resposta = styled.div`
  margin-top: 0.5rem;
  background-color: #0f172a;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid #3b82f6;

  span {
    font-weight: bold;
    color: #3b82f6;
  }

  p {
    margin: 0.2rem 0 0 0;
  }
`;