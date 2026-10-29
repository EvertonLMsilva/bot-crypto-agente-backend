# BOT CRUPTO — instruções permanentes

## Escopo e retomada
- Projeto independente de Jarvis/Kate. Não importar suas regras, arquivos ou arquitetura.
- Diretório oficial: `D:\04-Projetos\30-bot-crypto-agence`.
- Antes de iniciar novas tarefas, ler [contexto](docs/PROJECT_CONTEXT.md), [decisões](docs/DECISIONS.md) e [estado](docs/DEVELOPMENT_STATE.md).
- Consultar [requisitos](docs/REQUIREMENTS.md), [arquitetura](docs/ARCHITECTURE.md) e [roadmap](docs/ROADMAP.md) conforme o escopo.
- Inspecionar arquivos, instruções locais e Git antes de modificar; preservar trabalho existente.

## Autoridade e registros
- Preservar decisões anteriores; não alterar decisões aprovadas sem autorização explícita.
- Distinguir APPROVED (aprovado), PROPOSED (proposto) e PENDING (pendente). SUPERSEDED identifica decisão substituída, cujo histórico deve ser preservado.
- Não inventar requisitos, aprovações, implementações ou resultados de testes.
- Identificar conflitos entre novas solicitações e decisões documentadas antes de executar mudanças conflitantes.
- Manter documentação concisa, objetiva e sem duplicações desnecessárias; atualizar o estado após tarefas que modifiquem o projeto.
- Não realizar commits automaticamente. Não executar operações financeiras reais sem autorização específica.
- Não contratar serviços nem consumir APIs pagas sem autorização específica.

## Protocolo contínuo
Quando uma decisão for aprovada:
1. Registrar ou atualizar seu registro em `docs/DECISIONS.md`, com identificador estável.
2. Atualizar requisitos ou arquitetura impactados.
3. Atualizar o roadmap se necessário.
4. Atualizar o checkpoint em `docs/DEVELOPMENT_STATE.md`.

Quando uma ideia estiver em discussão:
1. Documentar como PROPOSED ou PENDING quando relevante.
2. Não substituir decisões aprovadas.
3. Não implementar sem autorização.

Quando uma tarefa de implementação for concluída:
1. Registrar apenas o que foi realmente implementado.
2. Atualizar a situação de implementação dos requisitos relacionados, preservando a distinção entre aprovação e entrega.
3. Registrar testes e resultados reais.
4. Atualizar `docs/DEVELOPMENT_STATE.md`.
5. Informar pendências restantes.

Não atualizar documentos sem relação com a tarefa apenas para modificar datas. A documentação acompanha toda a evolução do projeto.

## Limites permanentes do MVP simulado (DOCS-002)
- Consultar decisões aprovadas antes de implementar. Aprovação conceitual não autoriza desenvolvimento nesta tarefa documental.
- Preservar especialização exclusiva por ativo: compartilhar contexto não autoriza revisão ou aprovação de estratégias de outro ativo.
- Manter contratos entre componentes; trocar provedores sem alterar contratos consumidos pelos especialistas.
- Separar inteligência contextual, análise individual, priorização, orçamento, execução simulada, aprendizado e visualização.
- Registrar versões das estratégias, dados/contexto disponíveis no instante da decisão, análises e resultados; proibir informação futura.
- Exigir validação independente de candidatas e todos os critérios de DEC-016 antes de promoção automática, exclusivamente na simulação.
- Candidatas não interferem nas operações oficiais enquanto avaliadas. Aprendizado individual: resultados de ETH não alteram automaticamente BTC.
- Agentes não alteram código, segurança, limites financeiros, contratos, critérios obrigatórios de promoção ou restrições de autorização.
- Reversão auditável preserva histórico e trata posições simuladas abertas com segurança; perda isolada não provoca mudança automática.
- MVP usa capital fictício e dados/acontecimentos simulados reproduzíveis. Não usar dinheiro real ou provedores pagos sem autorização específica. Fontes reais são evolução posterior.
- Após mudanças aprovadas, atualizar documentação conforme o protocolo contínuo e o impacto da tarefa.

