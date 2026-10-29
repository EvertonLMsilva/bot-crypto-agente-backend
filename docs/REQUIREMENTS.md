# Requisitos

Status indica aprovação: APPROVED, PROPOSED ou PENDING; não indica implementação. Nenhum requisito foi implementado. Critérios reproduzem as aprovações DOCS-001/DOCS-002/DOCS-004/DOCS-005; ausências ficam a definir. IDs anteriores preservados, alterações rastreadas abaixo. DOCS-004 aprova política inicial financeira/operacional; requisitos não significam capacidades implementadas.

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
| REQ-023 | Coordenação | Priorizar oportunidades por nota válida, tempo simulado, rodízio e identificador estável. | APPROVED | Maior nota; sinal mais antigo; rodízio determinístico entre ativos no empate completo; ID final. Persistir rodízio; chegada assíncrona não altera ordenação do mesmo ciclo. Não recalcular notas/análises. | REQ-022, REQ-062, REQ-068 | DEC-014, DEC-027, DEC-029 |
| REQ-024 | Coordenação | Separar priorização de reanálise e controle financeiro. | APPROVED | Coordenador não recalcula indicadores, altera conclusões/notas, executa, reserva capital nem substitui gestor. | REQ-023, REQ-030 | DEC-014, DEC-018 |
| REQ-025 | Aprendizado | Manter memória persistente, múltiplas estratégias e histórico exclusivos do próprio ativo. | APPROVED | Especialista usa estratégias/memória de seu ativo; resultados de BTC não alteram automaticamente ETH nem vice-versa. Estratégias, candidatas e políticas versionadas e independentes. | REQ-010, REQ-071 | DEC-015, DEC-026, DEC-028 |
| REQ-026 | Aprendizado | Avaliar candidatas isoladas com validação independente e promoção automática só simulada. | APPROVED | Candidatas não interferem em operações oficiais; promoção somente com todos os critérios de DEC-016. | REQ-025, REQ-027, REQ-028 | DEC-015, DEC-016 |
| REQ-027 | Aprendizado — integridade | Aplicar LEARN-GATE de amostra e integridade. | APPROVED | 60 operações distintas concluídas; pelo menos 3 períodos, mínimo 10 por período; alta/baixa/lateralização e contexto/notícias; separação cronológica, sem futuro ou duplicação de observações; reprodução. | REQ-020, REQ-025 | DEC-016 |
| REQ-028 | Aprendizado — desempenho e risco | Aplicar LEARN-GATE financeiro e de risco. | APPROVED | Líquido positivo após custos; melhoria média mínima 1 ponto percentual; superior em 2 dos 3 períodos; mesmas condições/horizontes/custos; drawdown até 10% e no máximo 2 pontos percentuais acima da ativa; sem violações ou operações não autorizadas; dados inválidos/antecipados invalidam. Acerto isolado não basta. | REQ-027; métricas detalhadas pendentes | DEC-016 |
| REQ-029 | Aprendizado — decisões e segurança | Registrar PROMOTE, REJECT, INSUFFICIENT_EVIDENCE e ROLLBACK, preservando histórico e limites. | APPROVED | Estados conforme DEC-016; perda isolada não muda estratégia; rollback trata posições abertas. Agente não altera código, segurança, limites, contratos, critérios obrigatórios ou autorização. | REQ-026, REQ-028 | DEC-015, DEC-016 |
| REQ-030 | Sala de orçamento | Gestor recebe pedidos priorizados e controla capital compartilhado, disponibilidade, limites, reservas/liberações. | APPROVED | Sem saldo permanente por agente ou capital duplicado; aplicar política aprovada e registrar autorizações/rejeições. | REQ-008, REQ-009, REQ-023 | DEC-018, DEC-020, DEC-025 |
| REQ-031 | Coordenação | Definir calibração técnica restante de regimes, pontuação e geração de sinais. | PENDING | Regimes, pesos globais, limiar, tipos, validade e desempate aprovados em REQ-061 a REQ-069/REQ-023. Restam cálculos internos T/R/C/H/A, indicadores/normalizações, histórico insuficiente e critérios técnicos concretos de criação. Fórmula antiga 40/35/25 não aprovada. | REQ-023, REQ-061, REQ-062, REQ-063 | DEC-014, DEC-027, DEC-029 |
| REQ-032 | Operações simuladas | Aplicar parâmetros iniciais de entrada/saída, stop, take e custos na simulação. | APPROVED | Próxima abertura elegível, stop 2%, take 4%, taxa 0,10% e deslizamento 0,05% por execução; uma posição por ativo e encerramento integral. Detalhes restantes REQ-043/REQ-044. | REQ-015, REQ-036, REQ-037, REQ-038 | DEC-021, DEC-022, DEC-023 |
| REQ-033 | Aprendizado | Definir detalhes quantitativos de geração/ajuste, pesquisa, estatística e monitoramento/rollback. | PENDING | Ciclos e até três candidatas aprovados em REQ-066; frequência, mutações, métricas exatas, sobreajuste e limites pós-promoção/rollback ainda a definir; não reduzir DEC-016. | REQ-026, REQ-029, REQ-066 | DEC-015, DEC-016, DEC-028 |
| REQ-034 | Arquitetura e visualização | Separar responsabilidades e manter frontend 3D como representação de atividades. | APPROVED | Lógica de negócio fora do frontend 3D; contratos preservados na troca de provedores. | REQ-012, REQ-020 | DEC-019 |
| REQ-035 | Orçamento e risco | Capital centralizado e limites auditáveis sobre patrimônio. | APPROVED | 10.000 UC fictícias; sem saldo permanente por agente. Exposição individual até 20%, consolidada 40%; risco planejado por operação até 1%, total aberto 2%. Perda diária 3% sobre patrimônio inicial do dia UTC, virada 00:00; atingido limite, bloquear novas entradas. Considerar redução patrimonial e perdas não realizadas; risco planejado inclui custos e distância à proteção, sem garantir perda máxima; gaps/deslizamentos podem excedê-lo. | REQ-009, REQ-040 | DEC-020 |
| REQ-036 | Execução temporal | Gerar sinais só com candles fechados e executar entrada na próxima abertura elegível autorizada. | APPROVED | Sem retroatividade. Abertura perdida expira ENTRY_CANDIDATE e libera reserva idempotentemente; nova análise/autorização necessárias. Preço efetivamente simulado, custos/deslizamento, sem futuro. | REQ-020, REQ-030, REQ-068 | DEC-021, DEC-029 |
| REQ-037 | OPS-002 | Aplicar configuração inicial versionada da simulação. | APPROVED | Stop 2% abaixo da entrada, take 4% acima; taxa 0,10% e deslizamento 0,05% por execução; uma posição simultânea por ativo; saída integral. Estratégia sai na próxima abertura; stop/take ativo via OHLC. Dia UTC, 00:00; auditoria e proteção durante evolução. | REQ-032, REQ-038, REQ-039 | DEC-022 |
| REQ-038 | Proteção OHLC | Resolver gaps e ambiguidades intrabar conservadoramente. | APPROVED | Avaliar abertura; gap abaixo do stop usa abertura desfavorável com deslizamento; acima do take não concede além do alvo. Apenas stop/take atingido executa respectiva proteção; ambos sem sequência conhecida: stop primeiro. Sem encerramento duplo, aplicar custos/razão de saída; sem futuro ou alteração retroativa da proteção. | REQ-036, REQ-037 | DEC-023 |
| REQ-039 | Aprendizado e posições | Preservar proteções, vínculos e limites durante evolução. | APPROVED | Stop obrigatório e estratégia/versão de origem; apertar só por regra autorizada, sem ampliar risco. Promoção não modifica retroativamente posição; rollback não abandona posições. Histórico preservado; candidatas só promovidas cumprindo integralmente DEC-016. Agentes não alteram limites globais ou gates. | REQ-026, REQ-029, REQ-037 | DEC-022, DEC-024 |
| REQ-040 | Contabilidade | Manter estado financeiro e marcação a mercado persistentes. | APPROVED | Caixa disponível/reservado, posições, patrimônio, realizado/não realizado, exposição, risco planejado, perda diária e taxas/deslizamentos; usar preços conhecidos no instante. | REQ-035, REQ-042 | DEC-020, DEC-025 |
| REQ-041 | Rastreabilidade | Vincular sinais, operações e aprendizado à cadeia rastreável de decisões. | APPROVED | Registrar agente/ativo, estratégia/política e versões, oportunidade/ID/ciclo, nota e dimensões disponíveis, dados/contexto, orçamento/justificativa, capital/risco, entrada/saída, custos, stop/take, resultado e aprendizado. Separar carteira/hipóteses; falta de capital não prova erro de estratégia. | REQ-010, REQ-025, REQ-040, REQ-064 | DEC-025, DEC-027, DEC-028, DEC-029 |
| REQ-042 | Auditoria e idempotência | Persistir histórico/estado e impedir efeitos financeiros duplicados. | APPROVED | Correções por ajustes preservam originais; sem duplicar reservas, execuções, taxas/liquidações. Reinício preserva estado, sinais e rodízio; mesmo cenário/parâmetros/versões/sequência reproduz resultados. Idempotência de sinal e liberação em REQ-068/REQ-069. | REQ-040, REQ-041, REQ-069 | DEC-025, DEC-029 |
| REQ-043 | Execução — pendências | Definir detalhes restantes do ciclo da ordem, reservas e contingências por dados/falhas. | PENDING | Expiração de ENTRY e reavaliação de EXIT após abertura perdida aprovadas em REQ-068/REQ-067; liberação idempotente aprovada. Restam transições completas, reservas/contingências não especificadas, redimensionamento/rejeição, regra concreta de apertar proteção e recuperação; sem retroatividade. | REQ-036, REQ-039, REQ-068, REQ-070 | DEC-021, DEC-024, DEC-029 |
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
| REQ-057 | Aceite operacional | Repetição reproduz resultados. | APPROVED | Mesmos dados/cenário, parâmetros, versões e sequência produzem os mesmos resultados. | REQ-020, REQ-042 | DEC-011, DEC-025, DEC-028, DEC-029 |
| REQ-058 | Aceite operacional | Resultados alimentam só aprendizado responsável. | APPROVED | Resultado da operação alimenta apenas o aprendizado do especialista do ativo responsável. | REQ-025, REQ-041 | DEC-015, DEC-025 |
| REQ-059 | Aceite operacional | Dados futuros não influenciam decisões anteriores. | APPROVED | Decisões usam apenas dados disponíveis no instante; máxima/mínima/fechamento futuros não antecipados. | REQ-020, REQ-036, REQ-038 | DEC-011, DEC-021, DEC-023 |
| REQ-060 | Aceite operacional | Nenhuma operação real executada. | APPROVED | Todas as operações usam apenas spot e capital fictícios em simulação, sem execução financeira real. | REQ-015, REQ-035 | DEC-008, DEC-020 |
| REQ-061 | Regimes | Classificar regimes e dimensões complementares deterministicamente. | APPROVED | UPTREND/DOWNTREND/SIDEWAYS; UNKNOWN se dados insuficientes/classificação inválida, sem operação inválida. Volatilidade normal/elevada e contexto favorável/desfavorável/neutro/incerto. Mesmos dados/cenário produzem mesma classificação sem futuro; algoritmos internos pendentes. | REQ-020, REQ-031 | DEC-027 |
| REQ-062 | Pontuação | Aplicar fórmula global com componentes normalizados 0–100 e limiar inicial 70. | APPROVED | S = round(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A); T técnica 35%, R regime 25%, C contexto 15%, H histórico validado 15%, A concordância independente 10%. Agente não altera pesos/limiar. Score não é probabilidade, autorização, garantia de execução ou medida suficiente de risco. | REQ-061, REQ-031 | DEC-027 |
| REQ-063 | Elegibilidade | Gerar ENTRY_CANDIDATE apenas com score >=70 e todos os critérios obrigatórios. | APPROVED | Score <70 não produz compra; >=70 não dispensa dados válidos/cronológicos/atuais, ausência de futuro, regime conhecido/válido, ao menos uma estratégia elegível, ausência de posição conflitante/duplicação e autorização financeira separada antes de executar. | REQ-062, REQ-030, REQ-069 | DEC-027, DEC-028 |
| REQ-064 | Rastreabilidade de estratégias | Registrar divergências das estratégias e evidências das decisões de sinal. | APPROVED | Divergências registradas com contexto e versões; preservar análises originais e componentes disponíveis, sem assumir independência quantitativa ainda não definida. | REQ-041, REQ-062, REQ-071 | DEC-027, DEC-028 |
| REQ-065 | Baseline | Identificar baseline inicial UNVALIDATED quando histórico é insuficiente. | APPROVED | Pode iniciar simulação sob elegibilidade/limites, sem alegar desempenho validado. Não impor H=50; tratamento numérico PENDING. Promoção posterior exige DEC-016 integral. | REQ-063, REQ-026 | DEC-027, DEC-028 |
| REQ-066 | Aprendizado em ciclos | Manter uma política ativa oficial e até três candidatas por ciclo e por agente. | APPROVED | Candidatas isoladas, sem movimentar capital oficial; condições comparáveis e dados cronológicos com ativa; políticas/estratégias versionadas, evidências preservadas e sem efeito retroativo. LEARN-GATE em REQ-026; posições protegidas em REQ-039. | REQ-025, REQ-026, REQ-039 | DEC-028 |
| REQ-067 | Decisões e eventos | Distinguir ENTRY_CANDIDATE, EXIT_REQUEST, HOLD, WAIT e RISK_ALERT. | APPROVED | ENTRY compra spot elegível ao Coordenador; EXIT encerra posição existente na próxima abertura, independente da fila de compras, exige reavaliação se perdida. HOLD mantém posição; WAIT sem oportunidade/reserva no ciclo atual. RISK_ALERT adicional persistido com situação rastreável, não cria ordem/autorização sozinho. Stop/take independem da fila. | REQ-063, REQ-068, REQ-037 | DEC-028, DEC-029 |
| REQ-068 | Validade | Expirar ENTRY na abertura elegível perdida e liberar reserva exatamente uma vez. | APPROVED | Só vale até próxima abertura com autorização válida anterior; sem retroatividade/transferência de autorização. Expiração/cancelamento libera reserva idempotentemente; nova oportunidade requer nova análise/dados válidos e autorização própria. Relógio simulado, pausa não expira por tempo real/animação. | REQ-036, REQ-042, REQ-069 | DEC-029 |
| REQ-069 | Identidade e idempotência de sinais | Manter identidade estável por sinal/ciclo e uma decisão oficial por ativo/candle fechado. | APPROVED | Reprocessamento não duplica oportunidades, reservas ou operações; alertas adicionais permitidos, sem segunda decisão operacional oficial. | REQ-042, REQ-067 | DEC-028, DEC-029 |
| REQ-070 | Dados e contingências | Bloquear novas entradas com dados ausentes/inválidos sem abandonar proteção de posições. | APPROVED | Registrar insuficiência e contexto; não permitir entrada inválida nem remover proteção por indisponibilidade. Mecanismos concretos de contingência/recuperação PENDING. | REQ-043, REQ-039, REQ-061 | DEC-027, DEC-029 |
| REQ-071 | Política adaptativa | Selecionar/combinar múltiplas estratégias do próprio ativo conforme regime/contexto. | APPROVED | Política versionada; mudanças da política só evoluem via LEARN-GATE. Central fornece contexto sem ordens; Coordenador não recalcula análise/nota. Famílias propostas não equivalem a algoritmos aprovados. | REQ-025, REQ-026, REQ-061 | DEC-026 |

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

