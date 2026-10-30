# Checkpoint operacional

LAST_UPDATED: 2026-10-30
PROJECT: BOT CRUPTO
DIRECTORY: D:\04-Projetos\30-bot-crypto-agence\backend
CURRENT_PHASE: EXACT_SIGNAL_COMPOSITION_AND_SELECTION
PHASE: MVP-001-C3 — contexto, composição exata e seleção pura
MVP: FOUNDATION_INDICATORS_REGIMES_TECHNICAL_FAMILIES_SIGNAL_COMPOSITION_IMPLEMENTED; REMAINING_INCREMENTS_NOT_STARTED
IMPLEMENTATION: MVP_001_A_B_C1_C2_AND_C3_IMPLEMENTED_ONLY
CENTRALIZED_BUDGET: APPROVED
BUDGET_POLICY: APPROVED
FINANCIAL_POLICY: APPROVED
NEXT_CANDLE_EXECUTION: APPROVED
CONSERVATIVE_INTRABAR_STOP_TAKE: APPROVED
OPS-002: APPROVED
PERSISTENT_AUDIT: APPROVED
SIGNAL_POLICY: FUNCTIONAL_RULES_APPROVED; PURE_COMPOSITION_IMPLEMENTED; OPERATIONAL_INTEGRATION_PENDING
SIGNAL-001: APPROVED
SIGNAL-002: APPROVED
SIGNAL-003: APPROVED
SIGNAL-004: APPROVED
SIGNAL_CALIBRATION_DETAILS: INITIAL_FORMULAS_APPROVED; RESIDUAL_DETAILS_PENDING
SIGNAL-005.1-005.10: APPROVED_FUNCTIONAL_RULES
MVP-SCOPE-001-006: APPROVED_FUNCTIONAL_SCOPE
VALIDATION_MIXED_WINDOWS: APPROVED
H_OPERATIONAL_INITIAL: ZERO_UNTIL_VALIDATION_AND_AUTHORIZATION
H_POSITIVE_ACTIVATION: APPROVED_SPEC; NOT_IMPLEMENTED
LEARNING_QUANTITATIVE_DETAILS: APPROVED_POLICIES; RESIDUAL_DETAILS_PENDING
LEARN-004: APPROVED
LEARN_RETURN_METRIC: APPROVED
LEARN_VALIDATION_WINDOWS: APPROVED
LEARN_CANDIDATE_GENERATION_POLICY: APPROVED
LEARN_DRAWDOWN_POLICY: APPROVED
LEARN_POST_PROMOTION_MONITORING: APPROVED
LEARN_ROLLBACK_POLICY: APPROVED
LEARN_STATISTICAL_DETAILS: PARTIALLY_PENDING
SIGNAL_CALIBRATION: FORMULAS_AND_EDGES_APPROVED; EXPERIMENTAL_EVIDENCE_PENDING
OPS_RELIABILITY: FUNCTIONAL_SPEC_APPROVED; TECHNICAL_CONTRACTS_ARCH_001
OPS-003.1: APPROVED_SPEC
OPS-003.2: APPROVED_SPEC
OPS-003.3: APPROVED_SPEC
OPS-003.4: APPROVED_SPEC
MVP_SCOPE: FUNCTIONAL_SCOPE_APPROVED; TECHNICAL_READINESS_PENDING
FINAL_LEARNING_ALGORITHMS: PENDING
TECHNICAL_ARCHITECTURE: MINIMAL_ARCH_001_APPROVED; REMAINING_CONTRACTS_PENDING
ARCHITECTURE: MINIMAL_APPROVED_DEC_063; FOUNDATION_INDICATORS_HOURLY_TECHNICAL_AND_SIGNAL_FUNCTIONS_IMPLEMENTED
MARKET_DATA: SIMULATED_FIRST
CENTRAL_INTELLIGENCE: CONCEPT_APPROVED
SPECIALIST_AGENTS: CONCEPT_APPROVED
COORDINATOR: CONCEPT_APPROVED
LEARNING: CONTROLLED_AUTONOMOUS_APPROVED
PROMOTION_GATES: INITIAL_PARAMETERS_APPROVED
TRADING_POLICY: MVP_FUNCTIONAL_SPEC_APPROVED; TECHNICAL_IMPLEMENTATION_PENDING
TESTS: PASS_245_TESTS_20_SUITES; 49_NEW_AND_196_PRESERVED
COVERAGE_LINES: 98.95_PERCENT_GLOBAL; 98.91_PERCENT_NEW_SIGNALS
BUILD: PASS
SMOKE: MVP_001_A_HISTORICAL_PASS; NOT_RERUN_MVP_001_C3
SIMULATION: SYNTHETIC_CANDLES_ONLY; FINANCIAL_NOT_EXECUTED
NODE_VERSION: v24.18.0
NPM_VERSION: 11.16.0
NEXT: REMAINING_INCREMENT_REQUIRES_EXPLICIT_TASK
ARCH_001: APPROVED_DEC_063
REQ_093_100: APPROVED_SPEC; REQ_095_MATH_AND_C3_COMPOSITION_IMPLEMENTED; OPERATIONAL_REMAINDER_PENDING
REQ_091_095: INDICATOR_MATH_AND_HOURLY_TIMEFRAME_IMPLEMENTED; REMAINING_DEPENDENTS_PENDING
REQ_061_080: HOURLY_AGGREGATION_REGIMES_AND_VOLATILITY_IMPLEMENTED; NO_OPERATIONAL_SIGNALS_OR_AUTHORIZATION
REQ_083_085: THREE_TECHNICAL_FAMILIES_EXACT_TRIGGERS_AND_T_IMPLEMENTED; C2_NUMBER_T_DIAGNOSTIC_ONLY; NO_ORDERS
SIGNAL_COMPOSITION_C3: EXACT_T_R_C_A_H0_S_AND_PURE_SELECTION_IMPLEMENTED; NO_OPERATIONAL_ENTRY_CANDIDATE_OR_ORDERS
WARMUP: INFORMATIONAL_150_CONTINUOUS_VALID_HOURS; NOT_OPERATIONAL_AUTHORIZATION
REQ_100_EVIDENCE: NOT_EXECUTED/PENDING_VERIFICATION

