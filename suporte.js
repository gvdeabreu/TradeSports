import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Suporte() {
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState('');
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const usuarioLocal = localStorage.getItem('usuario');
    if (!usuarioLocal || usuarioLocal === 'undefined') {
      router.push('/login');
    } else {
      setUsuario(JSON.parse(usuarioLocal));
    }
  }, []);

  const enviarMensagem = async () => {
    setStatus('');

    if (!assunto || !mensagem) {
      setStatus('❌ Preencha todos os campos.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:4001/suporte',
        { assunto, mensagem },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        });

      setStatus(`✅ ${res.data.mensagem}`);
      setAssunto('');
      setMensagem('');
    } catch (err) {
      const erro = err.response?.data?.erro || 'Erro ao enviar mensagem.';
      setStatus(`❌ ${erro}`);
    }
  };

  return (
    <Container>
      <h1>Central de Suporte</h1>

      <Descricao>Se você tiver dúvidas, sugestões ou encontrou algum problema, entre em contato conosco abaixo.</Descricao>

      <Form>
        <label>Assunto</label>
        <Input
          type="text"
          placeholder="Ex: Problema com saque"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
        />

        <label>Mensagem</label>
        <Textarea
          rows={6}
          placeholder="Descreva com detalhes o que aconteceu..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />

        <Botao onClick={enviarMensagem}>Enviar Mensagem</Botao>
        {status && <Status>{status}</Status>}
      </Form>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  color: white;
`;

const Descricao = styled.p`
  color: #cbd5e1;
  margin-top: -0.5rem;
  margin-bottom: 2rem;
`;

const Form = styled.div`
  background-color: #1e293b;
  padding: 1.5rem;
  border-radius: 8px;

  label {
    font-weight: 500;
    margin-top: 1rem;
    display: block;
    color: #e2e8f0;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: none;
  color: white;
  border-radius: 6px;
  margin-top: 0.5rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: none;
  color: white;
  border-radius: 6px;
  margin-top: 0.5rem;
`;

const Botao = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;

const Status = styled.p`
  margin-top: 1rem;
  font-weight: 500;
  color: ${({ children }) => (children?.startsWith('✅') ? '#22c55e' : '#ef4444')};
`;