## Política financeira e operacional consolidada (DOCS-004)
- MVP exclusivamente spot simulado, sem alavancagem, venda descoberta ou operação real.
- Aplicar orçamento centralizado/compartilhado sem saldo permanente por agente, limites de exposição/risco e perda diária aprovados em DEC-020. Risco planejado não garante perda máxima; considerar custos e gaps.
- Exigir autorização financeira anterior à execução e sinais baseados somente em candles fechados. Entradas e saídas estratégicas na próxima abertura elegível, sem execução retroativa; ENTRY com abertura perdida expira; EXIT exige reavaliação, sem retroatividade (DEC-021 e detalhamento DEC-029).
- Aplicar OPS-002 (DEC-022) e política conservadora OHLC/gaps (DEC-023). Sem informação futura, custos omitidos, liquidações duplicadas ou alterações retroativas de proteção.
- Toda posição tem stop e vínculo à estratégia/versão de origem. Promoção e rollback preservam proteção/histórico; não ampliar risco autorizado (DEC-024). DEC-016 permanece integralmente vigente.
- Persistir trilha financeira auditável e idempotente; preservar originais por ajuste/compensação. Separar carteira simulada e avaliações hipotéticas (DEC-025).
- Consultar os aceites e as pendências em REQUIREMENTS.md antes de implementar; não resolver regras ausentes por suposição nem relaxar limites/gates.

## Sinais e política adaptativa (DOCS-005)
- Política de seleção/combinação versionada por ativo; evolução só após LEARN-GATE. Pesos globais e limiar aprovados em DEC-027 não podem ser alterados autonomamente.
- Classificação, elegibilidade, validade e ordenação usam relógio/dados da simulação, sem futuro; pausa não expira sinais por tempo real ou animação.
- Baseline inicial UNVALIDATED não prova desempenho e não dispensa elegibilidade, limites ou validação integral das promoções posteriores. Não inventar H neutro obrigatório.
- Uma decisão oficial por ativo/candle fechado, com alertas adicionais; sinais/ciclos têm identidade estável. Persistir rodízio e preservar idempotência na ordenação, reserva e liberação.
- Candidatas não consomem capital oficial. Não transferir autorização de oportunidade expirada; nova oportunidade exige nova análise e autorização própria.
- EXIT_REQUEST e proteções existentes não dependem da fila de novas compras; dados indisponíveis não autorizam remover proteção. Detalhes de contingência não definidos continuam pendentes.

## Validação e reversão controladas (DOCS-006 / LEARN-004)
- Aplicar retorno líquido patrimonial, janelas independentes e drawdown pelo pior período conforme DEC-030/DEC-031/DEC-033, sempre com custos e dados conhecidos no instante. Não substituir pior drawdown por média.
- Congelar candidata/parâmetros antes da validação final reservada; não ajustar pela validação, escolher retrospectivamente janelas favoráveis ou reutilizá-las oportunisticamente após resultados. Registrar todas as tentativas/sementes e total acumulado; não duplicar evidência.
- Busca local apenas em parâmetros/seleção autorizados, até três candidatas e no máximo uma desafiante final por ciclo/agente; sem capital oficial ou mudança de código/contratos/score/limites/gates (DEC-032).
- Nas fronteiras, marcar posições a mercado e provisionar custos de encerramento; posições abertas não são operações concluídas. Não fabricar fechamento pelo fim da janela ou transportar posição entre carteiras independentes.
- Separar suspensão imediata de novas entradas por violação crítica e rollback por degradação comprovada segundo DEC-034. Não aguardar janelas para suspender violações críticas.
- Rollback só afeta novas decisões; preservar stop, take e versão de origem das posições. Usar anterior apenas íntegra/elegível; sem versão segura, manter suspensão e bloqueios financeiros. Registrar motivo/evidências sem apagar histórico (DEC-035).