## Última tarefa
BOT-CRYPTO-MVP-001-C3 — IMPLEMENTATION / TDD.
STATUS: DONE. Preflight: raiz backend, master/d82664545390b102c6f79b00e9ea4a7d6dc56902, worktree/staging limpos, Node v24.18.0/npm11.16.0. Instruções e seções autorizadas consultadas; decisões, requisitos, C1/C2, indicadores e dependências preservados.

Criados somente sete módulos src/signals/{types,context,exact-technical-score,regime-fit,score,select,index}.ts e cinco testes autorizados. evaluateSignalCandidates chama C2 uma vez, calcula T/C/S em frações bigint serializáveis, aplica as oito células R, concordância qualificada por T>=60 e H0 obrigatório. Half-up somente no S final e desempate por S arredondado/bruto/T/R/ID. Retorna três avaliações congeladas, representante ou null, descartadas e razões; política P0 UNVALIDATED com versões explícitas, sem histórico/H fornecido. Contexto valida identidade, UTC, sequência e revisão; conflitos UNCERTAIN não viram falha técnica, eventos futuros não contribuem e revisões não reiniciam validade. Contratos reais/limitações descritos em ARCHITECTURE.

TDD: suítes novas executadas antes dos respectivos módulos, RED por contratos/módulos ausentes, depois GREEN;49 novos/5 suítes. Focados49/5 PASS; suíte completa245/20 e cobertura245/20 PASS, preservando196 anteriores. Linhas novas98,91%, branches98,33%, linhas globais98,95%; linhas defensivas não cobertas: denominador/divisor interno inválido e propagação de erro inesperado do contexto. Build PASS. git diff --check e conferência explícita dos untracked PASS; staging vazio, sem commit/push. Somente ARCHITECTURE e este checkpoint modificados entre os arquivos rastreados.

Referências independentes para EMA/Wilder/RSI, F/Q/V/T, T60 e vizinhos racionais, S69,50 e vizinhos, acordo por participantes e todos os desempates. Rejeição da série de30 preços10000000000000000.00000000..29 confirmada pela integração C2 antes de decisão. Testes causais incluem disponibilidade contextual, correções/retrações, duplicatas/conflitos, ordem de chegada, entradas congeladas e isolamento BTC/ETH. Recuperação real150h sem mocks: T90, C50 gera S69; C80 confirmado disponível no instante gera S73,50→74, selecionando MEAN_REVERSION. Nenhum uso de Date.now/Math.random.

Medição local única após adiar reduções RSI não consumidas:150h/1.800 candles234,21ms, heap5,45→9,37MiB, RSS após63,40MiB;200h/2.400 candles362,29ms, heap6,02→16,31MiB, RSS após80,76MiB. Caminho completo com entradas congeladas, preços alternados exatos e GC anterior. Não é SLA nem pico de memória; histórias maiores não medidas, custo dos inteiros cresce. Observação Number permanece apenas diagnóstica; incertezas conservadoras de regimes do C1 continuam bloqueando qualificação.

Pendentes: produtor contextual, integração operacional, ENTRY_CANDIDATE/Coordenador/Gestor, ordens/orçamento/proteções, persistência/SQLite/ledger, cenários oficiais, certificação, aprendizagem e H positivo. REQ-100 operacional/empírico continua NOT_EXECUTED/PENDING_VERIFICATION. Sem autorização financeira, fontes externas, frontend ou integração automática NestJS. Próximo incremento somente mediante tarefa explícita.

## MVP-001-C2 — registro histórico
BOT-CRYPTO-MVP-001-C2 — IMPLEMENTATION / TDD.
STATUS: DONE. Preflight: raiz backend, master/6e1a0e2bc0fd526cc151edf1880278ad39553fa1, worktree/staging limpos, Node v24.18.0/npm11.16.0. Consultadas somente instruções e seções/interfaces pertinentes. Sem conflito encontrado entre as interpretações operacionais autorizadas e DEC-039/DEC-043/DEC-053. Decisões, requisitos, limiares e módulos anteriores preservados.

Entregues cinco módulos src/strategies/{types,exact-triggers,technical-evidence,evaluate,index}.ts e três testes correspondentes a exact-triggers, technical-evidence e evaluate. API retorna três avaliações imutáveis do último candle na ordem TREND/BREAKOUT/MEAN_REVERSION; asOf deve coincidir com esse fechamento. Usa uma chamada à classificação horária, último horário fechado e aquecimento150h. Gatilhos exatos por bigint/EMA racional/RSI Wilder racional/Bollinger quadrático; estado em uma passagem e janela20. T estatístico sem arredondamento, com null/razões explícitas, sem T>=60 ou score global. triggerMet/G são certificados brutos; elegibilidade técnica também exige contexto, aquecimento e componentes válidos. Detalhes em ARCHITECTURE.

TDD real: três suítes escritas e executadas antes dos módulos respectivos (RED por módulos ausentes);19 testes de gatilhos,19 de evidência e11 de avaliação aprovados. Focados49/3; suíte completa196/15 e npm run test:coverage196/15 PASS, preservando147 anteriores. Linhas novas99,26%, branches novas97,96%; global linhas98,97%, statements98,53%, branches97,58%. Uma linha defensiva de rejeição de T fora de intervalo não coberta; mínimo95% atendido. npm run build PASS. git diff --check PASS. Staging vazio; branch/HEAD preservados, sem commit/push.