## Reconciliação SIGNAL-001 a SIGNAL-004 — DOCS-005
- DEC-026 a DEC-029 aprovam estruturas funcionais; REQ-031 e REQ-033 continuam PENDING somente para detalhes não decididos, não como negação das partes aprovadas.
- REQ-023: desempate/ordenação; REQ-025: fronteira de aprendizado; REQ-036: expiração; REQ-041/REQ-042: rastreabilidade/idempotência; REQ-043: contingências restantes; REQ-057: reprodução com versões.
- Fórmula global, limiar e taxonomia aprovados em REQ-062/REQ-063/REQ-067; calibração interna permanece pendente. Fórmula antiga 40/35/25 não é a atual e segue não aprovada.
- Não duplicar aceites cobertos integralmente: mapeamentos abaixo reutilizam requisitos existentes ou um mesmo requisito para condições relacionadas. IDs SIG-A são referências da tarefa, não novos requisitos paralelos.

## Mapeamento dos aceites SIGNAL
- SIG-A01: REQ-025.
- SIG-A02: REQ-061.
- SIG-A03: REQ-061.
- SIG-A04: REQ-062.
- SIG-A05: REQ-063.
- SIG-A06: REQ-063.
- SIG-A07: REQ-064.
- SIG-A08: REQ-065.
- SIG-A09: REQ-066.
- SIG-A10: REQ-066.
- SIG-A11: REQ-026.
- SIG-A12: REQ-067.
- SIG-A13: REQ-068.
- SIG-A14: REQ-068.
- SIG-A15: REQ-068.
- SIG-A16: REQ-023.
- SIG-A17: REQ-023.
- SIG-A18: REQ-069.
- SIG-A19: REQ-067.
- SIG-A20: REQ-067.
- SIG-A21: REQ-070.
- SIG-A22: REQ-025, REQ-058.
- SIG-A23: REQ-057.

