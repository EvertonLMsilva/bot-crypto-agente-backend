# 💹 BOT CRUPTO — Roadmap completo do MVP

> **Atualizado em:** 01/11/2026
> **Projeto:** BOT CRUPTO — Backend, agentes, aprendizado, frontend 3D e validação integrada
> **Referência da análise:** documentação do repositório `EvertonLMsilva/bot-crypto-agente-backend`, branch `master`, D5 publicado no commit `bd1159c7988f3d5332069b736578adcc49fc0f0d`; 11/11 incrementos publicados, integração operacional ponta a ponta pendente.

Este documento cobre o **MVP completo do BOT CRUPTO**, incluindo backend, cinco agentes de IA, aprendizado autônomo controlado, escritório virtual 3D, simulação financeira e validação.

A documentação do projeto prevê **6 fases oficiais, de 0 a 5**, e **100 requisitos documentados**. Apenas a sequência de incrementos `MVP-001` recebeu numeração própria de implementação até este checkpoint; ainda não há códigos oficiais de implementação para `MVP-002`, `MVP-003` etc.

Os subcódigos `0.1`, `2.1`, `3.1`, `4.1` e `5.1` a seguir são uma **organização analítica para acompanhamento** e não representam tarefas formalmente aprovadas com esses IDs no repositório.

## Visão geral das fases

| Fase | Área | Situação |
|---|---|---|
| 0 | Planejamento e arquitetura | Base documental aprovada; pendências residuais |
| 1 | Fundação e núcleo operacional | 11/11 incrementos publicados; RUNTIME-001 publicado e RUNTIME-002 local implementado; E2E integral e MVP completo pendentes |
| 2 | Escritório virtual 3D | Não iniciado |
| 3 | Inteligência e cinco agentes especializados | Parcial — funções técnicas implementadas |
| 4 | Orçamento, operações e aprendizado | Parcial — orçamento, execução, D5 e runtime explícito implementados; E2E integral e aprendizado pendentes |
| 5 | Integração e validação final | Não iniciado |

**Nota:** as fases representam áreas funcionais e não uma sequência rigidamente isolada: componentes das fases 3 e 4 já estão sendo desenvolvidos dentro do `MVP-001`.

---

## Fase 0 — Planejamento e arquitetura

| Código | Tópico | Estado |
|---|---|---|
| 0.1 | Definir visão, objetivos e limites do MVP | Aprovado |
| 0.2 | Definir requisitos, critérios de aceite e decisões técnicas | Aprovado, com pendências |
| 0.3 | Arquitetura mínima do backend, frontend e agentes | Base aprovada |
| 0.4 | Contratos de integração e calibração restantes | Pendente |
| 0.5 | Segurança, credenciais e permissões | Pendente |
| 0.6 | Métricas, observabilidade e hardware-alvo | Pendente |
| 0.7 | Detalhes residuais de aprendizado e avaliações hipotéticas | Pendente |

## Fase 1 — Backend e núcleo operacional (`MVP-001`)

| Código | Tópico | Estado |
|---|---|---|
| A | Fundação NestJS e relógio da simulação | **Concluído e publicado** |
| B | Indicadores matemáticos | **Concluído e publicado** |
| C1 | Regimes de mercado e volatilidade | **Concluído e publicado** |
| C2 | Estratégias técnicas BTC/ETH | **Concluído e publicado** |
| C3 | Contexto, score global e seleção | **Concluído e publicado** |
| D1 | Decisões e auditoria imutável | **Concluído e publicado** |
| D2 | Coordenador determinístico | **Concluído e publicado** |
| D3.1 | Cálculos financeiros e avaliação de risco | **PUBLICADO — 74d66c80693f60f5ed656d3fa432f6b96b0dfe15** |
| D3.2 | Autorizações e reservas | **PUBLICADO — 40b2c893d7955c9ca58ab53c438379c6815797d2** |
| D4 | Execução simulada e proteções | **PUBLICADO — 472bc0a5bccd019e88df21386859cf7ab2375b65** |
| D5 | Persistência, ledger e recuperação | **PUBLICADO — bd1159c7988f3d5332069b736578adcc49fc0f0d** |

**Progresso da sequência MVP-001 numerada:** **11 de 11 incrementos publicados (100%)**. Isso mede somente os incrementos listados, **não** o percentual de funcionalidades do MVP completo.

Distribuição dos **11 incrementos**: **11 publicados** (A até D5), **0 implementados e não publicados** e **0 ainda não implementados nesta sequência**. D5 publicado no SHA `bd1159c7988f3d5332069b736578adcc49fc0f0d`. Isso não encerra as fases posteriores do MVP completo.

### MVP-001-D3.1 — histórico da aprovação técnica e publicação

O tópico anteriormente marcado como **Próximo / não iniciado** foi implementado e aprovado tecnicamente, inicialmente aguardando commit/push. Foi publicado no SHA `74d66c80693f60f5ed656d3fa432f6b96b0dfe15`, informado na tarefa D3.2. A entrega D3.1 é uma cotação consultiva de oportunidades priorizadas pelo D2, sem autorização financeira, reserva efetiva ou execução.

