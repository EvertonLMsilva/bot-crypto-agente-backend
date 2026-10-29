# BOT CRUPTO

Aplicação web planejada como escritório virtual 3D. O MVP-001 terá personagens que refletem atividades reais de uma simulação, com capital exclusivamente fictício e nenhuma operação financeira real.

## Funcionamento aprovado
O Analista Central de Inteligência organiza e contextualiza dados e acontecimentos simulados. Especialistas autônomos exclusivos por ativo integram esse contexto às próprias estratégias. O Coordenador de Oportunidades ordena sinais sem refazer análises ou alterar pontuações. O Gestor de Orçamento avalia pedidos de capital fictício segundo política inicial aprovada (DEC-020). Operações simuladas geram resultados auditáveis para aprendizado individual, estratégias versionadas, validação independente e promoção/reversão automática controlada apenas na simulação.

## Política inicial aprovada
10.000 UC fictícias compartilhadas; exposição individual 20% e consolidada 40%; risco planejado 1% por operação e 2% aberto; perda diária de referência 3% do patrimônio inicial do dia UTC. Spot simulado, sem alavancagem ou venda descoberta. Entrada na próxima abertura elegível autorizada, stop inicial 2%, take 4%, taxa 0,10% e deslizamento 0,05% por execução. Proteções OHLC conservadoras, auditoria persistente e proteção durante evolução. Gaps/deslizamentos podem superar o risco planejado. Especificação completa e pendências em [decisões](docs/DECISIONS.md) e [requisitos](docs/REQUIREMENTS.md).

Repositório: [EvertonLMsilva/bot-crypto-agente](https://github.com/EvertonLMsilva/bot-crypto-agente).

## Sinais e aprendizado aprovados
Especialistas selecionam múltiplas estratégias conforme regime/contexto, com política versionada. Fórmula global 0–100: T 35%, R 25%, C 15%, H 15%, A 10%; ENTRY_CANDIDATE exige nota >=70 e demais critérios, com autorização financeira separada. Nota não representa probabilidade de lucro. Uma política ativa e até três candidatas por ciclo/agente, estas sem consumir capital oficial; baseline inicial UNVALIDATED e promoções sujeitas ao LEARN-GATE. Tipos: ENTRY_CANDIDATE, EXIT_REQUEST, HOLD, WAIT e RISK_ALERT. Abertura de entrada perdida expira o sinal, libera reserva idempotentemente e exige nova análise/autorização; saída perdida exige reavaliação. Ordenação por nota, tempo simulado, rodízio e ID estável. Indicadores, algoritmos e calibração interna permanecem pendentes em [requisitos](docs/REQUIREMENTS.md).

## Validação do aprendizado — LEARN-004
Comparação por retorno líquido patrimonial, em três períodos cronológicos de mesma duração e carteiras independentes de 10.000 UC. Desenvolvimento/ajuste separados da validação final reservada; até uma desafiante final por ciclo e histórico de todas as tentativas. Avaliar o pior drawdown dos períodos e manter DEC-016 integral. Pós-promoção, degradação exige duas janelas consecutivas com pelo menos 20 operações encerradas da promovida em cada uma e desvantagem de pelo menos 1 p.p. em ambas. Violações críticas suspendem novas entradas imediatamente. Rollback preserva posições/proteções e usa versão anterior apenas íntegra/elegível; sem versão segura, mantém suspensão. Durações concretas, intervalos mutáveis, algoritmos e estatística complementar continuam pendentes em [decisões](docs/DECISIONS.md).

## Estado atual
Planejamento do MVP-001, requisitos em consolidação. DOCS-001/002 criaram a base; GIT-001 publicou o primeiro commit; DOCS-004 consolidou finanças/operações e GIT-002 publicou esse conteúdo em 4bba447862703bba1d99570a738621c269139c3e. DOCS-005 consolidou SIGNAL-001 a SIGNAL-004, publicada pela GIT-003 em aa9c24a94a234a6f164b183364efc72146f834d1. DOCS-006 consolida LEARN-004, com alterações documentais locais não commitadas. Sem evidência local de DOCS-003. Inspeção: oito documentos, master no HEAD aa9c24a94a234a6f164b183364efc72146f834d1, nenhuma aplicação implementada. Aprovações não comprovam capacidades executáveis.

## Visual e tecnologias
Referência aprovada: um andar, análise/coordenação e orçamento no centro, mesas ao redor e expansão lateral. Visual final dos personagens/salas pendente. Three.js: PROPOSED. Frontend definitivo, backend, persistência, IA e infraestrutura não escolhidos. Dados e notícias reais somente em fase posterior, preservando contratos dos especialistas. MVP sem dependência de APIs externas pagas.

## Documentação
- [Instruções permanentes](AGENTS.md)
- [Contexto e referência visual](docs/PROJECT_CONTEXT.md)
- [Requisitos](docs/REQUIREMENTS.md)
- [Arquitetura conceitual](docs/ARCHITECTURE.md)
- [Histórico de decisões](docs/DECISIONS.md)
- [Roadmap proposto](docs/ROADMAP.md)
- [Checkpoint do desenvolvimento](docs/DEVELOPMENT_STATE.md)

## Retomar
Ler contexto, decisões e checkpoint; consultar demais documentos conforme o escopo. Próximo passo funcional: MVP_SCOPE_001 — definir ativos/agentes, timeframes, cenários, duração das janelas e configurações iniciais. Publicação documental desta tarefa depende da GIT-004, ainda não executada. Esta tarefa não autoriza desenvolvimento, instalações, integrações ou commits. Não há comandos de execução ou testes de aplicação disponíveis.
