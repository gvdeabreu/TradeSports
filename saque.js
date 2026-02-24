import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useToast } from '../components/ToastProvider';

export default function Saque() {
  const [metodo, setMetodo] = useState('PIX');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [tipoChave, setTipoChave] = useState('cpf');
  const [chavePix, setChavePix] = useState('');
  const [valor, setValor] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { adicionarToast } = useToast();
  const router = useRouter();

  const MINIMO = 30; // R$ 30,00

const VERSAO_REGRAS_FINANCEIRAS = 'v1.0';
const [mostrarRegras, setMostrarRegras] = useState(false);
const [regrasScrollNoFim, setRegrasScrollNoFim] = useState(false);
const regrasScrollRef = useRef(null);

const regrasJaAceitas = () => {
  try {
    const u = JSON.parse(localStorage.getItem('usuario') || 'null');
    const ace = u?.aceitesFinanceiros?.saque;
    return !!ace?.aceitoEm;
  } catch {
    return false;
  }
};

useEffect(() => {
  if (typeof window === 'undefined') return;
  if (!regrasJaAceitas()) {
    setMostrarRegras(true);
    setRegrasScrollNoFim(false);
    setTimeout(() => {
      try { regrasScrollRef.current?.scrollTo?.(0, 0); } catch {}
    }, 0);
  }
}, []);


  const obterSaldoLocal = () => {
    if (typeof window === 'undefined') return 0;
    const bruto = localStorage.getItem('saldo');
    const num = parseFloat(bruto?.replace(',', '.') || '0');
    return Number.isFinite(num) ? num : 0;
  };

  const handleSaque = async () => {
    if (!regrasJaAceitas()) {
      setMostrarRegras(true);
      adicionarToast('Antes de continuar, leia e aceite as Regras de Saque.', 'erro');
      return;
    }
    const valorNumerico = Number(valor.replace(',', '.'));

    if (metodo !== 'PIX') {
      adicionarToast('No momento apenas PIX está disponível para saque.', 'erro');
      return;
    }

    if (!nome || nome.trim().split(' ').length < 2) {
      adicionarToast('Informe o nome completo do titular da conta.', 'erro');
      return;
    }

    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      adicionarToast('Informe um CPF válido (11 dígitos).', 'erro');
      return;
    }

    if (!chavePix || chavePix.trim().length < 3) {
      adicionarToast('Informe uma chave PIX válida.', 'erro');
      return;
    }

    if (!Number.isFinite(valorNumerico) || valorNumerico < MINIMO) {
      adicionarToast(
        `O valor mínimo para saque é de R$ ${MINIMO.toFixed(2)}.`,
        'erro'
      );
      return;
    }

    const saldoAtual = obterSaldoLocal();
    if (valorNumerico > saldoAtual) {
      adicionarToast(
        `Saldo insuficiente. Saldo disponível: R$ ${saldoAtual.toFixed(2)}.`,
        'erro'
      );
      return;
    }

    setCarregando(true);

    try {
      // aqui você manda todos os dados relevantes para o backend / gateway
      const res = await api.post('/usuario/saque', {
        valor: valorNumerico,
        metodo: 'PIX',
        nomeTitular: nome.trim(),
        cpfTitular: cpf.replace(/\D/g, ''),
        tipoChavePix: tipoChave,
        chavePix: chavePix.trim(),
      });

      const usuarioAtualizado = res.data?.usuario ?? res.data;

      if (usuarioAtualizado) {
        localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

        if (typeof usuarioAtualizado.saldo === 'number') {
          localStorage.setItem('saldo', usuarioAtualizado.saldo.toFixed(2));
        }

        // atualiza Topbar e poder de compra em tempo real
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('force-topbar-update'));
      }

      adicionarToast(
        'Pedido de saque registrado com sucesso! O processamento será feito pela nossa equipe/gateway.',
        'sucesso'
      );

      router.push('/carteira');
    } catch (err) {
      const msg =
        err?.response?.data?.erro ||
        err?.response?.data?.message ||
        'Erro ao realizar saque.';
      adicionarToast(msg, 'erro');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Container>
      <Card>
        <Titulo>Saque</Titulo>

        {/* Método de saque */}
        <Campo>
          <Label>Método de Saque</Label>
          <Select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            disabled
          >
            <option value="PIX">PIX</option>
            {/* no futuro: TED, DOC etc. */}
          </Select>
        </Campo>

        {/* Aviso de segurança */}
        <Aviso>
          O saque será processado para uma conta bancária de mesma titularidade.
          Certifique-se de que o nome e o CPF informados sejam os mesmos do
          titular da conta que receberá o valor. Saques para terceiros podem ser
          recusados pelo banco ou pelo gateway de pagamentos.
        </Aviso>

        {/* Nome completo */}
        <Campo>
          <Label>Nome completo do titular</Label>
          <Input
            type="text"
            placeholder="Ex: João da Silva Souza"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </Campo>

        {/* CPF */}
        <Campo>
          <Label>CPF do titular</Label>
          <Input
            type="text"
            placeholder="Somente números"
            value={cpf}
            onChange={(e) =>
              setCpf(e.target.value.replace(/[^\d]/g, '').slice(0, 11))
            }
          />
        </Campo>

        {/* Tipo chave PIX */}
        <Campo>
          <Label>Tipo de chave PIX</Label>
          <Select
            value={tipoChave}
            onChange={(e) => setTipoChave(e.target.value)}
          >
            <option value="cpf">CPF</option>
            <option value="email">E-mail</option>
            <option value="celular">Celular</option>
            <option value="aleatoria">Chave aleatória</option>
          </Select>
        </Campo>

        {/* Chave PIX */}
        <Campo>
          <Label>Chave PIX</Label>
          <Input
            type="text"
            placeholder="Informe a chave PIX que receberá o saque"
            value={chavePix}
            onChange={(e) => setChavePix(e.target.value)}
          />
        </Campo>

        {/* Valor do saque */}
        <Campo>
          <Label>
            Valor do Saque <SpanMin>Min. R$ {MINIMO.toFixed(2)}</SpanMin>
          </Label>
          <Input
            type="number"
            min={MINIMO}
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="R$ 0,00"
          />
        </Campo>

        <BotaoSaque disabled={carregando} onClick={handleSaque}>
          {carregando ? 'Processando...' : 'Solicitar Saque'}
        </BotaoSaque>
      </Card>


{mostrarRegras && (
  <Overlay onClick={() => setMostrarRegras(false)}>
    <Modal onClick={(e) => e.stopPropagation()}>
      <ModalHeader>
        <ModalTitle>Regras de Depósito e Saque</ModalTitle>
        <Fechar type="button" onClick={() => setMostrarRegras(false)} aria-label="Fechar">
          ✕
        </Fechar>
      </ModalHeader>

      <ModalBody
        ref={regrasScrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            setRegrasScrollNoFim(true);
          }
        }}
      >
        <TermosPre>{`REGRAS DE DEPÓSITO E SAQUE – TRADESPORTS

Versão: v1.0

1. Depósitos (PIX)
1.1. Depósitos são feitos via PIX para a conta do site.
1.2. O crédito do valor pode depender de confirmação do banco/gateway e de validações antifraude.
1.3. O CPF do pagador pode precisar coincidir com o CPF cadastrado. Depósitos de terceiros podem ser recusados ou retidos para validação.
1.4. A TradeSports pode solicitar comprovação/validação adicional antes de liberar saldo.

2. Saques (PIX)
2.1. Saques são destinados a conta/Chave PIX de mesma titularidade (mesmo CPF do cadastro).
2.2. A TradeSports pode reter ou atrasar saques para validações de segurança, prevenção à fraude, chargeback e cumprimento de políticas internas.
2.3. Prazos: pedidos de saque podem levar até 3 dias úteis para processamento (ou outro prazo definido pela plataforma/gateway).
2.4. Em caso de inconsistência de dados, o saque poderá ser recusado e o usuário será orientado a corrigir as informações.

3. Limites, bloqueios e cancelamentos
3.1. A TradeSports pode aplicar limites mínimos/máximos, bloqueios temporários e revisões manuais.
3.2. Operações suspeitas podem gerar congelamento de saldo e exigência de verificação adicional.

4. Disposições finais
4.1. Estas regras complementam os Termos de Uso e as Políticas do site.
4.2. A versão pode ser atualizada por motivos técnicos, operacionais e de segurança.
`}</TermosPre>
      </ModalBody>

      <ModalFooter>
        <ModalHint>
          {!regrasScrollNoFim
            ? 'Role até o final para habilitar o botão “Li e entendi”.'
            : 'Ao confirmar, registraremos seu aceite desta versão (v1.0).'}
        </ModalHint>

        <ModalActions>
          <BotaoSec type="button" onClick={() => setMostrarRegras(false)}>
            Voltar
          </BotaoSec>

          <BotaoPrim
            type="button"
            disabled={!regrasScrollNoFim}
            onClick={async () => {
              try {
                const res = await api.post('/usuario/aceites-financeiros', {
                  tipo: 'SAQUE',
                  versao: VERSAO_REGRAS_FINANCEIRAS,
                });

                const usuarioAtualizado = res.data?.usuario ?? res.data;
                if (usuarioAtualizado) {
                  localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
                  if (typeof usuarioAtualizado.saldo === 'number') {
                    localStorage.setItem('saldo', usuarioAtualizado.saldo.toFixed(2));
                  }
                  window.dispatchEvent(new Event('storage'));
                  window.dispatchEvent(new Event('force-topbar-update'));
                }

                adicionarToast('Regras aceitas com sucesso.', 'sucesso');
                setMostrarRegras(false);
              } catch (err) {
                const msg =
                  err?.response?.data?.erro ||
                  err?.response?.data?.message ||
                  'Erro ao registrar aceite.';
                adicionarToast(msg, 'erro');
              }
            }}
          >
            Li e entendi
          </BotaoPrim>
        </ModalActions>
      </ModalFooter>
    </Modal>
  </Overlay>
)}


    </Container>
  );
}