| Capacidade implementada no D3.1 | Regra e limite |
|---|---|
| Aritmética financeira | `bigint` exato; valores canônicos com 8 casas decimais; precisão interna superior |
| Dimensionamento inicial | Alvo fixo de 10% do patrimônio explícito; quantidade arredondada para baixo, sem redimensionamento silencioso |
| Comprometimento e taxas | Arredondamento conservador para cima; recebimento líquido para baixo; taxa de venda quantizada antes da subtração |
| Referência de compra | Último fechamento validado, margem de referência de 1%, slippage de compra de 0,05% e taxa por execução de 0,10%; sem dupla cobrança |
| Risco planejado | Stop estimado de 2% da entrada estimada, com custos previstos de entrada e saída; slippage de venda de 0,05%; não instala ordem de proteção |
| Exposição máxima | Individual de 20% e consolidada de 40% do patrimônio |
| Risco máximo | Por operação de 1% e aberto/comprometido de 2% do patrimônio |
| Perda diária | Atingir 3% do patrimônio inicial do dia UTC bloqueia nova cotação elegível; patrimônio informado inclui efeitos não realizados |
| Estados e disponibilidade | Bloqueios explícitos para `RECOVERING`, `ENTRY_SUSPENDED`, `MANUAL_REVIEW_REQUIRED`, posição `OPEN`/`UNKNOWN` e reserva `ACTIVE`/`UNKNOWN`; sem saldos ou posições inferidos |
| Causalidade | Sem look-ahead; rank original, ativo, ciclo e fechamento validados; sinais antigos não ganham nova validade |
| Isolamento financeiro | `financialAuthorization=NOT_EVALUATED`, `reservation=NOT_CREATED`, `execution=NOT_EXECUTED`; sem alteração de saldos, ordens, fills, banco ou ledger |

A margem de 1% não garante preço contra gaps. Duas cotações independentes não são duas autorizações simultâneas. O processamento sequencial e as reservas locais foram acrescentados por D3.2; atomicidade persistente permanece futura. Não há operação financeira ou rentabilidade simulada comprovada; `REQ-100` empírico permanece pendente.

#### Evidências técnicas anteriores à atualização documental

| Registro | Evidência |
|---|---|
| TASK | `BOT-CRYPTO-MVP-001-D3.1` |
| FIX | `BOT-CRYPTO-MVP-001-D3.1-FIX-001` |
| REVIEW | `APPROVED_CODE_DOCUMENTATION_PENDING` |
| TESTS | `342 PASS` |
| COVERAGE_CHANGED | `100%` das linhas alteradas pelo FIX |
| BUILD | `PASS` |
| DIFF_CHECK | `PASS` |

Correção crítica validada na fixture de regressão: patrimônio, base diária e caixa de `10.00000260`, fechamento de `1.00000026` e quantidade de `1.00000000`.

| Estimativa da fixture | Valor exato |
|---|---|
| Comprometimento de compra | `1.01151578` |
| Taxa de venda arredondada para cima | `0.00098981` |
| Recebimento líquido estimado | `0.98881019` |
| Risco planejado estimado | `0.02270559` |

Esses valores são referências de teste, **não uma operação executada**. Testes e build não foram repetidos na tarefa documental histórica. As evidências não alteram o status dos requisitos aprovados nem certificam o MVP integrado. A publicação posterior de D3.1 está registrada acima, preservando as evidências da revisão anterior.

### MVP-001-D3.2 — histórico da implementação, revisão e publicação

D3.2 foi publicado no SHA `40b2c893d7955c9ca58ab53c438379c6815797d2`, informado na tarefa D4. Os registros abaixo preservam o escopo e as evidências anteriores à publicação.

Autorização e rejeição sequenciais na ordem D2, consumindo cotações D3.1 sem refazer fórmulas, scores ou dimensionamento. BTC/ETH compartilham caixa, exposição e risco, incluindo reservas anteriores do lote. Estado explícito imutável conserva referência financeira, oportunidades processadas, decisões, reservas e auditoria before/after reconciliada exatamente com bigint e strings de8 casas.

Reservas ACTIVE congelam quantidade, capital, risco, origem/versão e próxima abertura elegível. Cancelamento/expiração libera uma vez para RELEASED; replay não duplica reserva nem reativa identidade terminal. Etapas lógicas BEFORE_OPEN/AFTER_OPEN preservam causalidade na mesma fronteira UTC, sem consultar abertura futura. SETTLED consta apenas no contrato; efetivação por fill pertence ao D4.

Idempotência e transições são **somente em memória, no estado explícito recebido**. Não há garantia transacional entre processos, recuperação durável, banco/ledger, ordem, fill, taxa efetiva ou stop/take. Patrimônio e posições não mudam por reserva. Snapshot divergente falha; atualização patrimonial/base diária e integração financeira continuam pendentes. Rejeição financeira não invalida a estratégia técnica. Nenhum requisito passou a concluído apenas por testes unitários.

Histórico da implementação `BOT-CRYPTO-MVP-001-D3.2`: RED/GREEN,48 novos testes focados PASS;390 testes/31 suítes PASS, incluindo342 anteriores;100% das linhas novas,99,30% globais e build PASS. A revisão independente identificou uma falha de integridade: replay aceitava cotações armazenadas com campos financeiros inválidos ou contraditórios. A correção FIX-001 foi posteriormente conferida e aprovada em revisão independente, com as evidências finais abaixo.

#### Evidências finais — D3.2 / FIX-001

| Registro | Evidência |
|---|---|
| TASK | `BOT-CRYPTO-MVP-001-D3.2` |
| FIX | `BOT-CRYPTO-MVP-001-D3.2-FIX-001` |
| REVIEW | `APPROVED_CODE_DOCUMENTATION_PENDING` — resultado técnico anterior a esta atualização documental |
| TESTS | `423 PASS / 31 suítes` |
| REGRESSION | `390` testes anteriores preservados; `33` testes novos |
| FOCUSED_TESTS | `81 PASS` |
| COVERAGE | `100%` das linhas alteradas; `99,31%` global |
| BUILD | `PASS` |
| DIFF_CHECK | `PASS` |
| FILES | `6` novos e `4` modificados, incluindo este roadmap |

O FIX verifica os nove campos financeiros de `quote.estimates`: quantidade, exposição de referência, preço conservador de compra, comprometimento bruto, taxa de compra, comprometimento total, preço do stop, recebimento líquido no stop e risco planejado. Formato canônico de8 casas é obrigatório; valores inválidos são rejeitados com `RangeError`, sem correção silenciosa. As relações **bruto + taxa = comprometimento** e **comprometimento − líquido = risco** são conferidas exatamente com `bigint`.

