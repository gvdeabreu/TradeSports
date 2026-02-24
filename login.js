import { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';


export default function Login() {
  const [formData, setFormData] = useState({ identificador: '', senha: '' });
  const [erro, setErro] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErro('');

  try {
    const res = await axios.post('http://localhost:4001/api/login', formData);

    if (res.data?.usuario) {
      const usuario = res.data.usuario;

      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
localStorage.setItem('saldo', res.data.usuario.saldo.toFixed(2));
localStorage.setItem('token', res.data.token);

// 🔔 Força a atualização do Topbar
window.dispatchEvent(new Event('force-topbar-update'));

router.push('/');

      // Redireciona para home ou dashboard
      
    } else {
      setErro('Resposta inesperada do servidor');
    }

  } catch (err) {
    setErro(err.response?.data?.erro || 'Erro ao logar');
  }
};
const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <Input
          name="identificador"
          placeholder="Email ou Nome de Usuário"
          value={formData.identificador}
          onChange={handleChange}
          required
        />
        <Input
          name="senha"
          type="password"
          placeholder="Senha"
          value={formData.senha}
          onChange={handleChange}
          required
        />
        {erro && <Erro>{erro}</Erro>}
        <Botao type="submit">Entrar</Botao>
      </form>
      <ExtraLinha>
  <Link href="/esqueci-senha">Esqueci minha senha</Link>
</ExtraLinha>

    </Container>
  );
}

// Styled Components
const Container = styled.div`
  max-width: 400px;
  margin: 4rem auto;
  background: #0f172a;
  color: white;
  padding: 2rem;
  border-radius: 8px;
`;

const Input = styled.input`
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.7rem;
  border: none;
  border-radius: 4px;
  background: #1e293b;
  color: white;
`;

const Botao = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;

const Erro = styled.p`
  color: #f87171;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const ExtraLinha = styled.div`
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.85rem;

  a {
    color: #3b82f6;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;
