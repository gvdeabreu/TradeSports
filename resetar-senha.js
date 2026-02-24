// pages/resetar-senha.js
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useToast } from '../components/ToastProvider';

export default function ResetarSenha() {
  const router = useRouter();
  const { token } = router.query;
  const { adicionarToast } = useToast();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      adicionarToast('Token inválido. Use o link recebido por e-mail.', 'erro');
      return;
    }

    if (!novaSenha || novaSenha.length < 6) {
      adicionarToast('A nova senha deve ter pelo menos 6 caracteres.', 'erro');
      return;
    }

    if (novaSenha !== confirmar) {
      adicionarToast('A confirmação de senha não confere.', 'erro');
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch('http://localhost:4001/resetar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.erro || 'Erro ao redefinir senha.');
      }

      adicionarToast(data.mensagem || 'Senha alterada com sucesso.', 'sucesso');
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
        <Titulo>Criar nova senha</Titulo>
        <Subtitulo>
          Defina uma nova senha para sua conta. Depois, use-a para fazer login normalmente.
        </Subtitulo>

        <Form onSubmit={handleSubmit}>
          <Campo>
            <Label>Nova senha</Label>
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </Campo>

          <Campo>
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repita a senha"
            />
          </Campo>

          <Botao type="submit" disabled={carregando}>
            {carregando ? 'Salvando...' : 'Salvar nova senha'}
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
  background-color: #22c55e;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;

  &:hover {
    background-color: #16a34a;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
