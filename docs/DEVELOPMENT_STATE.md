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
LEARNING_QUANTITATIVE_DETAILS: PENDING
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
NEXT: REVIEW_REMAINING_MVP_REQUIREMENTS

## Última tarefa
BOT-CRYPTO-DOCS-005 — DOCUMENTATION_ONLY.
STATUS: DONE — SIGNAL-001 a SIGNAL-004 consolidados, sem implementação, commit ou push.

## Histórico preservado
- DOCS-001: oito documentos criados a partir de raiz vazia, sem Git/implementação; seis decisões aprovadas e Three.js proposto; layout central, expansão lateral e imagem de referência documentados. Nenhuma instrução preexistente local/ancestral encontrada naquela inspeção.
- DOCS-002: DEC-008 a DEC-019, REQ-018 a REQ-034 e reconciliação dos anteriores; inteligência contextual, autonomia exclusiva, coordenação e aprendizado controlado; roadmap proposto e implementação ausente.
- GIT-001: único commit inicial f034f9d010e573659aa80ba0720080bcb70b7088, mensagem `docs: bootstrap BOT CRUPTO project documentation`, oito documentos publicados e rastreamento origin/master configurado. O checkpoint publicado ainda dizia “Git não inicializado” porque a tarefa GIT-001 proibiu alterar documentação; situação real reconciliada aqui.
- DOCS-003: nenhuma evidência local de execução nos documentos, histórico Git ou mudanças locais antes da DOCS-004. Não presumir execução ausente do histórico.
- DOCS-004: DEC-020 a DEC-025, REQ-035 a REQ-060, atualizações de DEC-017/DEC-018 e REQ-008/REQ-009/REQ-015/REQ-030/REQ-032. DEC-016 integralmente preservada.
- GIT-002: DOCS-004 publicada em 4bba447862703bba1d99570a738621c269139c3e, mensagem `docs: consolidate budget and simulated trading requirements`, pai f034f9d010e573659aa80ba0720080bcb70b7088; único commit novo e publicação confirmados na tarefa GIT-002. É a baseline confirmada da DOCS-005. O checkpoint anteriormente publicado retratava a etapa DOCS-004 anterior ao commit; agora reconciliado.
- DOCS-005: DEC-026 a DEC-029 vinculadas a SIGNAL-001 a SIGNAL-004, REQ-061 a REQ-071; REQ-023/REQ-025/REQ-031/REQ-033/REQ-036/REQ-041/REQ-042/REQ-043/REQ-057 atualizados. 23 aceites SIG mapeados sem registros duplicados. DEC-016 e DEC-020 a DEC-025 preservadas integralmente.

## Inspeção atual
Raiz, branch, HEAD, origin e status confirmados. Antes da DOCS-005, árvore e staging limpos, oito documentos e nenhuma implementação; histórico local com os dois commits GIT-001/GIT-002, HEAD e origin/master locais em 4bba447862703bba1d99570a738621c269139c3e. Sem conflitos. Nenhuma alteração local anterior a reconciliar. Documentos existentes lidos; sem decisão conflitante não conciliável. Aprovações desta tarefa são fonte da consolidação, não comprovação de implementação. Nenhuma consulta remota ou API externa executada nesta tarefa documental.

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

## Tarefa em andamento e próxima tarefa
Nenhuma tarefa de execução em andamento após esta consolidação. Próxima: REVIEW_REMAINING_MVP_REQUIREMENTS — revisar lacunas restantes e fechar especificação do MVP sem presumir autorização de implementação. Roadmap mantém fases PROPOSED, nenhuma entregue.

## Pendências
- Quantidade definitiva de ativos/agentes, horizonte temporal dos candles e estratégias técnicas concretas/parametrizações.
- Indicadores, limiares e normalizações internos; cálculo exato de T/R/C/H/A, dependências quantitativas entre estratégias e tratamento numérico do histórico inicial não validado. EMA 20/50, ADX 14/20, ATR 14, percentil 75/janela e 150 candles são propostas não aprovadas; H=50 não obrigatório.
- Frequência de ciclos/mutações, geração/ajuste das candidatas, métricas precisas do LEARN-GATE, estatística complementar, limites de pesquisa/sobreajuste, monitoramento quantitativo pós-promoção e rollback por degradação. REQ-033 continua PENDING nos detalhes.
- Regras restantes REQ-043/REQ-044: ciclo completo da ordem, reservas/contingências não especificadas, recuperação após falhas/dados ausentes, precisão/arredondamento/reconciliação, redimensionamento/rejeição, apertar proteção e avaliações hipotéticas detalhadas. Expiração de ENTRY e reavaliação de EXIT já aprovadas, não mais escolha aberta de reagendamento.
- Arquitetura técnica, stack, contratos, persistência/comunicação, infraestrutura, hardware/desempenho, observabilidade/segurança, fontes futuras e IA/execução local. Three.js PROPOSED; visual final/câmera ainda sujeitos à definição.
- Fórmula antiga 40/35/25 e faixas financeiras por nota não aprovadas. Não confundir com a nova fórmula global aprovada.

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
HEAD: 4bba447862703bba1d99570a738621c269139c3e
UPSTREAM: origin/master
LOCAL_REMOTE_TRACKING_HEAD: 4bba447862703bba1d99570a738621c269139c3e
LAST_CONFIRMED_REMOTE_COMMIT: 4bba447862703bba1d99570a738621c269139c3e (GIT-002 / baseline informada e confirmada localmente)
Nenhuma consulta remota, fetch ou API externa nesta tarefa. Referência origin/master é evidência local, não nova confirmação do servidor. Alterações DOCS-005 somente na árvore de trabalho, staging vazio; não publicadas. DOCS-004 já publicada conforme histórico GIT-002. HEAD, rastreamento e configuração preservados, sem commit/push.

## Validação
Integridade dos oito documentos, links relativos, IDs únicos, rastreabilidade, aceites CA-01 a CA-16 preservados e SIG-A01 a SIG-A23 mapeados para requisitos reais sem duplicações. Fórmula/limiar, status e pendências conferidos; DEC-016 e DEC-020 a DEC-025 idênticas ao HEAD, com todo o histórico anterior preservado. Diff limitado à allowlist, sem código ou arquivos adicionais; Git preservado.
Testes de software: NOT_EXECUTED — tarefa exclusivamente documental. Critérios de aceite registrados não são resultados de testes.