A cotação armazenada é conferida pelo avaliador D3.1 existente contra as evidências de origem e o snapshot original `before`, preservando o ranking D2. Replay rejeita estado corrompido; liberação falha antes de creditar caixa; expiração recebe a mesma proteção. Quantidade, capital e risco congelados continuam vinculados à reserva; uma reserva RELEASED não pode ser reativada por replay. Autorizações sequenciais, orçamento BTC/ETH compartilhado, atualização conservadora dos compromissos, limites de capital/risco, auditoria determinística e ausência de look-ahead permanecem preservados.

Essas evidências correspondem a testes, **não a operações executadas**. O componente D3.2 continua apenas em memória, sem persistência transacional, recuperação após reinício ou garantia de idempotência entre processos. Seu escopo não executa ordens/fills nem cobra taxas efetivas. Na revisão técnica anterior, ficou **IMPLEMENTADO — APROVADO TECNICAMENTE — AGUARDANDO COMMIT/PUSH**; a publicação posterior está registrada acima. D4 acrescenta execução simulada e proteções em estado próprio; D5 continua responsável por persistência, ledger e recuperação. Sem autorização para operações reais. Testes e build não foram repetidos na tarefa documental histórica.

### MVP-001-D4 — histórico da execução spot simulada e publicação

Publicado no SHA `472bc0a5bccd019e88df21386859cf7ab2375b65`, informado na tarefa D5. A situação anterior era **IMPLEMENTADO — AGUARDANDO REVISÃO E COMMIT**; as evidências abaixo preservam esse histórico. Estado D4 próprio preserva as autorizações D3.2 como evidências históricas imutáveis. Funções puras processOpening/processClosedCandle/validateExecutionState e ponte orçamentária usam eventos explícitos, IDs estáveis, snapshots independentes e auditoria JSON. As identidades sobrevivem à projeção de novos ciclos; replay não gera outra reserva, fill, taxa, crédito ou liquidação.

Implementado: entradas integrais na abertura elegível, revalidação compartilhada BTC/ETH, consumo de reserva ACTIVE→SETTLED com liberação exata de R−C, cancelamento/expiração ACTIVE→RELEASED, ordens e posições OPEN/CLOSED. Quantidade congelada; sem redimensionamento ou complemento de capital. Limites20%/40%, risco1%/2%, perda diária3% e alvo10% preservados. Margem de reserva1% não é custo de execução. Slippage0,05% e taxa0,10% por lado são contabilizados uma vez, com bigint, custos para cima e recebimentos para baixo.

Stop2% e take4% fixos sobre a entrada executada conservam gatilhos racionais. Gaps são conservadores; ambos atingidos sem sequência conhecida: stop primeiro. Proteções precedem saída estratégica, e saídas precedem entradas. Pedido estratégico explícito perdido exige revalidação; D1 EXIT_EVALUATION_PENDING não vira ordem automaticamente. Reentrada do ativo na fronteira da saída é bloqueada. Abertura usa somente ativo/instante/preço conhecido; OHLC completo somente no fechamento, sem next() do gerador para antecipar abertura ou execução retroativa.

Portfólio registra caixa disponível/reservado, marcas conhecidas, exposição/risco, PnL realizado/não realizado assinado, taxas e base diária UTC. Patrimônio=caixa disponível+reservado+posições marcadas, sem dupla cobrança de custos. Virada diária usa o fechamento conhecido antes da nova abertura. Estados corrompidos ou eventos fora de ordem são rejeitados por reconciliação determinística dos comandos locais.

| Registro D4 | Evidência |
|---|---|
| TASK | `BOT-CRYPTO-MVP-001-D4` |
| TDD | Quatro suítes RED/GREEN; regressão adicional para reentrada após saída intrabar |
| TESTS | `476 PASS / 35 suítes`; `423` anteriores preservados e `53` novos |
| FOCUSED_TESTS | `53 PASS` |
| COVERAGE | `100%` das linhas novas; `99,41%` global |
| BUILD | `PASS` |
| FILES | `10` novos e `4` modificados, somente allowlist D4 |

Exemplos independentes dos testes: Q10/abertura100 resulta em entrada100,05000000, custo1001,50050000 e patrimônio marcado9998,49950000; saída estratégica a100 produz líquido998,50050000 e PnL−3,00000000. São fixtures de simulação, **não operações reais ou prova de rentabilidade**.

Limitações do componente D4: funções locais em memória, sem corretora/rede financeira ou persistência própria. Inicialização exige snapshot plano/coerente; não inventa posições de carteira preexistente. ExitRequest é fornecido explicitamente; geração automática dos gatilhos estratégicos e runtime integrado seguem pendentes. Histórico em memória cresce e é percorrido na validação. No checkpoint D4, D5 era próximo/não iniciado; a fronteira durável implementada posteriormente está descrita abaixo. REQ-100 empírico permanece pendente. Nenhum requisito foi declarado integralmente entregue apenas por testes unitários.

### MVP-001-D5 — persistência transacional, ledger e recuperação

**PUBLICADO — bd1159c7988f3d5332069b736578adcc49fc0f0d**. Situação anterior preservada como histórico: IMPLEMENTADO — AGUARDANDO REVISÃO/COMMIT. DEC-064 registra as escolhas técnicas expressamente adotadas pela tarefa. SQLite local via node:sqlite, sem ORM/dependências novas; Node24.18.0 e SQLite3.53.1 verificados. FK/WAL/FULL, timeout explícito limitado, extensões desabilitadas, SQL parametrizado e BEGIN IMMEDIATE. Schema1 versionado, migração inicial atômica, tabelas STRICT, PK/FK/UNIQUE e histórico protegido contra UPDATE/DELETE pelas APIs operacionais.

DurableExecution expõe createSimulation, commitOperation, loadState, recover, close e suspendEntries. Genesis exige capital/configuração/versões/identidades explícitos; banco ausente nunca inventa saldo. Uma operação D4 inteira confirma eventos, lançamentos, recibo, revisão/cursor e checkpoint aplicável na mesma transação. Idempotência durável usa simulação/operationId e payload canônico; consulta recibo antes de negar revisão antiga. Mesmo ID divergente, revisão obsoleta de operação nova e reutilização de comando falham sem duplicar capital.

