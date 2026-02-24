// pages/admin.js
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Admin() {
  const [clubes, setClubes] = useState([]);
  const [posicoes, setPosicoes] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const usuario = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('usuario')) : null;

  // Proteção: apenas admin
  useEffect(() => {
    if (!usuario || usuario.email !== 'admin@plataforma.com') {
      router.push('/');
    }
  }, []);

  // Carrega clubes
  useEffect(() => {
    const carregarClubes = async () => {
      try {
        const res = await axios.get('http://localhost:4001/clubes');
        setClubes(res.data);

        const posicoesIniciais = {};
        res.data.forEach(c => {
          posicoesIniciais[c.id] = c.posicao;
        });
        setPosicoes(posicoesIniciais);
      } catch (err) {
        setErro('Erro ao carregar clubes.');
      }
    };

    carregarClubes();
  }, []);

  const handleChange = (clubeId, novaPosicao) => {
    setPosicoes(prev => ({ ...prev, [clubeId]: parseInt(novaPosicao) }));
  };

  const salvarRodada = async () => {
    try {
      const clubesAtualizados = clubes.map(c => ({
        id: c.id,
        novaPosicao: posicoes[c.id]
      }));

      await axios.post('http://localhost:4001/admin/rodada', {
        clubesAtualizados
      }, {
        headers: { authorization: `Bearer ${token}` }
      });

      setMensagem('✅ Rodada atualizada com sucesso!');
      setErro('');
    } catch (err) {
      setErro('❌ Erro ao atualizar rodada.');
      setMensagem('');
    }
  };

  const sincronizarRodada = async () => {
    try {
      await axios.post('http://localhost:4001/admin/sincronizar-api', {}, {
        headers: { authorization: `Bearer ${token}` }
      });

      setMensagem('✅ Sincronizado com dados reais!');
      setErro('');
    } catch (err) {
      setErro('❌ Falha ao sincronizar com a API externa.');
      setMensagem('');
    }
  };

  return (
    <Container>
      <h1>Admin - Atualizar Rodada</h1>

      {mensagem && <Mensagem>{mensagem}</Mensagem>}
      {erro && <Erro>{erro}</Erro>}

      <Botoes>
        <Botao onClick={salvarRodada}>Salvar Nova Rodada</Botao>
        <BotaoSecundario onClick={sincronizarRodada}>Sincronizar com API real</BotaoSecundario>
      </Botoes>

      <Tabela>
        <thead>
          <tr>
            <th>Clube</th>
            <th>Posição Atual</th>
            <th>Nova Posição</th>
          </tr>
        </thead>
        <tbody>
          {clubes.map(clube => (
            <tr key={clube.id}>
              <td>{clube.nome}</td>
              <td>{clube.posicao}</td>
              <td>
                <select
                  value={posicoes[clube.id] || clube.posicao}
                  onChange={(e) => handleChange(clube.id, e.target.value)}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(pos => (
                    <option key={pos} value={pos}>{pos}º</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </Tabela>
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
  background-color: #1e293b;
  margin-top: 1rem;
  border-collapse: collapse;
  font-size: 0.95rem;

  th, td {
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background-color: #0f172a;
    color: #94a3b8;
  }

  tr {
    border-bottom: 1px solid #334155;
  }

  select {
    padding: 0.4rem;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 4px;
  }
`;

const Botoes = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
`;

const Botao = styled.button`
  background-color: #16a34a;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #15803d;
  }
`;

const BotaoSecundario = styled(Botao)`
  background-color: #1d4ed8;
  &:hover {
    background-color: #1e40af;
  }
`;

const Mensagem = styled.p`
  color: #22c55e;
  font-weight: bold;
  margin-top: 1rem;
`;

const Erro = styled.p`
  color: #ef4444;
  font-weight: bold;
  margin-top: 1rem;
`;