Testadas igualdades e um tick em EMA9/RSI35/Bollinger/rompimento/volume; séries e componentes conhecidos; T sem gatilho e elegibilidade com T<60; ATR0/amplitude0/volume médio0/indisponibilidade; asOf desatualizado/futuro/duplicações; último horário sem antecipação,149h/150h, classificação única, entradas congeladas, prefixos e independência BTC/ETH. RangeError estatístico não fabrica números; erros inesperados propagam.

Diagnóstico adicional em memória:200h/2.400 candles com preços alternados e volumes exatos, entrada congelada;168,09ms local, três avaliações e aquecimento válido, sem NaN/Infinity. Não estabelece SLA nem comprova rentabilidade ou frequência de gatilhos. Histórias maiores e custo racional de longo prazo continuam sem medição. T é aproximado Number e seus limiares decisórios pertencem ao C3. Somente estes dois documentos foram modificados; nenhuma dependência, indicador, regime, relógio, gerador, NestJS ou frontend alterado.

Pendentes: MVP-001-C3 (matriz R e demais scores conforme tarefa futura), contexto C, concordância A, H positivo, sinais, operações/orçamento/proteções, SQLite/ledger, cenários oficiais e aprendizado. C2 não é motor de ordens ou score global. NEXT: MVP-001-C3, não iniciado. REQ-100 empírico NOT_EXECUTED/PENDING_VERIFICATION.

## MVP-001-C1-RESUME — registro histórico
BOT-CRYPTO-MVP-001-C1-RESUME — TARGETED_FIX + IMPLEMENTATION / TDD.
STATUS: DONE. Baseline conferida: backend, master/30f4a28bb724a5f25791c2386e8d77bec9e48dc7, staging/worktree limpos e Node v24.18.0. Tentativa C1 anterior interrompida sem arquivos alterados por comparação Number de D; retomada autoriza frações exatas e continuação. Nenhuma fórmula/limiar aprovado foi substituído e nenhuma decisão foi criada.

Entregues: comparação causal exata de D por bigint/SMA/Wilder/MDC; parâmetro final opcional5m/1h em EMA/ATR/ADX/validação; agregação UTC de12 candles com OHLC/volume exatos e saída congelada; regimes com confirmação conservadora em dois horários; volatilidade exata com100 razões anteriores/P75 nearest-rank; warmupComplete informativo a partir da150ª hora. Number continua para auditoria. Proteção contra colisões, índices e fórmulas anteriores preservados; RSI/Bollinger não alterados. Contratos detalhados em ARCHITECTURE.

Esclarecimento recebido do proprietário: classifyHourly rejeita histórico estruturalmente inválido com RangeError; UNKNOWN reservado a indisponibilidade/contradição/incerteza numérica. Sem classificação ou aquecimento reaproveitados por lacunas/futuro. Fronteiras ADX/DI são certificadas por intervalos com arredondamento binário para fora; quando não provadas, UNKNOWN com motivo. ADX exato20/25 não é decidido incorretamente; pode permanecer UNKNOWN. Volatilidade aproveita o ATR racional de D para igualdade e diferenças de um tick, sem epsilon ou arredondamento decisório.

TDD: testes escritos/executados antes dos componentes/contratos (RED por módulos/API ausentes); reprodução original confirma Number D=0,24999999999029873, mas comparador exato atende+0,25. Focados finais:10 testes exatos,8 agregação,8 timeframe e25 classificação/volatilidade. Suíte sem cobertura145/12 aprovada antes dos2 casos completos adicionais de ADX; execução final npm run test:coverage aprovou147/12, preservando96 anteriores e acrescentando51. Cobertura de linhas100% em src/regimes e indicadores alterados; global98,85%, statements98,73%, branches97,32%; regimes branches96,57%. npm run build PASS. UTC/dia, precisão/volumes, prefixos, histórico parcial, determinismo, entradas congeladas e isolamento BTC/ETH verificados. git diff --check PASS.

Criados somente5 módulos src/regimes/{types,aggregate-hourly,exact-d,classify-hourly,index}.ts e4 testes (test/regimes/{aggregate-hourly,exact-d,classify-hourly}.spec.ts, test/indicators/timeframe.spec.ts). Modificados6 arquivos permitidos de indicadores e apenas ARCHITECTURE/este checkpoint. Demais fontes, testes antigos, decisões/requisitos e dependências preservados. Sem integração automática no NestJS, finanças ou frontend. Branch/HEAD preservados; staging vazio, sem commit/push.

Limitações: custo crescente de inteiros racionais em histórias extensas; valores Number de auditoria aproximados; intervalos direcionais podem exigir UNKNOWN junto às fronteiras. A indicação de150h não autoriza entradas. Pendentes: MVP-001-C2, estratégias/contexto/T/R/C/A/H/scores/sinais, seis cenários oficiais, execução/orçamento/proteções, SQLite/ledger e aprendizado. REQ-100 empírico continua NOT_EXECUTED/PENDING_VERIFICATION. Próximo MVP-001-C2 não iniciado.

## MVP-001-B — registro histórico
BOT-CRYPTO-MVP-001-B — IMPLEMENTATION / TDD / CLOSED_CANDLE_INDICATORS.
STATUS: DONE — EMA9/20/21/50, RSI14, ATR14, ADX/+DI/-DI14 e Bollinger20/2 implementados conforme DEC-053/REQ-091/REQ-095. Preflight conferiu raiz backend, master/1b73021100b59b84f4f86e22d0ad28dc2bc3b96c, staging/worktree limpos, Node v24.18.0/npm11.16.0;30 testes anteriores aprovados antes da edição. Testes novos escritos e executados antes dos módulos: RED por módulos ausentes; depois52 novos aprovados/6 suítes e suíte completa82/8. Cobertura nova100% de linhas, branches, statements e funções; global97,96% de linhas,98,34% statements,98,16% branches. npm run build aprovado. Sem novas dependências ou decisões; REQUIREMENTS e demais arquivos fora da allowlist preservados. Entrega matemática parcial de REQ-091/REQ-095 não equivale a integração operacional, warmup150h ou comprovação REQ-100.