Ledger append-only separa eventos de negócio e lançamentos balanceados. Sequência e IDs são derivados por simulação/operação/ordinal, com SHA256 encadeado e referências originais D1/D2/D3.2/D4. Valores TEXT canônico e bigint; nenhum REAL ou soma decimal SQLite. Caixas, reservas, posições marcadas e contrapartidas de capital/PnL reconciliam exatamente; taxas já contidas no custo não recebem segundo débito.

Reinício passa por RECOVERING e verifica histórico completo, recibos, lançamentos, hashes, sequência, head/cursor e checkpoints. Ledger incoerente gera MANUAL_REVIEW_REQUIRED; checkpoint divergente com ledger íntegro gera ENTRY_SUSPENDED. RUNNING exige prova completa; snapshot inválido não substitui histórico. Bloqueio local permanece se o bloqueio não puder ser gravado. Rodízio D2, UTC/fase e metadata seed/versão/passos confirmados são preservados; sem preços fabricados, avanço antecipado do gerador ou expiração por tempo real de desligamento.

Extensão D4 pontual: CANCEL/cancelActiveReservation libera ACTIVE uma vez, com motivo, ID e fronteira explícitos, sem cancelar posição executada ou alterar fill/stop/take/PnL. Com entradas suspensas, reservas de entrada pendentes devem ser canceladas antes de processar abertura; proteções/saídas sobre estado financeiro reconciliado permanecem permitidas. BTC/ETH continuam compartilhando orçamento na ordem D2, com revisão otimista e serialização real pelo SQLite.

| Registro D5 | Evidência |
|---|---|
| TASK | `BOT-CRYPTO-MVP-001-D5` |
| SCHEMA | `1`; migração inicial/checksum verificados; versão futura rejeitada |
| TDD | Cinco suítes RED/GREEN e RED/GREEN do cancelamento D4 |
| TESTS | `517 PASS / 40 suítes`; `476` anteriores preservados e `41` novos |
| FOCUSED_TESTS | `55 PASS / 6 suítes` |
| CRASH | Dois processos reais encerrados antes/depois do COMMIT; recuperação e replay sem novo efeito |
| CONCURRENCY | Dois testes com processos reais: mesmo ID/recibo e operações diferentes disputando a revisão |
| COVERAGE | Linhas persistence `99,15%`; extensão D4 coberta `100%`; global `99,37%`; gate diferencial95% atendido |
| BUILD | `PASS` |
| FILES | `13` novos e `9` modificados; total `22` autorizados |

Testes também cobrem rollback em quatro pontos, resposta perdida, reabertura real, liquidação/saída/cancelamento únicos, checkpoints/corrupção/lacunas/duplicatas, dinheiro acima de2^53, PnL negativo, virada UTC, abertura sem fechamento e proteção preservada em suspensão. Todos os bancos de teste são temporários fora do repositório. Não são testes de perda física de energia nem prova de rentabilidade.

Limitações: durabilidade depende de disco/VFS/flush/locks locais; sem garantia absoluta contra hardware defeituoso ou edição administrativa. API síncrona e replay completo crescem com o histórico, sem SLA/compactação. Sem backup, migração para schema futuro, compensação financeira arbitrária ou restauração direta do PRNG privado. Runtime autônomo, gatilhos automáticos de saída, aprendizado, frontend3D e validação empírica continuam pendentes. Sem corretoras, dinheiro real ou dados financeiros externos. Nenhuma fase posterior é iniciada automaticamente e o MVP completo não está finalizado.

### Checkpoint de encerramento documental da sequência MVP-001 — histórico anterior ao RUNTIME-001

Contratos A–D5 implementados e publicados; integração operacional ponta a ponta: **PENDENTE**. src/main.ts executa apenas smoke do gerador. Integrações D2–D5 existentes são parciais; testes E2E completos ainda ausentes. Permanecem pendentes de integração: inicialização unificada, aquecimento de histórico, contexto e políticas operacionais, ordenação causal de abertura/fechamento, saídas estratégicas automáticas e retomada coordenada após reinício.

As evidências da entrega D5 — 517 PASS / 40 suítes, crash e concorrência com processos reais, cobertura de persistência 99,15%, global 99,37% e build PASS — validam o escopo implementado; não representam aprovação E2E de todo o backend. Testes/build não foram repetidos nesta atualização documental.

Publicação dos 11 incrementos não conclui o MVP completo nem converte requisitos aprovados em comportamentos operacionalmente validados. Seis cenários oficiais ainda não entregues, aprendizado controlado, escritório 3D e REQ-100 empírico permanecem pendentes. Limitações de replay síncrono e durabilidade condicionada ao armazenamento permanecem vigentes.

Próxima frente recomendada: **INTEGRAÇÃO OPERACIONAL DETERMINÍSTICA DO BACKEND**, sem constituir incremento aprovado. Gate posterior deverá definir runtime unificado, inicialização/aquecimento, processamento causal, contexto/políticas, saídas estratégicas, retomada coordenada e E2E multicíclo com reinício. Nenhum novo código oficial de incremento é criado por este checkpoint.

### Integração operacional transversal — RUNTIME-001 publicado

**RUNTIME-001: PUBLICADO — 98ed9c385c3d9228739aa805f9a4e263c06ddb38**, conforme tarefa RUNTIME-002. Situação anterior preservada: IMPLEMENTADO / NÃO PUBLICADO, conforme DEC-065. Entrega abertura conhecida sem avanço do gerador, manifesto/evidência JSON versão1, reconstrução do gerador pelos fechamentos confirmados e contagem de aquecimento por ativo. Reutiliza exclusivamente o ledger D5; registros antigos continuam recuperáveis sem evidência inventada. Snapshots recuperados têm mode PAUSED; isso não implementa os controles operacionais futuros.

