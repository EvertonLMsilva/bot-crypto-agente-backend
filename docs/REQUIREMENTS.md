# Requisitos

Status indica aprovação: APPROVED, PROPOSED ou PENDING; não indica implementação. Nenhum requisito foi implementado. Critérios reproduzem DOCS-001/DOCS-002; ausências ficam a definir. IDs anteriores preservados, alterações rastreadas abaixo. DOCS-004 aprova política inicial financeira/operacional; requisitos não significam capacidades implementadas.

| ID | Área | Descrição | Status | Critério de aceite | Dependências | Decisão relacionada |
|---|---|---|---|---|---|---|
| REQ-001 | Ambiente virtual 3D | Representar o produto como escritório web 3D. | APPROVED | Escritório com personagens, estações e salas de análise e orçamento. | DEC-001 | DEC-001, DEC-008 |
| REQ-002 | Ambiente virtual 3D | Manter um andar, salas juntas no centro e mesas ao redor; ampliar lateralmente. | APPROVED | Novas mesas não criam outros andares; salas permanecem centrais. | REQ-001, DEC-002 | DEC-002 |
| REQ-003 | Ambiente virtual 3D | Adicionar ativos com mesas e personagens. | APPROVED | Inclusão de ativo acrescenta sua mesa e personagem. | REQ-002, REQ-004 | DEC-004 |
| REQ-004 | Personagens e agentes | Associar cada personagem a um ativo e representar atividades em seus deslocamentos. | APPROVED | Personagem acompanha seu ativo e transita entre mesa e salas conforme a atividade. | REQ-001, REQ-006 | DEC-001, DEC-009, DEC-010 |
| REQ-005 | Monitoramento de criptomoedas | Exibir os ativos investidos em telão compartilhado e permitir acompanhamento nas mesas. | APPROVED | Telão da carteira integra o escritório. | Dados de mercado a definir | DEC-001, DEC-008 |
| REQ-006 | Análise individual | Cada agente analisa fatores relacionados à alta ou queda do seu ativo. | APPROVED | A definir; metodologia e validação pendentes. | Dados e estratégia a definir | DEC-013 |
| REQ-007 | Análise colaborativa | Compartilhar contexto comum sem revisão técnica ou aprovação de estratégias entre ativos. | APPROVED | BTC não revisa ETH nem vice-versa; interpretação pertence ao especialista do ativo. | REQ-006, REQ-019 | DEC-009, DEC-012 |
| REQ-008 | Sala de orçamento | Representar pedidos de capital na sala central de orçamento, sob Gestor separado do Coordenador. | APPROVED | Pedidos priorizados avaliados segundo REQ-009/REQ-035; gestor autoriza ou rejeita. | REQ-002, REQ-009 | DEC-018, DEC-020 |
| REQ-009 | Gerenciamento de capital e risco | Aplicar política inicial de orçamento centralizado, exposição, risco e perda diária. | APPROVED | 10.000 UC; exposição individual 20% e consolidada 40%; risco planejado 1% por operação e 2% aberto; perda diária de referência 3%. Bases e limites conforme REQ-035. | REQ-030, REQ-035 | DEC-020 |
| REQ-010 | Histórico e rastreabilidade | Registrar propostas, justificativas, contexto, estratégias versionadas, operações simuladas e resultados. | APPROVED | Preservar contexto disponível no momento e versão da estratégia em cada decisão. | REQ-022, REQ-025 | DEC-008, DEC-013, DEC-015 |
| REQ-011 | Segurança e autorizações | Exigir autorização específica para operações financeiras reais. | APPROVED | Não executar operações reais sem autorização específica. | AGENTS.md, política operacional a definir | DEC-006, DEC-008 |
| REQ-012 | Observabilidade e desempenho | Manter deslocamentos curtos e não condicionar processamento ao término da animação. | APPROVED | Nenhuma obrigação de terminar a caminhada antes de processar atividade. Tempo máximo a definir. | REQ-004 | DEC-002, DEC-019 |
| REQ-013 | Observabilidade e desempenho | Definir métricas, alertas, hardware-alvo e capacidade de expansão. | PENDING | A definir. | Arquitetura e orçamento a definir | DEC-019 |
| REQ-014 | Monitoramento de criptomoedas | Manter BTC, ETH e SOL como proposta anterior; quantidade definitiva de agentes pendente. | PROPOSED | A definir. Dados simulados primeiro aprovados em REQ-020. | Composição do MVP a definir | DEC-011 |
| REQ-015 | Gerenciamento de capital e risco | Acompanhar operações exclusivamente spot simuladas com capital fictício e resultados auditáveis. | APPROVED | Sem alavancagem, venda descoberta ou operação real; execução/proteções conforme REQ-036 a REQ-038. | REQ-009, REQ-030 | DEC-008, DEC-017, DEC-020, DEC-021 |
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
| REQ-030 | Sala de orçamento | Gestor recebe pedidos priorizados e controla capital compartilhado, disponibilidade, limites, reservas/liberações. | APPROVED | Sem saldo permanente por agente ou capital duplicado; aplicar política aprovada e registrar autorizações/rejeições. | REQ-008, REQ-009, REQ-023 | DEC-018, DEC-020, DEC-025 |
| REQ-031 | Coordenação | Definir classificação, geração, validade/expiração, cálculo da nota, pesos e desempates. | PENDING | A definir; fórmula 40/35/25 não aprovada. | REQ-023 | DEC-014 |
| REQ-032 | Operações simuladas | Aplicar parâmetros iniciais de entrada/saída, stop, take e custos na simulação. | APPROVED | Próxima abertura elegível, stop 2%, take 4%, taxa 0,10% e deslizamento 0,05% por execução; uma posição por ativo e encerramento integral. Detalhes restantes REQ-043/REQ-044. | REQ-015, REQ-036, REQ-037, REQ-038 | DEC-021, DEC-022, DEC-023 |
| REQ-033 | Aprendizado | Definir geração/ajuste de candidatas, estatística e monitoramento pós-promoção/reversão. | PENDING | A definir; não reduzir LEARN-GATE aprovado. | REQ-026, REQ-029 | DEC-015, DEC-016 |
| REQ-034 | Arquitetura e visualização | Separar responsabilidades e manter frontend 3D como representação de atividades. | APPROVED | Lógica de negócio fora do frontend 3D; contratos preservados na troca de provedores. | REQ-012, REQ-020 | DEC-019 |
| REQ-035 | Orçamento e risco | Capital centralizado e limites auditáveis sobre patrimônio. | APPROVED | 10.000 UC fictícias; sem saldo permanente por agente. Exposição individual até 20%, consolidada 40%; risco planejado por operação até 1%, total aberto 2%. Perda diária 3% sobre patrimônio inicial do dia UTC, virada 00:00; atingido limite, bloquear novas entradas. Considerar redução patrimonial e perdas não realizadas; risco planejado inclui custos e distância à proteção, sem garantir perda máxima; gaps/deslizamentos podem excedê-lo. | REQ-009, REQ-040 | DEC-020 |
| REQ-036 | Execução temporal | Gerar sinais só com candles fechados e executar entrada na próxima abertura elegível autorizada. | APPROVED | Sem execução retroativa no candle de origem ou quando autorização chega após abertura; expiração/reagendamento ainda PENDING. Usar preço efetivamente simulado, custos/deslizamento, sem conhecimento futuro. | REQ-020, REQ-030 | DEC-021 |
| REQ-037 | OPS-002 | Aplicar configuração inicial versionada da simulação. | APPROVED | Stop 2% abaixo da entrada, take 4% acima; taxa 0,10% e deslizamento 0,05% por execução; uma posição simultânea por ativo; saída integral. Estratégia sai na próxima abertura; stop/take ativo via OHLC. Dia UTC, 00:00; auditoria e proteção durante evolução. | REQ-032, REQ-038, REQ-039 | DEC-022 |
| REQ-038 | Proteção OHLC | Resolver gaps e ambiguidades intrabar conservadoramente. | APPROVED | Avaliar abertura; gap abaixo do stop usa abertura desfavorável com deslizamento; acima do take não concede além do alvo. Apenas stop/take atingido executa respectiva proteção; ambos sem sequência conhecida: stop primeiro. Sem encerramento duplo, aplicar custos/razão de saída; sem futuro ou alteração retroativa da proteção. | REQ-036, REQ-037 | DEC-023 |
| REQ-039 | Aprendizado e posições | Preservar proteções, vínculos e limites durante evolução. | APPROVED | Stop obrigatório e estratégia/versão de origem; apertar só por regra autorizada, sem ampliar risco. Promoção não modifica retroativamente posição; rollback não abandona posições. Histórico preservado; candidatas só promovidas cumprindo integralmente DEC-016. Agentes não alteram limites globais ou gates. | REQ-026, REQ-029, REQ-037 | DEC-022, DEC-024 |
| REQ-040 | Contabilidade | Manter estado financeiro e marcação a mercado persistentes. | APPROVED | Caixa disponível/reservado, posições, patrimônio, realizado/não realizado, exposição, risco planejado, perda diária e taxas/deslizamentos; usar preços conhecidos no instante. | REQ-035, REQ-042 | DEC-020, DEC-025 |
| REQ-041 | Rastreabilidade | Vincular cada operação à cadeia completa de decisões e aprendizado. | APPROVED | Registrar agente/ativo, estratégia/versão, oportunidade, nota ao Coordenador, dados/contexto, orçamento e justificativa, capital/risco autorizados, entrada/saída, custos, stop/take, resultado e eventos de aprendizado. Separar carteira e avaliações hipotéticas não executadas. | REQ-010, REQ-025, REQ-040 | DEC-025 |
| REQ-042 | Auditoria e idempotência | Persistir histórico/estado e impedir efeitos financeiros duplicados. | APPROVED | Correções por ajustes/compensação preservam originais; sem duplicar reservas, execuções, taxas ou liquidações. Reinício preserva estado/histórico; repetição do mesmo cenário/parâmetros/sequência reproduz resultados. | REQ-040, REQ-041 | DEC-025 |
| REQ-043 | Execução — pendências | Definir ciclo completo da ordem, abertura perdida, reservas expiradas e dados indisponíveis. | PENDING | A definir, incluindo redimensionamento/rejeição e regra concreta para apertar proteção; sem execução retroativa. | REQ-036, REQ-039 | DEC-021, DEC-024 |
| REQ-044 | Contabilidade — pendências | Definir precisão, arredondamento, reconciliação, falhas/recuperação e avaliações hipotéticas. | PENDING | A definir, preservando histórico e separação entre resultados reais da simulação e avaliações hipotéticas. | REQ-040, REQ-041, REQ-042 | DEC-025 |
| REQ-045 | Aceite operacional | Sinal fechado não executa no mesmo fechamento. | APPROVED | Um sinal derivado de candle fechado não gera execução naquele candle/fechamento. | REQ-036 | DEC-021 |
| REQ-046 | Aceite operacional | Entrada utiliza próxima abertura elegível. | APPROVED | Com autorização prévia válida, entrada usa abertura do próximo candle elegível, com custos/deslizamento aprovados; não executa retroativamente. | REQ-036, REQ-037 | DEC-021, DEC-022 |
| REQ-047 | Aceite operacional | Bloquear entrada acima dos limites financeiros. | APPROVED | Pedido que excede limites aprovados não gera entrada. Critérios finais de redimensionamento ainda pendentes. | REQ-035, REQ-043 | DEC-020 |
| REQ-048 | Aceite operacional | Não duplicar capital em operações simultâneas. | APPROVED | Solicitações simultâneas não reservam ou utilizam duas vezes o mesmo capital. | REQ-030, REQ-042 | DEC-020, DEC-025 |
| REQ-049 | Aceite operacional | Stop e take no mesmo candle seguem política conservadora. | APPROVED | Se ambos atingidos e sequência desconhecida, registrar saída pelo stop primeiro. | REQ-038 | DEC-023 |
| REQ-050 | Aceite operacional | Gap desfavorável usa abertura compatível. | APPROVED | Comprada com abertura abaixo do stop sai pela abertura desfavorável com deslizamento aplicável. | REQ-038 | DEC-023 |
| REQ-051 | Aceite operacional | Descontar corretamente custos simulados. | APPROVED | Apurar resultado com taxa 0,10% e deslizamento 0,05% por execução e preço efetivamente simulado, sem duplicações. | REQ-037, REQ-040, REQ-042 | DEC-022, DEC-025 |
| REQ-052 | Aceite operacional | Não encerrar posição duas vezes. | APPROVED | Repetição de evento ou múltiplas condições não duplicam encerramento/liquidação. | REQ-038, REQ-042 | DEC-023, DEC-025 |
| REQ-053 | Aceite operacional | Perda diária máxima bloqueia novas entradas. | APPROVED | Ao atingir perda diária de referência 3% sobre patrimônio inicial do dia UTC, incluindo perdas não realizadas, bloquear novas entradas. | REQ-035, REQ-040 | DEC-020 |
| REQ-054 | Aceite operacional | Promoção preserva posições protegidas. | APPROVED | Posições abertas mantêm proteção e vínculo original sem alteração retroativa por promoção. | REQ-039 | DEC-024 |
| REQ-055 | Aceite operacional | Rollback mantém auditoria e proteção. | APPROVED | Reversão preserva histórico e não abandona posições simuladas abertas ou suas proteções. | REQ-029, REQ-039 | DEC-016, DEC-024 |
| REQ-056 | Aceite operacional | Reinício preserva estado persistido. | APPROVED | Após reinício, manter histórico/estado financeiro persistido, sem efeitos duplicados. Recuperação detalhada ainda pendente. | REQ-042, REQ-044 | DEC-025 |
| REQ-057 | Aceite operacional | Repetição reproduz resultados. | APPROVED | Mesmo cenário, parâmetros e sequência produzem os mesmos resultados. | REQ-020, REQ-042 | DEC-011, DEC-025 |
| REQ-058 | Aceite operacional | Resultados alimentam só aprendizado responsável. | APPROVED | Resultado da operação alimenta apenas o aprendizado do especialista do ativo responsável. | REQ-025, REQ-041 | DEC-015, DEC-025 |
| REQ-059 | Aceite operacional | Dados futuros não influenciam decisões anteriores. | APPROVED | Decisões usam apenas dados disponíveis no instante; máxima/mínima/fechamento futuros não antecipados. | REQ-020, REQ-036, REQ-038 | DEC-011, DEC-021, DEC-023 |
| REQ-060 | Aceite operacional | Nenhuma operação real executada. | APPROVED | Todas as operações usam apenas spot e capital fictícios em simulação, sem execução financeira real. | REQ-015, REQ-035 | DEC-008, DEC-020 |

