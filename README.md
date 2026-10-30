# BOT CRYPTO

Aplicação web planejada como escritório virtual 3D de análise de criptomoedas, com personagens que refletem eventos reais de uma simulação. Capital exclusivamente fictício; nenhuma operação financeira real.

## MVP funcional aprovado
Exatamente cinco agentes lógicos: Analista Central de Inteligência, especialistas BTC e ETH, Coordenador de Oportunidades e Gestor de Orçamento. Simulador, execução e auditoria são componentes separados. SOL e expansão lateral ficam para evolução futura.

Um andar, mesas por especialista, salas centrais da Central e do Gestor, Coordenador e painel compartilhado; câmera orbit/zoom/pan e interações. Iniciar, pausar, avançar 5 minutos, velocidade e reinício confirmado. Animações não executam lógica financeira. Three.js permanece PROPOSED; engine e stack não foram escolhidas.

## Simulação, sinais e aprendizado
Candles fechados de 5 minutos para operações e de 1 hora para regime; 12 candles válidos por horário, UTC 24/7. Três famílias iniciais por ativo: tendência, rompimento e reversão à média. SIGNAL-005.1–005.10 define indicadores, T/R/C/A, seleção interna, H por política, half-up e saídas por origem. Pesos globais 35/25/15/15/10 e limiar 70 preservados; H operacional inicial zero em UNVALIDATED. H calculado positivo não autoriza ativação automática: estados e bootstrap aprovados em DEC-051/DEC-052, ainda não implementados.

Aquecimento de 150 horários, desenvolvimento de 90 dias, validação 3x30 e monitoramento 2x30: 240 dias mais aquecimento. Cada validação contém os seis cenários, 5 dias cada, em ordens alternadas V1/V2/V3, com carteiras independentes de 10.000 UC e trajetórias/sementes distintas. Sem manipular amostra; insuficiência gera INSUFFICIENT_EVIDENCE.

LEARN-GATE, limites financeiros e OPS-002 preservados: spot-long simulado sem alavancagem/short; uma posição por ativo; capital compartilhado 10.000 UC, exposição20%/40%, risco1%/2%, perda diária3%; stop2%, take4%, taxa0,10% e deslizamento0,05% por execução. Autorização separada e entrada na próxima abertura elegível, sem retroatividade. Score não é probabilidade e risco planejado não garante perda máxima.

## Estado e retomada
Planejamento funcional consolidado pela DOCS-007-R2 e detalhado na DOCS-008 (DEC-051 a DEC-058 / REQ-093 a REQ-100 APPROVED quanto à especificação). Implementação NOT_STARTED; simulações/build/testes de código não executados. Baseline observada master/e44ea76cbf855cd07d55c5a500916237da170ea5; DOCS-008 somente local, sem commit/push. Histórico no checkpoint. Repositório: [EvertonLMsilva/bot-crypto-agente](https://github.com/EvertonLMsilva/bot-crypto-agente).

Antes de prosseguir, ler contexto, decisões e checkpoint. Ativação de H, bootstrap, indicadores, precisão, eventos, ordem temporal, avaliação adicional e protocolo H=0 estão especificados; contratos técnicos, algoritmos/intervalos de mutação e detalhes residuais LEARN/OPS-003/ARCH-001 permanecem pendentes. REQ-100: protocolo APPROVED_SPEC, evidência operacional/empírica NOT_EXECUTED/PENDING_VERIFICATION; possibilidade algébrica não comprova frequência ou rentabilidade. Avaliação adicional de90 dias é condicional, sem alterar baseline240 dias. Esta tarefa não autoriza implementação, simulação, commit ou push.

## Documentação
- [Instruções permanentes](AGENTS.md)
- [Contexto e referência visual](docs/PROJECT_CONTEXT.md)
- [Requisitos e pendências](docs/REQUIREMENTS.md)
- [Arquitetura conceitual](docs/ARCHITECTURE.md)
- [Decisões e fórmulas](docs/DECISIONS.md)
- [Roadmap](docs/ROADMAP.md)
- [Checkpoint](docs/DEVELOPMENT_STATE.md)