RED: duas suítes falharam pelas APIs/tipos ainda ausentes. GREEN: 555 PASS / 41 suítes, preservando os 517 testes anteriores e acrescentando 38; inclui recuperação em novo processo real. Cobertura diferencial: 92/92 linhas executáveis alteradas (100%); runtime-evidence.ts com 100% de linhas, branches e funções; global de linhas 99,40%. npm run build PASS. A suíte completa foi executada com npm run test:coverage; não representa E2E integral.

Escopo histórico do componente RUNTIME-001: não implementa runtime operacional, loop, comandos iniciar/pausar/avançar, geração automática de saídas estratégicas ou E2E integral. PAUSED é a representação de retomada para a futura API, separada da saúde financeira D5; não altera RUNNING/RECOVERING/ENTRY_SUSPENDED/MANUAL_REVIEW_REQUIRED. Progresso de aquecimento não autoriza sinais: os validadores e dependências dos indicadores continuam obrigatórios na integração futura. Reprodução percorre comandos e pode crescer com o histórico; não há SLA, compactação ou certificação física do armazenamento. Gerador básico ainda não entrega os seis cenários oficiais. Nenhuma operação real, aprendizado ou interface 3D.

No checkpoint RUNTIME-001, RUNTIME-002 (runtime unificado e saídas estratégicas por origem) e RUNTIME-003 (E2E multicíclo com reinício) estavam **PLANEJADOS / NÃO IMPLEMENTADOS**. RUNTIME-002 foi implementado posteriormente conforme registro abaixo; RUNTIME-003 permanece pendente. Acompanhar esta frente nos tópicos existentes 0.4, 3.1, 3.2, 3.9 e 5.7, sem criar linhas/incrementos adicionais. MVP-001 continua com 11/11 publicados; D5 no SHA bd1159c7988f3d5332069b736578adcc49fc0f0d. Publicação desta entrega transversal e início das seguintes exigem tarefas próprias.

### Integração operacional transversal — RUNTIME-002

**IMPLEMENTADO / NÃO PUBLICADO.** API SimulationRuntime com create(config,coordinatorState), start, pause, advanceCycle(expectedRevision), snapshot, resume e close, sem temporizadores ou loop automático. Integra decisões/indicadores/contexto/estratégias, D2, orçamento D3, execução D4 e persistência/evidência D5/RUNTIME-001. Reutiliza os contratos publicados; não cria D6 nem altera fórmulas financeiras.

Aquecimento é formado pelos fechamentos persistidos, separado BTC/ETH, com mínimo de 150 horários completos para entradas. Lotes vazios são confirmados; contexto inválido ou indicadores indisponíveis não produzem sinais artificiais. Abertura é consultada sem avançar o gerador; OPEN confirma antes da geração do próximo fechamento. Retomada continua da fase confirmada e permanece PAUSED até start explícito. Falhas bloqueiam processamento sem publicar estado especulativo; saúde financeira e modo operacional continuam separados.

Saídas estratégicas aprovadas DEC-050/REQ-092 implementadas por origem/versão: EMA21, nível original de rompimento e SMA20, com comparação exata e prioridade D4 de proteções. O nível de rompimento é recuperado do prefixo imutável da decisão original; evidência insuficiente bloqueia integração sem saída presumida.

RED: duas suítes falharam inicialmente pelo módulo runtime ausente. GREEN: 576 PASS / 43 suítes, preservando os 555 anteriores e acrescentando 21 testes. Testes focados passaram; npm run test:coverage confirmou 137/137 linhas executáveis novas (100%), cobertura global de linhas 99,45%; npm run build PASS. Bancos de teste temporários fora do repositório. Não equivale à aprovação E2E integral.

A entrada ETH75 foi obtida pela cadeia analítica real, sem score alterado, sobre histórico simulado; testes de ciclos frios usam D5 real e falhas entre fases. Esses testes parciais não equivalem a E2E completo de aquecimento persistido até negociação. RUNTIME-003 permanece PENDENTE: validação E2E integral multicíclo, aquecimento completo persistido seguido de negociação, reinício/concorrência em escala e cenários oficiais ainda precisam de entrega própria. O gerador básico não implementa os seis cenários oficiais. Replay e reconstrução integral podem crescer com o histórico; não há SLA ou garantia física adicional de armazenamento. Aprendizado, REQ-100 empírico e escritório 3D permanecem pendentes. Sem mercado real, dependências novas, timers ou loop automático; main.ts permanece smoke.

Acompanhar RUNTIME-002 nos tópicos existentes 3.4–3.9, 4.4–4.5 e 5.7; RUNTIME-003 continua **PENDENTE / NÃO IMPLEMENTADO**. Preservados seis fases, 67 tópicos, MVP-001 com 11/11 publicados e D5 no SHA bd1159c7988f3d5332069b736578adcc49fc0f0d. Aprendizado e frontend 3D não estão concluídos.

## Fase 2 — Escritório virtual 3D

| Código | Tópico | Estado |
|---|---|---|
| 2.1 | Criar projeto frontend web e renderização 3D | Não iniciado |
| 2.2 | Construir escritório de um andar, salas e mesas BTC/ETH | Não iniciado |
| 2.3 | Criar os cinco personagens e suas estações | Não iniciado |
| 2.4 | Implementar deslocamentos e animações por atividade | Não iniciado |
| 2.5 | Implementar câmera orbit, zoom, pan e interações | Não iniciado |
| 2.6 | Criar telão compartilhado, painéis dos agentes e carteira | Não iniciado |
| 2.7 | Implementar iniciar, pausar, avançar 5 minutos, velocidade e reinício confirmado | Não iniciado |
| 2.8 | Integrar eventos e estados reais do backend ao ambiente 3D | Não iniciado |

O escritório 3D deve **representar os acontecimentos do sistema**, sem controlar decisões financeiras. **Three.js** continua como opção proposta, não como escolha definitiva.

## Fase 3 — Inteligência e agentes

A arquitetura aprovada prevê **exatamente cinco agentes lógicos**: Analista Central de Inteligência, Especialista BTC, Especialista ETH, Coordenador e Gestor de Orçamento. Simulador, persistência e frontend são componentes de suporte, não agentes adicionais.

