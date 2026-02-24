// pages/esqueci-senha.js
import { useState } from 'react';
import styled from 'styled-components';
import { useToast } from '../components/ToastProvider';
import { useRouter } from 'next/router';

export default function EsqueciSenha() {
  const [emailOuUsuario, setEmailOuUsuario] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { adicionarToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOuUsuario.trim()) {
      adicionarToast('Informe seu e-mail ou nome de usuário.', 'erro');
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch('http://localhost:4001/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOuUsuario }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.erro || 'Erro ao solicitar redefinição de senha.');
      }

      adicionarToast(
        data.mensagem ||
          'Se o usuário existir, você receberá um e-mail com instruções para redefinir a senha.',
        'sucesso'
      );
      router.push('/login');
    } catch (err) {
      adicionarToast(err.message, 'erro');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        <Titulo>Esqueci minha senha</Titulo>
        <Subtitulo>
          Informe seu e-mail ou nome de usuário. Se a conta existir, enviaremos um link para
          redefinir sua senha.
        </Subtitulo>

        <Form onSubmit={handleSubmit}>
          <Campo>
            <Label>E-mail ou usuário</Label>
            <Input
              value={emailOuUsuario}
              onChange={(e) => setEmailOuUsuario(e.target.value)}
              placeholder="seuemail@exemplo.com ou gvinvest"
            />
          </Campo>

          <Botao type="submit" disabled={carregando}>
            {carregando ? 'Enviando...' : 'Enviar link de redefinição'}
          </Botao>
        </Form>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  color: #0f172a;
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 1.75rem 2rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
`;

const Titulo = styled.h1`
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
  color: #111827;
`;

const Subtitulo = styled.p`
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1.25rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Campo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: #4b5563;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  font-size: 0.95rem;
`;

const Botao = styled.button`
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.8rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
