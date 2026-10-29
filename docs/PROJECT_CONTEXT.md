# Contexto do projeto

## Identidade e objetivo
BOT CRUPTO é um projeto independente de Jarvis/Kate. Diretório oficial: `D:\04-Projetos\30-bot-crypto-agence`.

O conceito aprovado é uma aplicação web que representa um escritório virtual 3D de acompanhamento e análise de criptomoedas. Personagens representam agentes especializados, cada um responsável por um ativo e por monitorar informações em sua estação de trabalho.

O produto pretende tornar visíveis o acompanhamento dos ativos, as análises, os pedidos de capital e o monitoramento das posições. O MVP prevê compra spot simulada, saída de posição existente, manutenção/espera e alertas conforme SIGNAL-001 a SIGNAL-004. Estruturas funcionais estão aprovadas; algoritmos e calibração concreta ainda precisam ser definidos, mantendo autorização financeira separada. Viabilidade técnica não comprova rentabilidade.

## Organização aprovada
- Um único andar, sem expansão por outros pisos.
- Sala compartilhada de análise e sala de orçamento/gerenciamento de capital juntas no centro.
- Mesas individuais ao redor, corredores livres e expansão lateral mediante ampliação das paredes externas.
- Inclusão de novos ativos com suas mesas e personagens.
- Telão compartilhado da carteira e dos ativos investidos, observado pelos personagens.
- Personagens transitam conforme suas atividades, com deslocamentos curtos. A lógica não depende de concluir uma caminhada.
- Movimentos devem representar eventos e processos da aplicação; no protótipo, eventos demonstrativos devem ser identificados como simulação.

## Referência visual aprovada
Imagem escolhida pelo proprietário na conversa de 2026-10-29:
`C:\Users\evert\.codex\generated_images\01a18866-132a-7252-ab17-198456d91aae\exec-48b0374a-0e09-4b38-9137-2bcf85f735ef.png`

Referência local externa ao repositório; sua disponibilidade em outras máquinas não é garantida. Não foi copiada nesta tarefa, cujo escopo permite apenas documentação. Orienta disposição, personagens, móveis e iluminação; não comprova implementação, preços reais ou resultados financeiros.

## MVP-001 aprovado na DOCS-002
Escritório funcional com estações, sala de análise e coordenação, sala de orçamento e agentes autônomos. Dados, acontecimentos e capital serão simulados, fictícios e reproduzíveis; decisões e processos rastreáveis. Animações refletem estados do sistema e não determinam resultados de análises, operações ou decisões financeiras.

### Responsabilidades dos personagens
- Analista Central de Inteligência: coleta, organiza, valida e interpreta contexto financeiro/econômico/político; disponibiliza dados, resumos, riscos e hipóteses relevantes, fontes, timestamps, incerteza e justificativas. Distingue fatos, rumores, hipóteses e interpretações. Não negocia, executa ou autoriza capital.
- Especialista por ativo: analisa exclusivamente seu ativo com técnica e contexto, identifica oportunidades, envia sinais, acompanha resultados e avalia desempenho. Estratégias, memória persistente e aprendizado próprios. Não revisa nem aprova estratégias de outro ativo; usuário supervisiona.
- Coordenador de Oportunidades: na sala de análise, prioriza deterministicamente sinais por nota padronizada de 0 a 100, com critérios comuns. Preserva notas e análises recebidas; não refaz análise, altera pontuações, reserva capital ou executa.
- Gestor de Orçamento: recebe solicitações priorizadas, controla disponibilidade, autorizações, reservas e liberações do capital fictício, sem uso duplicado. Política inicial financeira APPROVED (DEC-020): capital compartilhado, sem saldo permanente por agente; refinamentos operacionais ainda pendentes.

### Aprendizado controlado
Cada especialista mantém uma política ativa oficial de seleção/combinação de múltiplas estratégias, com candidatas isoladas das operações oficiais durante avaliação (DEC-026/DEC-028). Múltiplas estratégias, memória persistente, testes independentes, adaptação controlada e versionamento aprovados. Validação independente obrigatória antes de promoção automática exclusivamente simulada; reversão auditável segundo LEARN-GATE de DEC-016. Resultados de ETH não alteram automaticamente BTC. Agentes não modificam código, segurança, limites, contratos, critérios obrigatórios ou autorizações.

### Contexto de mercado
Preços/liquidez, economia, política, geopolítica, regulação, acontecimentos cripto/institucionais e sentimento compõem o contexto. Classificação não comprova causalidade ou previsão. No MVP, tudo é simulado e identificado como fictício; informação futura não pode ser antecipada. Provedores reais serão evolução posterior sem alterar contratos dos especialistas; nenhuma dependência de APIs externas pagas.

## Propostas, pendências e limitações
Three.js continua PROPOSED. Quantidade definitiva de agentes/estratégias, tecnologias, indicadores e cálculos internos da pontuação, refinamentos operacionais/contábeis, desempenho e visual final pendentes. Pesos globais/limiar e regras funcionais de sinais agora aprovados em DEC-027 a DEC-029. Política inicial de capital, risco e operação agora aprovada em DEC-020 a DEC-025. BTC/ETH são exemplos; proposta BTC/ETH/SOL não fecha composição do MVP. Câmera interativa permanece proposta.

