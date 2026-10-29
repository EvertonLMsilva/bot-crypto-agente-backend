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
