import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useRouter } from "next/router";
import { useToast } from "../components/ToastProvider";
import PoliticaPrivacidadeModal from "../components/PoliticaPrivacidadeModal";

/**
 * Cadastro (TradeSports)
 * - Mantém o layout atual (cartão central) e adiciona:
 *   - Modal de Termos (com scroll obrigatório para habilitar "Aceitar")
 *   - Modal de Política de Risco
 *   - Modal de Política de Privacidade (componente separado)
 *
 * Observação: o checkbox de aceite só habilita depois do usuário aceitar no modal de Termos.
 */

const VERSAO_TERMOS = "1.0";
const VERSAO_POLITICA_RISCO = 'v1.0';
const VERSAO_POLITICA_PRIVACIDADE = 'v1.0';


export default function Cadastro() {
  const router = useRouter();
  const { adicionarToast } = useToast();

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    dataNascimento: "",
    cpf: "",
    genero: "",
    nomeUsuario: "",
    senha: "",
    confirmarSenha: "",
  });

  const [erro, setErro] = useState("");

  // Aceites
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPoliticaRisco, setAceitouPoliticaRisco] = useState(false);
  const [aceitouPoliticaPrivacidade, setAceitouPoliticaPrivacidade] = useState(false);

  const [termosLiberados, setTermosLiberados] = useState(false);

  // Modais
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [mostrarPoliticaRisco, setMostrarPoliticaRisco] = useState(false);
  const [mostrarPoliticaPrivacidade, setMostrarPoliticaPrivacidade] = useState(false);

  // Controle de scroll do Termos
  const [termosScrollNoFim, setTermosScrollNoFim] = useState(false);
  const termosScrollRef = useRef(null);

  const termosTexto = useMemo(() => {
    return `TERMOS DE USO – TRADESPORTS
Versão: v1.0

Última atualização: [dd/mm/aaaa]

1. OBJETO
A TradeSports é uma plataforma de simulação econômica esportiva que permite aos usuários adquirir e negociar cotas virtuais vinculadas ao desempenho esportivo de clubes em campeonatos, conforme regras internas da plataforma.

2. NATUREZA DA PLATAFORMA
A TradeSports não é instituição financeira e não oferece produto de investimento regulado. A participação do usuário ocorre em ambiente de simulação econômica esportiva, com regras próprias.

3. CADASTRO E CONTA
O usuário declara que:
- possui capacidade civil e idade mínima exigida por lei;
- fornece informações corretas e atualizadas;
- é responsável por manter a confidencialidade de sua senha e acesso.

4. FUNCIONAMENTO DO MERCADO
A plataforma poderá operar com:
- fase de IPO (emissão inicial de cotas); e
- mercado secundário (negociação entre usuários), conforme regras vigentes.

5. PREÇOS, VOLATILIDADE E RISCOS
Os preços das cotas podem variar com base em critérios esportivos e regras internas, podendo ocorrer perdas totais. O usuário deve ler a Política de Risco.

6. LIQUIDEZ
A TradeSports não garante liquidez. Ordens podem não ser executadas por ausência de contraparte ou limitações operacionais.

7. DIVIDENDOS E BENEFÍCIOS
Dividendos ou créditos eventualmente concedidos são condicionais e não garantidos, podendo ser alterados ou suspensos para manter a sustentabilidade da plataforma.

8. DEPÓSITOS E SAQUES
Depósitos e saques podem depender de provedores terceirizados (gateways). A TradeSports poderá aplicar validações de segurança e compliance, inclusive verificação de titularidade.

9. PREVENÇÃO À FRAUDE E CONDUTAS PROIBIDAS
São proibidos:
- uso de terceiros para burlar validações;
- tentativas de fraude;
- manipulação de ordens ou exploração de falhas;
- uso indevido de dados ou contas.

10. SUSPENSÃO E ENCERRAMENTO
A TradeSports poderá suspender ou encerrar contas em caso de violação destes Termos, suspeita de fraude, exigências legais ou operacionais.

11. PRIVACIDADE E DADOS PESSOAIS
O tratamento de dados pessoais segue a Política de Privacidade e a legislação aplicável, incluindo a LGPD.

12. ALTERAÇÕES DESTES TERMOS
A TradeSports pode alterar estes Termos para ajustes operacionais, legais, de segurança e de sustentabilidade. Quando aplicável, o usuário será comunicado.

13. FORO
Fica eleito o foro da Comarca do Rio de Janeiro/RJ, com renúncia a qualquer outro, por mais privilegiado que seja.

Ao criar conta e utilizar a plataforma, o usuário declara ciência e concordância integral com estes Termos.`;
  }, []);

  const politicaRiscoTexto = useMemo(() => {
    return `POLÍTICA DE RISCO – TRADESPORTS
    v1.0

Última atualização: [dd/mm/aaaa]

Esta Política de Risco informa, de forma clara e transparente, os principais riscos envolvidos na utilização da plataforma TradeSports.

1. RISCO DE PERDA TOTAL
A utilização da plataforma envolve risco de perda total dos valores utilizados pelo usuário. As cotas virtuais podem perder valor integralmente, sem garantia de retorno, preservação de capital ou compensação.

2. VOLATILIDADE POR DESEMPENHO ESPORTIVO
Os preços podem oscilar significativamente em razão de fatores esportivos imprevisíveis, como resultados de partidas, lesões, suspensões, mudanças técnicas, alterações na tabela e eventos extraordinários.

3. RISCO DE LIQUIDEZ LIMITADA
A negociação ocorre entre usuários. Pode não haver compradores ou vendedores, ordens podem não ser executadas e o usuário pode não conseguir vender ao preço desejado ou no prazo esperado. A TradeSports não garante liquidez.

4. DIVIDENDOS NÃO GARANTIDOS
Dividendos ou créditos eventualmente disponibilizados são condicionais, dependem de critérios objetivos definidos nas regras internas e podem variar, não ocorrer, ser alterados ou ser suspensos.

5. ALTERAÇÃO DE REGRAS E PARÂMETROS
A TradeSports poderá ajustar regras de negociação, critérios de dividendos, parâmetros de precificação, regras de liquidação e limites operacionais por motivos técnicos, operacionais, de segurança, prevenção de fraude e sustentabilidade.

6. RISCO TECNOLÓGICO E OPERACIONAL
A plataforma está sujeita a instabilidades, falhas temporárias, atrasos na atualização de dados e indisponibilidade de serviços de terceiros (APIs, gateways e servidores). Não há garantia de funcionamento ininterrupto.

7. AUSÊNCIA DE REGULAÇÃO FINANCEIRA
A TradeSports não é supervisionada por órgãos como CVM ou Banco Central. Não se aplicam proteções típicas do sistema financeiro.

8. RESPONSABILIDADE DO USUÁRIO
O usuário reconhece os riscos e assume total responsabilidade por suas decisões, devendo utilizar a plataforma de forma consciente e responsável.`;
  }, []);

  useEffect(() => {
    // Sempre que abrir o modal de termos, reseta o controle de scroll.
    if (mostrarTermos) {
      setTermosScrollNoFim(false);
      // leva o scroll pro topo quando abrir
      setTimeout(() => {
        if (termosScrollRef.current) {
          termosScrollRef.current.scrollTop = 0;
        }
      }, 0);
    }
  }, [mostrarTermos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErro("");

    // CPF: só números
    if (name === "cpf") {
      const onlyDigits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!aceitouTermos || !termosLiberados) {
      setErro("Você precisa aceitar os Termos de Uso para finalizar o cadastro.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      await axios.post("http://localhost:4001/cadastro", {
        nome: form.nome,
        sobrenome: form.sobrenome,
        email: form.email,
        dataNascimento: form.dataNascimento,
        cpf: form.cpf,
        genero: form.genero,
        nomeUsuario: form.nomeUsuario,
        senha: form.senha,
      });

      adicionarToast("Cadastro realizado com sucesso!", "success");
      router.push("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        "Erro ao cadastrar. Tente novamente.";
      setErro(msg);
      adicionarToast(msg, "error");
    }
    const payload = {
  ...form,
  aceitouTermos: true
};
  };

  return (
    <Container>
      <Card>
        <Titulo>Cadastro</Titulo>
        <Subtitulo>Crie sua conta para começar a investir em cotas de clubes.</Subtitulo>

        <Form onSubmit={handleSubmit}>
          <Linha2colunas>
            <Campo>
              <Label>Nome</Label>
              <Input
                name="nome"
                placeholder="Nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Sobrenome completo</Label>
              <Input
                name="sobrenome"
                placeholder="Sobrenome completo"
                value={form.sobrenome}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          <Linha2colunas>
            <Campo>
              <Label>E-mail</Label>
              <Input
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Data de Nascimento</Label>
              <Input
                name="dataNascimento"
                type="date"
                value={form.dataNascimento}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          <Linha2colunas>
            <Campo>
              <Label>CPF</Label>
              <Input
                name="cpf"
                placeholder="Somente números"
                value={form.cpf}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Gênero</Label>
              <Select name="genero" value={form.genero} onChange={handleChange} required>
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </Select>
            </Campo>
          </Linha2colunas>

          <Campo>
            <Label>Nome de Usuário</Label>
            <Input
              name="nomeUsuario"
              placeholder="Ex: gvinvest"
              value={form.nomeUsuario}
              onChange={handleChange}
              required
            />
          </Campo>

          <Linha2colunas>
            <Campo>
              <Label>Senha</Label>
              <Input
                name="senha"
                type="password"
                placeholder="Senha"
                value={form.senha}
                onChange={handleChange}
                required
              />
            </Campo>

            <Campo>
              <Label>Confirmar Senha</Label>
              <Input
                name="confirmarSenha"
                type="password"
                placeholder="Confirmar Senha"
                value={form.confirmarSenha}
                onChange={handleChange}
                required
              />
            </Campo>
          </Linha2colunas>

          {erro && <ErroMsg>{erro}</ErroMsg>}

          <AceiteLinha>
            <Checkbox
              type="checkbox"
              checked={aceitouTermos}
              disabled={!termosLiberados}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              id="aceite-termos"
            />

            <AceiteTexto htmlFor="aceite-termos">
              Li e aceito os{" "}
              <LinkLike
                type="button"
                onClick={() => {
                  setMostrarTermos(true);
                  setTermosScrollNoFim(false);
                }}
              >
                Termos de Uso
              </LinkLike>{" "}
              , a{" "}
              <LinkLike type="button" onClick={() => setMostrarPoliticaRisco(true)}>
                Política de Risco
              </LinkLike>{" "}
              e a{" "}
              <LinkLike type="button" onClick={() => setMostrarPoliticaPrivacidade(true)}>
                Política de Privacidade
              </LinkLike>
              .
            </AceiteTexto>
          </AceiteLinha>

          <Botao type="submit" disabled={!aceitouTermos || !termosLiberados}>
            Cadastrar
          </Botao>

          <Nota>
            Ao criar sua conta, você declara ciência dos riscos e concorda com os Termos de Uso e as
            Políticas exibidas.
          </Nota>
        </Form>
      </Card>

      {/* MODAL TERMOS (scroll obrigatório) */}
      {mostrarTermos && (
        <Overlay onClick={() => setMostrarTermos(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Termos de Uso (TradeSports)</ModalTitle>
              <Fechar type="button" onClick={() => setMostrarTermos(false)} aria-label="Fechar">
                ✕
              </Fechar>
            </ModalHeader>

            <ModalBody
              ref={termosScrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                  setTermosScrollNoFim(true);
                }
              }}
            >
              <TermosPre>{termosTexto}</TermosPre>
            </ModalBody>

            <ModalFooter>
              <ModalHint>
                {!termosScrollNoFim
                  ? 'Role até o final dos Termos para habilitar o botão “Aceitar”.'
                  : `Ao aceitar, você concorda com esta versão (${VERSAO_TERMOS}).`}
              </ModalHint>

              <ModalActions>
                <BotaoSec type="button" onClick={() => setMostrarTermos(false)}>
                  Voltar
                </BotaoSec>
                <BotaoPrim
                  type="button"
                  disabled={!termosScrollNoFim}
                  onClick={() => {
                    setAceitouTermos(true);
                    setTermosLiberados(true);
                    setMostrarTermos(false);
                  }}
                >
                  Aceitar e continuar
                </BotaoPrim>
              </ModalActions>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}

      {/* MODAL POLÍTICA DE RISCO */}
      {mostrarPoliticaRisco && (
        <Overlay onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Política de Risco (TradeSports)</ModalTitle>
              <Fechar
                type="button"
                onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}
                aria-label="Fechar"
              >
                ✕
              </Fechar>
            </ModalHeader>

            <ModalBody>
              <TermosPre>{politicaRiscoTexto}</TermosPre>
            </ModalBody>

            <ModalFooter>
              <ModalActions>
                <BotaoPrim type="button" onClick={() => { setAceitouPoliticaRisco(true); setMostrarPoliticaRisco(false); }}>
                  Entendi
                </BotaoPrim>
              </ModalActions>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}

      {/* MODAL POLÍTICA DE PRIVACIDADE (componente separado) */}
      {mostrarPoliticaPrivacidade && (
        <PoliticaPrivacidadeModal onClose={() => setMostrarPoliticaPrivacidade(false)} onAceitar={() => setAceitouPoliticaPrivacidade(true)} />
      )}
    </Container>
  );
}

/* ======= Styles (mantém padrão do layout atual) ======= */

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 16px;
  background: radial-gradient(1200px 600px at 50% 0%, #0b2840 0%, #071a2b 50%, #061524 100%);
`;

const Card = styled.div`
  width: 100%;
  max-width: 620px;
  background: #f6f6f6;
  border-radius: 10px;
  padding: 28px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
`;

const Titulo = styled.h1`
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

const Subtitulo = styled.p`
  margin: 0 0 18px;
  color: #4b5563;
  font-size: 14px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Linha2colunas = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Campo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  color: #374151;
  font-weight: 600;
`;

const Input = styled.input`
  height: 38px;
  padding: 0 12px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background: #fff;
  outline: none;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
  }
`;

const Select = styled.select`
  height: 38px;
  padding: 0 12px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background: #fff;
  outline: none;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
  }
`;

const ErroMsg = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
`;

const AceiteLinha = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 6px;
`;

const Checkbox = styled.input`
  margin-top: 2px;
  width: 16px;
  height: 16px;
`;

const AceiteTexto = styled.label`
  font-size: 13px;
  color: #374151;
  line-height: 1.35;
`;

const LinkLike = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Botao = styled.button`
  margin-top: 6px;
  height: 40px;
  background: #2563eb;
  border: 0;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const Nota = styled.p`
  margin: 6px 0 0;
  font-size: 12px;
  color: #6b7280;
`;

/* Modal */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 9999;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 760px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #111827;
`;

const Fechar = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: #374151;
`;

const ModalBody = styled.div`
  padding: 16px;
  max-height: 60vh;
  overflow: auto;
`;

const TermosPre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: #111827;
`;

const ModalFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ModalHint = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const BotaoSec = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
`;

const BotaoPrim = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  border: 0;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-weight: 700;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