## Evolução dos requisitos
- DOCS-002: REQ-007 delimitou contexto comum sem revisão cruzada; REQ-010/REQ-015 aprovados; REQ-014 não fechou composição de ativos.
- DOCS-004: REQ-008/REQ-009/REQ-015/REQ-030/REQ-032 reconciliados com DEC-020 a DEC-025. REQ-009 e REQ-032 passam de PENDING a APPROVED na política inicial; detalhes restantes ficam em REQ-043/REQ-044. Histórico anterior preservado em DEC-017/DEC-018.
- Capital 10.000 UC, exposição individual 20% e consolidada 40% agora APPROVED. Faixas por nota continuam PROPOSED, não aprovadas. Fórmula 40 tendência / 35 momentum / 25 volume continua PROPOSED, não aprovada (DEC-014).

## Mapeamento dos aceites DOCS-004
As referências conceituais CA-01 a CA-16 correspondem, na mesma ordem, a REQ-045 a REQ-060. Não constituem testes executados. Um aceite documentado não resolve regras ainda pendentes.
- CA-01: REQ-045.
- CA-02: REQ-046.
- CA-03: REQ-047.
- CA-04: REQ-048.
- CA-05: REQ-049.
- CA-06: REQ-050.
- CA-07: REQ-051.
- CA-08: REQ-052.
- CA-09: REQ-053.
- CA-10: REQ-054.
- CA-11: REQ-055.
- CA-12: REQ-056.
- CA-13: REQ-057.
- CA-14: REQ-058.
- CA-15: REQ-059.
- CA-16: REQ-060.

