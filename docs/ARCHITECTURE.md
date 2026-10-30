# Arquitetura conceitual

Divisão de responsabilidades APPROVED (DEC-019); arquitetura mínima ARCH-001 aprovada em DEC-063. MVP-001-A implementa somente fundação NestJS standalone, relógio e candles sintéticos. TypeScript/Node24/NestJS/Jest aprovados; contratos e componentes restantes não implementados. Blocos não implicam microsserviços. Referências: [decisões](DECISIONS.md), [requisitos](REQUIREMENTS.md).

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
DEC-040: um andar, cinco personagens, mesas BTC/ETH, salas centrais da Central e Gestor, Coordenador e telão; expansão lateral futura. Orbit/zoom/pan, interação/painéis derivados de eventos reais simulados; iniciar/pausar/avançar5min/velocidade/reinício confirmado. Animação simples, navegação curta, sem lógica financeira ou espera por caminhada. [Referência visual](PROJECT_CONTEXT.md). React/Vite/Three.js aprovados para fase posterior em DEC-063, sem implementação neste incremento.

## 2. Backend e serviços
Separar fontes/dados, inteligência contextual, estratégias individuais, priorização, gestão financeira, simulação operacional, aprendizado, visualização e persistência/auditoria. A separação conceitual não escolhe serviços físicos ou tecnologias.
STATUS: fundação mínima TypeScript/Node24/NestJS standalone implementada em MVP-001-A; contratos técnicos dos componentes restantes pendentes, sem servidor HTTP.

## 3. Mecanismo dos agentes
DEC-009/DEC-015/DEC-026: especialistas exclusivos por ativo, estratégias/memória/candidatas independentes. Seleção/combinação adaptativa conforme regime/contexto, política versionada e evolução só após DEC-016. Famílias iniciais e parâmetros aprovados em DEC-039/DEC-041 a DEC-050; bordas e ativação/bootstrap de H aprovados em DEC-051 a DEC-053; detalhes técnicos remanescentes PENDING.
DEC-028: uma política ativa oficial, até três candidatas por ciclo/agente, isoladas sem consumir capital da carteira oficial, condições comparáveis e dados cronológicos. Baseline inicial UNVALIDATED pode operar simulado sob controles; histórico insuficiente não é evidência de desempenho. Toda promoção posterior exige LEARN-GATE integral. Preservar histórico/evidências/versões; não retroagir operações ou abandonar proteções na promoção/rollback. DEC-016 e limites financeiros inalterados. LEARN-004 detalha políticas abaixo; intervalos/algoritmos concretos, frequência, estatística complementar e recuperação excepcional PENDING. Cenários e durações seguem a configuração aprovada na DEC-038.

### LEARN-004: avaliação e evolução (DEC-030 a DEC-035)
Fluxo conceitual: desenvolvimento/ajuste -> busca local autorizada -> congelamento -> no máximo uma desafiante final/ciclo -> validação reservada -> LEARN-GATE -> promoção -> monitoramento -> manutenção ou rollback seguro. Candidatas/referência paralela não movimentam capital oficial. Não define tecnologia ou contratos concretos.

Retorno por período: R_p = 100 * (E_final - E_inicial) / E_inicial. Delta = mean(R_candidata,p - R_ativa,p), mínimo 1 p.p.; líquido positivo após custos e superior em dois dos três períodos, além de DEC-016 integral. Três períodos cronológicos não sobrepostos de30 dias, cada um com os seis cenários/5 dias cada nas ordens V1/V2/V3 de DEC-038, carteiras independentes de 10.000 UC sem posições iniciais, mesmos dados/eventos/condições/custos para ativa/candidata e alta/baixa/lateralização com contexto. Taxas/deslizamento e marcação a mercado comparáveis.

Aquecimento com dados anteriores permitido sem contabilizar operações externas. Posições nas fronteiras integram patrimônio com provisão estimada de custos de encerramento; não contam como concluídas, não se força fechamento fictício nem transporte para outra carteira independente. Preservar operações distintas encerradas: 60 no conjunto válido e mínimo 10 por período.