| Código | Tópico | Estado |
|---|---|---|
| 3.1 | Gerador de preços BTC/ETH e seis cenários reproduzíveis | Gerador básico implementado; cenários completos pendentes |
| 3.2 | Gerador e distribuição temporal de acontecimentos contextuais | Parcial |
| 3.3 | Analista Central de Inteligência — validação e distribuição de contexto | Funções de contexto prontas; agente pendente |
| 3.4 | Especialista BTC — execução autônoma do ciclo de análise | Composição BTC no runtime explícito implementada; autonomia e E2E integral pendentes |
| 3.5 | Especialista ETH — análise e memória independentes | Composição ETH no runtime explícito implementada; memória/aprendizado e E2E integral pendentes |
| 3.6 | Coordenador — receber decisões e encaminhar oportunidades | D2 composto no runtime explícito; validação E2E integral pendente |
| 3.7 | Gestor de Orçamento — receber pedidos e aplicar limites | D3/D5 reutilizados pelo runtime explícito; validação E2E integral pendente |
| 3.8 | Políticas e estratégias versionadas por agente | Parcial |
| 3.9 | Estados operacionais e comunicação entre agentes | Estados do runtime explícito implementados; comunicação autônoma pendente |
| 3.10 | Ativação controlada do componente histórico H após validação | Pendente |

## Fase 4 — Orçamento, operações e evolução autônoma

Esta fase contém capacidades que dependem parcialmente dos incrementos `D3–D5`, além de aprendizado posterior. **Há sobreposição de escopo intencional** entre esta tabela e a Fase 1; não contar como entregas duplicadas.

| Código | Tópico | Estado |
|---|---|---|
| 4.1 | Capital inicial fictício de 10.000 UC e orçamento compartilhado | Snapshot explícito e orçamento compartilhado local D3.2; sem criar saldo inicial |
| 4.2 | Dimensionamento de posição e limites de risco | Cotação D3.1 e autorização local D3.2 implementadas; sem execução |
| 4.3 | Reservas atômicas e bloqueio de capital duplicado | Fronteira D5 composta pelo runtime explícito; validação E2E integral pendente |
| 4.4 | Execução spot simulada na próxima abertura elegível | D4 composto no runtime explícito; validação E2E integral pendente |
| 4.5 | Stop loss, take profit, gaps, custos e slippage | Proteções D4 e saídas por origem compostas; validação E2E integral pendente |
| 4.6 | EXIT_REQUEST, HOLD, WAIT, RISK_ALERT e saídas por origem | PARCIAL: D4 consome ExitRequest explícito; RUNTIME-002 gera automaticamente os gatilhos aprovados — tendência: dois fechamentos abaixo da EMA21; rompimento: dois abaixo do nível original congelado; reversão: fechamento alcança ou supera SMA20. E2E operacional integral e demais comportamentos/aceites completos, incluindo HOLD, WAIT e RISK_ALERT, permanecem parcialmente comprovados ou pendentes |
| 4.7 | Contabilidade, patrimônio, histórico e recuperação | D4/D5 locais implementados; runtime completo e aceites finais pendentes |
| 4.8 | Memória persistente e resultados exclusivos de cada especialista | Pendente |
| 4.9 | Uma política ativa e até três candidatas por ciclo/agente | Pendente |
| 4.10 | Carteiras shadow e avaliação hipotética isolada | Pendente |
| 4.11 | Busca local controlada de parâmetros e geração de desafiante | Pendente |
| 4.12 | Desenvolvimento cronológico e histórico de aquecimento | Parcial; integração pendente |
| 4.13 | Validação em três carteiras independentes de 30 dias | Pendente |
| 4.14 | Métricas: retorno líquido, operações distintas, risco e drawdown | Pendente |
| 4.15 | LEARN-GATE e critérios para promoção automática simulada | Pendente |
| 4.16 | Ativação segura do H validado por política/ativo | Pendente |
| 4.17 | Monitoramento pós-promoção em duas janelas de 30 dias | Pendente |
| 4.18 | Suspensão crítica e rollback de estratégia | Pendente |
| 4.19 | Proteção de posições durante promoção, rollback ou recuperação | Pendente |

### Cronologia da validação e do aprendizado

A especificação aprovada prevê:

- **150 candles horários válidos** de aquecimento informativo inicial;
- **90 dias** de desenvolvimento;
- **3 janelas independentes de 30 dias** de validação;
- **2 janelas de 30 dias** de monitoramento pós-promoção;
- **240 dias no total**, mais o aquecimento;
- **6 cenários em cada janela de validação**, com **5 dias por cenário**;
- carteiras independentes iniciando com **10.000 UC** cada, sem herdar capital ou posições de outras janelas.

As exigências de amostra e integridade do LEARN-GATE não são substituídas por resultados de testes unitários nem por uma simples quantidade de candles.

## Fase 5 — Integração e validação final

| Código | Tópico | Estado |
|---|---|---|
| 5.1 | Integração de backend, agentes, orçamento e simulação | Pendente |
| 5.2 | Integração completa do frontend 3D | Pendente |
| 5.3 | Testes ponta a ponta com BTC e ETH | Pendente |
| 5.4 | Testes de causalidade e ausência de look-ahead | Parcialmente cobertos nos módulos |
| 5.5 | Testes de orçamento simultâneo e limites financeiros | Compartilhamento sequencial/limites locais D3.2 cobertos; integração/concorrência persistente pendentes |
| 5.6 | Testes de execução, gaps, stops, takes e saídas | Unitários/integração local D4 cobertos; validação do runtime completo pendente |
| 5.7 | Testes de recuperação, reinício e idempotência financeira | D5 local coberto, incluindo crash/concorrência reais; validação operacional completa pendente |
| 5.8 | Testes de autonomia e isolamento dos agentes | Pendente |
| 5.9 | Testes de aprendizado, validação e rollback | Pendente |
| 5.10 | Diagnóstico empírico de viabilidade com H=0 (`REQ-100`) | Pendente |
| 5.11 | Segurança, observabilidade e desempenho | Pendente |
| 5.12 | Critérios de aceite final e reprodução completa dos cenários | Pendente |

