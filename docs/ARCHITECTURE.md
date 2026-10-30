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
BTC/ETH são os dois especialistas definidos no MVP, entre cinco agentes lógicos (DEC-036). Central, Coordenador e Gestor completam os cinco; simulação/execução/auditoria são componentes, não agentes. SOL futuro. Resultados alimentam somente o aprendizado do respectivo especialista. Visualização observa atividades; persistência/auditoria apoiam todo o fluxo.

## 1. Frontend e ambiente 3D
DEC-040: um andar, cinco personagens, mesas BTC/ETH, salas centrais da Central e Gestor, Coordenador e telão; expansão lateral futura. Orbit/zoom/pan, interação/painéis derivados de eventos reais simulados; iniciar/pausar/avançar5min/velocidade/reinício confirmado. Animação simples, navegação curta, sem lógica financeira ou espera por caminhada. [Referência visual](PROJECT_CONTEXT.md). Engine/framework/linguagem não escolhidos; Three.js PROPOSED.

## 2. Backend e serviços
Separar fontes/dados, inteligência contextual, estratégias individuais, priorização, gestão financeira, simulação operacional, aprendizado, visualização e persistência/auditoria. A separação conceitual não escolhe serviços físicos ou tecnologias.
STATUS: PENDING — aguardando definição arquitetural técnica.

## 3. Mecanismo dos agentes
DEC-009/DEC-015/DEC-026: especialistas exclusivos por ativo, estratégias/memória/candidatas independentes. Seleção/combinação adaptativa conforme regime/contexto, política versionada e evolução só após DEC-016. Famílias iniciais e parâmetros aprovados em DEC-039/DEC-041 a DEC-050; bordas, ativação de H e detalhes técnicos remanescentes PENDING.
DEC-028: uma política ativa oficial, até três candidatas por ciclo/agente, isoladas sem consumir capital da carteira oficial, condições comparáveis e dados cronológicos. Baseline inicial UNVALIDATED pode operar simulado sob controles; histórico insuficiente não é evidência de desempenho. Toda promoção posterior exige LEARN-GATE integral. Preservar histórico/evidências/versões; não retroagir operações ou abandonar proteções na promoção/rollback. DEC-016 e limites financeiros inalterados. LEARN-004 detalha políticas abaixo; intervalos/algoritmos concretos, frequência, estatística complementar e recuperação excepcional PENDING. Cenários e durações seguem a configuração aprovada na DEC-038.

### LEARN-004: avaliação e evolução (DEC-030 a DEC-035)
Fluxo conceitual: desenvolvimento/ajuste -> busca local autorizada -> congelamento -> no máximo uma desafiante final/ciclo -> validação reservada -> LEARN-GATE -> promoção -> monitoramento -> manutenção ou rollback seguro. Candidatas/referência paralela não movimentam capital oficial. Não define tecnologia ou contratos concretos.

Retorno por período: R_p = 100 * (E_final - E_inicial) / E_inicial. Delta = mean(R_candidata,p - R_ativa,p), mínimo 1 p.p.; líquido positivo após custos e superior em dois dos três períodos, além de DEC-016 integral. Três períodos cronológicos não sobrepostos de30 dias, cada um com os seis cenários/5 dias cada nas ordens V1/V2/V3 de DEC-038, carteiras independentes de 10.000 UC sem posições iniciais, mesmos dados/eventos/condições/custos para ativa/candidata e alta/baixa/lateralização com contexto. Taxas/deslizamento e marcação a mercado comparáveis.

Aquecimento com dados anteriores permitido sem contabilizar operações externas. Posições nas fronteiras integram patrimônio com provisão estimada de custos de encerramento; não contam como concluídas, não se força fechamento fictício nem transporte para outra carteira independente. Preservar operações distintas encerradas: 60 no conjunto válido e mínimo 10 por período.

Geração: versão de origem identificada, hipótese/parâmetros/versões/sementes e todas as tentativas, incluindo total entre ciclos e concentração por período/regime. Até três candidatas e no máximo uma desafiante final. Proibir ajuste pela validação, janelas escolhidas retrospectivamente ou reutilizadas oportunisticamente após resultados; invalidar contaminação/look-ahead, usar INSUFFICIENT_EVIDENCE sem dados válidos suficientes. Sem código/contratos, score global/limiar 70, limites ou gates alterados.

Drawdown: P_t é maior patrimônio desde início do período; DD_t = 100 * (P_t - E_t) / P_t, com E_t líquido marcado a mercado/custos. MDD_p = max(DD_t); MDD_final = max(MDD_1, MDD_2, MDD_3). Candidata <=10% e <= ativa +2 p.p., simultaneamente. Mesma metodologia e dados conhecidos no instante; não usar média para substituir pior período.

