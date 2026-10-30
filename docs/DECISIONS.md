# Histórico de decisões

Origem dos registros: conversa com o proprietário e tarefa BOT-CRYPTO-DOCS-001 recebidas em 2026-10-29. APPROVED registra autorização explícita, não entrega. Não apagar histórico; substituições exigem novo registro, vínculo SUBSTITUI e justificativa, com anterior marcado SUPERSEDED.

## DEC-001
ID: DEC-001
DATA: 2026-10-29
TÍTULO: Escritório virtual de especialistas por ativo
STATUS: APPROVED

CONTEXTO:
O proprietário descreveu um escritório de análise de criptomoedas com personagens.

DECISÃO:
Representar o produto como aplicação web com escritório 3D, mesas individuais, especialistas por ativo, sala de análise, sala de orçamento e telão da carteira. Personagens representam as atividades do sistema.

JUSTIFICATIVA:
Tornar o acompanhamento e os processos compreensíveis pela representação visual solicitada.

IMPACTOS:
Separar a representação visual da lógica operacional; regras de análise e negociação ainda precisam ser definidas.

SUBSTITUI:
Não se aplica.

## DEC-002
ID: DEC-002
DATA: 2026-10-29
TÍTULO: Um andar, núcleo central e expansão lateral
STATUS: APPROVED

CONTEXTO:
O proprietário rejeitou expansão por andares e deslocamentos demorados.

DECISÃO:
Centralizar análise e orçamento, distribuir mesas ao redor e expandir apenas lateralmente, ampliando paredes externas. Manter trajetos curtos; processamento não aguarda a animação.

JUSTIFICATIVA:
Preservar proximidade dos ambientes compartilhados e fluidez visual.

IMPACTOS:
Layout expansível em um piso; limites quantitativos e capacidade permanecem pendentes.

SUBSTITUI:
Não se aplica; sugestão anterior de andares não foi decisão aprovada.

## DEC-003
ID: DEC-003
DATA: 2026-10-29
TÍTULO: Referência visual do escritório
STATUS: APPROVED

CONTEXTO:
O proprietário aprovou a segunda imagem gerada e pediu que fosse a referência.

DECISÃO:
Usar a imagem identificada em PROJECT_CONTEXT.md como direção visual do ambiente.

JUSTIFICATIVA:
Preservar a composição e a aparência escolhidas para futuras sessões.

IMPACTOS:
Imagem é referência conceitual externa; não comprova produto executável nem fidelidade gráfica já alcançada.

SUBSTITUI:
Não se aplica; é a primeira referência formal registrada.

## DEC-004
ID: DEC-004
DATA: 2026-10-29
TÍTULO: Inclusão de ativos e estações
STATUS: APPROVED

CONTEXTO:
O proprietário solicitou opção de acrescentar ativos e mesas.

DECISÃO:
Permitir expansão dos ativos acompanhados, acrescentando estações e personagens no mesmo andar.

JUSTIFICATIVA:
Permitir que o escritório cresça conforme os ativos selecionados.

IMPACTOS:
Exige layout adaptável; catálogo, limites e comportamento de remoção permanecem pendentes.

SUBSTITUI:
Não se aplica.

## DEC-005
ID: DEC-005
DATA: 2026-10-29
TÍTULO: Independência e diretório oficial
STATUS: APPROVED

CONTEXTO:
A tarefa documental define o projeto como independente de Jarvis/Kate e informa novo diretório oficial.

DECISÃO:
Manter BOT CRUPTO em D:\04-Projetos\30-bot-crypto-agence, sem importar regras, arquivos ou arquitetura de Jarvis/Kate. A pasta de conversa anterior não é o diretório oficial desta tarefa.

JUSTIFICATIVA:
Evitar mistura de escopos e preservar identidade e contexto próprios.

IMPACTOS:
Documentação e futuras tarefas usam esta raiz; nenhuma migração de outro projeto foi autorizada.

SUBSTITUI:
Não se aplica.

## DEC-006
ID: DEC-006
DATA: 2026-10-29
TÍTULO: Bootstrap exclusivamente documental
STATUS: APPROVED

CONTEXTO:
A tarefa BOT-CRYPTO-DOCS-001 solicita documentação durável antes de implementar.

DECISÃO:
Criar apenas AGENTS.md, README.md e os seis documentos em docs definidos na tarefa. Não criar código, Git, dependências, integrações, commits ou push. Operações financeiras reais dependem de autorização específica.

JUSTIFICATIVA:
Preservar requisitos, decisões e checkpoint para continuidade entre sessões.

IMPACTOS:
Implementação permanece NOT_STARTED; MVP e arquitetura dependem de definição posterior.

SUBSTITUI:
Não se aplica.

## DEC-007
ID: DEC-007
DATA: 2026-10-29
TÍTULO: Three.js como candidato visual
STATUS: PROPOSED

CONTEXTO:
Three.js foi mencionado como possibilidade para o escritório.

DECISÃO:
Registrar Three.js como candidato, sem fechar a seleção tecnológica nesta tarefa.

JUSTIFICATIVA:
A tarefa atual o identifica expressamente como tecnologia inicialmente proposta.

IMPACTOS:
Avaliar adequação e confirmar stack antes da implementação; nenhum backend ou infraestrutura decorre dessa proposta.

SUBSTITUI:
Não se aplica.

## Sincronização DOCS-002
Origem: tarefa BOT-CRYPTO-DOCS-002, 2026-10-29. DEC-001 a DEC-007 preservados como histórico. Nenhum registro SUPERSEDED: revisão cruzada e coletor restrito não eram decisões aprovadas documentadas. Abandono/evolução registrados em DEC-009/DEC-012. Novos registros atualizam o conhecimento; não comprovam implementação.

## DEC-008
ID: DEC-008
DATA: 2026-10-29
TÍTULO: MVP-001: escritório virtual funcional simulado
STATUS: APPROVED

CONTEXTO:
Evolução do conceito visual para processos funcionais.

DECISÃO:
Escritório web 3D, estações, sala de análise/coordenação, orçamento e agentes autônomos. Dados e acontecimentos inicialmente simulados, processos/decisões rastreáveis e capital exclusivamente fictício. Nenhuma operação real. Personagens refletem estados do sistema; animações não determinam resultados.

JUSTIFICATIVA:
Validar o funcionamento do escritório em simulação.

IMPACTOS:
MVP em consolidação de requisitos, não implementado. Three.js permanece PROPOSED.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-009
ID: DEC-009
DATA: 2026-10-29
TÍTULO: MVP-002: exclusividade por ativo e abandono da revisão cruzada
STATUS: APPROVED

CONTEXTO:
DOCS-002 informa abandono da revisão cruzada BTC/ETH; não existia registro histórico aprovado dessa revisão.

DECISÃO:
Cada especialista é responsável exclusivamente por seu ativo. Não faz análise técnica, revisão ou aprovação de estratégias de outro ativo. Podem compartilhar contexto geral; interpretação e decisão pertencem ao especialista do ativo.

JUSTIFICATIVA:
Preservar independência e responsabilidade.

IMPACTOS:
REQ-007 deixa de ser indefinido. Revisão cruzada descartada sem inventar decisão histórica substituída.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-010
ID: DEC-010
DATA: 2026-10-29
TÍTULO: MVP-003: autonomia supervisionada
STATUS: APPROVED

CONTEXTO:
O proprietário aprovou especialistas orientados por regras e estratégias.

DECISÃO:
Receber informações, executar análises, identificar oportunidades, encaminhar sinais, acompanhar resultados simulados, avaliar desempenho, aprender e evoluir estratégias. Usuário supervisiona.

JUSTIFICATIVA:
Representar trabalho autônomo na simulação.

IMPACTOS:
Autonomia limitada por DEC-009, DEC-015 e DEC-016; não autoriza dinheiro real.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-011
ID: DEC-011
DATA: 2026-10-29
TÍTULO: MVP-004: dados simulados reproduzíveis primeiro
STATUS: APPROVED

CONTEXTO:
Validar sem integrações externas iniciais.

DECISÃO:
Dados financeiros e acontecimentos econômicos/políticos simulados, reproduzíveis e identificados como fictícios. Sem informação futura antecipada. Provedores reais somente em fase posterior, substituindo os simulados sem mudar contratos consumidos pelos especialistas. MVP não depende de APIs externas pagas.

JUSTIFICATIVA:
Permitir reprodução e evolução das fontes.

IMPACTOS:
Contratos concretos e fontes reais pendentes; nenhuma integração executada.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-012
ID: DEC-012
DATA: 2026-10-29
TÍTULO: Analista Central de Inteligência contextual
STATUS: APPROVED

CONTEXTO:
Evolução de coletor/distribuidor de preços para inteligência contextual; o papel restrito não constava como decisão aprovada na DOCS-001.

DECISÃO:
Centralizar coleta, organização, validação, interpretação contextual e disponibilização de informações potencialmente relevantes aos mercados.
Categorias previstas:
1. Cotações, candles, volumes, volatilidade e liquidez.
2. Notícias econômicas e financeiras.
3. Inflação, juros, emprego e decisões de bancos centrais.
4. Política e decisões governamentais.
5. Geopolítica, conflitos e sanções.
6. Regulamentação e tributação.
7. Criptomoedas, blockchains e corretoras.
8. Eventos corporativos e institucionais.
9. Sentimento, distinguindo dados verificáveis de rumores.
10. Outros acontecimentos relevantes.
Produzir resumos, classificar relevância/riscos, identificar ativos potencialmente afetados e formular hipóteses fundamentadas sobre impactos. Distinguir fatos confirmados, rumores, hipóteses e interpretações; registrar incerteza, justificativas, fontes e timestamps. Compartilhar contexto sem consultas externas redundantes e disponibilizar conforme relevância.

JUSTIFICATIVA:
Oferecer contexto comum preservando análise individual.

IMPACTOS:
Não decide comprar/vender, executa operações, autoriza capital ou substitui especialistas. Hipóteses não são fatos; classificação não comprova causalidade nem previsão. No MVP dados/notícias/eventos são simulados segundo DEC-011.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-013
ID: DEC-013
DATA: 2026-10-29
TÍTULO: Análise técnica e contextual rastreável
STATUS: APPROVED

