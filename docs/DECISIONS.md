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
Entrada, saída, stop, take profit, dimensionamento, custos e sentido das operações PENDING. Não inventar política definitiva.

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
Política detalhada PENDING. Capital inicial de 10.000 UC, 20% por pedido, exposição total de 40% e faixas por pontuação permanecem PROPOSED, NÃO APROVADOS.

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
