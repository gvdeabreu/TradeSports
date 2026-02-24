import React, { useMemo } from 'react';
import styled from 'styled-components';

// Modal 100% self-contained (sem dependências externas)

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
  max-width: 900px;
  height: 85vh;
  background: #f7f7f9;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
`;

const Fechar = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: #111827;
  padding: 6px;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
`;

const TextoPre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: #111827;
`;

const ModalFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid rgba(0,0,0,0.08);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const BotaoPrim = styled.button`
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  background: #2563eb;
  color: #fff;
`;

const BotaoSec = styled.button`
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 700;
  background: #fff;
  color: #111827;
`;

export default function PoliticaPrivacidadeModal({ onClose, onAceitar }) {
  const texto = useMemo(
    () =>
      `POLÍTICA DE PRIVACIDADE – TRADESPORTS\n\nÚltima atualização: [dd/mm/aaaa]\n\n1. INTRODUÇÃO\nA presente Política de Privacidade descreve como a TradeSports coleta, utiliza, armazena, compartilha e protege os dados pessoais dos usuários, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais – LGPD).\n\n2. DADOS PESSOAIS COLETADOS\nNo uso da plataforma, poderemos coletar e tratar as seguintes categorias de dados:\n(a) Dados cadastrais: nome, sobrenome, nome de usuário, data de nascimento, gênero (quando informado), e-mail e CPF.\n(b) Dados de acesso e autenticação: senha (armazenada de forma criptografada/hasheada), logs de login e identificadores de sessão.\n(c) Dados de transações e histórico econômico: depósitos, saques, movimentações de saldo, ordens de compra e venda, histórico de negociações, posições em carteira, dividendos e liquidações, valores, horários e status das operações.\n(d) Dados técnicos: endereço IP, dados de navegador/dispositivo e registros de eventos para segurança e prevenção a fraudes.\n\n3. FINALIDADES DO TRATAMENTO\nOs dados pessoais são tratados para as seguintes finalidades:\n(a) Cadastro, autenticação e gestão da conta do usuário.\n(b) Execução das funcionalidades da plataforma, incluindo registro e processamento de ordens, carteira, extrato e demais recursos.\n(c) Cumprimento de obrigações legais e regulatórias aplicáveis e atendimento a solicitações de autoridades competentes.\n(d) Prevenção a fraudes, segurança da plataforma, monitoramento de abuso e proteção do usuário e da TradeSports.\n(e) Suporte e atendimento ao usuário.\n(f) Melhoria contínua da plataforma, correção de erros e análise de desempenho (com dados minimizados sempre que possível).\n\n4. BASES LEGAIS (LGPD)\nO tratamento de dados pessoais ocorre, principalmente, com fundamento nas seguintes bases legais:\n(a) Execução de contrato (art. 7º, V): para viabilizar o cadastro, acesso e uso das funcionalidades da TradeSports.\n(b) Cumprimento de obrigação legal/regulatória (art. 7º, II): quando aplicável, especialmente em temas de segurança e prevenção a fraude.\n(c) Legítimo interesse (art. 7º, IX): para prevenção a fraudes, segurança e melhoria do serviço, observados os direitos e liberdades do titular.\n(d) Consentimento (art. 7º, I): quando necessário para finalidades específicas, podendo ser revogado a qualquer momento, conforme a lei.\n\n5. COMPARTILHAMENTO DE DADOS\nA TradeSports poderá compartilhar dados pessoais estritamente quando necessário, com:\n(a) Prestadores de serviços e parceiros tecnológicos (ex.: hospedagem, monitoramento, e-mail transacional, ferramentas antifraude), sob contratos que exijam confidencialidade e segurança.\n(b) Gateways e instituições de pagamento, quando integrados, para viabilizar depósitos, saques, validações antifraude e compliance, respeitando o princípio da necessidade.\n(c) Autoridades competentes, mediante obrigação legal, ordem judicial ou requisição válida.\n\n6. SEGURANÇA DA INFORMAÇÃO\nAdotamos medidas técnicas e administrativas razoáveis para proteger os dados pessoais, incluindo controles de acesso, registros de auditoria, criptografia/hasheamento de credenciais e mecanismos de prevenção de fraude. Ainda assim, nenhum sistema é absolutamente seguro, e o usuário deve manter suas credenciais em sigilo.\n\n7. RETENÇÃO E ELIMINAÇÃO DE DADOS\nOs dados serão mantidos pelo tempo necessário para cumprir as finalidades descritas, obrigações legais/regulatórias, resolução de disputas e exercício regular de direitos. Após esse período, poderão ser eliminados ou anonimizados, conforme aplicável e permitido.\n\n8. DIREITOS DO TITULAR\nNos termos da LGPD, o titular poderá solicitar: confirmação da existência de tratamento, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade, informação sobre compartilhamento, e revisão de decisões automatizadas (quando aplicável), além de revogação de consentimento, conforme a lei.\n\n9. CANAL DE CONTATO\nSolicitações relacionadas à privacidade e proteção de dados poderão ser encaminhadas para: [e-mail de contato / canal oficial].\n\n10. ATUALIZAÇÕES\nEsta Política pode ser atualizada a qualquer momento para refletir melhorias e mudanças operacionais, legais ou técnicas. A versão vigente estará disponível na plataforma.\n`,
    []
  );

  return (
    <Overlay onClick={async () => { if (onAceitar) await onAceitar(); onClose(); }}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Política de Privacidade (TradeSports)</ModalTitle>
          <Fechar type="button" onClick={async () => { if (onAceitar) await onAceitar(); onClose(); }} aria-label="Fechar">
            ✕
          </Fechar>
        </ModalHeader>

        <ModalBody>
          <TextoPre>{texto}</TextoPre>
        </ModalBody>

        <ModalFooter>
          <BotaoSec type="button" onClick={async () => { if (onAceitar) await onAceitar(); onClose(); }}>
            Fechar
          </BotaoSec>
          <BotaoPrim type="button" onClick={async () => { if (onAceitar) await onAceitar(); onClose(); }}>
            Entendi
          </BotaoPrim>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}
