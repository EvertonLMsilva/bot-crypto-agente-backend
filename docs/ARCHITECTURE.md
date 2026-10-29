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
DEC-018/DEC-020: Gestor recebe oportunidades priorizadas, controla orçamento centralizado compartilhado de 10.000 UC, sem saldo permanente por agente. Autoriza/rejeita e registra disponibilidade, limites, reservas/liberações sem duplicação. Exposição individual máxima 20% e consolidada 40% do patrimônio; risco planejado por operação 1% e total aberto 2%. Recalcular percentuais sobre patrimônio conforme regras auditáveis. Perda diária de referência 3% usa patrimônio do início do dia UTC, virada 00:00, e considera redução patrimonial/perdas não realizadas; ao atingir o limite, bloquear novas entradas. Risco inclui custos previstos e distância à proteção, sem garantir perda máxima: gaps/deslizamentos podem exceder planejamento. Faixas por pontuação não aprovadas.

DEC-021/DEC-022: somente spot simulado, sem alavancagem/venda descoberta/operação real. Sinais em candles fechados; entrada na próxima abertura elegível, com autorização financeira anterior. Não executar retroativamente no candle de origem ou após perder abertura; expiração/reagendamento PENDING. Registrar preço efetivamente simulado. OPS-002: stop inicial 2% abaixo, take 4% acima; taxa 0,10% e deslizamento 0,05% por execução; uma posição por ativo, saída integral. Saída estratégica na próxima abertura elegível; stop/take ativos via OHLC.

DEC-023: avaliar gaps na abertura. Abaixo do stop de comprada, usar abertura desfavorável com deslizamento; acima do take, não conceder além do alvo sem regra aprovada. Só stop ou só take atingido: processar respectivo; ambos com sequência desconhecida: stop primeiro. Registrar razão/custos e impedir encerramento duplo. Não antecipar máxima/mínima/fechamento futuros; mudanças de proteção não retroagem.

DEC-024: stop obrigatório e vínculo com versão de origem; apertar proteção só conforme regra autorizada, sem ampliar risco. Promoção não muda retroativamente posições; rollback não abandona posições e preserva proteção/histórico. Parâmetros versionados e candidatas sujeitos integralmente a DEC-016; sem alteração autônoma de limites globais/gates.

Pendências: ciclo completo de ordem, abertura perdida, reservas expiradas, indisponibilidade de dados, redimensionamento/rejeição, precisão/reconciliação e recuperação. Não escolher contratos ou tecnologias nesta consolidação.

## 8. Persistência e auditoria
DEC-025: histórico e estado financeiros persistentes, auditáveis e idempotentes. Controlar caixa disponível/reservado, posições, patrimônio, realizado/não realizado, exposição, risco planejado, perda diária, taxas/deslizamentos e justificativas de autorizações/rejeições. Marcação a mercado usa preços conhecidos no instante, sem antecipação.

Cada operação preserva agente/ativo, estratégia/versão, oportunidade original, nota ao Coordenador, dados/contexto, orçamento, capital/risco autorizados, entrada/saída, custos, stop/take, resultado e eventos usados no aprendizado. Resultados alimentam só o especialista responsável; separar carteira de avaliações hipotéticas não executadas.

Correções por eventos de ajuste/compensação preservam originais; não duplicar reservas, execuções, taxas ou liquidações. Reinício preserva histórico/estado; mesmo cenário/parâmetros/sequência reproduz resultados. Banco, contratos, precisão, arredondamento, reconciliação, recuperação e avaliações hipotéticas detalhadas PENDING. Nenhum mecanismo implementado.

## 9. Segurança
Agentes não alteram código, segurança, limites financeiros, contratos, critérios obrigatórios ou autorizações. Candidatas não interferem em operações oficiais enquanto avaliadas. Gates não provam eficácia real. Operações reais e provedores pagos exigem autorização específica; não integram o MVP atual. Autenticação, credenciais e controles técnicos PENDING; nenhum implementado.

## 10. Infraestrutura e implantação
STATUS: PENDING — aguardando definição arquitetural.
Hardware, desempenho, observabilidade, custos e implantação ainda a definir. Não há frameworks ou provedores aprovados por este desenho.