## Pendências para concluir a especificação do MVP
### Sinais e estratégias — PENDING
Quantidade definitiva de agentes/ativos e estratégias iniciais por ativo; indicadores/pesos; fórmula comparável 0–100; criação/expiração de sinais; desempates; classificação de alertas de queda. REQ-031 continua pendente; sentido operacional aprovado é spot sem venda descoberta, mas taxonomia de alertas de queda permanece indefinida.

### Aprendizado — PENDING
Geração de candidatas, ajuste de parâmetros, métricas exatas do LEARN-GATE, validação estatística complementar, critérios quantitativos pós-promoção e rollback por degradação. REQ-033 não relaxa DEC-016; agregação e mais de três períodos ainda exigem especificação.

### Execução e finanças — PENDING
Ciclo completo da ordem; autorização após abertura elegível (expiração/reagendamento); reservas expiradas; dados indisponíveis; precisão/arredondamento/reconciliação; falhas e recuperação; critérios finais de redimensionamento/rejeição; detalhamento de avaliações hipotéticas não executadas. REQ-043/REQ-044. Nenhuma destas pendências revoga os limites aprovados.

### Arquitetura — PENDING
Stack definitiva, contratos concretos, persistência/comunicação, hardware/desempenho, observabilidade/segurança, fontes externas futuras, IA e execução local. Three.js PROPOSED. Visual final de personagens/salas e câmera interativa não automaticamente aprovados; layout/referência preservados.

Gates são guardrails de engenharia/simulação, não prova estatística de eficácia ou segurança real. Pendências não bloqueiam documentação; aprovação documental não autoriza implementação ou operação real.