Contrato e índices registrados em ARCHITECTURE: instante UTC explícito, rejeição de futuro/formação/lacunas/mistura de ativos/OHLCV inválido; séries com null no histórico insuficiente; erros RangeError explícitos, sem NaN/Infinity ou números substitutos. Referências independentes incluem RSI Wilder, ATR com gaps de preço, ADX misto por frações exatas e variância populacional. Prefixos, ausência de relógio real/aleatoriedade, determinismo e entradas congeladas verificados. ATR0 não habilita divisores dependentes. Cálculo Number somente estatístico, separado de dinheiro/ledger.

Criados exclusivamente os8 arquivos src/indicators/{types,validation,ema,rsi,atr,adx,bollinger,index}.ts e6 testes test/indicators/{ema,rsi,atr,adx,bollinger,validation}.spec.ts. Modificados somente ARCHITECTURE e este checkpoint. git diff --check aprovado; staging vazio, HEAD/branch preservados; sem commit/push. Pendentes: MVP-001-C e integrações posteriores, agregação horária, warmup150h, regimes/estratégias/scores/sinais, seis cenários oficiais, operações financeiras/orçamento/ledger/SQLite e aprendizado; frontend não alterado. Nenhum início de MVP-001-C.

## Histórico preservado
- DOCS-001: oito documentos criados a partir de raiz vazia, sem Git/implementação; seis decisões aprovadas e Three.js proposto; layout central, expansão lateral e imagem de referência documentados. Nenhuma instrução preexistente local/ancestral encontrada naquela inspeção.
- DOCS-002: DEC-008 a DEC-019, REQ-018 a REQ-034 e reconciliação dos anteriores; inteligência contextual, autonomia exclusiva, coordenação e aprendizado controlado; roadmap proposto e implementação ausente.
- GIT-001: único commit inicial f034f9d010e573659aa80ba0720080bcb70b7088, mensagem `docs: bootstrap BOT CRUPTO project documentation`, oito documentos publicados e rastreamento origin/master configurado. O checkpoint publicado ainda dizia “Git não inicializado” porque a tarefa GIT-001 proibiu alterar documentação; situação real reconciliada aqui.
- DOCS-003: nenhuma evidência local de execução nos documentos, histórico Git ou mudanças locais antes da DOCS-004. Não presumir execução ausente do histórico.
- DOCS-004: DEC-020 a DEC-025, REQ-035 a REQ-060, atualizações de DEC-017/DEC-018 e REQ-008/REQ-009/REQ-015/REQ-030/REQ-032. DEC-016 integralmente preservada.
- GIT-002: DOCS-004 publicada em 4bba447862703bba1d99570a738621c269139c3e, mensagem `docs: consolidate budget and simulated trading requirements`, pai f034f9d010e573659aa80ba0720080bcb70b7088; único commit novo e publicação confirmados na tarefa GIT-002. É a baseline confirmada da DOCS-005. O checkpoint anteriormente publicado retratava a etapa DOCS-004 anterior ao commit; agora reconciliado.
- DOCS-005: DEC-026 a DEC-029 vinculadas a SIGNAL-001 a SIGNAL-004, REQ-061 a REQ-071; REQ-023/REQ-025/REQ-031/REQ-033/REQ-036/REQ-041/REQ-042/REQ-043/REQ-057 atualizados. 23 aceites SIG mapeados sem registros duplicados. DEC-016 e DEC-020 a DEC-025 preservadas integralmente.
- GIT-003: DOCS-005 publicada em aa9c24a94a234a6f164b183364efc72146f834d1, mensagem `docs: consolidate adaptive signals and learning requirements`, pai 4bba447862703bba1d99570a738621c269139c3e. Commit único/publicação confirmados em GIT-003; baseline confirmada antes da DOCS-006. O checkpoint publicado descrevia DOCS-005 antes desse commit, agora reconciliado.
- DOCS-006: DEC-030 a DEC-035, REQ-072 a REQ-078, reconciliação de REQ-025/REQ-026/REQ-027/REQ-028/REQ-029/REQ-033/REQ-039/REQ-041/REQ-042/REQ-065/REQ-066 e 19 aceites LEARN vinculados sem duplicação. DEC-016 e demais decisões anteriores preservadas integralmente. DOCS-006 não possui commit próprio nesta etapa.
- GIT-004: DOCS-006 publicada em 0feccd4b35cd12422c6dca24e7723b0edb3b1ace, mensagem `docs: consolidate quantitative learning and rollback requirements`, pai aa9c24a94a234a6f164b183364efc72146f834d1; commit único/publicação confirmados na GIT-004. Checkpoint publicado descrevia DOCS-006 antes desse commit, agora reconciliado.
- DOCS-007 anterior: não aplicada na baseline; sem registros, alterações locais ou documentação parcial encontrados no preflight.
- DOCS-007-R2: DEC-036 a DEC-050, REQ-079 a REQ-100 (14 novos aprovados e oito pendentes), 13 requisitos anteriores reconciliados. AGENTS.md somente lido e preservado; histórico decisório anterior intacto.

