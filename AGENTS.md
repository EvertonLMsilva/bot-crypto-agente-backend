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
- Exigir autorização financeira anterior à execução e sinais baseados somente em candles fechados. Entradas e saídas estratégicas na próxima abertura elegível, sem execução retroativa; autorização atrasada requer regra ainda pendente (DEC-021).
- Aplicar OPS-002 (DEC-022) e política conservadora OHLC/gaps (DEC-023). Sem informação futura, custos omitidos, liquidações duplicadas ou alterações retroativas de proteção.
- Toda posição tem stop e vínculo à estratégia/versão de origem. Promoção e rollback preservam proteção/histórico; não ampliar risco autorizado (DEC-024). DEC-016 permanece integralmente vigente.
- Persistir trilha financeira auditável e idempotente; preservar originais por ajuste/compensação. Separar carteira simulada e avaliações hipotéticas (DEC-025).
- Consultar os aceites e as pendências em REQUIREMENTS.md antes de implementar; não resolver regras ausentes por suposição nem relaxar limites/gates.