Histórico DOCS-002: fórmula 40/35/25, capital 10.000 UC, 20% por pedido, 40% de exposição e faixas por nota não estavam aprovados. Na DOCS-004, capital 10.000 UC, exposição individual 20% e consolidada 40% foram aprovados. A fórmula antiga 40/35/25 e faixas por nota continuam não aprovadas; a nova fórmula global distinta foi aprovada em DEC-027; exposição individual não equivale à autorização automática de qualquer pedido. Detalhes em REQUIREMENTS.md e DECISIONS.md. Gates são guardrails de engenharia/simulação, não prova estatística de eficácia ou segurança real.

DOCS-001 preserva o histórico inicial. DOCS-002 sincronizou conceitos; GIT-001 publicou a documentação inicial. DOCS-004 consolidou política financeira/operacional, publicada na GIT-002 (4bba447). DOCS-005 consolida SIGNAL-001 a SIGNAL-004 sem iniciar desenvolvimento. Não há evidência local de DOCS-003. Não há agentes, aprendizado, análise ou negociação implementados. Viabilidade técnica não comprova rentabilidade. Operações reais e provedores pagos exigem autorização específica; nenhuma operação real integra o MVP.

## Política financeira e operacional aprovada — DOCS-004
Capital fictício inicial de 10.000 UC, orçamento centralizado compartilhado. Exposição individual até 20% do patrimônio, consolidada até 40%; risco planejado até 1% por operação e 2% total aberto. Percentuais recalculados sobre patrimônio conforme regras auditáveis; limite diário de referência 3% usa patrimônio do início do dia UTC (00:00), incluindo redução patrimonial e perdas não realizadas, e bloqueia novas entradas. Planejamento inclui custos previstos e distância à proteção; gaps/deslizamentos podem exceder perdas planejadas.

Somente spot simulado, sem alavancagem/venda descoberta ou operação real. Sinais de candles fechados, entrada na próxima abertura elegível com autorização prévia, sem retroatividade. Stop inicial 2% abaixo da entrada, take 4% acima; taxa 0,10% e deslizamento 0,05% por execução. Uma posição por ativo e saída integral inicial. Saída estratégica só na próxima abertura; proteções ativas via OHLC intrabar. Gaps/ambiguidade seguem DEC-023: abertura abaixo do stop usa preço desfavorável; gap acima do take não concede além do alvo; ambos atingidos sem sequência conhecida, stop primeiro.

Toda posição preserva stop e versão de origem durante promoção/rollback. Parâmetros de estratégia são configuráveis/versionados; candidatas só promovidas após LEARN-GATE integral, sem autonomia para alterar limites globais ou critérios obrigatórios. Auditoria financeira persistente e idempotente conecta propostas, autorizações, reservas, execução, resultados e aprendizado do especialista responsável. Avaliações hipotéticas de sinais não executados ficam separadas da carteira. Precisão, recuperação, ciclo completo da ordem e contingências restantes continuam PENDING em REQUIREMENTS.md. Abertura perdida por ENTRY expira; EXIT perdido exige reavaliação conforme DEC-029, sem transferir autorização ou executar retroativamente.

## Estratégias e sinais — DOCS-005
SIGNAL-001/DEC-026: seleção/combinação adaptativa versionada por regime/contexto, exclusiva por ativo. Famílias tendência, rompimento, reversão à média e contexto transversal são PROPOSED, sem algoritmos completos aprovados.
SIGNAL-002/DEC-027: UPTREND/DOWNTREND/SIDEWAYS/UNKNOWN, volatilidade normal/elevada e contexto favorável/desfavorável/neutro/incerto. Classificação determinística só com dados disponíveis. Score global = round(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A), dimensões 0–100: técnica, regime, contexto, histórico validado e concordância independente. Entrada exige >=70 mais elegibilidade e orçamento. Pesos/limiar não mudam autonomamente; H com histórico insuficiente PENDING, sem obrigar 50.
SIGNAL-003/DEC-028: uma política ativa oficial e até três candidatas por ciclo/agente, isoladas sem capital oficial. Baseline UNVALIDATED pode iniciar simulação respeitando controles; histórico insuficiente não prova desempenho. Promoções posteriores só após LEARN-GATE integral. Tipos: ENTRY_CANDIDATE, EXIT_REQUEST, HOLD, WAIT; RISK_ALERT adicional. Uma decisão oficial por ativo/candle fechado. Saídas e stop/take não dependem da fila de compras.
SIGNAL-004/DEC-029: ENTRY só até próxima abertura elegível; se perdida, expira e libera reserva uma vez, sem reaproveitar autorização. EXIT perdido exige reavaliação; HOLD/WAIT no ciclo corrente, WAIT sem reserva. Alertas persistentes e rastreáveis não geram ordem sozinhos. Relógio simulado; pausa não expira por tempo real. Coordenador usa nota decrescente, tempo mais antigo, rodízio persistido e ID estável, sem depender de chegada assíncrona. Identidade por sinal/ciclo e reprocessamento sem duplicações. Dados ausentes bloqueiam entrada, sem retirar proteção de posições. Falta de capital não comprova erro de estratégia; avaliações hipotéticas separadas da carteira.

MVP_SCOPE, SIGNAL_CALIBRATION_DETAILS, LEARNING_QUANTITATIVE_DETAILS e TECHNICAL_ARCHITECTURE permanecem PENDING. Nenhuma aprovação de quantidade de ativos, timeframe, heurísticas, tratamento numérico do baseline ou tecnologias definitivas decorre dessas estruturas.