- DOCS-007-FIX-001: classificação incorreta de cenários/durações como PENDING removida de ARCHITECTURE.md; configuração aprovada referenciada à DEC-038.
- GIT-005: commit local e44ea76cbf855cd07d55c5a500916237da170ea5, pai 0feccd4b35cd12422c6dca24e7723b0edb3b1ace, mensagem `docs: consolidate MVP scope and SIGNAL-005 specification`; sete documentos. Tarefa COMMIT_ONLY, sem push nela. DOCS-007-R2/FIX-001 integram esta baseline.
- DOCS-008: DEC-051 a DEC-058 acrescentadas, preservando integralmente DEC-001 a DEC-050. REQ-093 a REQ-100 existentes passam de PENDING para APPROVED quanto à especificação; dependências/IDs preservados. Sem implementação ou evidência experimental produzida.

- GIT-006: commit local 6cae9dc8283f79c342e6e75cff545a50511798ea, pai e44ea76cbf855cd07d55c5a500916237da170ea5, mensagem `docs: consolidate REQ-093 to REQ-100 approvals`; sete documentos, COMMIT_ONLY, sem push naquela tarefa. Esta é a baseline observada da DOCS-009.
- DOCS-009: quatro decisões DEC-059 a DEC-062 acrescentadas; DEC-001 a DEC-058 preservadas integralmente. REQ-043/REQ-044 e referências diretamente afetadas reconciliadas, sem novos requisitos e com REQ-093 a REQ-100 intactas. Apenas cinco documentos autorizados editados.

- Após DOCS-009, baseline Git observada para MVP-001-A:4424b4654a0dd531e699776d35d13f60f1d78e0a em master. Não inferir push/publicação pelo estado local.
- MVP-001-A: primeira implementação real autorizada. DEC-063 acrescentada, decisões anteriores preservadas; novos arquivos somente na allowlist de fundação/testes, três documentos afetados atualizados. Requisitos e gates não alterados.

## Inspeção da MVP-001-A — registro histórico
Raiz oficial D:\04-Projetos\30-bot-crypto-agence, master e HEAD4424b4654a0dd531e699776d35d13f60f1d78e0a conferidos. Preflight: worktree limpa, staging vazio, estrutura inicial com oito documentos e sem código; Node v24.18.0/npm11.16.0 funcionais. Última decisão era DEC-062. Sem alterações globais, Docker ou serviços pagos.
Dependências gratuitas consultadas no registro npm e instaladas localmente com scripts de instalação desabilitados, versões explícitas e lockfile. Documentação oficial NestJS consultada para contexto standalone. Runtime dos testes/smoke sem API de mercado ou rede de aplicação. Sem consulta remota Git, commit ou push. Instalação gerou node_modules e build gerou dist, ambos ignorados; cobertura somente textual, sem relatório extra versionável. Staging permaneceu vazio.

## Aprovações consolidadas
- Capital 10.000 UC centralizado compartilhado, sem saldo permanente por agente; exposição individual 20% e consolidada 40%; risco planejado 1% por operação e 2% aberto.
- Perda diária máxima de referência 3% sobre patrimônio do início do dia UTC (00:00), considerando redução patrimonial/perdas não realizadas e bloqueando novas entradas. Custos/distância à proteção no risco; gaps/deslizamentos podem exceder planejamento.
- Apenas spot simulado, sem alavancagem/venda descoberta/operação real. Sinais de candles fechados; entrada autorizada na próxima abertura elegível; sem retroatividade.
- OPS-002: stop 2%, take 4%, taxa 0,10% e deslizamento 0,05% por execução; uma posição por ativo; saída integral; estratégia na próxima abertura e proteção OHLC conservadora.
- Stop obrigatório e vínculo à estratégia/versão; promoção/rollback preservam posições e proteção. Parâmetros versionados, candidatas sujeitas ao LEARN-GATE completo, sem alteração autônoma de limites/gates.
- Contabilidade/auditoria persistentes e idempotentes; ajustes preservam originais; rastreabilidade completa; avaliações hipotéticas separadas; aprendizado exclusivo do responsável.

## Histórico de aprovações de sinais — DOCS-005 (detalhado pela DOCS-007-R2)
- SIGNAL-001: política adaptativa de seleção/combinação versionada, múltiplas estratégias exclusivas por ativo, evolução só por LEARN-GATE; famílias apenas propostas.
- SIGNAL-002: regimes/dimensões determinísticos; T/R/C/H/A normalizados 0–100, pesos globais 35/25/15/15/10; S = round(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A), limiar 70 e elegibilidade obrigatória. Não é probabilidade, autorização, garantia ou risco suficiente. Pesos/limiar não alteráveis autonomamente; Naquela etapa H insuficiente ainda sem valor definido; agora H operacional inicial0 conforme DEC-041.
- SIGNAL-003: uma política ativa e até três candidatas por ciclo/agente, isoladas sem capital oficial; baseline UNVALIDATED, promoções posteriores dependem de DEC-016 integral. ENTRY_CANDIDATE/EXIT_REQUEST/HOLD/WAIT e RISK_ALERT adicional; uma decisão por ativo/candle fechado. Saídas e proteções não dependem da fila de novas compras.
- SIGNAL-004: ENTRY expira na abertura elegível perdida, reserva liberada idempotentemente; sem transferir autorização, nova oportunidade exige nova análise. EXIT perdido exige reavaliação. Relógio simulado, pausa não expira por tempo real. Ordenação por nota/tempo/rodízio persistido/ID, sem chegada assíncrona casual. Identidade estável por sinal/ciclo e ausência de duplicação. Dados ausentes bloqueiam entrada sem retirar proteção. Falta de capital não prova erro; avaliações hipotéticas separadas.