## Fora do MVP inicial

| Expansão futura | Situação |
|---|---|
| Dados reais de mercado e notícias | Posterior |
| Novo especialista SOL | Posterior |
| Novas mesas e personagens para mais ativos | Posterior |
| Negociação financeira real | Fora do MVP simulado; exige autorização específica |
| Ampliação do escritório além do primeiro escopo | Posterior |

---

## Resumo consolidado

| Indicador | Quantidade | Interpretação |
|---|---:|---|
| Fases oficiais | **6** | Áreas do roadmap: 0 a 5 |
| Tópicos detalhados neste documento | **67** | Subdivisão analítica do escopo, não 67 tarefas independentes aprovadas |
| Requisitos documentados | **100** | Requisitos funcionais e técnicos registrados |
| Requisitos com status `APPROVED` | **95/100** | Aprovação de especificação, não implementação |
| Requisitos com status `PENDING` | **5/100** | `REQ-013`, `REQ-017`, `REQ-031`, `REQ-033`, `REQ-044` |
| Incrementos publicados na sequência MVP-001 | **10/11** | A, B, C1, C2, C3, D1, D2, D3.1, D3.2 e D4 |
| Incrementos implementados aguardando publicação | **1/11** | D5 implementado; aguardando revisão/commit |
| Incrementos ainda não implementados | **0/11** | Apenas nesta sequência numerada; fases posteriores continuam pendentes |
| Último incremento publicado | **MVP-001-D4** | Execução/proteções; SHA472bc0a5bccd019e88df21386859cf7ab2375b65 |
| Próximo incremento | **Não iniciado automaticamente** | Revisão/publicação D5; próximo desenvolvimento exige tarefa própria |

### Como interpretar o andamento

1. **O MVP-001 não representa o MVP inteiro**: é a sequência já numerada do núcleo de backend.
2. **As 6 fases incluem tudo que foi aprovado para o MVP completo**: escritório virtual, agentes, orçamento, evolução e validação.
3. **O número 67 representa tópicos organizacionais**, extraídos da análise dos requisitos e do roadmap, e **não** 67 unidades de entrega oficialmente planejadas ou sem sobreposição.
4. **95% de requisitos aprovados não significa 95% do software construído**.
5. **D5 não encerra automaticamente o produto**: ainda serão necessários agentes, frontend, aprendizado, integração e evidências finais.
6. **Não existe rentabilidade demonstrada**: as operações financeiras e a validação empírica ainda não estavam implementadas neste checkpoint.

### Organização recomendada para as próximas etapas

Manter a sequência `MVP-001` já desenvolvida, concluir o núcleo operacional e criar um roadmap **executável e versionado** para os componentes restantes, incluindo seus critérios de aceite, dependências, testes e identificadores oficiais. A numeração proposta neste documento pode servir de base, mas não deve ser confundida com aprovação formal dos próximos incrementos.

## Referências oficiais