CONTEXTO:
Um mesmo acontecimento pode ter interpretações diferentes por ativo.

DECISÃO:
Integrar tendência/preço, volume/volatilidade, economia, política/geopolítica, regulação e riscos/incertezas nas estratégias próprias. Identificar dados e eventos influentes, versão da estratégia e contexto disponível na decisão. Proibir dados futuros e permitir comparação posterior entre condições, com rastreabilidade e independência.

JUSTIFICATIVA:
Preservar justificativas e comparabilidade.

IMPACTOS:
Pesos e influência exata de cada indicador/categoria contextual PENDING.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-014
ID: DEC-014
DATA: 2026-10-29
TÍTULO: Coordenador independente de oportunidades
STATUS: APPROVED

CONTEXTO:
Comparar prioridades sem reanalisar estratégias.

DECISÃO:
Coordenador na sala de análise recebe oportunidades e encaminha pedidos ao processo financeiro. Pontuação padronizada 0–100, critérios comuns comparáveis entre ativos e ordenação determinística. Preserva análises originais; não recalcula indicadores, altera conclusões ou pontuações recebidas, executa, reserva capital ou substitui o gestor.

JUSTIFICATIVA:
Separar priorização, análise e autorização financeira.

IMPACTOS:
Classificação dos sinais, cálculo/origem da nota, pesos, limiares e desempate final PENDING. Fórmula de 40 pontos tendência / 35 momentum / 25 volume permanece PROPOSED, NÃO APROVADA.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-015
ID: DEC-015
DATA: 2026-10-29
TÍTULO: Aprendizado individual e evolução automática controlada
STATUS: APPROVED

CONTEXTO:
Agentes não devem ficar limitados a uma fórmula fixa.

DECISÃO:
Múltiplas estratégias, memória persistente, análises/decisões, histórico de operações simuladas, avaliação de desempenho/contextos, criação de candidatas, testes independentes, adaptação controlada, versionamento, promoção automática e reversão auditável. Cada especialista mantém estratégia ativa e avalia candidatas isoladas das operações oficiais. Validação independente antes de promoção, exclusivamente simulada e sujeita a DEC-016. Aprendizado próprio: resultados de ETH não alteram automaticamente BTC.

JUSTIFICATIVA:
Evoluir por evidências individuais com limites de autoridade.

IMPACTOS:
Agentes não alteram autonomamente código, regras de segurança, limites financeiros, contratos, critérios obrigatórios de promoção ou restrições de autorização. Modelo de geração/ajuste, estatística e monitoramento detalhado ainda pendentes.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-016
ID: DEC-016
DATA: 2026-10-29
TÍTULO: LEARN-GATE: critérios iniciais de promoção e reversão
STATUS: APPROVED

CONTEXTO:
Promoção automática simulada exige validação obrigatória.

DECISÃO:
Parâmetros iniciais configuráveis aprovados:

### Amostra e integridade
- Mínimo de 60 operações simuladas distintas e concluídas; repetições não contam como observações independentes.
- Pelo menos 3 períodos separados e mínimo de 10 operações por período.
- Cenários de alta, baixa e lateralização, incluindo contextos econômicos e notícias simuladas.
- Separação cronológica entre ajuste e validação, proibição de dados futuros e reprodução dos resultados.

### Desempenho
- Resultado líquido positivo após custos simulados.
- Melhoria média mínima de 1 ponto percentual sobre a estratégia ativa.
- Desempenho superior à ativa em pelo menos 2 dos 3 períodos.
- Comparação com mesmas condições, horizontes e custos.
- Taxa de acerto isolada não é suficiente.

### Risco
- Drawdown máximo de 10% do capital fictício.
- Drawdown não supera o da ativa em mais de 2 pontos percentuais.
- Nenhuma violação de limites financeiros ou operação não autorizada.
- Dados inválidos ou antecipados invalidam a avaliação.

### Estados de decisão
- PROMOTE: todos os critérios atendidos.
- REJECT: violação obrigatória ou desempenho insuficiente.
- INSUFFICIENT_EVIDENCE: dados insuficientes para conclusão.
- ROLLBACK: reversão controlada após degradação comprovada ou violação de limites definidos.
Reversão preserva histórico e não abandona posições simuladas abertas sem tratamento seguro. Perda isolada não provoca alteração automática. Nenhuma candidata é promovida sem atender integralmente aos critérios.

JUSTIFICATIVA:
Estabelecer guardrails iniciais de engenharia e simulação.

IMPACTOS:
Não constituem prova estatística de eficácia ou segurança real. Geração matemática de candidatas, tratamento estatístico e monitoramento pós-promoção/reversão exigem especificação adicional. Métricas/agregação e tratamento de mais de três períodos não devem ser inventados. Agentes não podem relaxar critérios.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-017
ID: DEC-017
DATA: 2026-10-29
TÍTULO: Fluxo de operações e resultados simulados
STATUS: APPROVED

CONTEXTO:
Aprendizado depende de medir análises e operações.

DECISÃO:
Analista Central disponibiliza dados/contexto; especialista analisa seu ativo e identifica oportunidade; coordenador determina prioridade; gestor avalia capital fictício; se permitido, simulação acompanha operação; encerra segundo regras a definir; registra resultados; especialista avalia desempenho; evolução testa melhorias.

JUSTIFICATIVA:
Conectar decisões e resultados auditáveis.

IMPACTOS:
Histórico DOCS-002: entrada, saída, stop, take profit, dimensionamento, custos e sentido estavam PENDING. Atualização DOCS-004: spot simulado, próxima abertura, proteções e parâmetros iniciais agora APPROVED em DEC-021 a DEC-024. Ciclo completo da ordem, expiração/reagendamento, precisão e critérios finais de dimensionamento continuam pendentes. Não inventar regras restantes.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-018
ID: DEC-018
DATA: 2026-10-29
TÍTULO: Gestor de Orçamento separado da coordenação
STATUS: APPROVED

CONTEXTO:
Prioridade não equivale a autorização financeira.

DECISÃO:
Registrar conceito funcional: controlar capital fictício, receber pedidos priorizados, avaliar disponibilidade, aplicar limites, autorizar/rejeitar, registrar reservas/liberações, impedir capital duplicado e preservar rastreabilidade. Coordenador não substitui o gestor.

JUSTIFICATIVA:
Separar orçamento da priorização e análise.

IMPACTOS:
Histórico DOCS-002: política detalhada estava PENDING; 10.000 UC, 20% por pedido, 40% de exposição e faixas por pontuação eram PROPOSED, NÃO APROVADOS. Atualização DOCS-004: capital de 10.000 UC, exposição individual de 20% do patrimônio e consolidada de 40% agora APPROVED em DEC-020, com limites de risco e perda diária. Faixas por pontuação continuam PROPOSED, não aprovadas. O limite individual é exposição, não aprovação automática de qualquer pedido de 20%.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## DEC-019
ID: DEC-019
DATA: 2026-10-29
TÍTULO: Separação conceitual de responsabilidades
STATUS: APPROVED

CONTEXTO:
Visualização deve refletir atividades, sem executar negócio.

DECISÃO:
Separar fontes/dados, inteligência contextual, estratégias individuais, priorização, gestão financeira, simulação operacional, aprendizado, visualização 3D e persistência/auditoria. Frontend 3D representa atividades e não executa lógica de negócio. Preservar contratos.

JUSTIFICATIVA:
Independência funcional dos componentes e da animação.

IMPACTOS:
Não define serviços físicos, frameworks ou infraestrutura. Tecnologias e contratos concretos PENDING; Three.js PROPOSED.

SUBSTITUI:
Não se aplica; complementa histórico sem substituir aprovação anterior.

## Consolidação DOCS-004
Fonte: BOT-CRYPTO-DOCS-004, 2026-10-29. Não foi encontrada evidência local de execução da DOCS-003 (documentos, histórico Git ou alterações locais). Não se presume sua execução. DEC-017/DEC-018 receberam atualização rastreável sem apagar o status histórico dos parâmetros. Nenhuma decisão SUPERSEDED necessária.

## DEC-020
ID: DEC-020
DATA: 2026-10-29
TÍTULO: Capital centralizado e política financeira inicial
STATUS: APPROVED

CONTEXTO:
A tarefa DOCS-004 aprova parâmetros antes pendentes, sem evidência local de DOCS-003.

DECISÃO:
Capital inicial fictício de 10.000 UC, orçamento centralizado e compartilhado, sem saldo permanente exclusivo por agente. Coordenador prioriza; Gestor autoriza ou rejeita.
- Exposição individual máxima: 20% do patrimônio.
- Exposição consolidada máxima: 40% do patrimônio.
- Risco planejado máximo por operação: 1% do patrimônio.
- Risco planejado total aberto: 2% do patrimônio.
- Perda diária máxima de referência: 3%, sobre patrimônio registrado no início do dia simulado; ao atingir o limite, bloquear novas entradas.
Limites percentuais recalculados sobre patrimônio conforme regras auditáveis, com a base diária fixa indicada acima. Risco planejado inclui custos previstos e distância até a proteção; não garante perda máxima. Gaps e deslizamentos podem produzir perdas superiores ao planejado. Dia financeiro UTC, virada 00:00 UTC. Controle diário considera redução patrimonial e perdas não realizadas, sem antecipar dados.
Operações exclusivamente spot simuladas, sem alavancagem ou venda descoberta; operações reais proibidas.

JUSTIFICATIVA:
Fixar controles compartilhados antes do desenvolvimento.

IMPACTOS:
Complementa DEC-018; detalhamento do ciclo financeiro, redimensionamento/rejeição e reconciliação ainda pendente. Faixas por pontuação não aprovadas. Não autoriza agentes a alterar limites globais.

SUBSTITUI:
Não se aplica; detalha decisões anteriores com autorização da DOCS-004.

## DEC-021
ID: DEC-021
DATA: 2026-10-29
TÍTULO: Execução na próxima abertura elegível
STATUS: APPROVED

CONTEXTO:
Evitar execução retroativa e informação futura.

DECISÃO:
Sinais usam somente candles fechados. Nenhuma execução no candle que originou o sinal. Entrada na abertura do próximo candle elegível, com autorização financeira obrigatória anterior à execução. Custos/deslizamento simulados e contabilização do preço efetivamente simulado. Não conhecer preços futuros antecipadamente. Se autorização chegar após a abertura elegível, não executar retroativamente; regra definitiva de expiração ou reagendamento PENDING.

