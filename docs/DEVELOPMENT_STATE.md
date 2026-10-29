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
SIGNAL_POLICY: PENDING
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
NEXT: FINALIZAR_SINAIS_PONTUACAO_E_ESTRATEGIAS_INICIAIS

## Última tarefa
BOT-CRYPTO-DOCS-004 — DOCUMENTATION_CONSOLIDATION_ONLY.
STATUS: DONE — consolidação documental, sem implementação, commit ou push.

## Histórico preservado
- DOCS-001: oito documentos criados a partir de raiz vazia, sem Git/implementação; seis decisões aprovadas e Three.js proposto; layout central, expansão lateral e imagem de referência documentados. Nenhuma instrução preexistente local/ancestral encontrada naquela inspeção.
- DOCS-002: DEC-008 a DEC-019, REQ-018 a REQ-034 e reconciliação dos anteriores; inteligência contextual, autonomia exclusiva, coordenação e aprendizado controlado; roadmap proposto e implementação ausente.
- GIT-001: único commit inicial f034f9d010e573659aa80ba0720080bcb70b7088, mensagem `docs: bootstrap BOT CRUPTO project documentation`, oito documentos publicados e rastreamento origin/master configurado. O checkpoint publicado ainda dizia “Git não inicializado” porque a tarefa GIT-001 proibiu alterar documentação; situação real reconciliada aqui.
- DOCS-003: nenhuma evidência local de execução nos documentos, histórico Git ou mudanças locais antes da DOCS-004. Não presumir execução ausente do histórico.
- DOCS-004: DEC-020 a DEC-025, REQ-035 a REQ-060, atualizações de DEC-017/DEC-018 e REQ-008/REQ-009/REQ-015/REQ-030/REQ-032. DEC-016 integralmente preservada.

## Inspeção atual
Raiz, branch, HEAD, origin e status confirmados. Antes da tarefa, árvore e staging limpos, oito documentos e nenhuma implementação; histórico com único commit inicial. Nenhuma alteração local anterior a reconciliar. Documentos existentes lidos; sem decisão conflitante não conciliável. Aprovações desta tarefa são fonte da consolidação, não comprovação de implementação.

## Aprovações consolidadas
- Capital 10.000 UC centralizado compartilhado, sem saldo permanente por agente; exposição individual 20% e consolidada 40%; risco planejado 1% por operação e 2% aberto.
- Perda diária máxima de referência 3% sobre patrimônio do início do dia UTC (00:00), considerando redução patrimonial/perdas não realizadas e bloqueando novas entradas. Custos/distância à proteção no risco; gaps/deslizamentos podem exceder planejamento.
- Apenas spot simulado, sem alavancagem/venda descoberta/operação real. Sinais de candles fechados; entrada autorizada na próxima abertura elegível; sem retroatividade.
- OPS-002: stop 2%, take 4%, taxa 0,10% e deslizamento 0,05% por execução; uma posição por ativo; saída integral; estratégia na próxima abertura e proteção OHLC conservadora.
- Stop obrigatório e vínculo à estratégia/versão; promoção/rollback preservam posições e proteção. Parâmetros versionados, candidatas sujeitas ao LEARN-GATE completo, sem alteração autônoma de limites/gates.
- Contabilidade/auditoria persistentes e idempotentes; ajustes preservam originais; rastreabilidade completa; avaliações hipotéticas separadas; aprendizado exclusivo do responsável.

## Tarefa em andamento e próxima tarefa
Nenhuma tarefa de execução em andamento após esta consolidação. Próxima tarefa funcional: finalizar sinais, pontuação comparável 0–100 e estratégias iniciais. Planejamento do MVP continua; fases do roadmap não concluídas.

## Pendências
- Agentes/ativos definitivos, estratégias iniciais, indicadores/pesos, fórmula 0–100, criação/expiração de sinais, desempates e alertas de queda.
- Geração de candidatas, ajuste, métricas exatas do LEARN-GATE, validação estatística complementar, monitoramento quantitativo e rollback por degradação. DEC-016 não relaxada.
- Ciclo completo da ordem, autorização após perder abertura, expiração de reservas, dados indisponíveis, precisão/arredondamento/reconciliação, falhas/recuperação, critérios finais de redimensionamento/rejeição e avaliações hipotéticas detalhadas.
- Stack, contratos concretos, persistência/comunicação, hardware/desempenho, observabilidade/segurança, fontes externas futuras, IA/execução local. Three.js continua PROPOSED. Visual final/câmera continuam sujeitos à definição.
- Fórmula 40/35/25 e faixas de capital vinculadas à pontuação não aprovadas; parâmetros financeiros explicitamente aprovados nesta tarefa não permanecem pendentes.

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
HEAD: f034f9d010e573659aa80ba0720080bcb70b7088
UPSTREAM: origin/master
LOCAL_REMOTE_TRACKING_HEAD: f034f9d010e573659aa80ba0720080bcb70b7088
LAST_CONFIRMED_REMOTE_COMMIT: f034f9d010e573659aa80ba0720080bcb70b7088 (GIT-001 / informação da tarefa)
Nenhuma consulta remota, fetch ou API externa nesta tarefa. Referência origin/master é evidência local, não nova confirmação do servidor. Alterações DOCS-004 somente na árvore de trabalho, staging vazio; não publicadas. HEAD, rastreamento e configuração preservados, sem commit/push.

## Validação
Integridade dos oito documentos, links relativos, IDs únicos, referências decisão/requisito, aceites CA-01 a CA-16 mapeados para REQ-045 a REQ-060, status e pendências conferidos. DEC-016 idêntica à versão do HEAD. Diff limitado à allowlist, sem código ou arquivos adicionais; Git preservado.
Testes de software: NOT_EXECUTED — tarefa exclusivamente documental. Critérios de aceite registrados não são resultados de testes.