## Aprovações LEARN-004 — DOCS-006
- Retorno líquido patrimonial R_p = 100 * (E_final - E_inicial) / E_inicial; Delta = mean(R_candidata,p - R_ativa,p) >=1 p.p.; líquido positivo e superior em dois dos três períodos, com custos/marcação comparáveis e demais critérios DEC-016.
- Três períodos cronológicos independentes, sem sobreposição/de mesma duração; cada carteira inicia com 10.000 UC sem posições, mesmos dados/eventos/condições/custos. Desenvolvimento/ajuste, congelamento e validação final reservada separados.
- Nas fronteiras, posições abertas marcadas a mercado com provisão de custos, sem contar como encerradas, fechamento fictício ou transporte entre carteiras; 60 encerradas distintas válidas, mínimo 10 por período. Aquecimento anterior permitido sem operações fora da avaliação.
- Busca local autorizada, até três candidatas por ciclo/agente e no máximo uma desafiante final; hipótese/parâmetros/versões/sementes e todas as tentativas acumuladas persistidas. Sem ajustar pela validação, escolher períodos favoráveis retrospectivamente ou reutilizá-los oportunisticamente. Invalidar contaminação/look-ahead; INSUFFICIENT_EVIDENCE por insuficiência válida.
- DD_t = 100 * (P_t - E_t) / P_t; pico desde início do período, E_t líquido marcado a mercado/custos; MDD_final é o pior dos três períodos. Candidata <=10% e <= ativa +2 p.p., simultaneamente; não usar média substituta.
- Promovida gera decisões oficiais; anterior é referência identificada sem capital oficial. Degradação exige duas janelas consecutivas não sobrepostas/de mesma duração, cada uma >=20 operações distintas encerradas da promovida e retorno >=1 p.p. inferior à anterior, com dados/condições/custos/capital inicial equivalentes; métricas e justificativa registradas. Sem amostra, perda isolada não comprova degradação.
- Violações críticas suspendem novas entradas imediatamente, sem aguardar janelas; mecanismo distinto de rollback por degradação. Reversão só para novas decisões; manter stop/take/versão de origem das posições, motivos/evidências e histórico. Anterior só íntegra/elegível; sem versão segura manter suspensão, sem revogar bloqueios financeiros ou limites.
- DEC-016 não alterada; mínimos não constituem prova estatística. Sem mudança autônoma de código/contratos, pesos globais/limiar 70, limites ou gates.

## Aprovações atuais — MVP / SIGNAL-005
- Exatamente cinco agentes: Central, BTC, ETH, Coordenador e Gestor. Simulador/execução/auditoria são componentes; SOL futuro. Responsabilidades e independência por ativo preservadas.
- Operações em5min fechados; regime/contexto técnico em1h (12 candles válidos). UTC24/7, eventos reproduzíveis, sem rótulo verdadeiro do gerador para agentes ou informação futura.
- Seis cenários, aquecimento150 horários, desenvolvimento90 dias, validação3x30 e monitoramento2x30; 240 dias mais aquecimento. Cada V1/V2/V3 contém os seis cenários por5 dias, ordens exatas em DEC-038/REQ-082; sementes/trajetórias distintas, sem fabricar operações. Carteiras independentes10.000 UC, sem transportar estado/capital/posições; preservado mínimo60 concluídas distintas/10 por janela ou INSUFFICIENT_EVIDENCE.
- Três famílias iniciais tendência/rompimento/reversão (DEC-039). Regimes EMA20/50, ADX/DI14, ATR14 e volatilidade nearest rank75; T/R/C/A, seleção e métodos/saídas definidos em DEC-042 a DEC-050, com indexação/bordas e F formalizados na DEC-053.
- S = round_half_up(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A), limiar70, pesos inalterados. H operacional inicial0 em UNVALIDATED/insuficiência; H pertence à política versionada. H calculado50–90 após gate não autoriza ativação automática; precisa nova configuração/validação independente e estados/bootstrap aprovados em DEC-051/DEC-052, sem implementação.
- Seleção interna por S arredondado/bruto/T/R/ID canônico, sem somar scores; Coordenador mantém nota/tempo/rodízio/ID. Saídas por origem geram EXIT_REQUEST próxima abertura; proteção OPS-002/gaps prevalecem; sem duplicações ou liquidação automática por regime/notícia isolada.
- Escritório web de um andar, cinco personagens, mesas especialistas, Central/Gestor/Coordenador/telão, câmera orbit/zoom/pan e controles iniciar/pausar/avançar5min/velocidade/reinício confirmado. Animações não interferem na lógica; expansão lateral futura; nenhuma engine ou stack escolhida.