JUSTIFICATIVA:
Manter causalidade temporal e reprodução.

IMPACTOS:
Proteções intrabar OHLC com tratamento conservador/gaps conforme DEC-023. Não consultar antecipadamente máxima, mínima ou fechamento de candles futuros.

SUBSTITUI:
Não se aplica; detalha decisões anteriores com autorização da DOCS-004.

## DEC-022
ID: DEC-022
DATA: 2026-10-29
TÍTULO: OPS-002: parâmetros operacionais iniciais
STATUS: APPROVED

CONTEXTO:
A DOCS-004 aprova configuração inicial versionada.

DECISÃO:
- Stop Loss: 2% abaixo da entrada.
- Take Profit: 4% acima da entrada.
- Taxa: 0,10% por execução.
- Deslizamento: 0,05% por execução.
- Máximo de uma posição simultânea por ativo.
- Encerramento integral na primeira versão.
- Saída por estratégia na próxima abertura elegível.
- Saída por stop/take ativo segundo OHLC intrabar, conforme DEC-023.
- Dia financeiro UTC, virada às 00:00 UTC.
- Auditoria persistente e preservação de proteção durante promoção/rollback.
Parâmetros de estratégia configuráveis e versionados. Agentes podem testar alterações em candidatas; promoção somente após cumprir integralmente LEARN-GATE. Não podem alterar limites financeiros globais ou critérios obrigatórios de promoção.

JUSTIFICATIVA:
Estabelecer uma configuração inicial reprodutível para simulação.

IMPACTOS:
Sem implementação. Precisão, arredondamento, ciclo de vida da ordem e demais pendências não são resolvidos implicitamente pelos parâmetros. DEC-016 preservada integralmente.

SUBSTITUI:
Não se aplica; detalha decisões anteriores com autorização da DOCS-004.

## DEC-023
ID: DEC-023
DATA: 2026-10-29
TÍTULO: Saída conservadora por OHLC e gaps
STATUS: APPROVED

CONTEXTO:
OHLC não revela a sequência intrabar quando stop e take são atingidos.

DECISÃO:
1. Avaliar gaps na abertura do candle.
2. Se uma posição comprada abrir abaixo do stop, usar abertura desfavorável com deslizamento aplicável.
3. Se abrir acima do take, não conceder ganho além do alvo sem regra de execução aprovada.
4. Se apenas stop for atingido intrabar, processar stop.
5. Se apenas take for atingido intrabar, processar take.
6. Se ambos forem atingidos e sequência desconhecida, processar stop primeiro.
7. Não encerrar posição duas vezes.
8. Aplicar custos efetivos simulados na apuração.
9. Registrar razão da saída.
10. Proibir uso antecipado de máxima, mínima ou fechamento de candles futuros.
Saída estratégica só na próxima abertura elegível. Mudanças de proteção após fechamento não se aplicam retroativamente.

JUSTIFICATIVA:
Resolver ambiguidades de modo conservador e rastreável.

IMPACTOS:
Preço efetivamente simulado deve constar na contabilidade. Regras adicionais de prioridade entre eventos coincidentes não definidas nesta tarefa não devem ser inventadas.

SUBSTITUI:
Não se aplica; detalha decisões anteriores com autorização da DOCS-004.

## DEC-024
ID: DEC-024
DATA: 2026-10-29
TÍTULO: Proteção de posições durante evolução
STATUS: APPROVED

CONTEXTO:
Evolução não pode abandonar posições ou ampliar risco autorizado.

DECISÃO:
Toda posição mantém vínculo com estratégia/versão de origem e stop obrigatório. Pode apertar proteção conforme regra autorizada; não ampliar risco além do autorizado. Promoção não modifica retroativamente posições abertas; rollback não as abandona. Histórico de versões/decisões preservado; nenhuma alteração descumpre limites financeiros.

JUSTIFICATIVA:
Manter proteção e responsabilidade por versão durante evolução.

IMPACTOS:
DEC-016 e LEARN-GATE integralmente preservados. Regra concreta para apertar proteção e critérios quantitativos de rollback por degradação continuam pendentes, sem licença para relaxar risco.

SUBSTITUI:
Não se aplica; detalha decisões anteriores com autorização da DOCS-004.

## DEC-025
ID: DEC-025
DATA: 2026-10-29
TÍTULO: Contabilidade e auditoria financeira persistente
STATUS: APPROVED

CONTEXTO:
Resultados financeiros e aprendizado precisam de trilha reproduzível.

DECISÃO:
Controlar caixa disponível/reservado, posições abertas, patrimônio total, resultado realizado/não realizado, exposição consolidada, risco planejado, perdas diárias, taxas/deslizamentos e justificativas de autorizações/rejeições. Marcação a mercado usa preços conhecidos no instante; perda diária considera redução patrimonial e perdas não realizadas.
Cada operação rastreia agente/ativo, estratégia/versão, oportunidade original, nota enviada ao Coordenador, dados/contexto, decisão de orçamento, capital/risco autorizados, entrada/saída, custos, stop/take, resultado e eventos usados no aprendizado.
Histórico persistente, auditável e idempotente. Correções preservam originais por eventos de ajuste/compensação. Sem duplicação de reservas, execuções, taxas ou liquidações. Separar resultados da carteira simulada de avaliações hipotéticas de sinais não executados. Reinício preserva histórico e estado persistido; repetir cenário/parâmetros/sequência produz os mesmos resultados. Resultados alimentam somente o especialista responsável.

JUSTIFICATIVA:
Permitir reconciliação, auditoria e avaliação individual sem duplicações.

IMPACTOS:
Tecnologia de persistência, precisão, arredondamento, reconciliação, falhas/recuperação e detalhamento das avaliações hipotéticas PENDING. Critérios de aceite ligados em REQUIREMENTS.md.

SUBSTITUI:
Não se aplica; detalha decisões anteriores com autorização da DOCS-004.

## Consolidação DOCS-005
Fonte: tarefa BOT-CRYPTO-DOCS-005, 2026-10-29, aprovações SIGNAL-001 a SIGNAL-004. DEC-001 a DEC-025 preservadas integralmente como histórico. Pendências históricas de fórmula/desempate em DEC-014 e expiração em DEC-021 passam a ter as definições funcionais abaixo; calibração e contingências restantes não são aprovadas implicitamente. DEC-016 e DEC-020 a DEC-025 não foram alteradas. Não há implementação.

## DEC-026
ID: DEC-026
DATA: 2026-10-29
TÍTULO: SIGNAL-001: seleção adaptativa de estratégias por ativo
STATUS: APPROVED

CONTEXTO:
A DOCS-005 consolida aprovação funcional de SIGNAL-001.

DECISÃO:
Especialista usa exclusivamente estratégias, memória e resultados do próprio ativo, com múltiplas estratégias e seleção adaptativa conforme regime/contexto. Política de seleção e combinação versionada. Estratégias e candidatas independentes entre ativos: resultados de BTC não alteram automaticamente ETH, nem o inverso. Central fornece contexto, sem ordens ou substituição do especialista. Coordenador prioriza oportunidades sem recalcular análise ou pontuação. Evolução da política adaptativa somente após validação integral pelo LEARN-GATE de DEC-016.
Famílias iniciais PROPOSED: tendência, rompimento, reversão à média; contexto econômico/geopolítico como camada transversal. Não são algoritmos completos aprovados.

JUSTIFICATIVA:
Permitir adaptação por ativo mantendo limites entre papéis.

IMPACTOS:
Seleção/combinação funcional aprovada; estratégias concretas, indicadores e parametrizações PENDING. Não aprova composição definitiva de ativos ou tecnologias.

SUBSTITUI:
Não se aplica; complementa e detalha decisões anteriores, preservando histórico.

## DEC-027
ID: DEC-027
DATA: 2026-10-29
TÍTULO: SIGNAL-002: regimes, pontuação global e elegibilidade
STATUS: APPROVED

CONTEXTO:
A DOCS-005 aprova estrutura global, sem aprovar calibração interna.

DECISÃO:
Classificação inicial APPROVED:
- Regimes principais: UPTREND, DOWNTREND, SIDEWAYS, UNKNOWN quando dados insuficientes ou classificação inválida.
- Dimensões complementares: volatilidade normal/elevada; contexto favorável/desfavorável/neutro/incerto.
Classificação determinística, usando apenas informações disponíveis no instante simulado.

Componentes normalizados 0–100 e pesos globais:
- T: evidência técnica, 35%.
- R: adequação ao regime, 25%.
- C: contexto econômico/notícias, 15%.
- H: desempenho histórico validado, 15%.
- A: concordância independente, 10%.
S = round(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A)
Limiar inicial para ENTRY_CANDIDATE: S >= 70.
Score não é probabilidade de lucro, autorização financeira, garantia de execução ou medida suficiente de risco. Pesos globais e limiar não podem ser modificados autonomamente.

Elegibilidade obrigatória: dados válidos, cronológicos e atuais; sem futuro; regime conhecido/válido; evidência de ao menos uma estratégia elegível; sem posição aberta conflitante ou duplicação de sinal; pontuação mínima. Autorização financeira separada antes de executar.

Heurísticas ainda PROPOSED, não aprovadas: EMA 20/50, ADX 14/possível limiar 20, ATR 14 normalizado, percentil 75/janela de volatilidade, mínimo de 150 candles. Cálculo exato de T/R/C/H/A, dependências quantitativas entre estratégias e H com histórico insuficiente PENDING. Não impor H neutro de 50 sem aprovação. Baseline inicial identificado UNVALIDATED.

JUSTIFICATIVA:
Padronizar comparabilidade sem confundir nota e risco ou execução.

IMPACTOS:
Antiga fórmula 40/35/25 continua não aprovada e não é a nova fórmula. Algoritmos de regime, atualidade dos dados, normalizações, arredondamento exato e histórico insuficiente ainda exigem especificação; não inventar detalhes.

SUBSTITUI:
Não se aplica; complementa e detalha decisões anteriores, preservando histórico.

## DEC-028
ID: DEC-028
DATA: 2026-10-29
TÍTULO: SIGNAL-003: ciclos de aprendizado e decisões operacionais
STATUS: APPROVED