Geração: versão de origem identificada, hipótese/parâmetros/versões/sementes e todas as tentativas, incluindo total entre ciclos e concentração por período/regime. Até três candidatas e no máximo uma desafiante final. Proibir ajuste pela validação, janelas escolhidas retrospectivamente ou reutilizadas oportunisticamente após resultados; invalidar contaminação/look-ahead, usar INSUFFICIENT_EVIDENCE sem dados válidos suficientes. Sem código/contratos, score global/limiar 70, limites ou gates alterados.

Drawdown: P_t é maior patrimônio desde início do período; DD_t = 100 * (P_t - E_t) / P_t, com E_t líquido marcado a mercado/custos. MDD_p = max(DD_t); MDD_final = max(MDD_1, MDD_2, MDD_3). Candidata <=10% e <= ativa +2 p.p., simultaneamente. Mesma metodologia e dados conhecidos no instante; não usar média para substituir pior período.

Promovida assume novas decisões oficiais; anterior continua referência identificada, em paralelo sem capital oficial. Rollback por degradação: duas janelas consecutivas sem sobreposição, de30 dias cada, pelo menos 20 operações distintas encerradas da promovida em cada; retorno líquido inferior ao anterior por pelo menos 1 p.p. em CADA janela, com dados/condições/custos/capital inicial equivalentes e evidências persistidas. Insuficiência não comprova degradação por perdas isoladas. Violações críticas de segurança/autorização/integridade/limites suspendem imediatamente novas entradas, sem esperar janelas; mecanismo distinto de rollback por degradação.

Reversão só em novas decisões; registrar motivo/evidências e preservar versão promovida/histórico, sem retroatividade. Posições existentes mantêm stop/take e estratégia/versão de origem. Anterior só íntegra/elegível; sem versão segura, manter suspensão. Não revogar bloqueios ou alterar limites. PROMOTE/REJECT/INSUFFICIENT_EVIDENCE/ROLLBACK preservados.

DEC-038 fixa150 horários de aquecimento inicial,90 dias de desenvolvimento,3x30 de validação e2x30 de monitoramento (240 dias mais aquecimento). Trajetórias/sementes distintas; nenhum transporte de posição/capital/operação entre carteiras. Aquecimento anterior por carteira sem estado operacional importado ou ajuste pela reserva. Sem fabricar amostra mínima: INSUFFICIENT_EVIDENCE quando insuficiente. Avaliação adicional aprovada em DEC-057. Pendentes: intervalos mutáveis, algoritmos de geração, frequência detalhada, estatística complementar, exceções e recuperação. Os mínimos não provam eficácia estatística.

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
Fluxo funcional, sem escolher contratos concretos; precedência operacional aprovada em DEC-056:
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

Famílias iniciais DEC-039: tendência EMA9/21 e recuperaçãoEMA9 em5min/UPTREND; rompimento Close>máxima20 anteriores e volume>1,2x média anterior; reversão SIDEWAYS/RSI14 recupera35 após sobrevenda/retorno à banda inferior Bollinger20/2. Métodos DEC-050: EMA sementeSMA e2/(N+1); RSI/ATR/ADX-DI Wilder; Bollinger com desvio populacional; janelas de volume/rompimento excluem atual. Indexação e bordas aprovadas em DEC-053, detalhadas abaixo.

T = 40G + 30F + 20Q + 10V; G gatilho binário, F normalizada; Q=(Close-Low)/(High-Low); V=clip((Volume/Media20Anterior-1)/0.5,0,1). F=clip(x,0,1), conforme DEC-053: tendência x=(EMA9-EMA21)/(0.5*ATR14); rompimento x=(Close-max20 anteriores)/(0.5*ATR14); reversão x=(35-minRSI dos3 anteriores)/15. Gatilhos DEC-043 permanecem obrigatórios. Sem gatilho, histórico insuficiente ou divisor inválido impede entrada.
R segue matriz exata DEC-044/REQ-086: UPTREND tendência100/80, rompimento90/80; SIDEWAYS rompimento80/60, reversão100/60 (NORMAL/HIGH). Demais INELEGIBLE, distintas de R=0.
C = clip(50 + soma(direcao*intensidade*decaimento) - U, 0, 100), fluxo válido neutro50. Fatos simulados10/20/30 por ativo, decaimento linear cripto6h/macro24h/geopolítico-regulatório72h; rumor penaliza5 por grupo independente até10, sem bônus. IDs agrupam duplicados, timestamps limitam disponibilidade; identidade, revisão e precedência contextual aprovadas em DEC-055, preservando DEC-045.
A50 uma família válida; A100 pelo menos2 distintas elegíveis/T>=60, somente participantes qualificados. Sem duplicar família/versões, cruzar BTC/ETH ou usar shadow/challengers externos à política avaliada (DEC-046).