- [Roadmap](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/blob/master/docs/ROADMAP.md)
- [Contexto e escopo do MVP](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/blob/master/docs/PROJECT_CONTEXT.md)
- [Requisitos](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/blob/master/docs/REQUIREMENTS.md)
- [Arquitetura](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/blob/master/docs/ARCHITECTURE.md)
- [Decisões](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/blob/master/docs/DECISIONS.md)
- [Checkpoint do desenvolvimento](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/blob/master/docs/DEVELOPMENT_STATE.md)
- [Commit publicado do MVP-001-D2](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/commit/ffc65288bc5caeab7feb487cd53dc2a25eaf34b5)
- [Commit publicado do MVP-001-D3.1](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/commit/74d66c80693f60f5ed656d3fa432f6b96b0dfe15)
- [Commit publicado do MVP-001-D3.2](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/commit/40b2c893d7955c9ca58ab53c438379c6815797d2)
- [Commit publicado do MVP-001-D4](https://github.com/EvertonLMsilva/bot-crypto-agente-backend/commit/472bc0a5bccd019e88df21386859cf7ab2375b65)

---

*Documento de acompanhamento preparado a partir da análise consolidada do escopo do MVP. Não substitui as decisões, requisitos e aprovações formais mantidas no repositório.*

## Checkpoint SOURCE-001 — fonte de fixtures para a validação pendente

BOT-CRYPTO-RUNTIME-003-SOURCE-001: IMPLEMENTADO LOCALMENTE / NÃO PUBLICADO. DEC-066: fonte causal fixture-market/1 com manifesto completo BTC/ETH, gaps de preço, OHLCV canônico8, continuidade5m, identidade vinculada ao SHA256 canônico e evidência/configuração runtime2 verificada pelo mesmo D5. SeededGenerator, runtime1, D5 legado e cálculos financeiros preservados. Manifesto de simulação existente não pode ser trocado; cenários com caudas diferentes exigem novas identidades/simulações. EOF pausa sem fabricar dados, autorizar novo ciclo ou liquidar posições; retomada permanece PAUSED.

Evidências de SOURCE-001:42 testes novos;626 PASS/46 suítes,584 anteriores preservados e5 TODO preexistentes; cobertura diferencial88/88 (100%) e global99,47% na execução completa de624 PASS anterior aos dois testes adicionais, com código executável inalterado; build PASS e diff check PASS. Inclui recuperação em processo real e preservação de reservas/posição em teste de contrato com análise real, sem decisões prontas. Isso não constitui negociação E2E pelo runtime após aquecimento persistido.

O bloqueio anterior por ausência de uma fonte pública de fixtures foi resolvido nesta entrega isolada. RUNTIME-003 permanece PARCIAL / BLOQUEADO PARA ACEITE INTEGRAL; gate de desempenho/replay ainda PENDENTE. Aquecimento operacional150h, negociação persistida, proteções/saídas/capital e equivalência integral contínua versus reiniciada ainda dependem dos cenários E2E não demonstrados. Não se reduzem scores, aquecimento ou verificações D5 para acelerá-los.

Mantidos6 fases,67 tópicos e11/11 incrementos MVP-001 publicados; RUNTIME-001/002 publicados, RUNTIME-002 no SHA ffc2eecfbcf3ef7268a9cd870d6500f6fbbbcb65. Nenhum D6 ou novo tópico oficial criado. Este checkpoint atualiza a situação da extensão de fonte; os registros e contagens antigos permanecem históricos. Seis cenários oficiais, REQ-100 empírico, aprendizado e escritório3D continuam pendentes; MVP completo não concluído.

## Checkpoint PERF-002 — desempenho de replay e escala ainda pendente

BOT-CRYPTO-RUNTIME-003-PERF-002: IMPLEMENTADO LOCALMENTE / NÃO PUBLICADO; revisão independente pendente. Sessão privada de replay por transação, uma passagem financeira/causal por reconstrução e checkpoints comparados sequencialmente (DEC-067). Sem cache entre transações, bypass, migração ou alteração financeira. Histórico/hashes/recibos completos, rollback, concorrência e recuperação preservados.

Evidências locais:657 PASS/47 suítes,639 anteriores preservados,18 novos e5 TODO preexistentes; cobertura diferencial100% (79/79), global99,49%, build PASS. Inclui testes reais de crash e concorrência. Totais incluem o E2E parcial local e não representam aprovação integral do RUNTIME-003. Oráculo adicional com cancelamento/posição/gap confirmou estado e ledger iguais ao baseline publicado, incluindo PnL negativo.

Metas experimentais pareadas PASS: três processos por variante/cenário, mesma máquina, Node24.18.0/SQLite3.53.1, sem profiler. Mediana seeded ciclo15:4347,75→520,67ms (-88,02%); fixture1802 lotes/ciclo4:5893,44→1424,97ms (-75,82%). Hashes finais iguais nos pares; maior aumento RSS5,77% (limite20%). Não é SLA nem comprovação de1800 ciclos.

Medições crescentes:16 e32 completos; alvo64 interrompido após40 ciclos por orçamento de tempo;128/1800 não executados. Limites:45s de avanço entre fronteiras, supervisor48s incluindo inicialização/retomada, RSS512MiB e banco/WAL/SHM256MiB. Custos residuais de sete reconstruções por ciclo, cópia/hash e checkpoints persistidos exigem novo gate. RUNTIME-003 permanece PARCIAL / ACEITE INTEGRAL BLOQUEADO; aquecimento operacional150h e negociação E2E integral continuam sem demonstração.

Mantidos6 fases,67 tópicos, MVP-00111/11 publicado, RUNTIME-001/002 publicados e SOURCE-001 publicado no SHA3c8021b45ac237bb953463c0d47811a5ca4b2b13. Nenhum D6, novo tópico oficial ou conclusão antecipada do MVP completo. Conteúdo parcial anterior preservado integralmente.


## Checkpoint PERF-003 — snapshots confirmados e gate experimental

PERF-003 IMPLEMENTADO LOCALMENTE / NÃO PUBLICADO (DEC-068). API aditiva de recibo/snapshot imutável após COMMIT; revisão do recibo separada do head atual, replay antigo com snapshot=null e reconstrução segura. Histórico, saúde e revisão continuam validados sob cada novo lock. Ciclo normal reduzido de sete para quatro reconstruções D5, sem implementar a segunda proposta D4 ou alterar finanças/schema/provedores.

Validação:681 PASS/48 suítes e5 TODO preexistentes; cobertura diferencial100% (31/31), global99,49%; build PASS. Teste de concorrência adaptado à nova fronteira, mais caso de recibo2/head3 sem associação indevida; crash real, rollback, resposta perdida e processos concorrentes preservados. Equivalência financeira/ledger exata com baseline, inclusive cancelamento/posição e perda por gap. Os totais incluem o E2E parcial preexistente e não aprovam RUNTIME-003 integral.

Benchmark pareado sem instrumentação, três processos por variante/cenário, Node24.18.0/SQLite3.53.1: ciclo32 mediano2061,46→1420,00ms (-31,12%), gate≥25% PASS. RSS mediano301,28→277,80MiB; maior aumento pareado de todos os cenários1,10% (limite20%). Fingerprints finais iguais.16/32 completos;64 parou por tempo após47 ciclos,51,01s totais sob supervisor60s, RSS335,41MiB e recuperação PAUSED íntegra.128/1800 não executados. Métricas completas/limites/reprodução em DEVELOPMENT_STATE.md.

RUNTIME-003 continua PARCIAL / ACEITE INTEGRAL BLOQUEADO. Persistem custos crescentes de reconstrução/cópia/hash/checkpoints e escala integral não demonstrada. Seis fases,67 tópicos e situação das entregas publicadas inalterados; nenhum aprendizado, REQ-100 empírico ou frontend3D entregue. Trabalho local anterior dos documentos e test/runtime/runtime-e2e.spec.ts preservado. Sem staging/commit/push/merge.

### Checkpoint STORAGE-001 — REF1/schema2 implementados localmente

- Representação compacta REF1 autorizada em DEC-069, exclusivamente em bancos V2 criados explicitamente; V1 permanece padrão e legível sem migração.
- Ledger financeiro e replay integral preservados; catálogo lógico estrito, inicialização concorrente, rollback e recovery fazem parte do contrato implementado.
- Ensaios de 16/32 ciclos e resultados de validação no checkpoint STORAGE-001 de DEVELOPMENT_STATE.md. Não aprovam escalabilidade integral nem concluem RUNTIME-003.
- Próximo gate: revisão independente da implementação e ensaio de armazenamento/recuperação com limites explícitos antes de autorizar qualquer escala maior. PERF-004/D4 permanece separado. Nenhuma execução automática de 64/128/1.800 ciclos.