CONTEXTO:
A DOCS-005 aprova organização funcional do aprendizado e tipos de decisão.

DECISÃO:
Uma política ativa oficial por especialista; até três candidatas por ciclo e por agente. Avaliar candidatas isoladamente, sem consumir capital da carteira oficial. Candidatas/ativa usam condições comparáveis e dados cronológicos. Baseline pode iniciar operações simuladas identificado UNVALIDATED; histórico insuficiente não prova desempenho. Toda promoção posterior exige integralmente DEC-016. Estratégias/políticas versionadas; preservar histórico, resultados e evidências. Mudanças não retroagem sobre operações anteriores. Promoção/rollback preservam proteção de posições abertas. Agentes não alteram código, limites globais, segurança ou critérios obrigatórios.

Tipos aprovados:
- ENTRY_CANDIDATE: potencial compra spot elegível, score >=70 e demais critérios; encaminhar ao Coordenador.
- EXIT_REQUEST: pedido estratégico de encerrar posição existente, próxima abertura elegível; independe da fila de novas compras.
- HOLD: manutenção de posição aberta.
- WAIT: sem nova posição ou oportunidade válida.
- RISK_ALERT: evento informativo adicional, pode acompanhar outra decisão; não autoriza operação sozinho.
Uma decisão operacional oficial por ativo e candle fechado, com alertas adicionais permitidos. Proteções stop/take existentes operam independentemente da fila de oportunidades, conforme OPS-002. Registrar divergências entre estratégias.

JUSTIFICATIVA:
Permitir simulação inicial e evolução controlada sem contaminar carteira ou histórico.

IMPACTOS:
DEC-016 preservada integralmente: 60 operações distintas concluídas, pelo menos três períodos com mínimo dez cada e demais critérios já aprovados. Não reduzir drawdown, integridade ou comparação exigidos. Frequência dos ciclos, mutações, métricas, sobreajuste, monitoramento e rollback detalhado PENDING.

SUBSTITUI:
Não se aplica; complementa e detalha decisões anteriores, preservando histórico.

## DEC-029
ID: DEC-029
DATA: 2026-10-29
TÍTULO: SIGNAL-004: validade, priorização e idempotência dos sinais
STATUS: APPROVED

CONTEXTO:
A DOCS-005 resolve validade de oportunidades e desempate funcional.

DECISÃO:
ENTRY_CANDIDATE vale somente até a próxima abertura elegível, com autorização financeira válida anterior à execução. Perdeu abertura: expirar, sem execução retroativa ou transferência da mesma autorização para nova oportunidade. Expiração/cancelamento libera reserva idempotentemente. Nova oportunidade exige nova análise com dados válidos. Relógio da simulação, não animação/tempo real; pausa não expira sinal por tempo real.

Coordenador desempata nesta ordem:
1. Maior pontuação válida.
2. Data/hora simulada mais antiga do sinal.
3. Rodízio determinístico entre ativos em empate completo.
4. Identificador estável final.
Persistir estado necessário do rodízio. Oportunidades do mesmo ciclo têm ordem reproduzível, independente da chegada casual/assíncrona. Coordenador não muda pontuações ou resultados de estratégias.

EXIT_REQUEST: próxima abertura elegível; se perdida, sem retroatividade e com reavaliação obrigatória. HOLD e WAIT valem no ciclo corrente; WAIT sem reserva. RISK_ALERT é persistido com situação rastreável, sem criar ordem automaticamente.

Identidade estável por sinal/ciclo; reprocessamento não duplica oportunidades, reservas ou operações. Dados ausentes/inválidos bloqueiam novas entradas; posições abertas não podem perder proteção por indisponibilidade. Contingências não definidas continuam PENDING. Rejeição por falta de capital não prova erro de estratégia; resultados hipotéticos separados da carteira.

JUSTIFICATIVA:
Fixar validade temporal, ordenação e ausência de efeitos duplicados.

IMPACTOS:
Complementa DEC-021 sem editar sua versão histórica: expiração antes pendente agora aprovada, sem reagendamento automático do mesmo sinal/autorização. Ciclo completo da ordem, contingências, recuperação e detalhes contábeis seguem PENDING. Limites financeiros e DEC-016 não alterados.

SUBSTITUI:
Não se aplica; complementa e detalha decisões anteriores, preservando histórico.

## Consolidação DOCS-006 — LEARN-004
Fonte: BOT-CRYPTO-DOCS-006, 2026-10-29. DEC-001 a DEC-029 preservadas integralmente. As métricas, validação, pesquisa, drawdown e monitoramento antes registrados genericamente como pendentes passam a ter as definições abaixo; detalhes residuais continuam PENDING. DEC-016 não foi editada nem relaxada. Nenhuma implementação.

## DEC-030
ID: DEC-030
DATA: 2026-10-29
TÍTULO: LEARN-004: retorno líquido patrimonial
STATUS: APPROVED

CONTEXTO:
A DOCS-006 detalha métrica oficial de comparação sem substituir o LEARN-GATE.

DECISÃO:
Retorno líquido percentual sobre patrimônio simulado, por período:
R_p = 100 * (E_final - E_inicial) / E_inicial
Melhoria média:
Delta = mean(R_candidata,p - R_ativa,p)
Usar inicialmente três períodos cronológicos de mesma duração e condições equivalentes. Exigir Delta >= 1 ponto percentual, resultado líquido positivo após custos e superioridade da candidata em pelo menos dois dos três períodos, além de TODOS os critérios de DEC-016. Custos, taxas, deslizamento e patrimônio marcado a mercado comparáveis. Métrica de retorno não substitui risco ou integridade.

JUSTIFICATIVA:
Comparar desempenho líquido patrimonial sob condições equivalentes.

IMPACTOS:
Detalha DEC-016 sem alterar sua redação ou limites. Casos matemáticos excepcionais ainda não definidos continuam pendentes; não inventar tratamento.

SUBSTITUI:
Não se aplica; detalha decisões anteriores sem apagar seu histórico.

## DEC-031
ID: DEC-031
DATA: 2026-10-29
TÍTULO: LEARN-004: validação cronológica independente
STATUS: APPROVED

CONTEXTO:
A validação deve separar ajuste de evidência final reservada.

DECISÃO:
Inicialmente três períodos cronológicos, sem sobreposição, de mesma duração e contabilmente independentes. Cada carteira começa com 10.000 UC e sem posições abertas; ativa/candidata recebem os mesmos dados, acontecimentos, condições financeiras e custos. Incluir regimes de alta, baixa e lateralização e eventos contextuais.
Sequência: dados de desenvolvimento/ajuste -> congelamento da candidata e parâmetros -> dados reservados de validação final. Não usar validação antecipadamente no ajuste. Pode aquecer indicadores com dados anteriores à janela, sem contabilizar operações fora da avaliação.
Nas fronteiras: posições abertas integram patrimônio marcado a mercado, com provisão estimada de custos de encerramento; não contam como operações concluídas; não forçar fechamento fictício pelo fim da janela; não transportar posições automaticamente entre carteiras independentes. Preservar número e identificadores distintos das operações encerradas.
Mínimo permanece 60 operações distintas encerradas no conjunto válido, pelo menos 10 por período e demais critérios DEC-016.

JUSTIFICATIVA:
Evitar contaminação temporal e distorções de patrimônio/amostra nas janelas.

IMPACTOS:
Duração concreta, cenários, aquecimento numérico e recuperação de avaliações interrompidas PENDING. As carteiras independentes de avaliação não movimentam capital oficial.

SUBSTITUI:
Não se aplica; detalha decisões anteriores sem apagar seu histórico.

## DEC-032
ID: DEC-032
DATA: 2026-10-29
TÍTULO: LEARN-004: geração controlada e proteção contra sobreajuste
STATUS: APPROVED

CONTEXTO:
Ciclos de candidatas precisam de limites e histórico de pesquisa.

DECISÃO:
Uma política ativa oficial por especialista; até três candidatas por ciclo/agente, derivadas de versão identificada, por busca local controlada. Alterações somente em parâmetros/seleção autorizados. Registrar hipótese, parâmetros, versões, sementes e histórico de TODAS as tentativas, incluindo número acumulado entre ciclos. Escolher no máximo uma desafiante por ciclo para validação final reservada. Candidatas não movimentam capital oficial.
Não alterar código/contratos, pesos globais do score, limiar 70, limites financeiros ou critérios LEARN-GATE. Toda promoção exige DEC-016 integral.
Não selecionar parâmetros com dados de validação final, escolher retrospectivamente períodos favoráveis ou reutilizar oportunisticamente períodos finais após conhecer resultados. Não contar operações repetidas como independentes; registrar concentração por período/regime; comparar nas mesmas condições. Invalidar avaliações contaminadas ou com look-ahead. Usar INSUFFICIENT_EVIDENCE quando faltarem dados válidos. Mínimos numéricos não equivalem a comprovação estatística.

JUSTIFICATIVA:
Controlar pesquisa e impedir que tentativas ocultas contaminem a evidência.

IMPACTOS:
Intervalos concretos mutáveis, algoritmos de mutação/geração, frequência operacional dos ciclos e métodos estatísticos complementares PENDING; não aprovar esses detalhes implicitamente.

SUBSTITUI:
Não se aplica; detalha decisões anteriores sem apagar seu histórico.

## DEC-033
ID: DEC-033
DATA: 2026-10-29
TÍTULO: LEARN-004: drawdown pelo pior período
STATUS: APPROVED

CONTEXTO:
A comparação de risco deve considerar curva patrimonial e pior janela.

DECISÃO:
Para cada instante:
P_t = maior patrimônio observado desde o início do período.
DD_t = 100 * (P_t - E_t) / P_t
E_t = patrimônio líquido simulado com posições abertas marcadas a mercado e custos pertinentes.
MDD_p = max(DD_t) do período.
MDD_final = max(MDD_1, MDD_2, MDD_3).
Aplicar simultaneamente:
- MDD_final da candidata <= 10%.
- MDD_final da candidata <= MDD_final da ativa + 2 pontos percentuais.
Ativa/candidata usam a mesma metodologia; não substituir pior período por drawdown médio. Curva calculada com dados conhecidos em cada instante, sem antecipação temporal.