S = round_half_up(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A), S>=70 e demais elegibilidades; score não é probabilidade, orçamento ou risco suficiente. H operacional inicial0 em UNVALIDATED/insuficiência; H pertence à política versionada, comum às estratégias do ativo (DEC-041/DEC-048).
H calculado após gate: round_half_up(50+20E+10K+10D), E=clip((Delta-1)/2,0,1), K=periodos_superiores-2, D=clip((10-MDD)/10,0,1), faixa50–90. Cálculo não autoriza ativação: nova configuração/validação independente, com estados/bootstrap aprovados em DEC-051/DEC-052, sem retroatividade (DEC-049).

Especialista escolhe por maior S arredondado, bruto, T, R e ID canônico crescente, preservando origem/versão, descartadas, tempos e justificativas; nunca soma scores. Coordenador mantém ordem separada: maior nota válida, mais antigo, rodízio persistido, ID estável, independente de chegada assíncrona; não recalcula ou autoriza capital.

Saídas DEC-050 por origem: tendência2 fechamentos abaixoEMA21, rompimento2 abaixo nível congelado na entrada, reversão Close>=SMA20 Bollinger. EXIT_REQUEST próxima abertura, stop/take/gaps OPS-002 prevalecem. Manter versão/proteção durante evolução, sem dupla saída/taxa/liquidação/reserva. Regime/notícia negativa isolada não liquida automaticamente. Ordem temporal exata com falhas de dados aprovada em DEC-056.

## 7. Gerenciamento financeiro e execução simulada
DEC-018/DEC-020: Gestor recebe oportunidades priorizadas, controla orçamento centralizado compartilhado de 10.000 UC, sem saldo permanente por agente. Autoriza/rejeita e registra disponibilidade, limites, reservas/liberações sem duplicação. Exposição individual máxima 20% e consolidada 40% do patrimônio; risco planejado por operação 1% e total aberto 2%. Recalcular percentuais sobre patrimônio conforme regras auditáveis. Perda diária de referência 3% usa patrimônio do início do dia UTC, virada 00:00, e considera redução patrimonial/perdas não realizadas; ao atingir o limite, bloquear novas entradas. Risco inclui custos previstos e distância à proteção, sem garantir perda máxima: gaps/deslizamentos podem exceder planejamento. Dimensionamento inicial fixo de10% do patrimônio por oportunidade em DEC-060; não depende do score e não altera limites.

DEC-021/DEC-022: somente spot simulado, sem alavancagem/venda descoberta/operação real. Sinais em candles fechados; entrada na próxima abertura elegível, com autorização financeira anterior. Não executar retroativamente no candle de origem ou após perder abertura; ENTRY expira na abertura perdida; EXIT_REQUEST perdido exige reavaliação (DEC-029). Registrar preço efetivamente simulado. OPS-002: stop inicial 2% abaixo, take 4% acima; taxa 0,10% e deslizamento 0,05% por execução; uma posição por ativo, saída integral. Saída estratégica na próxima abertura elegível; stop/take ativos via OHLC.

DEC-023: avaliar gaps na abertura. Abaixo do stop de comprada, usar abertura desfavorável com deslizamento; acima do take, não conceder além do alvo sem regra aprovada. Só stop ou só take atingido: processar respectivo; ambos com sequência desconhecida: stop primeiro. Registrar razão/custos e impedir encerramento duplo. Não antecipar máxima/mínima/fechamento futuros; mudanças de proteção não retroagem.