Promovida assume novas decisões oficiais; anterior continua referência identificada, em paralelo sem capital oficial. Rollback por degradação: duas janelas consecutivas sem sobreposição, de30 dias cada, pelo menos 20 operações distintas encerradas da promovida em cada; retorno líquido inferior ao anterior por pelo menos 1 p.p. em CADA janela, com dados/condições/custos/capital inicial equivalentes e evidências persistidas. Insuficiência não comprova degradação por perdas isoladas. Violações críticas de segurança/autorização/integridade/limites suspendem imediatamente novas entradas, sem esperar janelas; mecanismo distinto de rollback por degradação.

Reversão só em novas decisões; registrar motivo/evidências e preservar versão promovida/histórico, sem retroatividade. Posições existentes mantêm stop/take e estratégia/versão de origem. Anterior só íntegra/elegível; sem versão segura, manter suspensão. Não revogar bloqueios ou alterar limites. PROMOTE/REJECT/INSUFFICIENT_EVIDENCE/ROLLBACK preservados.

DEC-038 fixa150 horários de aquecimento inicial,90 dias de desenvolvimento,3x30 de validação e2x30 de monitoramento (240 dias mais aquecimento). Trajetórias/sementes distintas; nenhum transporte de posição/capital/operação entre carteiras. Aquecimento anterior por carteira sem estado operacional importado ou ajuste pela reserva. Sem fabricar amostra mínima: INSUFFICIENT_EVIDENCE quando insuficiente. Pendentes: avaliação adicional, intervalos mutáveis, algoritmos de geração, frequência detalhada, estatística complementar, exceções e recuperação. Os mínimos não provam eficácia estatística.

## 4. Comunicação e fluxo funcional de sinais
```text
Dados/contexto disponíveis no relógio simulado
  -> Especialista do ativo: regime e estratégias elegíveis
  -> Política ativa versionada: análise, divergências e score
  -> Decisão oficial por ativo/candle fechado (+ alertas)
       ENTRY_CANDIDATE -> Coordenador -> Gestor -> abertura elegível autorizada
       EXIT_REQUEST -> próxima abertura elegível, fora da fila de novas compras
       HOLD / WAIT -> registro do ciclo (WAIT sem reserva)
       RISK_ALERT -> evento persistido, sem ordem automática
  -> Auditoria / resultados -> aprendizado só do especialista responsável
```
Proteções stop/take seguem fluxo independente da fila, conforme OPS-002. Candidatas avaliam em isolamento. Contratos, transportes e implementação PENDING; substituir provedores preserva contratos dos especialistas. Frontend apenas reflete estados.

## 5. Fontes e inteligência contextual
DEC-011/DEC-012: provedores simulam dados financeiros e acontecimentos econômicos/políticos, identificados como fictícios, reproduzíveis e sem informação futura antecipada. Central não é só distribuidor de preços: coleta, organiza, valida e interpreta cotações/candles/volume/volatilidade/liquidez, notícias econômicas/financeiras, inflação/juros/emprego/bancos centrais, política/governos, geopolítica/conflitos/sanções, regulação/tributação, cripto/blockchains/corretoras, instituições, sentimento e outros eventos relevantes.
Produz resumos, classifica relevância/risco, identifica ativos potencialmente afetados e formula hipóteses fundamentadas. Preserva fontes, timestamps, incerteza, justificativas e distinção entre fatos/rumores/hipóteses/interpretações; compartilha conforme relevância sem consultas externas redundantes. Não decide compras/vendas, executa, autoriza capital ou substitui especialistas. Classificação contextual não comprova causalidade nem previsão garantida. Fontes reais confiáveis só posteriormente; MVP sem dependência de APIs externas pagas.

## 6. Snapshots, cálculo e seleção SIGNAL-005
Fluxo funcional, sem escolher contratos concretos ou impor precedência temporal operacional ainda pendente:
```text
Snapshot de candles fechados 5min + último horário fechado (12 candles válidos)
  + eventos publicados/disponibilizados no instante UTC simulado
  -> classificar regime/volatilidade sem rótulo verdadeiro do gerador
  -> avaliar gatilhos das três famílias por ativo/política versionada
  -> calcular T / elegibilidade R / contexto C / concordância A / H autorizado
  -> score individual half-up -> representante por S/bruto/T/R/ID
  -> ENTRY_CANDIDATE ao Coordenador -> Gestor -> abertura elegível autorizada
  -> operação/proteções/EXIT_REQUEST por origem -> auditoria -> aprendizado
```
Gerador conhece os seis cenários, especialistas não recebem verdade oculta. Regime/contexto técnico superior só em1h fechada; nenhuma consulta a horário em formação. Dados inválidos bloqueiam sinais dependentes. DOWNTREND/UNKNOWN/volatilidade inválida não permitem nova compra.

