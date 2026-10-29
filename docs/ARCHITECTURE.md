# Arquitetura conceitual

Divisão de responsabilidades APPROVED (DEC-019); arquitetura implementada: nenhuma. Contratos concretos, frameworks, topologia e tecnologias PENDING. Blocos não implicam microsserviços. Referências: [decisões](DECISIONS.md), [requisitos](REQUIREMENTS.md).

## Fluxo aprovado
```text
PROVEDORES SIMULADOS
    |
    v
ANALISTA CENTRAL DE INTELIGÊNCIA
    | Dados, notícias, contexto e hipóteses
    +---------------------------+
    |                           |
    v                           v
AGENTE BTC                  AGENTE ETH
    | Estratégias próprias      | Estratégias próprias
    | Memória própria           | Memória própria
    | Aprendizado próprio       | Aprendizado próprio
    +-------------+-------------+
                  |
                  v
       COORDENADOR DE OPORTUNIDADES
                  |
                  v
          GESTOR DE ORÇAMENTO
                  |
                  v
          EXECUÇÃO SIMULADA
                  |
                  v
         RESULTADOS AUDITÁVEIS
                  |
                  v
        APRENDIZADO DOS AGENTES
```
BTC/ETH são exemplos, não composição definitiva do MVP. Resultados alimentam somente o aprendizado do respectivo especialista. Visualização observa atividades; persistência/auditoria apoiam todo o fluxo.

## 1. Frontend e ambiente 3D
DEC-001 a DEC-004 e DEC-008: um andar, salas centrais de análise/coordenação e orçamento, mesas ao redor e expansão lateral. Movimentos representam estados e não determinam análises, operações ou decisões; deslocamentos curtos sem bloquear processamento. Frontend 3D não executa lógica de negócio. Three.js PROPOSED (DEC-007); framework, linguagem e visual final PENDING. [Referência visual](PROJECT_CONTEXT.md).

## 2. Backend e serviços
Separar fontes/dados, inteligência contextual, estratégias individuais, priorização, gestão financeira, simulação operacional, aprendizado, visualização e persistência/auditoria. A separação conceitual não escolhe serviços físicos ou tecnologias.
STATUS: PENDING — aguardando definição arquitetural técnica.

## 3. Mecanismo dos agentes
DEC-009, DEC-010, DEC-013 e DEC-015: especialistas autônomos exclusivos por ativo sob supervisão do usuário. Recebem informações, analisam, identificam oportunidades, encaminham sinais, acompanham resultados, avaliam desempenho e evoluem estratégias. Memória persistente e aprendizado próprios, sem revisão/aprovação técnica de outro ativo.
Estratégia ativa e candidatas versionadas; candidatas isoladas das operações oficiais, testes independentes e validação independente antes de promoção automática exclusivamente simulada. LEARN-GATE integral em DEC-016: amostra/integridade, desempenho, risco e estados PROMOTE/REJECT/INSUFFICIENT_EVIDENCE/ROLLBACK. Reversão auditável trata posições abertas; perda isolada não altera estratégia. Modelo matemático, estatística e monitoramento detalhado PENDING. Nenhum mecanismo implementado.

## 4. Comunicação entre agentes
Contexto comum vem do Central; especialistas interpretam somente seus ativos. Sinais seguem ao Coordenador; pedidos priorizados ao Gestor; resultados preservam vínculo com especialista e versão da estratégia. Troca de provedores não altera contratos consumidos pelos especialistas. Transporte, protocolos e esquemas concretos PENDING.

## 5. Fontes e inteligência contextual
DEC-011/DEC-012: provedores simulam dados financeiros e acontecimentos econômicos/políticos, identificados como fictícios, reproduzíveis e sem informação futura antecipada. Central não é só distribuidor de preços: coleta, organiza, valida e interpreta cotações/candles/volume/volatilidade/liquidez, notícias econômicas/financeiras, inflação/juros/emprego/bancos centrais, política/governos, geopolítica/conflitos/sanções, regulação/tributação, cripto/blockchains/corretoras, instituições, sentimento e outros eventos relevantes.
Produz resumos, classifica relevância/risco, identifica ativos potencialmente afetados e formula hipóteses fundamentadas. Preserva fontes, timestamps, incerteza, justificativas e distinção entre fatos/rumores/hipóteses/interpretações; compartilha conforme relevância sem consultas externas redundantes. Não decide compras/vendas, executa, autoriza capital ou substitui especialistas. Classificação contextual não comprova causalidade nem previsão garantida. Fontes reais confiáveis só posteriormente; MVP sem dependência de APIs externas pagas.

## 6. Análise e coordenação
Especialistas combinam técnica e contexto: tendência/preço, volume/volatilidade, economia, política/geopolítica, regulação e riscos. Preservam dados/eventos influentes, contexto temporal e versão da estratégia; permitem comparação posterior sem dados futuros. Pesos PENDING.
DEC-014: Coordenador independente na sala de análise organiza oportunidades por nota padronizada 0–100 com critérios comuns e ordenação determinística. Preserva notas/análises, não recalcula indicadores nem muda conclusões, executa ou reserva capital. Fórmula, classificação, geração, validade/expiração, limiares e desempates PENDING; 40/35/25 não aprovado.

## 7. Gerenciamento financeiro e execução simulada
DEC-018: gestor controla capital fictício, disponibilidade, limites, pedidos priorizados, autorizações/rejeições e reservas/liberações auditáveis, impedindo uso duplicado. Coordenador não o substitui. Política detalhada PENDING; 10.000 UC, 20%, 40% e faixas por nota não aprovados.
DEC-017: após permissão, simulação acompanha operação e encerra conforme regras a definir, registra resultados e alimenta avaliação/evolução individual. Entrada, saída, stop, take profit, custos, dimensionamento e sentido PENDING. Nenhuma operação real no MVP.

## 8. Persistência e auditoria
Memória persistente individual e rastreabilidade aprovadas: análises originais, fontes/timestamps, contexto disponível, estratégias/versionamento, propostas, decisões, reservas, operações/resultados e validação/promoção/reversão. Banco, retenção e esquemas PENDING. Nenhuma persistência de aplicação implementada.

## 9. Segurança
Agentes não alteram código, segurança, limites financeiros, contratos, critérios obrigatórios ou autorizações. Candidatas não interferem em operações oficiais enquanto avaliadas. Gates não provam eficácia real. Operações reais e provedores pagos exigem autorização específica; não integram o MVP atual. Autenticação, credenciais e controles técnicos PENDING; nenhum implementado.

## 10. Infraestrutura e implantação
STATUS: PENDING — aguardando definição arquitetural.
Hardware, desempenho, observabilidade, custos e implantação ainda a definir. Não há frameworks ou provedores aprovados por este desenho.