DEC-024: stop obrigatório e vínculo com versão de origem. DEC-062 mantém stop2% e take4% do preço efetivo de entrada fixos durante toda a posição no MVP; apertar proteção fica como extensão histórica não habilitada, sem trailing, breakeven ou ajustes automáticos. Promoção não muda retroativamente posições; rollback não abandona posições e preserva proteção/histórico. Parâmetros versionados e candidatas sujeitos integralmente a DEC-016; sem alteração autônoma de limites globais/gates.

DEC-029: ENTRY só vale até próxima abertura elegível; expiração/cancelamento libera reserva idempotentemente, sem transferir autorização; nova oportunidade exige nova análise/dados válidos e autorização própria. Relógio simulado: pausa não expira por tempo real/animação. HOLD/WAIT no ciclo corrente, WAIT sem reserva; RISK_ALERT adicional persistido com situação rastreável, sem ordem automática. Uma decisão oficial por ativo/candle fechado; identidade estável por sinal/ciclo, reprocessamento sem duplicar oportunidades/reservas/operações. Dados ausentes/inválidos bloqueiam novas entradas; posições não perdem proteção. Estados e recuperação funcional detalhados em DEC-059/DEC-061; contratos técnicos reservados a ARCH-001.

Precisão/ordem temporal em DEC-054/DEC-056; máquina de estados, dimensionamento, reconciliação/recuperação e proteções fixas agora aprovados em DEC-059 a DEC-062 (OPS-003.1–003.4). Sem parcial ou redimensionamento automático. Detalhes técnicos de transações, persistência e recuperação ficam para ARCH-001; avaliações hipotéticas residuais em REQ-044. Não escolher contratos completos ou tecnologias nesta consolidação.

## 8. Persistência e auditoria
DEC-025: histórico e estado financeiros persistentes, auditáveis e idempotentes. Controlar caixa disponível/reservado, posições, patrimônio, realizado/não realizado, exposição, risco planejado, perda diária, taxas/deslizamentos e justificativas de autorizações/rejeições. Marcação a mercado usa preços conhecidos no instante, sem antecipação.

Cada operação preserva agente/ativo, estratégia/versão, oportunidade original, nota ao Coordenador, dados/contexto, orçamento, capital/risco autorizados, entrada/saída, custos, stop/take, resultado e eventos usados no aprendizado. Resultados alimentam só o especialista responsável; separar carteira de avaliações hipotéticas não executadas.

Correções por eventos de ajuste/compensação preservam originais; não duplicar reservas, execuções, taxas ou liquidações. Reinício preserva histórico/estado; mesmo cenário/parâmetros/sequência reproduz resultados. Também persistir identidades de sinais/ciclos, componentes disponíveis, divergências, estado do rodízio, expirações/cancelamentos e liberação idempotente. Rejeição por falta de capital não prova erro da estratégia. Precisão/arredondamento/serialização aprovados em DEC-054. Reconciliação exata e recuperação funcional aprovadas em DEC-061. Banco, contratos técnicos de persistência/transações/recuperação ficam para ARCH-001; detalhamento residual de avaliações hipotéticas permanece PENDING na REQ-044. Evidências de aprendizado incluem períodos/carteiras, congelamento, dados reservados, tentativas/sementes, curvas patrimoniais, operações distintas, custos provisionados nas fronteiras, métricas, referência anterior e motivo de suspensão/reversão (DEC-030 a DEC-035). Auditar também snapshot, origem e versões, T/R/C/A, H calculado versus autorizado, scores bruto/arredondado, concordâncias/descartes, IDs de eventos, sementes/trajetórias e fronteiras das carteiras, sem fornecer rótulo verdadeiro aos especialistas. Nenhum mecanismo implementado.

## 9. Segurança
Agentes não alteram código, segurança, limites financeiros, contratos, critérios obrigatórios ou autorizações. Candidatas não interferem em operações oficiais enquanto avaliadas. Gates não provam eficácia real. Operações reais e provedores pagos exigem autorização específica; não integram o MVP atual. Autenticação, credenciais e controles técnicos PENDING; nenhum implementado.

