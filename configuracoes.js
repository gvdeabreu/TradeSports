import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Configuracoes() {
  const router = useRouter();
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [sonsAtivos, setSonsAtivos] = useState(true);
  const [toastsAtivos, setToastsAtivos] = useState(true);
  const [intervaloAtualizacao, setIntervaloAtualizacao] = useState(1000);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const preferencias = JSON.parse(localStorage.getItem('preferencias')) || {};
      setTemaEscuro(preferencias.temaEscuro || false);
      setSonsAtivos(preferencias.sonsAtivos !== false);
      setToastsAtivos(preferencias.toastsAtivos !== false);
      setIntervaloAtualizacao(preferencias.intervaloAtualizacao || 1000);
    }
  }, []);

  const salvarPreferencias = () => {
    const prefs = {
      temaEscuro,
      sonsAtivos,
      toastsAtivos,
      intervaloAtualizacao,
    };
    localStorage.setItem('preferencias', JSON.stringify(prefs));
    toast.success('Preferências salvas com sucesso!');
  };

  const excluirConta = async () => {
    const confirmar = confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.');
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar logado para excluir sua conta.');
        return;
      }

      await axios.delete('http://localhost:4001/usuario', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      toast.success('Conta excluída com sucesso!');
      localStorage.clear();
      router.push('/');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta. Tente novamente mais tarde.');
    }
  };

  return (
    <Container>
      <h1>Configurações</h1>

      <Secao>
        <h2>Preferências</h2>
        <Checkbox>
          <input type="checkbox" checked={temaEscuro} onChange={() => setTemaEscuro(!temaEscuro)} />
          <label>Usar tema escuro</label>
        </Checkbox>

        <Checkbox>
          <input type="checkbox" checked={sonsAtivos} onChange={() => setSonsAtivos(!sonsAtivos)} />
          <label>Ativar sons</label>
        </Checkbox>

        <Checkbox>
          <input type="checkbox" checked={toastsAtivos} onChange={() => setToastsAtivos(!toastsAtivos)} />
          <label>Mostrar notificações (toasts)</label>
        </Checkbox>

        <div>
          <label>Intervalo de atualização (ms):</label>
          <Select onChange={(e) => setIntervaloAtualizacao(Number(e.target.value))} value={intervaloAtualizacao}>
            <option value={500}>500ms</option>
            <option value={1000}>1000ms</option>
            <option value={2000}>2000ms</option>
          </Select>
        </div>

        <Botao onClick={salvarPreferencias}>Salvar Preferências</Botao>
      </Secao>

      <Secao>
        <h2>Privacidade</h2>
        <p>
          Ao usar nossa plataforma, você concorda com nossos{' '}
          <a href="#">termos de uso</a> e <a href="#">política de privacidade</a>.
        </p>
        <BotaoVermelho onClick={excluirConta}>Excluir minha conta</BotaoVermelho>
      </Secao>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  color: white;
`;

const Secao = styled.div`
  margin-top: 2rem;

  h2 {
    margin-bottom: 0.5rem;
    color: #38bdf8;
  }

  p {
    color: #cbd5e1;
  }

  a {
    color: #3b82f6;
    text-decoration: underline;
  }
`;

const Checkbox = styled.div`
  margin: 0.8rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    font-size: 1rem;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  background: #1e293b;
  color: white;
  border-radius: 6px;
  margin-top: 0.5rem;
`;

const Botao = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #3b82f6;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;

const BotaoVermelho = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #ef4444;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #dc2626;
  }
`;