JUSTIFICATIVA:
Fixar cálculo compatível com limites já aprovados em DEC-016.

IMPACTOS:
Não altera limites de risco ou perda diária da carteira oficial. Precisão/arredondamento e casos excepcionais continuam PENDING.

SUBSTITUI:
Não se aplica; detalha decisões anteriores sem apagar seu histórico.

## DEC-034
ID: DEC-034
DATA: 2026-10-29
TÍTULO: LEARN-004: monitoramento pós-promoção e suspensão imediata
STATUS: APPROVED

CONTEXTO:
Promoção precisa de referência histórica e mecanismos distintos de proteção.

DECISÃO:
Após PROMOTE, nova versão gera decisões oficiais do especialista. Anterior permanece como referência identificada e pode ser avaliada em paralelo sem consumir capital oficial; preservar histórico/evidências.
Degradação comprovada para rollback: duas janelas consecutivas, sem sobreposição, com mesma duração de avaliação; pelo menos 20 operações distintas encerradas da versão promovida em CADA janela. Retorno líquido da promovida inferior ao da anterior em pelo menos 1 ponto percentual em CADA janela; comparar condições, dados, custos e capital inicial equivalentes, registrando métricas, períodos e justificativa. Amostra insuficiente não comprova degradação com resultados isolados.
Violações críticas de segurança, autorização, integridade ou limites exigem suspensão imediata de NOVAS ENTRADAS, sem aguardar janelas. Suspensão imediata e rollback por degradação são mecanismos distintos.

JUSTIFICATIVA:
Separar evidência de degradação de proteção imediata contra violações.

IMPACTOS:
Duração concreta de janelas, tratamento de casos excepcionais e recuperação permanecem PENDING. Suspensão não autoriza abandono de posições ou remoção de proteção.

SUBSTITUI:
Não se aplica; detalha decisões anteriores sem apagar seu histórico.

## DEC-035
ID: DEC-035
DATA: 2026-10-29
TÍTULO: LEARN-004: rollback seguro para novas decisões
STATUS: APPROVED

CONTEXTO:
Reversão não pode apagar histórico, abandonar posições ou remover bloqueios.

DECISÃO:
Registrar motivo/evidências, sem apagar versão promovida ou histórico nem alterar decisões retroativamente. Reversão aplica-se a novas decisões. Posições existentes mantêm stop, take profit e estratégia/versão de origem; não abandoná-las.
Usar versão anterior somente se continuar íntegra/elegível; sem versão segura, manter novas entradas suspensas. Rollback não revoga bloqueios financeiros nem modifica limites globais.
Preservar estados PROMOTE, REJECT, INSUFFICIENT_EVIDENCE e ROLLBACK. Promoção/reversão continuam exclusivamente simuladas e sujeitas a DEC-016 e limites financeiros.

JUSTIFICATIVA:
Manter rastreabilidade e proteção das posições durante reversão.

IMPACTOS:
A aprovação deste mecanismo não define tecnologias, contratos técnicos ou recuperação detalhada de falhas.

SUBSTITUI:
Não se aplica; detalha decisões anteriores sem apagar seu histórico.

## Consolidação DOCS-007-R2
Fonte: BOT-CRYPTO-DOCS-007-R2, 2026-10-29; baseline 0feccd4b35cd12422c6dca24e7723b0edb3b1ace limpa, sem DOCS-007 anterior aplicada. DEC-001 a DEC-035 preservadas integralmente. As novas aprovações fecham composição, parâmetros e distribuição das janelas antes pendentes; não enfraquecem SIGNAL-001 a SIGNAL-004, DEC-016, LEARN-004 ou OPS-002. Registros antigos expressam o conhecimento da época; os seguintes detalham a configuração atual. Nenhuma implementação ou simulação.

## DEC-036
ID: DEC-036
DATA: 2026-10-29
TÍTULO: MVP-SCOPE-001: cinco agentes lógicos e dois ativos
STATUS: APPROVED

CONTEXTO:
A DOCS-007-R2 fecha a composição funcional inicial do MVP.

DECISÃO:
Exatamente cinco agentes: Analista Central de Inteligência, Especialista BTC, Especialista ETH, Coordenador de Oportunidades e Gestor de Orçamento. Simulador, execução e auditoria são componentes separados, não agentes adicionais. SOL fica para expansão futura. Especialistas têm estratégias, versões e aprendizado independentes. Coordenador prioriza sinais existentes sem recalcular scores ou autorizar capital; Gestor controla capital/risco.

JUSTIFICATIVA:
Fixar escopo sem agentes redundantes ou mistura de responsabilidades.

IMPACTOS:
Detalha DEC-009/DEC-019 e resolve composição antes pendente; não muda limites ou competências dos papéis.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-037
ID: DEC-037
DATA: 2026-10-29
TÍTULO: MVP-SCOPE-002/003: candles e seis cenários simulados
STATUS: APPROVED

CONTEXTO:
É necessário definir dados e temporalidade sem expor o regime verdadeiro aos especialistas.

DECISÃO:
Operações avaliadas com candles fechados de 5 minutos; regimes e contexto técnico superior em candles fechados de 1 hora. Cada horário agrega 12 candles válidos de 5 minutos. Relógio simulado UTC, mercado 24/7. Dados/eventos determinísticos, reproduzíveis e sem antecipação. Seis cenários: alta estável, alta turbulenta, baixa gradual, queda brusca, lateral estável, lateral turbulenta. Gerador conhece regime verdadeiro; agentes não recebem esse rótulo. BTC e ETH podem reagir diferentemente ao mesmo evento. Sem API de negociação real, capital real ou infraestrutura paga obrigatória.

JUSTIFICATIVA:
Separar dados simulados da classificação inferida pelos agentes.

IMPACTOS:
Candle horário em formação não é fonte válida de regime. Geração concreta e contingências ainda dependem de especificações pertinentes.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-038
ID: DEC-038
DATA: 2026-10-29
TÍTULO: MVP-SCOPE-004: cronologia e correção das janelas de validação
STATUS: APPROVED

CONTEXTO:
A DOCS-007-R2 aprova durações e distribuição mista em CADA janela; não há DOCS-007 anterior aplicada na baseline.

DECISÃO:
Aquecimento inicial de 150 candles horários; desenvolvimento de 90 dias simulados; validação em três janelas independentes de 30 dias com 10.000 UC iniciais por carteira; monitoramento pós-promoção em duas janelas de 30 dias. Total cronológico inicial: 240 dias, mais aquecimento inicial. Não transferir posições, capital ou operações entre carteiras independentes.
Cada janela de validação contém os seis cenários, cinco dias por cenário, nas ordens:
- V1: alta estável -> alta turbulenta -> baixa gradual -> queda brusca -> lateral estável -> lateral turbulenta.
- V2: lateral estável -> lateral turbulenta -> alta estável -> alta turbulenta -> baixa gradual -> queda brusca.
- V3: baixa gradual -> queda brusca -> lateral estável -> lateral turbulenta -> alta estável -> alta turbulenta.
Trajetórias/sementes distintas, sem duplicar observações ou manipular cenários para produzir operações mínimas. Preservar DEC-016/LEARN-004: 60 operações distintas concluídas no conjunto e pelo menos 10 em cada janela; insuficiência gera INSUFFICIENT_EVIDENCE.
Permitir aquecimento com histórico anterior a cada carteira, sem importar estado operacional anterior ou reutilizar validação reservada para otimizar parâmetros.

JUSTIFICATIVA:
Garantir diversidade em cada carteira e evitar uma janela exclusiva para cada regime.

IMPACTOS:
Detalha DEC-031/DEC-034, sem editar histórico ou limites. A cronologia não comprova obtenção da amostra; nenhuma simulação executada nesta tarefa.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-039
ID: DEC-039
DATA: 2026-10-29
TÍTULO: MVP-SCOPE-005: três famílias técnicas iniciais
STATUS: APPROVED

CONTEXTO:
Famílias antes propostas passam a ter os gatilhos iniciais aprovados.

DECISÃO:
Tendência: EMA9/EMA21 de 5 minutos, recuperação da EMA9, adequação ao UPTREND. Rompimento: fechamento acima da máxima dos 20 candles anteriores e volume >1,2 vezes a média anterior. Reversão à média: SIDEWAYS, RSI14 recuperando acima de 35 após sobrevenda e retorno para dentro da banda inferior Bollinger 20/2. Parâmetros e aprendizado independentes por ativo. Contexto econômico/geopolítico continua camada transversal, não agente ou voto de família adicional.

JUSTIFICATIVA:
Fechar famílias iniciais sem cruzar aprendizagem entre BTC e ETH.

IMPACTOS:
Cálculos complementares em SIGNAL-005; intervalos mutáveis e bordas ainda não aprovadas não são inferidos.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-040
ID: DEC-040
DATA: 2026-10-29
TÍTULO: MVP-SCOPE-006: escritório 3D e controles
STATUS: APPROVED

CONTEXTO:
A referência visual e o layout central ganham escopo funcional de interface.

DECISÃO:
Instalação web 3D de um andar, cinco personagens, mesas por especialista, salas da Central e do Gestor, Coordenador, painel compartilhado e navegação curta. Preservar layout central aprovado, mesas ao redor. Câmera orbit/zoom/pan e interação com agentes/ambientes. Painéis derivados de eventos reais da simulação; animações simples sem interferir na lógica. Controles iniciar, pausar, avançar 5 minutos, velocidade e reinício confirmado. Expansão lateral futura; nenhuma engine ou stack escolhida.

JUSTIFICATIVA:
Representar estados da simulação de modo navegável e compreensível.

IMPACTOS:
Interações aprovadas; não representam implementação. Three.js continua PROPOSED. Inclusão de novos ativos é expansão futura, não ampliação automática do MVP.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-041
ID: DEC-041
DATA: 2026-10-29
TÍTULO: SIGNAL-005.1: H inicial e arredondamento global
STATUS: APPROVED

CONTEXTO:
A DOCS-007-R2 resolve o histórico inicial sem conceder desempenho fictício.

DECISÃO:
Enquanto política operacional UNVALIDATED, H=0. Preservar pesos globais e usar S = round_half_up(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A), limiar S >= 70. Score não é probabilidade de lucro. Não relaxar elegibilidade, orçamento ou limiar por falta de histórico.

