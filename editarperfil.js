import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const usuarioLocal = localStorage.getItem('usuario');
    if (usuarioLocal && usuarioLocal !== 'undefined') {
      const u = JSON.parse(usuarioLocal);
      setUsuario(u);
      setNome(u.nome || '');
      setEmail(u.email || '');
    }
  }, []);

  const atualizarPerfil = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const res = await axios.put('http://localhost:4001/usuario/perfil', {
        nome,
        email
      }, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      setMensagem('Perfil atualizado com sucesso!');
    } catch (err) {
      setMensagem('Erro ao atualizar perfil.');
    }
  };

  const trocarSenha = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      await axios.post('http://localhost:4001/usuario/trocar-senha', {
        senhaAtual,
        novaSenha
      }, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      setMensagem('Senha atualizada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
    } catch (err) {
      setMensagem('Erro ao trocar senha.');
    }
  };

  if (!usuario) return null;
  return (
    <Container>
      <h1>Editar Perfil</h1>

      {mensagem && <Mensagem>{mensagem}</Mensagem>}

      <Form onSubmit={atualizarPerfil}>
        <h2>Dados Pessoais</h2>
        <label>Nome</label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
        <label>Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Botao type="submit">Atualizar Perfil</Botao>
      </Form>

      <Form onSubmit={trocarSenha}>
        <h2>Alterar Senha</h2>
        <label>Senha Atual</label>
        <Input
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          required
        />
        <label>Nova Senha</label>
        <Input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />
        <Botao type="submit">Atualizar Senha</Botao>
      </Form>
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  color: white;
`;

const Form = styled.form`
  background-color: #1e293b;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;

  h2 {
    margin-bottom: 1rem;
    color: #38bdf8;
  }

  label {
    display: block;
    margin-top: 1rem;
    color: #cbd5e1;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.3rem;
  border: none;
  border-radius: 4px;
  background-color: #0f172a;
  color: white;
`;

const Botao = styled.button`
  margin-top: 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #2563eb;
  }
`;

const Mensagem = styled.p`
  margin-top: 1rem;
  color: #22c55e;
`;