DEC-042: D=(EMA20-EMA50)/ATR14; UPTREND ADX>=25,D>=0,25,+DI>-DI; DOWNTREND ADX>=25,D<=-0,25,-DI>+DI; SIDEWAYS ADX<20; zona intermediária/contradição/insuficiência/invalidade UNKNOWN. Confirmar novo regime em2 horários consecutivos, inválidos UNKNOWN imediato. Volatilidade ATR14/Close acima do percentil75 nearest rank dos100 valores horários ANTERIORES = HIGH; demais válidos NORMAL.

Famílias iniciais DEC-039: tendência EMA9/21 e recuperaçãoEMA9 em5min/UPTREND; rompimento Close>máxima20 anteriores e volume>1,2x média anterior; reversão SIDEWAYS/RSI14 recupera35 após sobrevenda/retorno à banda inferior Bollinger20/2. Métodos DEC-050: EMA sementeSMA e2/(N+1); RSI/ATR/ADX-DI Wilder; Bollinger com desvio populacional; janelas de volume/rompimento excluem atual. Bordas exatas PENDING.

T = 40G + 30F + 20Q + 10V; G gatilho binário, F normalizada; Q=(Close-Low)/(High-Low); V=clip((Volume/Media20Anterior-1)/0.5,0,1). Forças por família conforme DEC-043, sem completar composição/bordas não explicitadas. Sem gatilho, histórico insuficiente ou divisor inválido impede entrada.
R segue matriz exata DEC-044/REQ-086: UPTREND tendência100/80, rompimento90/80; SIDEWAYS rompimento80/60, reversão100/60 (NORMAL/HIGH). Demais INELEGIBLE, distintas de R=0.
C = clip(50 + soma(direcao*intensidade*decaimento) - U, 0, 100), fluxo válido neutro50. Fatos simulados10/20/30 por ativo, decaimento linear cripto6h/macro24h/geopolítico-regulatório72h; rumor penaliza5 por grupo independente até10, sem bônus. IDs agrupam duplicados, timestamps limitam disponibilidade; precedência contextual PENDING (DEC-045).
A50 uma família válida; A100 pelo menos2 distintas elegíveis/T>=60, somente participantes qualificados. Sem duplicar família/versões, cruzar BTC/ETH ou usar shadow/challengers externos à política avaliada (DEC-046).

S = round_half_up(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A), S>=70 e demais elegibilidades; score não é probabilidade, orçamento ou risco suficiente. H operacional inicial0 em UNVALIDATED/insuficiência; H pertence à política versionada, comum às estratégias do ativo (DEC-041/DEC-048).
H calculado após gate: round_half_up(50+20E+10K+10D), E=clip((Delta-1)/2,0,1), K=periodos_superiores-2, D=clip((10-MDD)/10,0,1), faixa50–90. Cálculo não autoriza ativação: nova configuração/validação independente, máquina de estados/bootstrap PENDING, sem retroatividade (DEC-049).

Especialista escolhe por maior S arredondado, bruto, T, R e ID canônico crescente, preservando origem/versão, descartadas, tempos e justificativas; nunca soma scores. Coordenador mantém ordem separada: maior nota válida, mais antigo, rodízio persistido, ID estável, independente de chegada assíncrona; não recalcula ou autoriza capital.

Saídas DEC-050 por origem: tendência2 fechamentos abaixoEMA21, rompimento2 abaixo nível congelado na entrada, reversão Close>=SMA20 Bollinger. EXIT_REQUEST próxima abertura, stop/take/gaps OPS-002 prevalecem. Manter versão/proteção durante evolução, sem dupla saída/taxa/liquidação/reserva. Regime/notícia negativa isolada não liquida automaticamente. Ordem temporal exata com falhas de dados PENDING.

## 7. Gerenciamento financeiro e execução simulada
DEC-018/DEC-020: Gestor recebe oportunidades priorizadas, controla orçamento centralizado compartilhado de 10.000 UC, sem saldo permanente por agente. Autoriza/rejeita e registra disponibilidade, limites, reservas/liberações sem duplicação. Exposição individual máxima 20% e consolidada 40% do patrimônio; risco planejado por operação 1% e total aberto 2%. Recalcular percentuais sobre patrimônio conforme regras auditáveis. Perda diária de referência 3% usa patrimônio do início do dia UTC, virada 00:00, e considera redução patrimonial/perdas não realizadas; ao atingir o limite, bloquear novas entradas. Risco inclui custos previstos e distância à proteção, sem garantir perda máxima: gaps/deslizamentos podem exceder planejamento. Faixas por pontuação não aprovadas.

