// components/Topbar.js
import styled from 'styled-components';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '../components/ToastProvider';

export default function Topbar() {
  const [saldo, setSaldo] = useState('0.00');
  const [usuario, setUsuario] = useState(null);

  // dropdown Banco
  const [bancoAberto, setBancoAberto] = useState(false);
  const bancoRef = useRef(null);

  // 1) Carrega usuário e saldo do localStorage ao montar
  useEffect(() => {
    try {
      const usuarioSalvo = localStorage.getItem('usuario');
      if (usuarioSalvo && usuarioSalvo !== 'undefined') {
        const parsed = JSON.parse(usuarioSalvo);
        setUsuario(parsed);
        if (parsed?.saldo !== undefined) {
          setSaldo(String(parsed.saldo));
        }
      }

      const saldoSalvo = localStorage.getItem('saldo');
      if (saldoSalvo) {
        setSaldo(saldoSalvo);
      }
    } catch (e) {
      console.warn('[Topbar] Erro ao parsear localStorage:', e);
    }
  }, []);

  // 2) Sempre que o usuário mudar, atualiza o saldo exibido
  useEffect(() => {
    if (usuario?.saldo !== undefined) {
      setSaldo(String(usuario.saldo));
    }
  }, [usuario]);

  // 3) Escuta mudanças no localStorage e evento customizado
  useEffect(() => {
    const atualizarTopbar = () => {
      try {
        const usuarioSalvo = localStorage.getItem('usuario');
        setUsuario(
          usuarioSalvo && usuarioSalvo !== 'undefined'
            ? JSON.parse(usuarioSalvo)
            : null
        );

        const saldoSalvo = localStorage.getItem('saldo');
        if (saldoSalvo) {
          setSaldo(saldoSalvo);
        } else if (usuarioSalvo) {
          const u = JSON.parse(usuarioSalvo);
          if (u?.saldo !== undefined) {
            setSaldo(String(u.saldo));
          }
        }
      } catch (e) {
        console.warn('[Topbar] Erro ao atualizar via evento:', e);
      }
    };

    window.addEventListener('storage', atualizarTopbar);
    window.addEventListener('force-topbar-update', atualizarTopbar);

    return () => {
      window.removeEventListener('storage', atualizarTopbar);
      window.removeEventListener('force-topbar-update', atualizarTopbar);
    };
  }, []);

  // 4) Watcher de saldo
  useEffect(() => {
    let ultimoSaldo = null;

    const checarSaldo = () => {
      try {
        const saldoLocal = localStorage.getItem('saldo');
        if (saldoLocal && saldoLocal !== ultimoSaldo) {
          ultimoSaldo = saldoLocal;
          setSaldo(saldoLocal);

          const usuarioSalvo = localStorage.getItem('usuario');
          if (usuarioSalvo && usuarioSalvo !== 'undefined') {
            setUsuario(JSON.parse(usuarioSalvo));
          }
        }
      } catch (e) {
        console.warn('[Topbar] Erro ao checar saldo:', e);
      }
    };

    const intervalo = setInterval(checarSaldo, 500);
    return () => clearInterval(intervalo);
  }, []);

  // fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickFora = (e) => {
      if (!bancoAberto) return;
      if (bancoRef.current && !bancoRef.current.contains(e.target)) {
        setBancoAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [bancoAberto]);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  const toggleBanco = () => setBancoAberto((v) => !v);

  const fecharBanco = () => setBancoAberto(false);

  return (
    <Barra>
      <Logo>
        <Link href="/">🏆 TradeSports</Link>
      </Logo>

      <Menu>
        {usuario ? (
          <>
            <Info>
              <Usuario>👤 {usuario.nomeUsuario || usuario.nome}</Usuario>
              <Saldo>💰 R$ {parseFloat(saldo || 0).toFixed(2)}</Saldo>
            </Info>

            <BancoWrap ref={bancoRef}>
              <BotaoVerde onClick={toggleBanco} aria-expanded={bancoAberto}>
                Banco
              </BotaoVerde>

              {bancoAberto && (
                <Dropdown>
                  <DropLink href="/carteira" onClick={fecharBanco}>Carteira</DropLink>
                  <DropLink href="/minhas-ordens" onClick={fecharBanco}>Minhas Ordens</DropLink>
                  <DropLink href="/minhas-transacoes" onClick={fecharBanco}>Minhas Transações</DropLink>
                  <DropLink href="/extrato" onClick={fecharBanco}>Extrato</DropLink>
                  <DropLink href="/deposito" onClick={fecharBanco}>Depósito</DropLink>
                  <DropLink href="/saque" onClick={fecharBanco}>Saque</DropLink>
                </Dropdown>
              )}
            </BancoWrap>

            <Botao onClick={handleLogout}>Sair</Botao>
          </>
        ) : (
          <>
            <Link href="/login" passHref>
              <BotaoAzul>Login</BotaoAzul>
            </Link>
            <Link href="/cadastro" passHref>
              <BotaoVerde>Registrar</BotaoVerde>
            </Link>
          </>
        )}
      </Menu>
    </Barra>
  );
}

/* ===================== STYLES ===================== */

const Barra = styled.header`
  width: 96,5%;
  padding: 1rem 2rem;
  background-color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
`;

const Logo = styled.h1`
  font-size: 1.2rem;
  font-weight: bold;

  a {
    color: white;
    text-decoration: none;
  }
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-right: 0.25rem;
`;

const BotaoAzul = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: #2563eb;
  }
`;

const BotaoVerde = styled.button`
  background: #22c55e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: #16a34a;
  }
`;

const Usuario = styled.span`
  font-size: 0.9rem;
`;

const Saldo = styled.span`
  font-size: 0.9rem;
`;

const Botao = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #2563eb;
  }
`;

const BancoWrap = styled.div`
  position: relative;
  display: inline-block;
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  background: #111827;
  border: 1px solid #1e293b;
  border-radius: 10px;
  min-width: 240px;
  padding: 10px;
  z-index: 9999;
  box-shadow: 0 12px 30px rgba(0,0,0,0.35);
`;

const DropLink = styled(Link)`
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  color: #e5e7eb;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    background: rgba(59, 130, 246, 0.18);
  }
`;