## Oito especificações aprovadas — DOCS-008
1. REQ-093 / DEC-051: validação e autorização operacional separadas; H por política/ativo, sem ativação automática por certificado. Configuração muda só H; três novas janelas30 dias, referência congelada, dados inéditos e gate integral antes da promoção para novas decisões. Preservar posições/origem/suspensão/rollback.
2. REQ-094 / DEC-052: BTC-P0 e ETH-P0 fixas UNVALIDATED/H=0, referências sem certificado; P1 em desenvolvimento90 dias apenas nos parâmetros autorizados. Congelar P0/P1, comparar em3x30 com carteiras independentes10.000 UC, custos/dados equivalentes e gate integral. P0 sem negociar: retorno/drawdown0, sem exceção relativa.
3. REQ-095 / DEC-053: indexação t=0, bordas Wilder/EMA/Bollinger, médias nulas RSI e F=clip(x,0,1) aprovados. Dados inválidos bloqueiam dependentes; sem futuro/lacunas artificiais; recuperar estado íntegro ou reconstruir histórico contínuo com150h.
4. REQ-096 / DEC-054: decimal exato8 casas, precisão interna superior; quantidade comprada/recebimentos para baixo, custos/comprometidos para cima, máximos para baixo; strings canônicas, rejeição de inválidos e slippage sem dupla cobrança. Half-up de score/H separado; reservas não mudam patrimônio.
5. REQ-097 / DEC-055: eventos imutáveis agrupados/revisados, uma contribuição ativa por grupo/ativo; revisão verificável/prospectiva, conflito UNCERTAIN sem direção, sem duplicação; U e C/6h/24h/72h preservados. Snapshot causal, feed obrigatório inválido bloqueia entrada.
6. REQ-098 / DEC-056: nove etapas temporais de5min, autorização/reserva antes da abertura, proteção/gap antes de EXIT/entrada; intrabar só quandoOHLC completo disponível; persistência idempotente. Sem reentrada na fronteira da saída, redimensionamento automático ou fill inventado; proteção persiste durante falha. Virada00UTC usa efeitos conhecidos do fechamento anterior.
7. REQ-099 / DEC-057: única rodada adicional só por insuficiência exclusiva de amostra e contingência pré-registrada; novas3x30 com seis cenários5 dias/ordens DEC-038, carteiras10.000 UC e configurações congeladas. Sem somar rodadas;>=60 distintas/10 por janela e gate integral na nova. Segunda insuficiência encerra versão; sem oportunismo/renomeação idêntica. +90 dias condicional, baseline240 intacto.
8. REQ-100 / DEC-058: protocolo em três fases aprovado: álgebraH0; futuro diagnóstico determinístico no desenvolvimento quando houver simulador; LEARN-GATE posterior em reserva com política congelada.

### REQ-100: aprovação não é comprovação
PROTOCOL: APPROVED_SPEC.
OPERATIONAL_DIAGNOSTIC: NOT_EXECUTED/PENDING_VERIFICATION.
EMPIRICAL_EVIDENCE: NOT_EXECUTED/PENDING_VERIFICATION.
Com H0, pesos35/25/15/15/10 e S>=70, half-up aceita bruto69,50. Com C50: R100/A50 requer T aproximadamente91,43; R90/A50,98,58 conservador; R80/A50 impossível; R80/A100 aproximadamente91,43; R60/A100 impossível. A100 exige concordância qualificada. Conferência algébrica não demonstra frequência de entradas.
Futuro diagnóstico por ativo/família/regime/cenário/janela: candles válidos, regimes elegíveis, gatilhos válidos, sinais>=70, autorizações, entradas, operações distintas concluídas, rejeições/motivos, reprodutibilidade e ausência de look-ahead. Sem resultados, certificação ou rentabilidade inventados.

## OPS-003.1 a OPS-003.4 — APPROVED_SPEC
- DEC-059: separar sinal/ordem/reserva/posição; estados e EXIT_REQUEST próprios, terminalidade, identidades estáveis e contabilidade atômica/idempotente; somente integral, sem parcial/redimensionamento automático; prioridade stop/take, ENTRY perdida expira e EXIT exige reavaliação.
- DEC-060: alvo fixo10% do patrimônio por oportunidade, sem sizing por score; quantidade determinística arredondada para baixo8 casas. Reserva pelo último fechamento válido+margem1%, slippage compra0,05% e taxa0,10%. Quantidade/reserva congeladas; abertura revalida preço/caixa/exposição/risco/bloqueios/custos, cancelamento integral se não couber. Liberação única, autorização atômica na ordem do Coordenador e orçamento BTC/ETH compartilhado; limites20%/40%,1%/2%,3% preservados.
- DEC-061: ledger imutável append-only, eventos idempotentes e transações atômicas; checkpoint por candle5min derivado do histórico confirmado oficial. Reconstrução determinística e reconciliação decimal exata; RUNNING/RECOVERING/ENTRY_SUSPENDED/MANUAL_REVIEW_REQUIRED; inconsistência bloqueia entrada sem abandonar proteção verificável ou inventar preço/liquidação. Correções compensatórias, shadow isolado, sem efeitos duplicados. Banco/contratos técnicos para ARCH-001.
- DEC-062: stop2%/take4% do preço efetivo de entrada fixos toda posição; sem trailing, breakeven ou ajuste automático. Saídas estratégicas mantidas, gaps/ambiguidades conforme DEC-023/REQ-098. Origem/proteções auditáveis, não alteradas por promoção/rollback/notícia/regime; inconsistência exige recuperação/revisão. Apertar proteção em DEC-024 é extensão não habilitada no MVP.

## Pendências residuais e prontidão
REQ-043 APPROVED como especificação funcional. REQ-044 PENDING apenas porque o detalhamento das avaliações hipotéticas de oportunidades não executadas não foi aprovado por esta tarefa; isolamento shadow e recuperação/reconciliação funcional estão aprovados. REQ-031 mantém contratos técnicos de integração; ARCH-001 mínima aprovada em DEC-063: TypeScript/Node24/NestJS/Jest, SQLite e decimal financeiro previstos; React/Vite/Three.js posteriores. Contratos técnicos de persistência/atomicidade/recuperação permanecem para incrementos pertinentes; fundação e indicadores entregues em MVP-001-A/B.
Intervalos/algoritmos de geração/mutação, ciclos, estatística complementar e recuperação excepcional LEARN continuam pendentes para quando necessários. Evidências experimentais, incluindo REQ-100, permanecem NOT_EXECUTED/PENDING_VERIFICATION. Não iniciar novo ciclo de especificação sem bloqueio concreto. Essas pendências serão tratadas quando necessárias nos incrementos posteriores. Three.js integra a stack aprovada para fase posterior, sem implementação.

