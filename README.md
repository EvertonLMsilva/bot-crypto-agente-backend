# BOT CRUPTO

Aplicação web planejada como escritório virtual 3D de análise de criptomoedas, com personagens que refletem eventos reais de uma simulação. Capital exclusivamente fictício; nenhuma operação financeira real.

## MVP funcional aprovado
Exatamente cinco agentes lógicos: Analista Central de Inteligência, especialistas BTC e ETH, Coordenador de Oportunidades e Gestor de Orçamento. Simulador, execução e auditoria são componentes separados. SOL e expansão lateral ficam para evolução futura.

Um andar, mesas por especialista, salas centrais da Central e do Gestor, Coordenador e painel compartilhado; câmera orbit/zoom/pan e interações. Iniciar, pausar, avançar 5 minutos, velocidade e reinício confirmado. Animações não executam lógica financeira. Three.js permanece PROPOSED; engine e stack não foram escolhidas.

## Simulação, sinais e aprendizado
Candles fechados de 5 minutos para operações e de 1 hora para regime; 12 candles válidos por horário, UTC 24/7. Três famílias iniciais por ativo: tendência, rompimento e reversão à média. SIGNAL-005.1–005.10 define indicadores, T/R/C/A, seleção interna, H por política, half-up e saídas por origem. Pesos globais 35/25/15/15/10 e limiar 70 preservados; H operacional inicial zero em UNVALIDATED. H calculado positivo não autoriza ativação automática: máquina de estados/bootstrap permanecem pendentes.

Aquecimento de 150 horários, desenvolvimento de 90 dias, validação 3x30 e monitoramento 2x30: 240 dias mais aquecimento. Cada validação contém os seis cenários, 5 dias cada, em ordens alternadas V1/V2/V3, com carteiras independentes de 10.000 UC e trajetórias/sementes distintas. Sem manipular amostra; insuficiência gera INSUFFICIENT_EVIDENCE.

LEARN-GATE, limites financeiros e OPS-002 preservados: spot-long simulado sem alavancagem/short; uma posição por ativo; capital compartilhado 10.000 UC, exposição20%/40%, risco1%/2%, perda diária3%; stop2%, take4%, taxa0,10% e deslizamento0,05% por execução. Autorização separada e entrada na próxima abertura elegível, sem retroatividade. Score não é probabilidade e risco planejado não garante perda máxima.

## Estado e retomada
Planejamento funcional consolidado pela DOCS-007-R2; implementação NOT_STARTED, simulações/build/testes de código não executados. Baseline master/0feccd4b35cd12422c6dca24e7723b0edb3b1ace (GIT-004), com alterações DOCS-007-R2 locais não commitadas. Histórico preservado no checkpoint. Repositório: [EvertonLMsilva/bot-crypto-agente](https://github.com/EvertonLMsilva/bot-crypto-agente).

Antes de prosseguir, ler contexto, decisões e checkpoint. Oito pendências explícitas, incluindo ativação/bootstrap de H, bordas matemáticas, precisão/ordenação, avaliação adicional e oportunidades com H=0, precisam de especificação. Esta tarefa não autoriza implementação, simulação, commit ou push.

## Documentação
- [Instruções permanentes](AGENTS.md)
- [Contexto e referência visual](docs/PROJECT_CONTEXT.md)
- [Requisitos e pendências](docs/REQUIREMENTS.md)
- [Arquitetura conceitual](docs/ARCHITECTURE.md)
- [Decisões e fórmulas](docs/DECISIONS.md)
- [Roadmap](docs/ROADMAP.md)
- [Checkpoint](docs/DEVELOPMENT_STATE.md)