DEC-021/DEC-022: somente spot simulado, sem alavancagem/venda descoberta/operação real. Sinais em candles fechados; entrada na próxima abertura elegível, com autorização financeira anterior. Não executar retroativamente no candle de origem ou após perder abertura; ENTRY expira na abertura perdida; EXIT_REQUEST perdido exige reavaliação (DEC-029). Registrar preço efetivamente simulado. OPS-002: stop inicial 2% abaixo, take 4% acima; taxa 0,10% e deslizamento 0,05% por execução; uma posição por ativo, saída integral. Saída estratégica na próxima abertura elegível; stop/take ativos via OHLC.

DEC-023: avaliar gaps na abertura. Abaixo do stop de comprada, usar abertura desfavorável com deslizamento; acima do take, não conceder além do alvo sem regra aprovada. Só stop ou só take atingido: processar respectivo; ambos com sequência desconhecida: stop primeiro. Registrar razão/custos e impedir encerramento duplo. Não antecipar máxima/mínima/fechamento futuros; mudanças de proteção não retroagem.

DEC-024: stop obrigatório e vínculo com versão de origem; apertar proteção só conforme regra autorizada, sem ampliar risco. Promoção não muda retroativamente posições; rollback não abandona posições e preserva proteção/histórico. Parâmetros versionados e candidatas sujeitos integralmente a DEC-016; sem alteração autônoma de limites globais/gates.

DEC-029: ENTRY só vale até próxima abertura elegível; expiração/cancelamento libera reserva idempotentemente, sem transferir autorização; nova oportunidade exige nova análise/dados válidos e autorização própria. Relógio simulado: pausa não expira por tempo real/animação. HOLD/WAIT no ciclo corrente, WAIT sem reserva; RISK_ALERT adicional persistido com situação rastreável, sem ordem automática. Uma decisão oficial por ativo/candle fechado; identidade estável por sinal/ciclo, reprocessamento sem duplicar oportunidades/reservas/operações. Dados ausentes/inválidos bloqueiam novas entradas; posições não perdem proteção. Contingências não definidas PENDING.

Pendências: ciclo completo da ordem, detalhes restantes das reservas/contingências, redimensionamento/rejeição, precisão/reconciliação e recuperação. Não escolher contratos ou tecnologias nesta consolidação.

## 8. Persistência e auditoria
DEC-025: histórico e estado financeiros persistentes, auditáveis e idempotentes. Controlar caixa disponível/reservado, posições, patrimônio, realizado/não realizado, exposição, risco planejado, perda diária, taxas/deslizamentos e justificativas de autorizações/rejeições. Marcação a mercado usa preços conhecidos no instante, sem antecipação.

Cada operação preserva agente/ativo, estratégia/versão, oportunidade original, nota ao Coordenador, dados/contexto, orçamento, capital/risco autorizados, entrada/saída, custos, stop/take, resultado e eventos usados no aprendizado. Resultados alimentam só o especialista responsável; separar carteira de avaliações hipotéticas não executadas.

Correções por eventos de ajuste/compensação preservam originais; não duplicar reservas, execuções, taxas ou liquidações. Reinício preserva histórico/estado; mesmo cenário/parâmetros/sequência reproduz resultados. Também persistir identidades de sinais/ciclos, componentes disponíveis, divergências, estado do rodízio, expirações/cancelamentos e liberação idempotente. Rejeição por falta de capital não prova erro da estratégia. Banco, contratos, precisão, arredondamento, reconciliação, recuperação e avaliações hipotéticas detalhadas PENDING. Evidências de aprendizado incluem períodos/carteiras, congelamento, dados reservados, tentativas/sementes, curvas patrimoniais, operações distintas, custos provisionados nas fronteiras, métricas, referência anterior e motivo de suspensão/reversão (DEC-030 a DEC-035). Auditar também snapshot, origem e versões, T/R/C/A, H calculado versus autorizado, scores bruto/arredondado, concordâncias/descartes, IDs de eventos, sementes/trajetórias e fronteiras das carteiras, sem fornecer rótulo verdadeiro aos especialistas. Nenhum mecanismo implementado.

## 9. Segurança
Agentes não alteram código, segurança, limites financeiros, contratos, critérios obrigatórios ou autorizações. Candidatas não interferem em operações oficiais enquanto avaliadas. Gates não provam eficácia real. Operações reais e provedores pagos exigem autorização específica; não integram o MVP atual. Autenticação, credenciais e controles técnicos PENDING; nenhum implementado.

## 10. Infraestrutura e implantação
STATUS: PENDING — aguardando definição arquitetural.
Hardware, desempenho, observabilidade, custos e implantação ainda a definir. Não há frameworks ou provedores aprovados por este desenho.
