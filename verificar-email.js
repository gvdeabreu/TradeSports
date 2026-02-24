import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

export default function VerificarEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('carregando'); // 'carregando' | 'ok' | 'erro'
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!token) return;

    const verificar = async () => {
      try {
        const res = await fetch(
          `http://localhost:4001/verificar-email?token=${encodeURIComponent(
            token
          )}`
        );
        const data = await res.json();

        if (!res.ok) {
          setStatus('erro');
          setMensagem(data.erro || 'Não foi possível verificar o e-mail.');
        } else {
          setStatus('ok');
          setMensagem(data.mensagem || 'E-mail verificado com sucesso!');
        }
      } catch (err) {
        setStatus('erro');
        setMensagem('Erro ao conectar com o servidor.');
      }
    };

    verificar();
  }, [token]);

  return (
    <Wrapper>
      <Card>
        {status === 'carregando' && <Titulo>Verificando seu e-mail...</Titulo>}

        {status !== 'carregando' && (
          <>
            <Titulo>{status === 'ok' ? 'Tudo certo!' : 'Ops...'}</Titulo>
            <Mensagem>{mensagem}</Mensagem>

            <Botao onClick={() => router.push('/login')}>
              Ir para a tela de login
            </Botao>
          </>
        )}
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
`;

const Card = styled.div`
  background-color: #0f172a;
  color: #e5e7eb;
  padding: 2rem 2.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.4);
  max-width: 480px;
  width: 100%;
  text-align: center;
`;

const Titulo = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
`;

const Mensagem = styled.p`
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  color: #d1d5db;
`;

const Botao = styled.button`
  padding: 0.7rem 1.5rem;
  background-color: #3b82f6;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;