JUSTIFICATIVA:
Definir baseline operacional sem imputação neutra não aprovada.

IMPACTOS:
Detalha DEC-027/REQ-065: H=50 não é fallback. Verificação quantitativa de oportunidades com H=0 permanece PENDING, sem executar simulação aqui.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-042
ID: DEC-042
DATA: 2026-10-29
TÍTULO: SIGNAL-005.2: regimes horários e volatilidade
STATUS: APPROVED

CONTEXTO:
A classificação deve usar apenas indicadores e candles já fechados.

DECISÃO:
Indicadores horários: EMA20, EMA50, ADX/DI14, ATR14.
D = (EMA20 - EMA50) / ATR14
- UPTREND: ADX>=25, D>=0,25 e +DI>-DI.
- DOWNTREND: ADX>=25, D<=-0,25 e -DI>+DI.
- SIDEWAYS: ADX<20.
- UNKNOWN: zona intermediária, contradição, dados inválidos ou histórico insuficiente.
Confirmar novo regime em dois candles horários consecutivos; dados inválidos causam UNKNOWN imediatamente. Não consultar horário em formação.
Volatilidade: ATR14 / Close, comparada ao percentil 75 (nearest rank) dos 100 valores horários anteriores. Atual acima do percentil: HIGH; demais valores válidos: NORMAL.

JUSTIFICATIVA:
Fixar classificação causal e tratamento conservador de insuficiência.

IMPACTOS:
Indexação e bordas exatas dos indicadores continuam PENDING; não inventar fallback numérico para divisor inválido.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-043
ID: DEC-043
DATA: 2026-10-29
TÍTULO: SIGNAL-005.3: evidência técnica T
STATUS: APPROVED

CONTEXTO:
O score técnico é calculado por estratégia elegível.

DECISÃO:
T = 40G + 30F + 20Q + 10V
G: gatilho obrigatório binário.
F: força técnica normalizada.
Q = (Close-Low)/(High-Low)
V = clip((Volume/Media20Anterior-1)/0.5, 0, 1)
F de tendência: separação EMA9-EMA21 normalizada por 0,5*ATR14 de 5 minutos.
F de rompimento: distância do fechamento acima da máxima anterior de 20 candles normalizada por 0,5*ATR14.
F de reversão: recuperação do RSI acima de 35, com profundidade de sobrevenda normalizada por 15 e janela de três candles anteriores.
Ausência de gatilho, histórico insuficiente ou divisor inválido impede entrada. Janelas de rompimento/volume excluem candle atual.

JUSTIFICATIVA:
Tornar evidência técnica rastreável sem aceitar sinais inválidos.

IMPACTOS:
Preservar exatamente os termos aprovados; composição/indexação e bordas não explicitadas não são completadas por suposição.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-044
ID: DEC-044
DATA: 2026-10-29
TÍTULO: SIGNAL-005.4: matriz de adequação R
STATUS: APPROVED

CONTEXTO:
Elegibilidade não equivale a uma nota zero.

DECISÃO:
Matriz aprovada:

| Regime | Estratégia | Vol. NORMAL | Vol. HIGH |
|---|---|---:|---:|
| UPTREND | Tendência | 100 | 80 |
| UPTREND | Rompimento | 90 | 80 |
| SIDEWAYS | Rompimento | 80 | 60 |
| SIDEWAYS | Reversão | 100 | 60 |

Demais combinações INELEGIBLE, distintas de R=0. DOWNTREND sem novas compras; UNKNOWN e volatilidade inválida bloqueiam entradas.

JUSTIFICATIVA:
Impedir que uma nota alta contorne inelegibilidade de regime/família.

IMPACTOS:
Não alterar limiar 70 ou competências do Coordenador.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-045
ID: DEC-045
DATA: 2026-10-29
TÍTULO: SIGNAL-005.5: contexto C por ativo
STATUS: APPROVED

CONTEXTO:
Contexto deve distinguir fatos simulados, rumores e disponibilidade temporal.

DECISÃO:
Base neutra C=50 somente com fluxo de eventos válido.
C = clip(50 + soma(direcao*intensidade*decaimento) - U, 0, 100)
Fatos confirmados simulados: intensidade 10/20/30, direção favorável/desfavorável/neutra por ativo. Decaimento linear: cripto 6h, macro 24h, geopolítico/regulatório 72h. Rumores: penalidade de 5 por grupo independente, limitada a 10; não conceder bônus positivo por rumor não confirmado. Eventos duplicados agrupados por ID estável. Disponíveis apenas a partir do timestamp de publicação/disponibilização. BTC e ETH interpretam impactos separadamente. Fluxo obrigatório inválido bloqueia novas entradas; rumores não são fatos.

JUSTIFICATIVA:
Manter contexto causal, sem duplicação de influência ou evidência inventada.

IMPACTOS:
Precedência de eventos simultâneos/contraditórios PENDING; não escolher regra automaticamente.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-046
ID: DEC-046
DATA: 2026-10-29
TÍTULO: SIGNAL-005.6: concordância A entre famílias
STATUS: APPROVED

CONTEXTO:
Votos devem pertencer ao mesmo ativo e à política avaliada.

DECISÃO:
A=50 com uma família válida. A=100 com pelo menos duas famílias distintas e elegíveis, cada uma com T>=60; A=100 somente para candidatas que participam dessa concordância qualificada. Não contar versões duplicadas da mesma família, misturar votos BTC/ETH ou incluir shadow/challengers fora da política avaliada. Uma decisão operacional oficial por ativo/candle fechado, preservando alertas adicionais já aprovados.

JUSTIFICATIVA:
Evitar concordância artificial ou contaminação entre políticas/ativos.

IMPACTOS:
Não soma scores nem substitui seleção representativa e autorização financeira.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-047
ID: DEC-047
DATA: 2026-10-29
TÍTULO: SIGNAL-005.7: seleção interna de representante
STATUS: APPROVED

CONTEXTO:
Desempate do especialista deve permanecer distinto do Coordenador.

DECISÃO:
Calcular score separadamente por estratégia elegível; arredondar apenas score global por half-up nesta seleção. Escolher por maior S arredondado, maior score bruto, maior T, maior R e ID estável canônico crescente, nessa ordem. Preservar estratégia/versão de origem, avaliações descartadas, timestamps e justificativas. Nunca somar scores de estratégias distintas. Ordenação/rodízio aprovados do Coordenador permanecem inalterados.

JUSTIFICATIVA:
Produzir uma decisão oficial auditável sem reanálise pela coordenação.

IMPACTOS:
Arredondamento próprio do H em DEC-049 é regra separada; precisão/serialização e execução OPS-003 continuam pendentes.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-048
ID: DEC-048
DATA: 2026-10-29
TÍTULO: SIGNAL-005.8: H pertence à política por especialista
STATUS: APPROVED

CONTEXTO:
Desempenho histórico precisa de origem inequívoca.

DECISÃO:
H pertence à política adaptativa versionada de cada especialista. Todas as estratégias da mesma política utilizam o H operacional autorizado daquela versão. Históricos de BTC e ETH não são compartilhados.

JUSTIFICATIVA:
Preservar independência por ativo e rastreabilidade por versão.

IMPACTOS:
H calculado e H operacional autorizado são conceitos diferentes, detalhados em DEC-049.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-049
ID: DEC-049
DATA: 2026-10-29
TÍTULO: SIGNAL-005.9: H validado e ativação não retroativa
STATUS: APPROVED

CONTEXTO:
Ativar H altera decisões e exige validação própria, sem autorização implícita por cálculo.

DECISÃO:
Somente após aprovação integral LEARN-GATE:
H = round_half_up(50 + 20E + 10K + 10D)
E = clip((Delta - 1)/2, 0, 1), Delta em pontos percentuais de melhoria média líquida.
K = numero_de_periodos_superiores - 2
D = clip((10-MDD)/10, 0, 1), MDD pior drawdown percentual nas três janelas.
Faixa de H validado: 50–90. Sem evidência suficiente ou política UNVALIDATED, H operacional inicial zero. Distinguir H histórico calculado de H operacional efetivamente autorizado.
Ativar H positivo muda os sinais: exige nova configuração versionada e validação cronológica independente. Não aplicar retroativamente.

JUSTIFICATIVA:
Evitar que evidência obtida com uma configuração autorize automaticamente outra.

IMPACTOS:
Máquina de estados de experimentação/ativação de H positivo e bootstrap/referência da primeira política validada continuam PENDING. E/D desta fórmula são locais ao cálculo de H; não confundir D com separação de EMAs em DEC-042.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## DEC-050
ID: DEC-050
DATA: 2026-10-29
TÍTULO: SIGNAL-005.10: indicadores matemáticos e saídas estratégicas
STATUS: APPROVED

CONTEXTO:
Indicadores e saídas devem seguir dados fechados e versão de origem.

DECISÃO:
EMA: semente SMA de N fechamentos e atualização por 2/(N+1).
RSI14: Wilder; casos de médias nulas precisam ser explicitados nas convenções de borda, sem inventar valores de fallback.
ATR14 e ADX/DI14: Wilder. Bollinger20/2: SMA20 mais/menos 2 desvios-padrão populacionais. Rompimento/volume usam janelas anteriores excluindo atual. Sem valores futuros ou candles incompletos; indicadores inválidos bloqueiam sinais dependentes.
Saídas: tendência com dois fechamentos consecutivos abaixo da EMA21; rompimento com dois fechamentos abaixo do nível rompido congelado na entrada; reversão com fechamento alcançando/superando SMA20 central da Bollinger. Saída estratégica gera EXIT_REQUEST para próxima abertura elegível. Stops/takes e gaps conservadores prevalecem conforme OPS-002.
Posição preserva estratégia/versão de origem durante promoção/rollback. Reprocessamentos/concorrências não duplicam saída, taxas, liquidação ou reserva. Mudança de regime ou notícia negativa isolada não gera liquidação automática.

JUSTIFICATIVA:
Fixar métodos aprovados sem inferir convenções matemáticas ainda pendentes.

IMPACTOS:
Indexação/bordas exatas de ATR/ADX/DI/RSI, precisão/serialização/arredondamento de execução e ordenação temporal de eventos/proteções/abertura/saída/falha de dados PENDING. Casos de médias nulas de RSI não receberam valores numéricos na tarefa, portanto não aprovar convenção implícita.

