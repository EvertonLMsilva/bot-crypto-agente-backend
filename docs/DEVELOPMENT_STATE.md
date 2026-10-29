# Checkpoint operacional

LAST_UPDATED: 2026-10-29
PROJECT: BOT CRUPTO
DIRECTORY: D:\04-Projetos\30-bot-crypto-agence
CURRENT_PHASE: PLANNING
PHASE: 0 — Planejamento
MVP: REQUIREMENTS_IN_PROGRESS
IMPLEMENTATION: NOT_STARTED
CENTRALIZED_BUDGET: APPROVED
BUDGET_POLICY: APPROVED
FINANCIAL_POLICY: APPROVED
NEXT_CANDLE_EXECUTION: APPROVED
CONSERVATIVE_INTRABAR_STOP_TAKE: APPROVED
OPS-002: APPROVED
PERSISTENT_AUDIT: APPROVED
SIGNAL_POLICY: FUNCTIONAL_STRUCTURE_APPROVED; CALIBRATION_PENDING
SIGNAL-001: APPROVED
SIGNAL-002: APPROVED
SIGNAL-003: APPROVED
SIGNAL-004: APPROVED
SIGNAL_CALIBRATION_DETAILS: PENDING
LEARNING_QUANTITATIVE_DETAILS: APPROVED_POLICIES; RESIDUAL_DETAILS_PENDING
LEARN-004: APPROVED
LEARN_RETURN_METRIC: APPROVED
LEARN_VALIDATION_WINDOWS: APPROVED
LEARN_CANDIDATE_GENERATION_POLICY: APPROVED
LEARN_DRAWDOWN_POLICY: APPROVED
LEARN_POST_PROMOTION_MONITORING: APPROVED
LEARN_ROLLBACK_POLICY: APPROVED
LEARN_STATISTICAL_DETAILS: PARTIALLY_PENDING
SIGNAL_CALIBRATION: PENDING
OPS_RELIABILITY: PENDING
MVP_SCOPE: PENDING
FINAL_LEARNING_ALGORITHMS: PENDING
TECHNICAL_ARCHITECTURE: PENDING
ARCHITECTURE: CONCEPTUAL_RESPONSIBILITIES_APPROVED; TECHNICAL_DEFINITION_PENDING
MARKET_DATA: SIMULATED_FIRST
CENTRAL_INTELLIGENCE: CONCEPT_APPROVED
SPECIALIST_AGENTS: CONCEPT_APPROVED
COORDINATOR: CONCEPT_APPROVED
LEARNING: CONTROLLED_AUTONOMOUS_APPROVED
PROMOTION_GATES: INITIAL_PARAMETERS_APPROVED
TRADING_POLICY: INITIAL_SPOT_SIMULATION_APPROVED; OPERATIONAL_DETAILS_PENDING
TESTS: NOT_EXECUTED
NEXT: MVP_SCOPE_001

## Última tarefa
BOT-CRYPTO-DOCS-006 — DOCUMENTATION_ONLY.
STATUS: DONE — LEARN-004 consolidado, sem implementação, commit ou push.

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

## Inspeção atual
Antes da DOCS-006: raiz oficial, branch master, HEAD esperado aa9c24a94a234a6f164b183364efc72146f834d1, origin e referência local origin/master confirmados. Staging/árvore limpos, sem conflitos; oito documentos, nenhuma implementação, histórico dos três commits GIT-001/GIT-002/GIT-003. Sem mudanças locais anteriores a reconciliar. Documentação existente consultada. Nenhuma consulta remota, API ou integração executada nesta tarefa documental. Aprovações são requisitos, não comprovação de capacidades implementadas.

## Aprovações consolidadas
- Capital 10.000 UC centralizado compartilhado, sem saldo permanente por agente; exposição individual 20% e consolidada 40%; risco planejado 1% por operação e 2% aberto.
- Perda diária máxima de referência 3% sobre patrimônio do início do dia UTC (00:00), considerando redução patrimonial/perdas não realizadas e bloqueando novas entradas. Custos/distância à proteção no risco; gaps/deslizamentos podem exceder planejamento.
- Apenas spot simulado, sem alavancagem/venda descoberta/operação real. Sinais de candles fechados; entrada autorizada na próxima abertura elegível; sem retroatividade.
- OPS-002: stop 2%, take 4%, taxa 0,10% e deslizamento 0,05% por execução; uma posição por ativo; saída integral; estratégia na próxima abertura e proteção OHLC conservadora.
- Stop obrigatório e vínculo à estratégia/versão; promoção/rollback preservam posições e proteção. Parâmetros versionados, candidatas sujeitas ao LEARN-GATE completo, sem alteração autônoma de limites/gates.
- Contabilidade/auditoria persistentes e idempotentes; ajustes preservam originais; rastreabilidade completa; avaliações hipotéticas separadas; aprendizado exclusivo do responsável.