Aceites documentados não são testes executados. ENTRY nos aceites significa ENTRY_CANDIDATE; EXIT significa EXIT_REQUEST, sem criar tipos alternativos.

## Pendências para concluir a especificação do MVP
### Sinais e estratégias — PENDING
Quantidade definitiva de ativos/agentes; horizonte temporal dos candles; estratégias concretas e parametrizações; indicadores/limiares/normalizações internos; cálculos exatos T/R/C/H/A, dependências quantitativas entre estratégias e tratamento numérico de histórico não validado; critérios técnicos de criação/elegibilidade ainda não detalhados, sem revogar a estrutura aprovada. REQ-031.

Famílias iniciais PROPOSED: tendência, rompimento, reversão à média e contexto econômico/geopolítico transversal. Heurísticas PROPOSED, não aprovadas: EMA 20/50, ADX 14 e possível limiar 20, ATR 14 normalizado, percentil 75/janela de volatilidade, mínimo de 150 candles. H neutro de 50 não é obrigatório; fallback numérico PENDING. Pesos globais e limiar não podem ser alterados autonomamente. Convenção detalhada de arredondamento ainda não definida, sem alterar a fórmula aprovada.

### Aprendizado — PENDING
Frequência dos ciclos, seleção/mutações das candidatas, geração/ajuste, métricas matemáticas precisas do LEARN-GATE, estatística complementar, limites de pesquisa/controle de sobreajuste, monitoramento quantitativo pós-promoção e rollback por degradação. REQ-033. DEC-016 integralmente preservada, incluindo agregação e tratamento de mais de três períodos ainda a especificar. Baseline UNVALIDATED não é dispensa de elegibilidade, limites ou validação de promoções posteriores.

### Execução e finanças — PENDING
Regras restantes de REQ-043/REQ-044: ciclo completo da ordem, detalhes de reservas além da liberação idempotente aprovada, contingências por dados ausentes/falhas e recuperação, precisão/arredondamento/reconciliação, redimensionamento/rejeição, apertar proteção e avaliações hipotéticas. ENTRY com abertura perdida expira; EXIT perdido requer reavaliação: não são mais escolhas abertas de reagendamento. Faixas de capital por nota continuam PROPOSED, não aprovadas.

### Arquitetura — PENDING
Stack, contratos concretos, persistência/comunicação, infraestrutura, hardware/desempenho, observabilidade/segurança, fontes futuras, IA/execução local. Three.js PROPOSED. Visual final/câmera não automaticamente aprovados; layout/referência preservados.

Gates são guardrails de engenharia/simulação, não prova estatística de eficácia ou segurança real. Nenhuma implementação ou operação real autorizada nesta tarefa.
