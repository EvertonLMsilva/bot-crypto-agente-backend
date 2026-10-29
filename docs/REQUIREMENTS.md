# Requisitos

Status indica aprovação: APPROVED, PROPOSED ou PENDING; não indica implementação. Nenhum requisito foi implementado. Critérios reproduzem DOCS-001/DOCS-002; ausências ficam a definir. IDs anteriores preservados, alterações rastreadas abaixo.

| ID | Área | Descrição | Status | Critério de aceite | Dependências | Decisão relacionada |
|---|---|---|---|---|---|---|
| REQ-001 | Ambiente virtual 3D | Representar o produto como escritório web 3D. | APPROVED | Escritório com personagens, estações e salas de análise e orçamento. | DEC-001 | DEC-001, DEC-008 |
| REQ-002 | Ambiente virtual 3D | Manter um andar, salas juntas no centro e mesas ao redor; ampliar lateralmente. | APPROVED | Novas mesas não criam outros andares; salas permanecem centrais. | REQ-001, DEC-002 | DEC-002 |
| REQ-003 | Ambiente virtual 3D | Adicionar ativos com mesas e personagens. | APPROVED | Inclusão de ativo acrescenta sua mesa e personagem. | REQ-002, REQ-004 | DEC-004 |
| REQ-004 | Personagens e agentes | Associar cada personagem a um ativo e representar atividades em seus deslocamentos. | APPROVED | Personagem acompanha seu ativo e transita entre mesa e salas conforme a atividade. | REQ-001, REQ-006 | DEC-001, DEC-009, DEC-010 |
| REQ-005 | Monitoramento de criptomoedas | Exibir os ativos investidos em telão compartilhado e permitir acompanhamento nas mesas. | APPROVED | Telão da carteira integra o escritório. | Dados de mercado a definir | DEC-001, DEC-008 |
| REQ-006 | Análise individual | Cada agente analisa fatores relacionados à alta ou queda do seu ativo. | APPROVED | A definir; metodologia e validação pendentes. | Dados e estratégia a definir | DEC-013 |
| REQ-007 | Análise colaborativa | Compartilhar contexto comum sem revisão técnica ou aprovação de estratégias entre ativos. | APPROVED | BTC não revisa ETH nem vice-versa; interpretação pertence ao especialista do ativo. | REQ-006, REQ-019 | DEC-009, DEC-012 |
| REQ-008 | Sala de orçamento | Representar pedidos de capital na sala central de orçamento. | APPROVED | Ambiente central reservado a pedidos de orçamento. Regras de aprovação a definir. | REQ-002, REQ-009 | DEC-018 |
| REQ-009 | Gerenciamento de capital e risco | Definir distribuição de saldo, exposição e limites de perdas. | PENDING | A definir. | Política de capital a definir | DEC-018 |
| REQ-010 | Histórico e rastreabilidade | Registrar propostas, justificativas, contexto, estratégias versionadas, operações simuladas e resultados. | APPROVED | Preservar contexto disponível no momento e versão da estratégia em cada decisão. | REQ-022, REQ-025 | DEC-008, DEC-013, DEC-015 |
| REQ-011 | Segurança e autorizações | Exigir autorização específica para operações financeiras reais. | APPROVED | Não executar operações reais sem autorização específica. | AGENTS.md, política operacional a definir | DEC-006, DEC-008 |
| REQ-012 | Observabilidade e desempenho | Manter deslocamentos curtos e não condicionar processamento ao término da animação. | APPROVED | Nenhuma obrigação de terminar a caminhada antes de processar atividade. Tempo máximo a definir. | REQ-004 | DEC-002, DEC-019 |
| REQ-013 | Observabilidade e desempenho | Definir métricas, alertas, hardware-alvo e capacidade de expansão. | PENDING | A definir. | Arquitetura e orçamento a definir | DEC-019 |
| REQ-014 | Monitoramento de criptomoedas | Manter BTC, ETH e SOL como proposta anterior; quantidade definitiva de agentes pendente. | PROPOSED | A definir. Dados simulados primeiro aprovados em REQ-020. | Composição do MVP a definir | DEC-011 |
| REQ-015 | Gerenciamento de capital e risco | Acompanhar operações com capital exclusivamente fictício e resultados auditáveis. | APPROVED | Nenhuma operação real; regras de entrada/saída, custos e sentido a definir. | REQ-009, REQ-030 | DEC-008, DEC-017 |
| REQ-016 | Ambiente virtual 3D | Permitir aproximação, rotação e seleção de mesas/personagens. | PROPOSED | A definir. | Frontend e MVP a aprovar | DEC-003 |
| REQ-017 | Segurança e autorizações | Definir acesso, proteção de credenciais e permissões por ação. | PENDING | A definir. | Integrações e arquitetura a definir | DEC-019 |
| REQ-018 | Personagens e agentes | Executar autonomamente recepção, análise, oportunidades, sinais, acompanhamento e autoavaliação, sob supervisão. | APPROVED | Estados reais da simulação representados visualmente; animações não determinam resultados. | REQ-004, REQ-006 | DEC-008, DEC-010 |
| REQ-019 | Inteligência contextual | Centralizar coleta, organização, validação e interpretação das categorias financeiras e contextuais de DEC-012. | APPROVED | Resumos registram relevância/riscos, ativos afetados, fontes, timestamps, incerteza e justificativas; distinguem fatos, rumores, hipóteses e interpretações. | REQ-020 | DEC-012 |
| REQ-020 | Dados simulados | Fornecer dados e acontecimentos fictícios identificados, reproduzíveis e disponíveis apenas no tempo devido. | APPROVED | Sem informação futura; provedores reais somente depois, sem alterar contratos dos especialistas; sem dependência de APIs externas pagas. | Contratos concretos pendentes | DEC-011 |
| REQ-021 | Inteligência contextual | Distribuir contexto relevante sem consultas redundantes e preservar limites do Analista Central. | APPROVED | Central não decide compras/vendas, executa, autoriza capital ou substitui especialista; hipóteses não viram fatos ou causalidade comprovada. | REQ-019 | DEC-012 |
| REQ-022 | Análise individual | Combinar técnica e contexto externo conforme estratégia própria por ativo. | APPROVED | Identificar dados/eventos influentes, versão da estratégia e contexto temporal; vedar dados futuros e comparar condições posteriores. | REQ-006, REQ-019, REQ-020 | DEC-009, DEC-013 |
| REQ-023 | Coordenação | Priorizar oportunidades com nota padronizada 0–100 e ordenação determinística comparável entre ativos. | APPROVED | Preservar notas/análises; critérios comuns. Fórmula, limiares e desempates ainda a definir. | REQ-022, REQ-031 | DEC-014 |
| REQ-024 | Coordenação | Separar priorização de reanálise e controle financeiro. | APPROVED | Coordenador não recalcula indicadores, altera conclusões/notas, executa, reserva capital nem substitui gestor. | REQ-023, REQ-030 | DEC-014, DEC-018 |
| REQ-025 | Aprendizado | Manter memória persistente, múltiplas estratégias e histórico individual. | APPROVED | Resultados de ETH não alteram automaticamente BTC; estratégia ativa e candidatas versionadas. | REQ-010 | DEC-015 |
| REQ-026 | Aprendizado | Avaliar candidatas isoladas com validação independente e promoção automática só simulada. | APPROVED | Candidatas não interferem em operações oficiais; promoção somente com todos os critérios de DEC-016. | REQ-025, REQ-027, REQ-028 | DEC-015, DEC-016 |
| REQ-027 | Aprendizado — integridade | Aplicar LEARN-GATE de amostra e integridade. | APPROVED | 60 operações distintas concluídas; pelo menos 3 períodos, mínimo 10 por período; alta/baixa/lateralização e contexto/notícias; separação cronológica, sem futuro ou duplicação de observações; reprodução. | REQ-020, REQ-025 | DEC-016 |
| REQ-028 | Aprendizado — desempenho e risco | Aplicar LEARN-GATE financeiro e de risco. | APPROVED | Líquido positivo após custos; melhoria média mínima 1 ponto percentual; superior em 2 dos 3 períodos; mesmas condições/horizontes/custos; drawdown até 10% e no máximo 2 pontos percentuais acima da ativa; sem violações ou operações não autorizadas; dados inválidos/antecipados invalidam. Acerto isolado não basta. | REQ-027; métricas detalhadas pendentes | DEC-016 |
| REQ-029 | Aprendizado — decisões e segurança | Registrar PROMOTE, REJECT, INSUFFICIENT_EVIDENCE e ROLLBACK, preservando histórico e limites. | APPROVED | Estados conforme DEC-016; perda isolada não muda estratégia; rollback trata posições abertas. Agente não altera código, segurança, limites, contratos, critérios obrigatórios ou autorização. | REQ-026, REQ-028 | DEC-015, DEC-016 |
| REQ-030 | Sala de orçamento | Gestor recebe pedidos priorizados, controla capital fictício, disponibilidade, limites, decisões, reservas/liberações. | APPROVED | Evitar uso duplicado de capital e manter rastreabilidade; coordenador não reserva/autoriza capital. Política detalhada pendente. | REQ-008, REQ-009, REQ-023 | DEC-018 |
| REQ-031 | Coordenação | Definir classificação, geração, validade/expiração, cálculo da nota, pesos e desempates. | PENDING | A definir; fórmula 40/35/25 não aprovada. | REQ-023 | DEC-014 |
| REQ-032 | Operações simuladas | Definir entrada, saída, stop, take profit, dimensionamento, custos e sentido. | PENDING | A definir, incluindo compra, venda e/ou alertas de queda. | REQ-015, REQ-030 | DEC-017 |
| REQ-033 | Aprendizado | Definir geração/ajuste de candidatas, estatística e monitoramento pós-promoção/reversão. | PENDING | A definir; não reduzir LEARN-GATE aprovado. | REQ-026, REQ-029 | DEC-015, DEC-016 |
| REQ-034 | Arquitetura e visualização | Separar responsabilidades e manter frontend 3D como representação de atividades. | APPROVED | Lógica de negócio fora do frontend 3D; contratos preservados na troca de provedores. | REQ-012, REQ-020 | DEC-019 |