## Aprovações de sinais e aprendizado — DOCS-005
- SIGNAL-001: política adaptativa de seleção/combinação versionada, múltiplas estratégias exclusivas por ativo, evolução só por LEARN-GATE; famílias apenas propostas.
- SIGNAL-002: regimes/dimensões determinísticos; T/R/C/H/A normalizados 0–100, pesos globais 35/25/15/15/10; S = round(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A), limiar 70 e elegibilidade obrigatória. Não é probabilidade, autorização, garantia ou risco suficiente. Pesos/limiar não alteráveis autonomamente; H com histórico insuficiente sem valor obrigatório inventado.
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

## Tarefa em andamento e próxima tarefa
Nenhuma tarefa de execução em andamento após consolidação. Próximo passo de versionamento: GIT-004, mediante tarefa autorizada; ainda não executado. Próximo tópico funcional: MVP_SCOPE_001, sem autorização implícita para implementação. Roadmap permanece PROPOSED e não implementado.

## Pendências restantes
- SIGNAL-005: cálculos internos T/R/C/H/A, indicadores/normalizações, aquecimento/histórico insuficiente, estratégias técnicas concretas. H=50 não obrigatório; heurísticas anteriores continuam propostas, sem aprovação implícita.
- MVP-SCOPE-001: ativos/agentes iniciais, timeframes, cenários e duração concreta das janelas, configurações iniciais por agente. MVP_SCOPE: PENDING.
- LEARN: intervalos exatos mutáveis, algoritmos concretos, frequência operacional detalhada, estatística complementar e exceções/recuperação de avaliações interrompidas. LEARN_STATISTICAL_DETAILS: PARTIALLY_PENDING; REQ-033 não deixa métricas/políticas já aprovadas em aberto.
- OPS-003: precisão/arredondamento, reconciliação, recuperação após falhas/dados indisponíveis, detalhes restantes de reservas/ordens e redimensionamento/rejeição; REQ-043/REQ-044. Proteção, expiração/liberação e bloqueios aprovados continuam vigentes.
- ARCH-001: tecnologias/contratos/persistência/execução local/infraestrutura, hardware/desempenho, segurança/observabilidade; fontes futuras. Three.js PROPOSED; visual final/câmera pendentes.
- Fórmula antiga 40/35/25 e faixas financeiras por nota continuam não aprovadas; sem confundir com a fórmula global vigente.

## Bloqueios e limitações
Sem bloqueio documental. Pendências não impedem esta consolidação, mas precisam de definição antes da implementação pertinente. Nenhum código, instalação, API externa ou operação executada. Imagem de referência permanece externa conforme PROJECT_CONTEXT.md. Gates são guardrails simulados, não prova de eficácia ou segurança real.

## Arquivos atualizados nesta tarefa
- AGENTS.md
- README.md
- docs/PROJECT_CONTEXT.md
- docs/REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/DEVELOPMENT_STATE.md
Nenhum arquivo criado ou modificado fora da allowlist.

## Git real e publicação
REPOSITORY: https://github.com/EvertonLMsilva/bot-crypto-agente
ORIGIN: https://github.com/EvertonLMsilva/bot-crypto-agente.git
BRANCH: master
HEAD: aa9c24a94a234a6f164b183364efc72146f834d1
UPSTREAM: origin/master
LOCAL_REMOTE_TRACKING_HEAD: aa9c24a94a234a6f164b183364efc72146f834d1
LAST_CONFIRMED_REMOTE_COMMIT: aa9c24a94a234a6f164b183364efc72146f834d1 (GIT-003 / baseline da tarefa confirmada localmente)
Nenhuma consulta remota, fetch ou API externa nesta tarefa. Referência origin/master é evidência local, não nova confirmação do servidor. Alterações DOCS-006 somente na árvore de trabalho, staging vazio; não publicadas. DOCS-005 já publicada conforme histórico GIT-003; nenhum commit DOCS-006/GIT-004 criado. HEAD, rastreamento e configuração preservados, sem commit/push.

## Validação
Oito documentos e links relativos conferidos; decisões/requisitos com IDs únicos e referências válidas. Histórico DEC-001 a DEC-029 preservado integralmente, incluindo DEC-016 sem qualquer mudança. Fórmulas, limites, amostras, fronteiras e distinção suspensão/rollback conferidos. 19 aceites LEARN mapeados para requisitos existentes/novos, preservando 16 CA e 23 SIG. Pendências explícitas; diff restrito à allowlist e sem erros de whitespace. Sem código, arquivos adicionais, instalações, commit ou push.
Testes de software: NOT_EXECUTED — tarefa exclusivamente documental; aceites registrados não são testes executados.
