import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useToast } from '../components/ToastProvider';

export default function Deposito() {
  const [metodo, setMetodo] = useState('PIX');
  const [cpf, setCpf] = useState('');
  const [valor, setValor] = useState('');
  const [carregando, setCarregando] = useState(false);

  // dados opcionais para QRCode / copia-e-cola
  const [qrCodeImg, setQrCodeImg] = useState(null);
  const [pixCopiaCola, setPixCopiaCola] = useState('');

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
    const ace = u?.aceitesFinanceiros?.deposito;
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


  const handleDeposito = async () => {
    if (!regrasJaAceitas()) {
      setMostrarRegras(true);
      adicionarToast('Antes de continuar, leia e aceite as Regras de Depósito.', 'erro');
      return;
    }
    const valorNumerico = Number(valor.replace(',', '.'));

    if (metodo !== 'PIX') {
      adicionarToast('No momento apenas PIX está disponível.', 'erro');
      return;
    }

    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      adicionarToast('Informe um CPF válido (11 dígitos).', 'erro');
      return;
    }

    if (!Number.isFinite(valorNumerico) || valorNumerico < MINIMO) {
      adicionarToast(
        `O valor mínimo para depósito é de R$ ${MINIMO.toFixed(2)}.`,
        'erro'
      );
      return;
    }

    setCarregando(true);

    try {
      // hoje: crédito imediato + histórico
      const res = await api.post('/usuario/deposito', {
        valor: valorNumerico,
        cpf: cpf.replace(/\D/g, ''),
        metodo: 'PIX',
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

      // se o backend já retornar info de PIX, usamos aqui
      const img =
        res.data?.qrCodeBase64 ||
        res.data?.qrCode ||
        res.data?.qrCodeUrl ||
        null;
      const copia =
        res.data?.pixCopiaCola ||
        res.data?.copiaECola ||
        res.data?.payload ||
        '';

      setQrCodeImg(img || null);
      setPixCopiaCola(copia || '');

      adicionarToast('Depósito registrado com sucesso!', 'sucesso');

      // Se não houver PIX dinâmico, mantemos como hoje: redireciona para carteira
      if (!img && !copia) {
        router.push('/carteira');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.erro ||
        err?.response?.data?.message ||
        'Erro ao realizar depósito.';
      adicionarToast(msg, 'erro');
    } finally {
      setCarregando(false);
    }
  };

  const copiarPix = async () => {
    if (!pixCopiaCola) return;
    try {
      await navigator.clipboard.writeText(pixCopiaCola);
      adicionarToast('Código PIX copiado para a área de transferência.', 'sucesso');
    } catch {
      adicionarToast('Não foi possível copiar o código PIX.', 'erro');
    }
  };

  return (
    <Container>
      <Card>
        <Titulo>Depositar</Titulo>

        {/* Método de pagamento */}
        <Campo>
          <Label>Método de Pagamento</Label>
          <Select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            disabled
          >
            <option value="PIX">PIX</option>
            {/* no futuro dá pra adicionar TED, boleto, etc */}
          </Select>
        </Campo>

        {/* Aviso em vermelho, estilo casa de apostas */}
        <Aviso>
          Certifique-se de que o CPF registrado conosco esteja correto e seja o
          mesmo que está cadastrado na conta bancária utilizada para pagar pelo
          depósito. Se os dados não coincidirem, seu pagamento pode ser recusado.
          <br />
          <br />
          Você poderá notar diferenças no fluxo de depósito do PIX e como o
          pagamento aparece no seu extrato bancário. Para mais informações,
          acesse &quot;Perguntas Sobre Depósito&quot; na seção de Ajuda do site.
        </Aviso>

        {/* CPF */}
        <Campo>
          <Label>CPF</Label>
          <Input
            type="text"
            placeholder="Somente números"
            value={cpf}
            onChange={(e) =>
              setCpf(e.target.value.replace(/[^\d]/g, '').slice(0, 11))
            }
          />
        </Campo>

        {/* Valor */}
        <Campo>
          <Label>
            Valor do Depósito <SpanMin>Min. R$ {MINIMO.toFixed(2)}</SpanMin>
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

        <BotaoDepositar disabled={carregando} onClick={handleDeposito}>
          {carregando ? 'Processando...' : 'Depositar'}
        </BotaoDepositar>

        {/* QR CODE / CÓDIGO PIX (opcional, aparece se backend enviar dados) */}
        {(qrCodeImg || pixCopiaCola) && (
          <PixContainer>
            <Subtitulo>Finalize o pagamento via PIX</Subtitulo>

            {qrCodeImg && (
              <QrWrapper>
                <img
                  src={qrCodeImg}
                  alt="QR Code PIX para pagamento"
                  style={{ maxWidth: '200px' }}
                />
              </QrWrapper>
            )}

            {pixCopiaCola && (
              <CodigoWrapper>
                <Label>Código PIX (copia e cola)</Label>
                <CodigoArea readOnly value={pixCopiaCola} />
                <BotaoCopiar type="button" onClick={copiarPix}>
                  Copiar código PIX
                </BotaoCopiar>
              </CodigoWrapper>
            )}
          </PixContainer>
        )}

        {/* links de ajuda, se quiser adicionar depois */}
        {/* <LinksAuxiliares>
          <a href="#">Fazer uma Pausa</a>
          <a href="#">Limites de Depósito</a>
        </LinksAuxiliares> */}
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
                  tipo: 'DEPOSITO',
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

const Subtitulo = styled.h2`
  font-size: 1rem;
  margin: 1.2rem 0 0.6rem 0;
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

const BotaoDepositar = styled.button`
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background-color: #06b6d4;
  color: white;

  &:hover {
    background-color: #0891b2;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PixContainer = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const QrWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const CodigoWrapper = styled.div`
  margin-top: 0.5rem;
`;

const CodigoArea = styled.textarea`
  width: 100%;
  min-height: 70px;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  font-size: 0.85rem;
  resize: none;
`;

const BotaoCopiar = styled.button`
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  background-color: #111827;
  color: #f9fafb;

  &:hover {
    background-color: #020617;
  }
`;

// se quiser ativar no futuro
// const LinksAuxiliares = styled.div`
//   margin-top: 1rem;
//   display: flex;
//   flex-direction: column;
//   gap: 0.25rem;
//   font-size: 0.8rem;

//   a {
//     color: #0ea5e9;
//     text-decoration: none;
//   }

//   a:hover {
//     text-decoration: underline;
//   }
// `;


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