## 10. Infraestrutura e implantação
STATUS: PENDING — aguardando definição arquitetural.
Hardware, desempenho, observabilidade, custos e implantação ainda a definir. Não há frameworks ou provedores aprovados por este desenho.

## Fluxos complementares aprovados — DOCS-008
Especificações APPROVED; implementação NOT_STARTED. Referência normativa completa: [DEC-051 a DEC-058](DECISIONS.md#dec-051), vinculadas a REQ-093 a REQ-100. Nenhuma tecnologia, biblioteca decimal ou contrato técnico escolhido.

### H, bootstrap e contingência de validação
DEC-051 separa validação (UNVALIDATED, EVALUATING, INSUFFICIENT_EVIDENCE, REJECTED, VALIDATED) de autorização operacional (SHADOW, ELIGIBLE_FOR_PROMOTION, ACTIVE, NEW_ENTRIES_SUSPENDED, RETIRED). H é da política versionada do ativo, BTC/ETH independentes. Certificado histórico não autoriza H operacional. Configuração experimental muda somente H; candidata e referência congeladas, três NOVAS janelas independentes de30 dias, dados inéditos, custos/limites e LEARN-GATE integral. Só promoção controlada habilita H positivo para novas decisões; não reutilizar os períodos da certificação original nem retroagir. Preservar posições/versão de origem, auditoria, suspensão crítica e rollback.

DEC-052: BTC-P0 e ETH-P0 fixas, UNVALIDATED/H=0, referências sem certificado histórico e somente operações simuladas sob controles. P1 pode ser proposta durante90 dias de desenvolvimento nos parâmetros autorizados; intervalos concretos continuam PENDING. Congelar P0/P1 antes da reserva; comparar cada P1 à sua P0 com mesmos cenários/condições/preços/eventos/custos, carteiras/resultados separados de10.000 UC nas3x30 dias. LEARN-004/DEC-016 integrais; P0 sem negociar tem retorno/drawdown0, preservando limite relativo sem exceções e sem ativação automática de H.

DEC-057: exclusivamente por insuficiência de amostra na primeira validação e com contingência registrada ANTES dos resultados finais, admitir no máximo UMA avaliação adicional da mesma versão. Três NOVAS janelas completas de30 dias, cada uma com seis cenários de5 dias nas ordens DEC-038, novas sementes/trajetórias e carteiras independentes10.000 UC. Congelar candidata/referência/H/parâmetros/custos/regras. Não somar rodadas: a nova exige sozinha>=60 operações concluídas distintas,>=10 por janela e gate integral. Proibido retry por violação de risco, reprovação determinante de desempenho ou contaminação. Segunda insuficiência encerra versão; novo ciclo requer versão legítima e reserva inédita. Auditar todas as tentativas; renomear configuração idêntica não zera contador. +90 dias condicional, sem mudar baseline240 dias ou monitoramento2x30.

### Indicadores e recuperação causal
DEC-053: t=0 é o primeiro candle fechado; primeiros índices válidos EMA9=8, EMA20=19, EMA21=20, EMA50=49, Bollinger20=19, RSI14/ATR14/+DI/-DI14=14, ADX14=27. EMA usa semente SMA(N) e fator2/(N+1); RSI/ATR/ADX-DI Wilder; primeiro ATR=médiaTR[1..14], primeiro ADX=médiaDX[14..27]. Empate direcional: ambos DM0. RSI: ganhos positivos/perdas0=100; ganhos0/perdas positivas=0; ambos0=50. Soma direcional0: DI/DX0 sem divisão inválida; ATR0 bloqueia dependentes. Bollinger usa desvio populacional.
Dados ausentes, denominadores inválidos e OHLC inconsistente bloqueiam avaliações dependentes. Sem candles sintéticos, futuro ou continuidade artificial por lacunas. Recuperar estado íntegro persistido ou reconstruir com histórico contínuo válido e150h de aquecimento. As três fórmulas F acima usam clip(x,0,1) sem substituir gatilhos obrigatórios.

### Identidade contextual e fronteira de leitura
DEC-055: eventos imutáveis com event_id, event_group_id, revision, fonte, disponibilidadeUTC e sequência determinística; no máximo uma contribuição ativa por grupo/ativo/instante. Correção/retratação deve apontar informação anterior verificável. Confirmação substitui rumor prospectivamente; U preservado e rumor sem bônus. Republicação não duplica impacto ou reinicia validade. Conflito não resolvido do mesmo evento: grupo sem contribuição direcional, UNCERTAIN auditável; eventos independentes opostos contam separadamente. Conflito semântico não implica falha técnica; feed obrigatório tecnicamente inválido bloqueia entrada. Snapshots congelados usam apenas eventos disponíveis na fronteira; interpretações BTC/ETH independentes; C e prazos6h/24h/72h inalterados.

### Precisão e ciclo financeiro
DEC-054: decimal exato,8 casas para UC/quantidades/preços de execução, precisão interna superior sem arredondamento prematuro. Quantidade comprada/recebimentos para baixo; custos/taxas/comprometido para cima; máximos permitidos para baixo. Slippage da compra já incorporado ao preço não é descontado de novo. Half-up do score/H permanece separado. Strings decimais canônicas, rejeitando NaN/infinito/formatos ambíguos/inválidos. Reserva por si não altera patrimônio. Risco planejado compara custo de entrada ao recebimento líquido estimado no stop. Preservar ledger, reconciliação, idempotência, auditoria, exposição/perda diária e DEC-020/OPS-002. As pendências OPS-003 registradas na DOCS-008 foram detalhadas em DEC-059 a DEC-062; contratos técnicos ficam para ARCH-001, sem redimensionamento automático no MVP.

DEC-056 — ordem lógica de5 minutos:
1. Fechar e persistir candle anterior.
2. Calcular sinais e autorizações só com dados disponíveis.
3. Congelar autorizações e reservas antes da nova abertura.
4. Processar abertura com preço conhecido.
5. Priorizar gaps e proteções da posição existente.
6. Processar EXIT_REQUEST pendente se posição ainda aberta.
7. Revalidar/executar entradas previamente autorizadas elegíveis.
8. Avaliar proteção intrabar só com OHLC completo disponível.
9. Persistir efeitos, auditoria e estado idempotentes.

Stop primeiro se ambos atingidos sem sequência; gap desfavorável na abertura com slippage, favorável acima do take sem ganho além do alvo. Saída estratégica na próxima abertura elegível; ENTRY perdido expira/libera reserva uma vez, EXIT reavalia. Sem redimensionamento automático e sem reentrada do ativo na mesma fronteira da saída. Dados inválidos não inventam preço/fill; proteções persistem, sem presumir preço garantido sem dados. Em00UTC, patrimônio inicial diário incorpora efeitos conhecidos do fechamento anterior. Recuperação sem dupla reserva/taxa/execução/liquidação; sem antecipar High/Low/Close em formação. 3D não controla finanças.

### Diagnóstico futuro de H=0
DEC-058: (1) análise algébrica H=0; (2) diagnóstico determinístico futuro em desenvolvimento quando houver simulador; (3) LEARN-GATE posterior em reserva, política congelada. Pesos35/25/15/15/10 e S>=70, half-up desde bruto69,50. Com C50: R100/A50 exige T aproximadamente91,43; R90/A50,98,58 conservador; R80/A50 impossível; R80/A100 aproximadamente91,43; R60/A100 impossível mesmo T100. A100 exige concordância qualificada; álgebra não prova frequência de entradas.
Futuro diagnóstico por ativo/família/regime/cenário/janela registra candles válidos, regimes elegíveis, gatilhos válidos, sinaisS>=70, autorizações, entradas, operações distintas concluídas, rejeições/motivos, reprodutibilidade e ausência de look-ahead. REQ-100 APPROVED_SPEC; comprovação operacional/empírica NOT_EXECUTED/PENDING_VERIFICATION. Sem estatísticas, operações, certificação ou rentabilidade inventadas.

## OPS-003.1 a OPS-003.4 — fluxos funcionais aprovados na DOCS-009
APPROVED_SPEC; IMPLEMENTATION: NOT_STARTED; TESTS / SIMULATION: NOT_EXECUTED. [DEC-059 a DEC-062](DECISIONS.md#dec-059) detalham apenas os fluxos abaixo. Não escolhem tecnologia nem contratos técnicos completos.

### Entidades, estados e efeitos — DEC-059
Separar sinal, ordem de entrada, reserva financeira e posição. Saída estratégica e proteções pertencem à posição, não à fila de novas compras. Identidades estáveis ligam as entidades e suportam transições terminais e idempotentes.

| Entidade | Estados aprovados |
|---|---|
| Ordem de entrada | PENDING_BUDGET, REJECTED, RESERVED, FILLED, CANCELLED, EXPIRED |
| Reserva financeira | ACTIVE, SETTLED, RELEASED |
| Posição | OPEN, CLOSED |
| EXIT_REQUEST | PENDING_OPEN, FILLED, SUPERSEDED_BY_PROTECTION, REVALIDATION_REQUIRED |

A contabilização das transições deve ser atômica e auditável, com efeitos únicos. Somente preenchimento integral; não há execução parcial ou redimensionamento automático. Stop/take têm prioridade sobre saída estratégica. ENTRY que perde a abertura expira; EXIT que a perde exige reavaliação. Manter a ordem causal de nove etapas DEC-056/REQ-098 e impedir dupla execução/liberação/liquidação. A matriz técnica completa de contratos/transações pertence à ARCH-001.

### Autorização, quantidade e reserva — DEC-060
Alvo inicial fixo de exposição:10% do patrimônio por oportunidade; quantidade inicial determinística, arredondada para baixo em8 casas. Considerar patrimônio, caixa, posições/reservas existentes, exposição e risco. Preservar tetos de exposição individual20%/consolidada40%, risco por operação1%/aberto2% e perda diária3%; alvo não é nova tolerância nem sizing dependente do score.

Usar último fechamento válido como referência de reserva, com margem de preço1%, slippage de compra0,05% e taxa de compra0,10%, conforme precisão/arredondamentos DEC-054, sem descontar slippage duas vezes. A margem não é previsão de preço nem permite ultrapassar limites. Quantidade e reserva congeladas após autorização. Autorização atômica segue a ordem determinística do Coordenador, no orçamento compartilhado BTC/ETH.

Na abertura, revalidar preço, caixa, exposição, risco, bloqueios e custos. Se a quantidade autorizada não couber na reserva ou limites, cancelar integralmente; não aumentar ou redimensionar automaticamente. Liberar excedentes e cancelamentos exatamente uma vez. Reserva por si não altera patrimônio, e execução exige autorização anterior à abertura; não usar dados futuros para dimensionar.

### Histórico oficial, checkpoint e recuperação — DEC-061
Ledger financeiro imutável append-only; eventos idempotentes e transações atômicas. Ao finalizar cada candle de5 minutos, checkpoint consistente. Checkpoint é derivado: histórico confirmado é a fonte oficial. Reconstruir deterministicamente ordens, reservas, posições, proteções, caixa e estado temporal; reconciliar por decimal exato sem tolerância arbitrária.

Estados de execução/recuperação: RUNNING, RECOVERING, ENTRY_SUSPENDED e MANUAL_REVIEW_REQUIRED, distintos dos estados da política H, ordens e reservas. Inconsistência financeira bloqueia novas entradas; preservar posições e proteções verificáveis. Lacuna não permite inventar execução/preço; ausência ou inconsistência de proteção exige recuperação/revisão, sem inventar liquidação. Correções somente por eventos compensatórios auditados, sem editar lançamentos anteriores.

Carteiras shadow isoladas da oficial. Reprocessamentos/reinícios não duplicam reserva, taxa, execução ou liquidação. ARCH-001 definirá contratos técnicos, tecnologia de banco e mecanismos executáveis de atomicidade/persistência; nenhuma seleção nesta etapa. Avaliações hipotéticas residuais em REQ-044 não se confundem com a contabilidade oficial já especificada.

### Proteções fixas e origem — DEC-062
Stop inicial2% e take4% calculados a partir do preço efetivo de entrada e fixos durante toda a posição. Sem trailing stop, breakeven ou ajustes automáticos no MVP. Saídas estratégicas aprovadas continuam válidas; prioridade/gaps/ambiguidades conforme DEC-023 e REQ-098, sem look-ahead.

Promoção, rollback, notícia e mudança de regime não alteram proteções existentes; níveis e estratégia/versão de origem persistidos e auditáveis. Ausência/inconsistência exige recuperação/revisão, sem liquidação fictícia. DEC-024 permanece intacta como histórico: possibilidade de apertar proteção é extensão não habilitada no MVP.

Etapa funcional OPS-003 encerrada. Próxima ARCH-001 — arquitetura mínima executável; depois MVP-001 — implementação incremental. Pendências LEARN e evidências experimentais serão tratadas quando necessárias; sem novos ciclos de especificação sem bloqueio concreto. DEC-016/LEARN-GATE, SIGNAL-001 a SIGNAL-005, OPS-002, REQ-093 a REQ-100 e V1/V2/V3 preservados. Não há execução financeira ou simulação nesta tarefa.

## Fundação executável — MVP-001-A / DEC-063
Stack mínima aprovada: TypeScript, Node.js24 LTS, NestJS modular sem HTTP e Jest. SQLite local e biblioteca decimal financeira previstos para etapas posteriores; React/Vite/Three.js também posteriores. Arquivos package.json/package-lock.json fixam versões compatíveis; dependências só locais e gratuitas.

AppModule importa SimulationModule configurável, ambos definidos em src/app.module.ts dentro da allowlist. Factories fornecem SimulationClock e SeededGenerator, sem I/O financeiro. src/main.ts inicializa contexto standalone, produz amostra fechada e executa app.close() em finally, inclusive se a geração falhar. Sem listener, scheduler de tempo real, rede de mercado ou persistência.

Fluxo implementado: configuração explícita de inícioUTC/seed/preços sintéticos -> clock.step() fecha intervalo5min -> gerador publica par BTC/ETH imutável -> consumidor recebe somente OHLCV fechado. Início designa a abertura do primeiro candle. Snapshot contém startTime/currentTime/steps; reprodução reinicia com a mesma configuração e o mesmo número de passos. Não existe API de preview ou rótulo de regime, nem restauração durável. Avançar o relógio por fora do gerador causa rejeição para evitar divergência de sequência.

Relógio valida timestamp UTC em fronteira de5min, segundos/milissegundos zero, calendário real e limite de quatro dígitos de ano. Falha de limite não avança estado. Não consulta Date.now() ou relógio do Windows para decidir passos.

Gerador sintético v1: FNV-1a deriva estados xorshift32 separados por ativo. Configuração inicial é copiada para estados próprios; alteração do preço inicial ETH não altera BTC e vice-versa. Movimento inicial de fixture e pavios usam inteiros; valores de preço em bigint com escala100.000.000, serializados exatamente com8 casas. Volume sintético não negativo. Não há cálculos financeiros, biblioteca decimal contábil ou valores monetários em float. Objetos e batches de saída congelados.

Limitação explícita: não implementa os seis cenários oficiais, eventos contextuais, warmup150h, agregação1h, indicadores, scores, orçamento, ordens, proteções executáveis, SQLite/ledger, aprendizado ou escritório3D. As regras funcionais anteriores continuam especificações, não capacidades entregues por este incremento; não houve simulação financeira ou prova de viabilidade REQ-100.

Comandos locais: npm install (dependências locais); npm run test:coverage; npm run build; npm run smoke (após build). Smoke usa seed bot-crypto-mvp-001-a-v1 e início2026-01-01T00:00:00.000Z; publica3 candles fechados por ativo até00:15UTC e encerra. Execução standalone segue [documentação oficial NestJS](https://docs.nestjs.com/application-context). Resultados reais e limitações no checkpoint; próximo incremento MVP-001-B.
