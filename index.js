import styled from "styled-components";

export default function Home() {
  return (
    <Container>
      <Hero>
        <HeroTop>
          <Titulo>TradeSports</Titulo>
          <Lead>
            Uma plataforma de simulação econômica esportiva onde o “mercado” reage
            ao desempenho real dos clubes ao longo do campeonato. Você monta uma
            carteira, negocia cotas e acompanha sua estratégia rodada a rodada.
          </Lead>

          <Bullets>
            <Bullet>
              <b>Estratégia:</b> o preço se move com o campeonato, não com “mecânicas escondidas”.
            </Bullet>
            <Bullet>
              <b>Mercado de verdade:</b> IPO, livro de ordens, compra/venda e mercado secundário.
            </Bullet>
            <Bullet>
              <b>Carteira e resultado:</b> acompanhe preço médio, valorização e histórico.
            </Bullet>
          </Bullets>
        </HeroTop>
      </Hero>

      <Article>
        <Section>
          <H2>Quem somos</H2>
          <P>
            A TradeSports nasceu para quem gosta de futebol e também gosta de
            pensar como um “gestor”: ler cenário, assumir posições, proteger
            carteira, realizar lucro — e, principalmente, acompanhar a história
            do campeonato se desenhando.
          </P>
          <P>
            Aqui, cada clube possui <b>cotas virtuais</b>. Essas cotas têm preço e
            podem ser negociadas. A diferença é que a “força” do ativo vem do que
            acontece no mundo real: resultados, sequência de vitórias, queda de
            rendimento, briga por título, luta contra rebaixamento, etc.
          </P>
          <P>
            O objetivo é simples: você entende o sistema em minutos, mas consegue
            evoluir sua estratégia por semanas. É uma experiência de mercado,
            aplicada ao esporte.
          </P>
        </Section>

        <Divider />

        <Section>
          <H2>Como funciona na prática</H2>
          <P>
            A dinâmica do campeonato na TradeSports se organiza em fases. Você não
            precisa decorar tudo para começar — mas entender o fluxo te dá vantagem.
          </P>

          <H3>1) Fase de IPO (emissão inicial)</H3>
          <P>
            No início do campeonato (ou no início do ciclo dentro do sistema),
            cada clube disponibiliza um lote inicial de cotas para venda. Enquanto
            houver cotas disponíveis no IPO, você compra diretamente do “emissor”
            (o próprio clube dentro do sistema), pelo preço definido para o IPO.
          </P>
          <P>
            <b>O que isso significa?</b> Que existe uma janela onde o usuário consegue
            entrar cedo na tese: “acho que esse time vai subir na tabela”, “vai
            embalar”, “vai terminar no Top 4”, etc.
          </P>

          <MiniBox>
            <MiniTitle>Exemplo rápido</MiniTitle>
            <MiniText>
              Se o Clube A está no IPO e você acredita que ele vai ter uma boa campanha,
              comprar cedo pode fazer sentido. Se ele subir posições, o valor tende a refletir isso
              (dependendo das regras de precificação e do comportamento do mercado).
            </MiniText>
          </MiniBox>

          <H3>2) Mercado secundário (negociação entre usuários)</H3>
          <P>
            Quando o IPO de um clube se esgota (ou seja, as cotas iniciais acabam),
            a negociação passa a ser entre usuários. Aí entra o coração do sistema:
            <b> livro de ordens</b>, <b>melhor compra</b>, <b>melhor venda</b> e execução conforme oferta e demanda.
          </P>
          <P>
            Isso cria um efeito bem parecido com mercado real: em momentos de alta confiança
            (time embalado, sequência boa, briga por título), os compradores disputam preço.
            Em momentos de baixa (derrotas, risco esportivo), o preço pode cair e a liquidez pode ficar mais difícil.
          </P>

          <H3>3) Carteira: posição, preço médio e valorização</H3>
          <P>
            Tudo que você compra entra na sua <b>carteira</b>. Lá você acompanha:
          </P>
          <List>
            <li><b>Quantidade de cotas</b> por clube</li>
            <li><b>Preço médio</b> (quanto você pagou, em média)</li>
            <li><b>Valor atual</b> (quanto valem suas posições agora)</li>
            <li><b>Valorização</b> (diferença entre seu preço médio e o valor atual)</li>
            <li><b>Histórico</b> de transações e movimentos</li>
          </List>

          <P>
            A carteira te dá clareza para fazer o que todo bom jogador faz: ajustar risco.
            Você pode diversificar, concentrar em um time, reduzir exposição após lucros,
            ou segurar posição até o final conforme sua estratégia.
          </P>

          <H3>4) Dividendos (quando aplicável)</H3>
          <P>
            Em alguns formatos de campeonato, o sistema pode prever dividendos para determinados clubes/posições,
            conforme regras internas. Eles servem como incentivo para estratégia de longo prazo.
          </P>
          <P>
            Importante: dividendos <b>não são garantidos</b> e podem variar conforme as regras do ciclo.
          </P>

          <H3>5) Liquidação (final do campeonato)</H3>
          <P>
            No fim do campeonato, ocorre a <b>liquidação final</b> baseada na classificação final.
            É o fechamento do ciclo: quem assumiu posições certas no tempo certo tende a consolidar o resultado.
          </P>

          <MiniBox>
            <MiniTitle>Por que isso é legal?</MiniTitle>
            <MiniText>
              Porque sua decisão vira história: você consegue olhar o campeonato inteiro e entender
              como suas escolhas (entrada, saída, preço, timing, diversificação) construíram seu resultado.
            </MiniText>
          </MiniBox>
        </Section>

        <Divider />

        <Section>
          <H2>Como começar (em 60 segundos)</H2>
          <Steps>
            <Step>
              <StepN>1</StepN>
              <StepText>
                Escolha um campeonato no menu lateral e abra a tabela.
              </StepText>
            </Step>
            <Step>
              <StepN>2</StepN>
              <StepText>
                Clique em <b>Negociar</b> no clube que você quer comprar ou vender.
              </StepText>
            </Step>
            <Step>
              <StepN>3</StepN>
              <StepText>
                Se ainda estiver no IPO, você compra do lote inicial. Se o IPO acabou, você negocia com outros usuários no mercado secundário.
              </StepText>
            </Step>
            <Step>
              <StepN>4</StepN>
              <StepText>
                Acompanhe sua carteira, avalie desempenho e ajuste sua estratégia rodada a rodada.
              </StepText>
            </Step>
          </Steps>

          <P>
            Se você curte futebol e gosta de “jogo de decisão”, a TradeSports vira um hábito.
            Você começa comprando uma cota por curiosidade — e quando percebe, está lendo tabela
            com outro olhar.
          </P>
        </Section>

        <FooterNote>
          Aviso: a TradeSports é uma plataforma de simulação econômica esportiva. Não há promessa de rentabilidade.
          O valor das cotas pode variar e você pode perder total ou parcialmente os valores utilizados.
        </FooterNote>
      </Article>
    </Container>
  );
}

