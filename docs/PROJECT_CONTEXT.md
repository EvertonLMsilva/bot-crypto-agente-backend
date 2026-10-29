# Contexto do projeto

## Identidade e objetivo
BOT CRUPTO é um projeto independente de Jarvis/Kate. Diretório oficial: `D:\04-Projetos\30-bot-crypto-agence`.

O conceito aprovado é uma aplicação web que representa um escritório virtual 3D de acompanhamento e análise de criptomoedas. Personagens representam agentes especializados, cada um responsável por um ativo e por monitorar informações em sua estação de trabalho.

O produto pretende tornar visíveis o acompanhamento dos ativos, as análises, os pedidos de capital e o monitoramento das posições. A visão de longo prazo inclui propostas de compra, venda ou espera; estratégias e autorização de execução ainda precisam ser definidas. Viabilidade técnica não comprova rentabilidade.

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
- Gestor de Orçamento: recebe solicitações priorizadas, controla disponibilidade, autorizações, reservas e liberações do capital fictício, sem uso duplicado. Política financeira detalhada PENDING.

### Aprendizado controlado
Cada especialista mantém estratégia ativa e candidatas isoladas das operações oficiais durante avaliação. Múltiplas estratégias, memória persistente, testes independentes, adaptação controlada e versionamento aprovados. Validação independente obrigatória antes de promoção automática exclusivamente simulada; reversão auditável segundo LEARN-GATE de DEC-016. Resultados de ETH não alteram automaticamente BTC. Agentes não modificam código, segurança, limites, contratos, critérios obrigatórios ou autorizações.

### Contexto de mercado
Preços/liquidez, economia, política, geopolítica, regulação, acontecimentos cripto/institucionais e sentimento compõem o contexto. Classificação não comprova causalidade ou previsão. No MVP, tudo é simulado e identificado como fictício; informação futura não pode ser antecipada. Provedores reais serão evolução posterior sem alterar contratos dos especialistas; nenhuma dependência de APIs externas pagas.

## Propostas, pendências e limitações
Three.js continua PROPOSED. Quantidade definitiva de agentes/estratégias, tecnologias, indicadores, pesos, pontuação, regras operacionais, capital, risco, desempenho e visual final pendentes. BTC/ETH são exemplos; proposta BTC/ETH/SOL não fecha composição do MVP. Câmera interativa permanece proposta.

Fórmula 40/35/25, capital 10.000 UC, 20% por pedido, 40% de exposição e faixas por nota não aprovados. Detalhes em REQUIREMENTS.md e DECISIONS.md. Gates são guardrails de engenharia/simulação, não prova estatística de eficácia ou segurança real.

DOCS-001 preserva o histórico inicial. DOCS-002 sincroniza conceitos aprovados sem iniciar desenvolvimento. Não há agentes, aprendizado, análise ou negociação implementados. Viabilidade técnica não comprova rentabilidade. Operações reais e provedores pagos exigem autorização específica; nenhuma operação real integra o MVP.
