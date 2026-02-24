import { useEffect, useMemo, useState } from "react";

export default function Footer() {
  const [modalAberto, setModalAberto] = useState(null); // "risco" | "privacidade" | "uso" | null

  const ANO_ATUAL = new Date().getFullYear();

  const serverTimeBR = useMemo(() => {
    try {
      return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    } catch {
      return new Date().toLocaleString("pt-BR");
    }
  }, []);

  const POLITICA_RISCO_TEXTO = `POLÍTICA DE RISCO – TRADESPORTS
Última atualização: 03/02/2026

Esta Política de Risco tem como objetivo informar, de forma clara e transparente, os principais riscos envolvidos na utilização da plataforma TradeSports, permitindo que o usuário tome decisões conscientes ao participar da simulação econômica esportiva oferecida.

Ao utilizar a plataforma, o usuário declara estar ciente e de acordo com os riscos descritos abaixo.

1. RISCO DE PERDA TOTAL
A utilização da plataforma envolve risco de perda total dos valores utilizados pelo usuário.
Os valores aplicados em cotas virtuais podem perder valor integralmente, não havendo qualquer garantia de retorno, preservação de capital ou compensação por parte da TradeSports.
O usuário deve utilizar apenas valores que esteja disposto a perder integralmente.

2. VOLATILIDADE POR DESEMPENHO ESPORTIVO
Os preços das cotas podem sofrer oscilações significativas em razão de fatores esportivos imprevisíveis, incluindo, mas não se limitando a: resultados de partidas, desempenho de atletas e equipes, lesões, suspensões e mudanças técnicas, alterações na tabela de classificação, eventos extraordinários no campeonato.
Tais fatores são alheios ao controle da plataforma e podem gerar variações abruptas de preço.

3. RISCO DE LIQUIDEZ LIMITADA
A negociação de cotas ocorre em um mercado secundário entre usuários, podendo haver momentos em que não existam compradores ou vendedores, ordens não sejam executadas, ou o usuário não consiga negociar suas cotas ao preço desejado ou no prazo esperado.
A TradeSports não garante liquidez, execução de ordens ou possibilidade de saída imediata das posições.

4. DIVIDENDOS NÃO GARANTIDOS
Dividendos eventualmente disponibilizados são condicionais, dependem de critérios objetivos definidos nas regras internas e podem variar ou não ocorrer.
A concessão de dividendos não é garantida, não é contínua e pode ser alterada ou suspensa visando o equilíbrio e a sustentabilidade do sistema.

5. ALTERAÇÃO DE REGRAS E PARÂMETROS
A TradeSports poderá alterar regras de negociação, critérios de dividendos, parâmetros de precificação, regras de liquidação e limites operacionais por motivos técnicos, operacionais, de segurança, prevenção de fraude ou sustentabilidade da plataforma, comunicando quando aplicável.

6. RISCO TECNOLÓGICO E OPERACIONAL
A plataforma está sujeita a instabilidades, falhas temporárias, atrasos na atualização de dados e indisponibilidade de serviços de terceiros (APIs, gateways, servidores). Não há garantia de funcionamento ininterrupto.

7. AUSÊNCIA DE REGULAÇÃO FINANCEIRA
A TradeSports não é instituição financeira, não oferece produto de investimento regulado e não é supervisionada por órgãos como CVM ou Banco Central. A participação ocorre em ambiente de simulação econômica esportiva, com regras próprias.

8. RESPONSABILIDADE DO USUÁRIO
O usuário compreende e aceita os riscos, assume total responsabilidade por suas decisões e deve avaliar sua situação financeira antes de utilizar a plataforma.

9. DISPOSIÇÕES FINAIS
Esta Política complementa os Termos de Uso e deve ser lida em conjunto com eles. O uso continuado da plataforma implica ciência e aceitação integral dos riscos aqui descritos.

AVISO IMPORTANTE
A TradeSports é uma plataforma de simulação econômica esportiva. Não há promessa de rentabilidade. Você pode perder total ou parcialmente os valores utilizados.`;

  const POLITICA_PRIVACIDADE_TEXTO = `POLÍTICA DE PRIVACIDADE – TRADESPORTS (LGPD)
Última atualização: 03/02/2026

1. OBJETIVO
Esta Política de Privacidade descreve como a TradeSports coleta, utiliza, armazena, compartilha e protege dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD), e com práticas geralmente exigidas por bancos, gateways de pagamento e parceiros antifraude.

2. QUEM SOMOS
TradeSports (“Plataforma”) é uma aplicação de simulação econômica esportiva. Algumas funcionalidades podem envolver transações financeiras reais (depósitos e saques), conforme regras internas e Termos de Uso.

Foro: Rio de Janeiro/RJ (Brasil).
Dados societários (razão social/CNPJ) serão incluídos quando formalizados.

3. DADOS QUE COLETAMOS
3.1. Dados cadastrais
- Nome e sobrenome
- E-mail
- CPF
- Data de nascimento
- Gênero (quando informado)
- Nome de usuário

3.2. Dados de autenticação e segurança
- Senha (armazenada de forma protegida/criptografada – nunca em texto puro)
- Tokens/sessões de login
- Logs de acesso (data/hora, dispositivo/navegador, IP aproximado), para segurança e prevenção a fraudes

3.3. Dados financeiros e operacionais na plataforma
- Histórico de saldo, depósitos e saques
- Histórico de ordens (IPO e mercado secundário), transações, execuções, cancelamentos
- Eventos de dividendos, ajustes e liquidação (quando aplicáveis)

3.4. Dados de prevenção à fraude e conformidade
- Sinais de risco, comportamento de uso, tentativas suspeitas e inconsistências cadastrais
- Informações necessárias para validar identidade e reduzir fraudes (quando exigido por parceiros e/ou por regras internas)

4. FINALIDADES DE USO
Utilizamos os dados para:
- Criar e administrar sua conta e permitir acesso à plataforma
- Executar funcionalidades do sistema (negociação, extratos, carteira, dividendos, etc.)
- Processar depósitos e saques (inclusive integração com bancos/gateways quando houver)
- Prevenir fraudes, abuso, ataques, uso indevido e lavagem de dinheiro (conforme critérios internos)
- Cumprir obrigações legais e regulatórias aplicáveis (inclusive solicitações legítimas de autoridades)
- Realizar auditorias, investigações internas e melhoria de segurança
- Comunicações essenciais sobre conta, segurança e mudanças relevantes (ex.: políticas, regras)

5. BASES LEGAIS (LGPD)
O tratamento pode se fundamentar em:
- Execução de contrato (para operar a conta e os serviços)
- Cumprimento de obrigação legal/regulatória (quando aplicável)
- Legítimo interesse (segurança, prevenção de fraude, melhoria do serviço), com avaliação de impacto e proporcionalidade
- Consentimento (quando exigido, por exemplo em comunicações não essenciais, se implementadas)

6. COMPARTILHAMENTO DE DADOS
Podemos compartilhar dados estritamente necessários com:
- Provedores de hospedagem e infraestrutura (servidores, armazenamento)
- Gateways de pagamento, bancos e adquirentes (para depósitos/saques)
- Serviços antifraude, prevenção à lavagem de dinheiro e verificação de identidade (quando implementados)
- Prestadores técnicos (monitoramento, segurança, logs)
- Autoridades públicas, mediante obrigação legal ou ordem válida

Não vendemos dados pessoais.

7. SEGURANÇA DA INFORMAÇÃO
Adotamos medidas técnicas e organizacionais razoáveis, tais como:
- Controle de acesso e autenticação
- Proteção de senha (hash seguro) e tokens
- Logs de auditoria
- Monitoramento de atividades suspeitas
- Boas práticas de desenvolvimento e correções de vulnerabilidades quando identificadas

Nenhum sistema é 100% inviolável. Em caso de incidente relevante, poderemos notificar usuários e autoridades conforme exigido.

8. RETENÇÃO E DESCARTE
Mantemos dados pelo tempo necessário para:
- Prestação do serviço e execução do contrato
- Cumprimento de obrigações legais e exercício regular de direitos
- Prevenção à fraude e segurança

Após o término da necessidade, os dados podem ser eliminados ou anonimizados, observadas exigências legais e técnicas.

9. DIREITOS DO TITULAR
Nos termos da LGPD, você pode solicitar:
- Confirmação de tratamento e acesso aos dados
- Correção de dados incompletos/incorretos
- Portabilidade (quando aplicável)
- Anonimização, bloqueio ou eliminação (quando cabível)
- Informação sobre compartilhamentos
- Revogação de consentimento (quando a base for consentimento)

10. CANAL DE CONTATO
Canal de privacidade (provisório): suporte@tradesports.com

11. ALTERAÇÕES DESTA POLÍTICA
Podemos atualizar esta Política para refletir melhorias, mudanças operacionais, exigências legais ou integrações com parceiros. Quando aplicável, comunicaremos mudanças relevantes.`;

  // Coloque aqui o texto real dos termos (ou importe de onde você mantém hoje)
  const TERMOS_USO = `TERMOS DE USO – TRADESPORTS

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

  const styles = {
    footer: {
      width: "100%",
      background: "rgba(10, 12, 18, 0.95)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.85)",
      padding: "28px 20px",
    },
    container: {
      maxWidth: 1300,
      margin: "0 auto",
      display: "flex",
      gap: 28,
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    col: {
      minWidth: 180,
      flex: "1 1 180px",
    },
    title: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 10,
      color: "rgba(255,255,255,0.95)",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    linkBtn: {
      display: "inline-block",
      background: "transparent",
      border: "none",
      padding: "6px 0",
      color: "rgba(255,255,255,0.78)",
      cursor: "pointer",
      textAlign: "left",
      fontSize: 13,
    },
    bottom: {
      maxWidth: 1300,
      margin: "18px auto 0",
      paddingTop: 16,
      borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 12,
      color: "rgba(255,255,255,0.6)",
    },
    badge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.15)",
      color: "rgba(255,255,255,0.75)",
      fontSize: 12,
      whiteSpace: "nowrap",
    },

    // Modal (CORREÇÃO PRINCIPAL AQUI: inset: 0)
    overlay: {
      position: "fixed",
      inset: 0, // <- ISSO FAZ O OVERLAY COBRIR A TELA INTEIRA
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 16,
    },
    modal: {
      width: "min(900px, 96vw)",
      background: "#fff",
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
      border: "1px solid rgba(0,0,0,0.08)",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 16px",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
    },
    modalTitle: {
      fontSize: 14,
      fontWeight: 800,
      color: "#111827",
    },
    modalClose: {
      border: "1px solid rgba(0,0,0,0.18)",
      background: "#fff",
      color: "#111827",
      borderRadius: 8,
      padding: "6px 10px",
      cursor: "pointer",
      fontWeight: 700,
    },
    modalBody: {
      maxHeight: "72vh",
      overflow: "auto",
      padding: 16,
      background: "#fff",
      color: "#111827",
    },
    pre: {
      margin: 0,
      whiteSpace: "pre-wrap",
      lineHeight: 1.45,
      fontSize: 13,
      color: "#111827",
    },
    modalFooter: {
      padding: "12px 16px",
      borderTop: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      background: "#fff",
    },
    btnPrimary: {
      border: "none",
      background: "#2563eb",
      color: "#fff",
      borderRadius: 8,
      padding: "10px 14px",
      cursor: "pointer",
      fontWeight: 800,
    },
  };

  // trava scroll do body quando modal abre (opcional, mas dá acabamento profissional)
  useEffect(() => {
    if (modalAberto) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
  }, [modalAberto]);

  const Modal = ({ titulo, texto, onClose }) => (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>{titulo}</div>
          <button type="button" style={styles.modalClose} onClick={onClose}>
            Fechar
          </button>
        </div>
        <div style={styles.modalBody}>
          <pre style={styles.pre}>{texto}</pre>
        </div>
        <div style={styles.modalFooter}>
          <button type="button" style={styles.btnPrimary} onClick={onClose}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.col}>
            <div style={styles.title}>Ajuda</div>
            <button type="button" style={styles.linkBtn} onClick={() => alert("Em breve: Central de Ajuda")}>
              Central de Ajuda
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => alert("Em breve: Depósitos")}>
              Depósitos
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => alert("Em breve: Saques")}>
              Saques
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => alert("Em breve: Contato")}>
              Contato
            </button>
          </div>

          <div style={styles.col}>
            <div style={styles.title}>Institucional</div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.75)" }}>
              TradeSports é uma plataforma de simulação econômica esportiva com mercado de negociação de cotas virtuais,
              precificadas por desempenho esportivo.
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              Forneça razão social/CNPJ quando formalizados.
            </div>
          </div>

          <div style={styles.col}>
            <div style={styles.title}>Jurídico</div>
            <button type="button" style={styles.linkBtn} onClick={() => setModalAberto("risco")}>
              Política de Risco
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => setModalAberto("privacidade")}>
              Política de Privacidade
            </button>
            <br />
            <button type="button" style={styles.linkBtn} onClick={() => setModalAberto("uso")}>
              Termos de Uso
            </button>
          </div>

          <div style={styles.col}>
            <div style={styles.title}>Segurança</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={styles.badge}>Prevenção a fraudes</span>
              <span style={styles.badge}>Logs e auditoria</span>
              <span style={styles.badge}>Boas práticas LGPD</span>
              <span style={styles.badge}>18+</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
              Importante: não há promessa de rentabilidade. Você pode perder total ou parcialmente os valores utilizados.
            </div>
          </div>
        </div>

        <div style={styles.bottom}>
          <div>© {ANO_ATUAL} TradeSports. Todos os direitos reservados.</div>
        </div>
      </footer>

      {modalAberto === "risco" && (
        <Modal
          titulo="Política de Risco (TradeSports)"
          texto={POLITICA_RISCO_TEXTO}
          onClose={() => setModalAberto(null)}
        />
      )}

      {modalAberto === "privacidade" && (
        <Modal
          titulo="Política de Privacidade (TradeSports)"
          texto={POLITICA_PRIVACIDADE_TEXTO}
          onClose={() => setModalAberto(null)}
        />
      )}

      {modalAberto === "uso" && (
        <Modal
          titulo="Termos de Uso (TradeSports)"
          texto={TERMOS_USO}
          onClose={() => setModalAberto(null)}
        />
      )}
    </>
  );
}