SUBSTITUI:
Não se aplica; detalha configuração antes pendente sem apagar histórico.

## Pendências explícitas DOCS-007-R2 — PENDING
1. Máquina de estados para validação experimental e ativação operacional de H positivo.
2. Bootstrap e referência de comparação da primeira política validada.
3. Indexação exata e bordas de ATR/ADX/DI/RSI, incluindo valores nos casos de médias nulas de RSI não especificados no pedido.
4. Precisão decimal, serialização e arredondamento de execução, coordenados com OPS-003.
5. Precedência de eventos contextuais simultâneos/contraditórios.
6. Ordenação temporal exata de proteção, abertura, saída estratégica e falha de dados.
7. Configuração da avaliação adicional após INSUFFICIENT_EVIDENCE.
8. Verificação quantitativa de oportunidades possíveis com H=0, sem relaxar limiar 70.

As descrições aprovadas de F e gatilhos são preservadas literalmente no conteúdo funcional; composição/indexação e convenções de borda não explicitadas exigem especificação antes de implementar, sem criar fórmulas de fallback ou saturação por conta própria. Nenhuma dessas pendências foi resolvida nesta consolidação.

## Consolidação DOCS-008 — 2026-10-30

Fonte: BOT-CRYPTO-DOCS-008; baseline master/e44ea76cbf855cd07d55c5a500916237da170ea5, árvore limpa e staging vazio. DEC-001 a DEC-050 e suas referências preservadas integralmente. As pendências registradas na DOCS-007-R2 acima descrevem o estado histórico; DEC-051 a DEC-058 aprovam agora as oito especificações correspondentes. APPROVED significa especificação aprovada, não implementação nem certificação. Evidência operacional/empírica REQ-100: NOT_EXECUTED/PENDING_VERIFICATION.

## DEC-051
ID: DEC-051
DATA: 2026-10-30
TÍTULO: REQ-093 — Ativação segura de H
STATUS: APPROVED

CONTEXTO:
Separar certificação histórica de autorização de novas decisões oficiais.

DECISÃO:
- Separar estado de validação e autorização operacional.
- Estados de validação: UNVALIDATED, EVALUATING, INSUFFICIENT_EVIDENCE, REJECTED, VALIDATED.
- Estados operacionais: SHADOW, ELIGIBLE_FOR_PROMOTION, ACTIVE, NEW_ENTRIES_SUSPENDED, RETIRED.
- H pertence à política versionada de cada ativo; BTC e ETH independentes.
- H histórico certificado não ativa automaticamente H operacional.
- Criar configuração experimental versionada que altera somente H.
- Validar a nova configuração contra referência congelada, em três novas janelas independentes de 30 dias.
- Aplicar LEARN-GATE integral, dados novos, custos e limites preservados.
- Somente promoção controlada autoriza H positivo nas novas decisões oficiais.
- Preservar posições, versões de origem, auditoria, suspensão crítica e rollback.
- Não reutilizar períodos que produziram a certificação original nem validar retroativamente.

JUSTIFICATIVA:
Separar certificação histórica de autorização de novas decisões oficiais. Preservar causalidade, rastreabilidade e os controles aprovados.

IMPACTOS:
REQ-093: APPROVED quanto à especificação; implementação NOT_STARTED. Verificações experimentais NOT_EXECUTED/PENDING_VERIFICATION. Não altera gates ou limites financeiros; contratos técnicos, algoritmos de mutação e pendências residuais OPS-003/LEARN/ARCH-001 continuam PENDING.

REFERÊNCIAS:
REQ-093; DEC-016, DEC-034, DEC-035, DEC-041, DEC-048, DEC-049; LEARN-004, SIGNAL-001 a SIGNAL-005, OPS-002 e MVP-SCOPE-001 a 006.

SUBSTITUI:
Não se aplica; detalha pendência anterior, preservando as decisões existentes.

## DEC-052
ID: DEC-052
DATA: 2026-10-30
TÍTULO: REQ-094 — Bootstrap P0
STATUS: APPROVED

CONTEXTO:
Definir referência inicial por ativo sem inventar histórico validado.

DECISÃO:
- Criar BTC-P0 e ETH-P0 como referências iniciais distintas.
- Configuração fixa, estado UNVALIDATED, H=0.
- Permitir apenas operações simuladas sob controles existentes.
- P0 pode ser referência sem possuir certificado histórico.
- Durante os 90 dias de desenvolvimento, permitir proposta de P1 somente dentro dos parâmetros mutáveis autorizados; intervalos ainda não definidos permanecem pendentes.
- Congelar P0 e P1 antes da validação reservada.
- Comparar P1 contra sua própria P0 em três janelas independentes de 30 dias, com carteiras de 10.000 UC.
- Mesmos cenários, condições, preços, eventos e custos; carteiras e resultados separados.
- Aplicar integralmente os critérios LEARN-004/DEC-016.
- Não inventar histórico da primeira referência nem ativar H positivo automaticamente.
- Se P0 não negociar, retorno e drawdown serão zero; preservar o limite relativo de drawdown, sem exceção artificial.

JUSTIFICATIVA:
Definir referência inicial por ativo sem inventar histórico validado. Preservar causalidade, rastreabilidade e os controles aprovados.

IMPACTOS:
REQ-094: APPROVED quanto à especificação; implementação NOT_STARTED. Verificações experimentais NOT_EXECUTED/PENDING_VERIFICATION. Não altera gates ou limites financeiros; contratos técnicos, algoritmos de mutação e pendências residuais OPS-003/LEARN/ARCH-001 continuam PENDING.

REFERÊNCIAS:
REQ-094; DEC-016, DEC-028, DEC-032, DEC-038, DEC-049; LEARN-004, SIGNAL-001 a SIGNAL-005, OPS-002 e MVP-SCOPE-001 a 006.

SUBSTITUI:
Não se aplica; detalha pendência anterior, preservando as decisões existentes.

## DEC-053
ID: DEC-053
DATA: 2026-10-30
TÍTULO: REQ-095 — Indicadores matemáticos
STATUS: APPROVED

CONTEXTO:
Fixar convenções matemáticas antes da implementação.

DECISÃO:
Fixar indexação a partir de t=0 para o primeiro candle fechado:

- EMA9: índice 8.
- EMA20: índice 19.
- EMA21: índice 20.
- EMA50: índice 49.
- Bollinger20: índice 19.
- RSI14, ATR14, +DI/−DI14: índice 14.
- ADX14: índice 27.

Convenções:

- EMA: semente SMA(N), depois fator 2/(N+1).
- RSI, ATR e ADX/DI: suavização de Wilder.
- Primeiro ATR: média TR[1..14].
- Primeiro ADX: média DX[14..27].
- Empate de movimento direcional: +DM=0 e −DM=0.
- Ganhos positivos e perdas zero: RSI=100.
- Ganhos zero e perdas positivas: RSI=0.
- Ganhos e perdas zero: RSI=50.
- Soma direcional zero: DI/DX zero, sem divisão inválida.
- Bollinger20/2: desvio-padrão populacional.
- ATR zero, denominadores inválidos, dados ausentes ou OHLC inconsistente bloqueiam avaliações dependentes.
- Sem candles sintéticos, consulta futura ou continuidade artificial através de lacunas.
- Recuperar estado íntegro persistido ou reconstruir a partir de histórico contínuo válido com aquecimento de 150 horas.

Formalizar F por clip(x,0,1):

- Tendência: (EMA9−EMA21)/(0,5×ATR14).
- Rompimento: (Close−máxima dos 20 candles anteriores)/(0,5×ATR14).
- Reversão: (35−menor RSI dos três candles anteriores)/15.

Preservar gatilhos obrigatórios de SIGNAL-005.3.

JUSTIFICATIVA:
Fixar convenções matemáticas antes da implementação. Preservar causalidade, rastreabilidade e os controles aprovados.

IMPACTOS:
REQ-095: APPROVED quanto à especificação; implementação NOT_STARTED. Verificações experimentais NOT_EXECUTED/PENDING_VERIFICATION. Não altera gates ou limites financeiros; contratos técnicos, algoritmos de mutação e pendências residuais OPS-003/LEARN/ARCH-001 continuam PENDING.

REFERÊNCIAS:
REQ-095; DEC-039, DEC-042, DEC-043, DEC-050; LEARN-004, SIGNAL-001 a SIGNAL-005, OPS-002 e MVP-SCOPE-001 a 006.

SUBSTITUI:
Não se aplica; detalha pendência anterior, preservando as decisões existentes.

## DEC-054
ID: DEC-054
DATA: 2026-10-30
TÍTULO: REQ-096 — Precisão financeira
STATUS: APPROVED

CONTEXTO:
Distinguir precisão e arredondamento financeiros do half-up dos scores.

DECISÃO:
- Decimal exato para a contabilidade oficial.
- Oito casas decimais para UC, quantidades e preços de execução.
- Precisão interna superior, sem arredondamento prematuro.
- Arredondar quantidade comprada e recebimentos para baixo.
- Arredondar custos, taxas e valores comprometidos para cima.
- Limites máximos permitidos arredondados conservadoramente para baixo.
- Compra com slippage incorporado ao preço: nunca descontá-lo novamente.
- Score e H preservam half-up; não confundir com regras de arredondamento financeiro.
- Serializar valores financeiros em strings decimais canônicas.
- Rejeitar NaN, infinito, formatos ambíguos e valores inválidos.
- Reservas não alteram patrimônio por si só.
- Preservar reconciliação, livro-razão, idempotência e auditoria.
- Risco planejado considera custo de entrada e recebimento líquido estimado no stop.
- Preservar exposição, perda diária e todos os limites DEC-020/OPS-002.
- Transições completas de reserva, redimensionamento e contingência não autorizadas continuam como pendências residuais OPS-003.

JUSTIFICATIVA:
Distinguir precisão e arredondamento financeiros do half-up dos scores. Preservar causalidade, rastreabilidade e os controles aprovados.

IMPACTOS:
REQ-096: APPROVED quanto à especificação; implementação NOT_STARTED. Verificações experimentais NOT_EXECUTED/PENDING_VERIFICATION. Não altera gates ou limites financeiros; contratos técnicos, algoritmos de mutação e pendências residuais OPS-003/LEARN/ARCH-001 continuam PENDING.