/* ==================== ESTILO (mais largo, ocupa mais a tela) ==================== */

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: 28px 28px 60px;
`;

const Hero = styled.div`
  width: 100%;
  max-width: 1450px; /* AUMENTA a largura total do conteúdo */
  margin: 0 auto 28px;
  padding: 18px 0 10px;
`;

const HeroTop = styled.div`
  max-width: 1600px; /* ainda largo, mas confortável */
`;

const Titulo = styled.h1`
  font-size: 34px;
  margin: 0 0 10px;
  color: #eaf0ff;
`;

const Lead = styled.p`
  font-size: 17px;
  line-height: 1.8;
  margin: 0 0 14px;
  color: rgba(234, 240, 255, 0.85);
`;

const Bullets = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 14px;
`;

const Bullet = styled.div`
  font-size: 14px;
  color: rgba(234, 240, 255, 0.78);
  b {
    color: rgba(234, 240, 255, 0.92);
  }
`;

const Article = styled.div`
  width: 100%;
  max-width: 1450px; /* AQUI está o “ocupar mais tela” */
  margin: 0 auto;
  color: #e6ecff;
  line-height: 1.75;
`;

const Section = styled.section`
  max-width: 1300px; /* texto bem mais largo que antes */
`;

const H2 = styled.h2`
  margin: 0 0 10px;
  font-size: 22px;
  color: #eaf0ff;
`;

const H3 = styled.h3`
  margin: 18px 0 8px;
  font-size: 17px;
  color: rgba(234, 240, 255, 0.95);
`;

const P = styled.p`
  margin: 0 0 12px;
  font-size: 15px;
  color: rgba(234, 240, 255, 0.82);

  b {
    color: rgba(234, 240, 255, 0.96);
  }
`;

const List = styled.ul`
  margin: 8px 0 14px 18px;
  color: rgba(234, 240, 255, 0.82);
  font-size: 15px;

  li {
    margin: 6px 0;
  }
`;

const Divider = styled.hr`
  margin: 26px 0;
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
`;

const MiniBox = styled.div`
  margin: 14px 0 8px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.12);
  max-width: 920px;
`;

const MiniTitle = styled.div`
  font-size: 13px;
  letter-spacing: 0.2px;
  color: rgba(234, 240, 255, 0.9);
  margin-bottom: 6px;
  font-weight: 700;
`;

const MiniText = styled.div`
  font-size: 14px;
  color: rgba(234, 240, 255, 0.78);
  line-height: 1.65;
`;

const Steps = styled.div`
  display: grid;
  gap: 10px;
  margin: 12px 0 16px;
  max-width: 920px;
`;

const Step = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: start;
`;

const StepN = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.10);
  color: rgba(234, 240, 255, 0.92);
`;

const StepText = styled.div`
  font-size: 15px;
  color: rgba(234, 240, 255, 0.82);

  b {
    color: rgba(234, 240, 255, 0.96);
  }
`;

const FooterNote = styled.div`
  margin-top: 22px;
  max-width: 1000px;
  font-size: 13px;
  color: rgba(234, 240, 255, 0.62);
`;