## Componentes entregues e verificações reais — MVP-001-A histórico
- Fundação: package.json/lock, TypeScript strict, Jest e scripts build/test:coverage/smoke; AppModule e SimulationModule configuráveis em contexto NestJS standalone sem HTTP.
- Relógio: timestamp inicial explícito UTC/alinhado, passos exatos300.000ms, snapshots/intervalos imutáveis, calendário e limites validados; sem Date.now() nas decisões.
- Candles: seed explícita, estados independentes BTC/ETH, OHLC válido/positivo e volume não negativo,8 casas canônicas com bigint escalado; somente intervalos fechados, sem preview ou regime. Replay desde configuração inicial e passos; sem persistência/retomada durável.
- npm run test:coverage: PASS,30 testes em2 suítes; linhas95,6% global e100% em clock.ts/candle.ts/seeded-generator.ts, statements96,19%, branches94,11%. Quatro linhas CLI em main.ts não cobertas pelo Jest; CLI exercitada pelo smoke real. Cobertura medida sobre todos os arquivos src, sem exclusão para elevar percentual.
- Cobertura focada: intervalos/UTC/virada do dia/ano-limite, entradas inválidas, ordem cronológica, OHLCV por400 passos de integridade, independência por preço inicial de ativo, replay/seed alternativa, ausência de futuro e de Math.random/Date.now nos componentes, imutabilidade, ciclo de vida real NestJS e fechamento inclusive após erro de geração.
- npm run build: PASS após fixação das dependências finais. npm run smoke: PASS/exit0, seed bot-crypto-mvp-001-a-v1, início2026-01-01T00:00:00.000Z,3 intervalos/6 candles até00:15UTC, contexto encerrado. Sem gravação de operação financeira/rede de aplicação.
- Primeira verificação detectou incompatibilidade ESM NestJS12/Jest; corrigida dentro da allowlist fixando NestJS11.1.15. Verificação final aprovada, sem alterar instalações globais.

## Limitações e componentes não implementados — MVP-001-A histórico
Gerador inicial é fixture de infraestrutura, não implementa/valida seis cenários oficiais, warmup150h, agregação horária ou eventos contextuais. PRNG simples e determinístico, sem alegação de realismo de mercado ou uso criptográfico. Não há indicadores, scores/sinais, ordens/orçamento/proteções executáveis, SQLite/ledger, biblioteca decimal financeira, aprendizado/LEARN-GATE implementado, frontend ou3D. Cálculo bigint dos preços sintéticos não é contabilidade financeira. Simulação financeira e evidência REQ-100: NOT_EXECUTED/PENDING_VERIFICATION. Gates e requisitos permanecem intactos.

## Tarefa em andamento e próxima tarefa — MVP-001-A histórico
MVP-001-A concluída e validada. Próximo incremento MVP-001-B mediante tarefa própria; não iniciado automaticamente. Pendências LEARN/OPS e evidências experimentais mantidas para quando necessárias. Não abrir especificação adicional sem bloqueio concreto. Nenhum commit/push autorizado nesta tarefa.

## Arquivos desta tarefa — MVP-001-A histórico
Criados: package.json, package-lock.json, tsconfig.json, jest.config.cjs, .gitignore, src/main.ts, src/app.module.ts, src/simulation/clock.ts, src/simulation/candle.ts, src/simulation/seeded-generator.ts, test/simulation/clock.spec.ts e test/simulation/seeded-generator.spec.ts.
Modificados: docs/DECISIONS.md, docs/ARCHITECTURE.md e docs/DEVELOPMENT_STATE.md. Todos os demais arquivos rastreados preservados. node_modules/dist são artefatos locais ignorados da instalação/build autorizados; nenhum arquivo versionável adicional.

## Git real e publicação — MVP-001-A histórico
BASELINE_BRANCH: master
BASELINE_HEAD: 4424b4654a0dd531e699776d35d13f60f1d78e0a
Baseline/branch preservadas, alterações deste incremento somente locais. Staging vazio. Nenhum fetch/pull, commit ou push nesta tarefa.

## Validação final — MVP-001-A histórico
DEC-001 a DEC-062 preservadas integralmente; DEC-063 única/sequencial. Requisitos, limites financeiros, fórmulas/gates e V1/V2/V3 não alterados. Somente os12 arquivos novos e3 documentos autorizados; artefatos de dependências/build ignorados. git diff --check: PASS; staging vazio. Build/testes/smoke conforme resultados acima, sem simulação financeira ou alegação de rentabilidade.
IMPLEMENTATION: MVP_001_A_IMPLEMENTED_ONLY. TESTS: PASS_30. SIMULATION: SYNTHETIC_CANDLES_ONLY. FINANCIAL_SIMULATION: NOT_EXECUTED. REQ-100_EVIDENCE: NOT_EXECUTED/PENDING_VERIFICATION. NEXT: MVP-001-B. COMMIT: NONE. PUSH: NONE.

## Localização operacional após BOT-CRYPTO-REPO-SPLIT-001
Diretório oficial atual e raiz Git: `D:\04-Projetos\30-bot-crypto-agence\backend`.
Pasta principal do workspace: `D:\04-Projetos\30-bot-crypto-agence`, contendo backend/ e front/; front/ permanece fora do repositório e vazia como no preflight. README e links relativos acompanham o repositório sem necessidade de edição.
Repositório atual transferido localmente com .git, documentos, código, testes, configurações, alterações não commitadas, dependências e artefatos ignorados. Inventário final: 9.908 arquivos e 1.319 diretórios do backend; HEAD master/4424b4654a0dd531e699776d35d13f60f1d78e0a preservado, origin inalterado, sem novo histórico, staging, commit ou push. Diretório .git vazio remanescente na origem removido sem recursão; conteúdo Git íntegro em backend/.
Usar a nova raiz para comandos e próximas tarefas. Registros anteriores de diretório e resultados de MVP-001-A permanecem históricos. .gitignore não alterado nesta relocalização; bloqueio da revisão anterior continua pendente.