/* ================== STYLED COMPONENTS ================== */

const Container = styled.div`
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
  padding: 1.5rem 1.75rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
`;

const Titulo = styled.h1`
  font-size: 1.4rem;
  margin: 0 0 1rem 0;
  color: #111827;
`;

const Campo = styled.div`
  margin-top: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.35rem;
  color: #4b5563;
`;

const SpanMin = styled.span`
  font-size: 0.8rem;
  color: #9ca3af;
  margin-left: 0.4rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.55rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  font-size: 0.95rem;
`;

const Aviso = styled.p`
  margin-top: 1rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: #b91c1c;
  background-color: #fee2e2;
  border-radius: 4px;
  padding: 0.6rem 0.7rem;
`;

const BotaoSaque = styled.button`
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background-color: #16a34a;
  color: white;

  &:hover {
    background-color: #16a34a;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;


// ================== MODAL REGRAS (overlay) ==================
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 10000;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 760px;
  max-height: 85vh;
  background: #0b1220;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 18px 60px rgba(0,0,0,0.55);
  color: #e5e7eb;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.75);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
`;

const Fechar = styled.button`
  background: transparent;
  border: none;
  color: #e5e7eb;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 6px 10px;
  border-radius: 8px;

  &:hover {
    background: rgba(148, 163, 184, 0.14);
  }
`;

const ModalBody = styled.div`
  padding: 14px 16px;
  overflow: auto;
  max-height: 55vh;
`;

const TermosPre = styled.pre`
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.45;
  color: #e5e7eb;
`;

const ModalFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.6);
`;

const ModalHint = styled.div`
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.85);
  margin-bottom: 10px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const BotaoSec = styled.button`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: transparent;
  color: #e5e7eb;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: rgba(148, 163, 184, 0.12);
  }
`;

const BotaoPrim = styled.button`
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: white;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