REFERÊNCIAS:
REQ-096; DEC-020 a DEC-025, DEC-047, DEC-049, DEC-050; LEARN-004, SIGNAL-001 a SIGNAL-005, OPS-002 e MVP-SCOPE-001 a 006.

SUBSTITUI:
Não se aplica; detalha pendência anterior, preservando as decisões existentes.

## DEC-055
ID: DEC-055
DATA: 2026-10-30
TÍTULO: REQ-097 — Eventos contextuais
STATUS: APPROVED

CONTEXTO:
Resolver identidade, revisão e conflitos sem antecipar contexto.

DECISÃO:
- Eventos imutáveis com event_id, event_group_id, revision, fonte, disponibilidade UTC e sequência determinística.
- Um grupo gera no máximo uma contribuição contextual ativa por ativo e instante.
- Correções e retratações precisam de vínculo verificável com a informação anterior.
- Rumores não geram bônus positivo; preservar penalidade U aprovada.
- Confirmação substitui o estado de rumor dali em diante, sem retroatividade.
- Republicações não duplicam impacto nem reiniciam validade.
- Conflito não resolvido sobre o mesmo acontecimento: sem contribuição direcional daquele grupo, com UNCERTAIN auditável.
- Eventos independentes de sinais opostos são contabilizados separadamente.
- Conflito semântico não equivale automaticamente a falha técnica.
- Fluxo obrigatório tecnicamente inválido bloqueia novas entradas.
- BTC e ETH interpretam impactos separadamente.
- Congelar snapshots contextuais; não usar eventos disponibilizados depois da fronteira de leitura.
- Preservar fórmula C e prazos 6h/24h/72h aprovados.

JUSTIFICATIVA:
Resolver identidade, revisão e conflitos sem antecipar contexto. Preservar causalidade, rastreabilidade e os controles aprovados.

IMPACTOS:
REQ-097: APPROVED quanto à especificação; implementação NOT_STARTED. Verificações experimentais NOT_EXECUTED/PENDING_VERIFICATION. Não altera gates ou limites financeiros; contratos técnicos, algoritmos de mutação e pendências residuais OPS-003/LEARN/ARCH-001 continuam PENDING.

REFERÊNCIAS:
REQ-097; DEC-011, DEC-012, DEC-045; LEARN-004, SIGNAL-001 a SIGNAL-005, OPS-002 e MVP-SCOPE-001 a 006.

SUBSTITUI:
Não se aplica; detalha pendência anterior, preservando as decisões existentes.

## DEC-056
ID: DEC-056
DATA: 2026-10-30
TÍTULO: REQ-098 — Ordem temporal de execução
STATUS: APPROVED

CONTEXTO:
Fixar a causalidade entre fechamento, autorização, abertura e proteção.

DECISÃO:
Estabelecer o ciclo lógico de 5 minutos:

1. Fechar e persistir candle anterior.
2. Calcular sinais e autorizações somente com dados disponíveis.
3. Congelar autorizações e reservas anteriores à nova abertura.
4. Processar abertura com seu preço conhecido.
5. Priorizar gaps e proteções da posição existente.
6. Processar EXIT_REQUEST pendente se a posição continuar aberta.
7. Revalidar e executar entradas previamente autorizadas, quando elegíveis.
8. Avaliar proteção intrabar pelo OHLC completo quando disponível.
9. Persistir efeitos, auditoria e estado de forma idempotente.

Preservar:

- Stop primeiro se stop e take forem atingidos sem sequência conhecida.
- Gap desfavorável usa abertura compatível e slippage.
- Gap favorável acima do take não concede ganho além do alvo.
- Saída estratégica na próxima abertura elegível.
- Abertura perdida: ENTRY expira e libera reserva uma vez; EXIT requer reavaliação.
- Sem redimensionamento automático nesta especificação.
- Sem reentrada do mesmo ativo na mesma fronteira em que saiu.
- Dados inválidos não geram preços ou fills inventados.
- Proteções persistem durante falhas, embora preço garantido não seja presumido sem dados.
- Virada 00:00 UTC: patrimônio inicial diário com efeitos conhecidos do fechamento anterior.
- Recuperação após interrupção sem dupla reserva, taxa, execução ou liquidação.
- Não antecipar High/Low/Close do candle em formação.
- Visualização 3D não controla a sequência financeira.

JUSTIFICATIVA:
Fixar a causalidade entre fechamento, autorização, abertura e proteção. Preservar causalidade, rastreabilidade e os controles aprovados.

IMPACTOS:
REQ-098: APPROVED quanto à especificação; implementação NOT_STARTED. Verificações experimentais NOT_EXECUTED/PENDING_VERIFICATION. Não altera gates ou limites financeiros; contratos técnicos, algoritmos de mutação e pendências residuais OPS-003/LEARN/ARCH-001 continuam PENDING.

REFERÊNCIAS:
REQ-098; DEC-020 a DEC-025, DEC-029, DEC-050; LEARN-004, SIGNAL-001 a SIGNAL-005, OPS-002 e MVP-SCOPE-001 a 006.

SUBSTITUI:
Não se aplica; detalha pendência anterior, preservando as decisões existentes.

## DEC-057
ID: DEC-057
DATA: 2026-10-30
TÍTULO: REQ-099 — Evidência insuficiente
STATUS: APPROVED

CONTEXTO:
Tratar insuficiência de amostra sem tentativas oportunistas.

DECISÃO:
- Se a primeira validação terminar com INSUFFICIENT_EVIDENCE exclusivamente por falta de amostra, permitir no máximo uma avaliação adicional da mesma versão.
- Exigir contingência registrada antes de conhecer os resultados finais.
- Usar três novas janelas completas de 30 dias.
- Cada janela contém os seis cenários de cinco dias, com novas trajetórias/sementes.
- Carteiras independentes de 10.000 UC.
- Manter candidata, referência, H, parâmetros, custos e regras congelados.
- Não somar operações ou resultados das duas rodadas.
- Nova rodada exige por si só >=60 operações distintas e >=10 por janela, além de todo LEARN-GATE.
- Não permitir nova tentativa oportunista se houver violação de risco, reprovação determinante de desempenho ou contaminação de dados.
- Uma segunda insuficiência encerra a avaliação daquela versão.
- Novo ciclo futuro exige nova versão legítima e dados reservados inéditos.
- Preservar registro de todas as tentativas, evitando renomear configuração idêntica para zerar contador.
- Extensão adicional de 90 dias é condicional, não alteração retroativa do baseline de 240 dias.

JUSTIFICATIVA:
Tratar insuficiência de amostra sem tentativas oportunistas. Preservar causalidade, rastreabilidade e os controles aprovados.

IMPACTOS:
REQ-099: APPROVED quanto à especificação; implementação NOT_STARTED. Verificações experimentais NOT_EXECUTED/PENDING_VERIFICATION. Não altera gates ou limites financeiros; contratos técnicos, algoritmos de mutação e pendências residuais OPS-003/LEARN/ARCH-001 continuam PENDING.

REFERÊNCIAS:
REQ-099; DEC-016, DEC-031, DEC-032, DEC-038; LEARN-004, SIGNAL-001 a SIGNAL-005, OPS-002 e MVP-SCOPE-001 a 006.

SUBSTITUI:
Não se aplica; detalha pendência anterior, preservando as decisões existentes.

## DEC-058
ID: DEC-058
DATA: 2026-10-30
TÍTULO: REQ-100 — Viabilidade com H=0
STATUS: APPROVED

CONTEXTO:
Aprovar protocolo verificável sem alegar oportunidades ou rentabilidade observadas.

DECISÃO:
Aprovar protocolo de verificação em três fases:

1. Análise algébrica com H=0.
2. Diagnóstico operacional determinístico nos dados de desenvolvimento, quando existir simulador.
3. Aplicação posterior do LEARN-GATE em dados reservados, com política congelada.

Registrar:

- Fórmula global aprovada, mantendo H=0, pesos 35/25/15/15/10 e S>=70.
- Half-up permite S=70 a partir do score bruto 69,50.
- Contexto neutro C=50 e A=50 podem tornar algumas combinações inelegíveis por score.
- Para C=50, R=100 e A=50, T mínimo aproximado 91,43.
- Para C=50, R=90 e A=50, T mínimo aproximado 98,58.
- Para C=50, R=80 e A=50, atingir 70 é impossível mesmo com T=100.
- Para C=50, R=80 e A=100, T mínimo aproximado 91,43.
- Para C=50, R=60 e A=100, atingir 70 é impossível mesmo com T=100.
- A=100 continua condicionado à concordância qualificada, não é variável livre do agente.
- Possibilidade algébrica NÃO demonstra frequência efetiva de entradas.

Definir diagnóstico futuro por ativo, família, regime, cenário e janela:

- Candles válidos.
- Regimes elegíveis.
- Gatilhos válidos.
- Sinais com score >=70.
- Autorizações financeiras.
- Entradas executadas.
- Operações distintas concluídas.
- Rejeições e motivos.
- Reprodutibilidade e ausência de look-ahead.

Sem inventar estatísticas, operações executadas, simulações, certificação ou rentabilidade.

A REQ-100 pode ter status APPROVED quanto ao protocolo, mas comprovação operacional e empírica deve permanecer explicitamente NOT_EXECUTED/PENDING_VERIFICATION nos documentos de estado e roadmap.

JUSTIFICATIVA:
Aprovar protocolo verificável sem alegar oportunidades ou rentabilidade observadas. Preservar causalidade, rastreabilidade e os controles aprovados.

IMPACTOS:
REQ-100: APPROVED quanto à especificação; implementação NOT_STARTED. Verificações experimentais NOT_EXECUTED/PENDING_VERIFICATION. Não altera gates ou limites financeiros; contratos técnicos, algoritmos de mutação e pendências residuais OPS-003/LEARN/ARCH-001 continuam PENDING.

REFERÊNCIAS:
REQ-100; DEC-016, DEC-041, DEC-043 a DEC-046; LEARN-004, SIGNAL-001 a SIGNAL-005, OPS-002 e MVP-SCOPE-001 a 006.

SUBSTITUI:
Não se aplica; detalha pendência anterior, preservando as decisões existentes.