## Reconciliação e pendências
- REQ-007: compartilhamento de contexto sem revisão cruzada aprovado (DEC-009).
- REQ-010: rastreabilidade passa de PROPOSED a APPROVED; REQ-015: simulação/capital fictício aprovados, detalhes operacionais pendentes. REQ-014 não fecha ativos ou quantidade do MVP.
- Quantidade definitiva de agentes e estratégias iniciais: PENDING.
- Indicadores, pesos, fórmula 0–100, limiares, validade/expiração e desempates: PENDING.
- Capital, distribuição, risco por operação/ativo e exposição simultânea: PENDING. 10.000 UC, 20% por solicitação, 40% de exposição e faixas por nota são PROPOSED, não aprovados (DEC-018).
- Fórmula 40 tendência / 35 momentum / 25 volume: PROPOSED, não aprovada (DEC-014).
- Tecnologias definitivas de frontend/backend/persistência, comunicação, segurança, IA e infraestrutura: PENDING. Three.js permanece PROPOSED (DEC-007).
- Hardware/metas de desempenho; fontes reais futuras de preços/notícias; visual final dos personagens/salas: PENDING. Layout e referência aprovados preservados.
- Treinamento/ajuste, estatística, métricas/agregação, tratamento de mais de três períodos e limites quantitativos de monitoramento/reversão exigem especificação. Não reinterpretar nem relaxar gates autonomamente.

Gates são guardrails de engenharia/simulação, não prova estatística de eficácia ou segurança real. Aprovações não autorizam implementar nesta tarefa ou operar dinheiro real.
