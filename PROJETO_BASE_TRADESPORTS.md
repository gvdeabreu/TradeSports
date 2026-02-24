radeSports — Documento Base do Projeto (Fonte da Verdade)
1. Visão Geral

TradeSports é uma plataforma web de negociação econômica esportiva com dinheiro real, estruturada como uma corretora onde usuários compram e vendem cotas de clubes de futebol.

❗ Importante:
TradeSports NÃO é fantasy game, NÃO é gamificação financeira e NÃO é apostas esportivas.
É um mercado econômico derivado do desempenho esportivo real.

O preço das cotas:

reage ao desempenho real dos clubes no campeonato

é influenciado por oferta e demanda entre usuários

segue regras pré-definidas de valorização, dividendos e liquidação final.

2. Estrutura do Mercado
2.1 IPO (Oferta Inicial de Cotas)

Cada clube emite 1000 cotas na fase inicial (IPO)

As cotas são vendidas diretamente pela plataforma

O IPO permanece aberto até que as 1000 cotas sejam totalmente vendidas

Enquanto o IPO estiver aberto:

não existe mercado secundário

usuários só compram da “plataforma”

📌 Regra fixa:

Quando as 1000 cotas forem vendidas → o sistema abre automaticamente o mercado secundário.

2.2 Mercado Secundário

Após o IPO:

Usuários negociam entre si

Todas as ordens passam por um livro de ofertas

A plataforma não é contraparte

A plataforma ganha via taxas/comissões

3. Modal de Negociação (Regra Crítica)

Todas as operações de compra e venda DEVEM ocorrer exclusivamente via o modal de negociação existente:

NegociacaoModal

Não criar fluxos paralelos

Não criar compras “diretas” fora do modal

O modal já contém:

integração com usuário logado

livro de ordens

botão único de compra/venda

validações

integração com ToastProvider

📌 Regra fixa:

Qualquer melhoria (IPO, secundário, antifraude, liquidação)
deve ser incorporada nesse modal, nunca substituí-lo.

4. Lógica Econômica das Cotas
4.1 Precificação Base (Tabela)

O valor da cota cresce 5% por posição acima

Base:

20º colocado = R$ 5,00

Cada posição acima aumenta 5% em relação à anterior

Essa tabela:

serve como referência econômica

influencia expectativa de mercado

não trava o preço no mercado secundário

4.2 Dividendos (Top 4)

Apenas clubes do Top 4 geram dividendos

Dividendos são pagos a usuários que:

mantêm cotas por 3 rodadas consecutivas

Valor do dividendo:

maior para o 1º colocado

decrescente até o 4º

📌 Clubes fora do Top 4:

não pagam dividendos

têm maior potencial especulativo de valorização

5. Liquidação Final do Campeonato

Ao final do campeonato:

O sistema executa uma liquidação automática

Cada cota é liquidada com base:

na posição final do clube

na tabela econômica definida

O valor é creditado ao usuário

As cotas deixam de existir para aquele campeonato

📌 Essa etapa é obrigatória e encerra o ciclo do ativo.

6. Usuários e Autenticação

Usuários não logados:

podem navegar normalmente

podem ver clubes, preços e livro de ordens

Login é exigido apenas para:

enviar ordens

negociar

acessar carteira

📌 Regra fixa:

O site funciona em modo “open view”, mas write actions exigem login.

7. Identidade dos Clubes (Regra Técnica Importante)

O sistema utiliza um ID próprio do clubes.json

NÃO usar ID da API-Football para lógica interna

📌 Regra fixa:

Todas as operações (modal, ordens, carteira, liquidação)
usam exclusivamente o ID interno personalizado.

8. Armazenamento de Dados (Estado Atual)
Backend atual:

Dados persistidos em arquivos JSON

Inclui:

usuários

transações

ordens

carteira

histórico de dividendos

⚠️ MongoDB foi considerado, mas:

uso foi adiado temporariamente

estrutura já pensada para futura migração

9. Carteira do Usuário

Na página carteira.js devem aparecer:

Ativos atuais

Histórico de:

dividendos recebidos

liquidações finais

📌 Isso é parte do produto final, não opcional.

10. Antifraude e Segurança (Roadmap)
Camada 1 — Segurança básica

autenticação

validações

checagem de saldo

integridade de ordens

Camada 2 — Antifraude Econômico (planejada)

prevenção de manipulação

ordens artificiais

abuso de microtransações

wash trading

11. Princípios de Desenvolvimento (IMPORTANTÍSSIMO)

Qualquer alteração no projeto deve respeitar:

❌ Não quebrar o modal de negociação

❌ Não criar fluxos paralelos

❌ Não ignorar decisões já tomadas

✅ Sempre preservar continuidade econômica

✅ Sempre pensar como corretora, não como jogo

TradeSports é um mercado.
O esporte é o ativo subjacente.

12. Objetivo do MVP

Entregar uma plataforma:

funcional de ponta a ponta

com IPO → mercado secundário → dividendos → liquidação

pronta para testes reais

preparada para escalar juridicamente e tecnicamente

✅ Instrução Direta ao Codex

Este documento é a fonte da verdade do projeto.
Qualquer código gerado, alterado ou sugerido
DEVE respeitar integralmente estas regras.
