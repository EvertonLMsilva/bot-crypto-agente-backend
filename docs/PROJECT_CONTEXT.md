# Contexto do projeto

## Identidade e objetivo
BOT CRUPTO, independente de Jarvis/Kate. Diretório oficial: `D:\04-Projetos\30-bot-crypto-agence`.
Aplicação web que representa um escritório virtual 3D de acompanhamento/análise de criptomoedas. Personagens acompanham atividades reais do sistema simulado; animações não determinam análises, operações ou resultados. Autonomia especializada sob limites compartilhados e supervisão; viabilidade técnica não comprova rentabilidade.

## MVP aprovado — DOCS-007-R2
### Agentes e ambiente
Exatamente cinco agentes lógicos: Analista Central de Inteligência, Especialista BTC, Especialista ETH, Coordenador e Gestor de Orçamento. Central disponibiliza contexto validado, não ordens; especialistas têm estratégias/versões/memória/aprendizado exclusivos por ativo. Coordenador prioriza sem recalcular scores ou autorizar capital; Gestor controla capital/risco. Simulador, execução e auditoria são componentes, não agentes extras. SOL somente futuro.

Um andar, núcleo central com salas da Central e do Gestor, Coordenador, mesas especialistas ao redor e painel compartilhado; deslocamentos curtos. Câmera orbit/zoom/pan, interação com agentes/ambientes e painéis derivados de eventos da simulação. Iniciar/pausar, avançar 5 minutos, velocidade e reinício confirmado. Expansão lateral futura, sem andares adicionais. Nenhuma engine/stack definida; Three.js continua PROPOSED.

### Dados, cenários e cronologia
Operações em candles fechados de 5 minutos; regime/contexto técnico superior em 1 hora, cada horário agregado de 12 candles válidos de 5 minutos. Relógio UTC, 24/7, sem candle em formação ou informação futura. Gerador determinístico/reproduzível conhece regime verdadeiro mas não o expõe aos agentes; BTC/ETH interpretam o mesmo acontecimento independentemente.
Seis cenários: alta estável/turbulenta, baixa gradual, queda brusca, lateral estável/turbulenta. Aquecimento inicial 150 candles horários, desenvolvimento90 dias, validação3x30 dias, pós-promoção2x30 dias; total240 dias mais aquecimento.

Cada carteira de validação começa com 10.000 UC e sem posições; não transferir posições/capital/operações. Aquecimento com histórico anterior permitido sem importar estado anterior ou otimizar por validação reservada. Cada janela contém os seis cenários com cinco dias por cenário, ordens V1/V2/V3 de [requisitos](REQUIREMENTS.md) e DEC-038. Trajetórias/sementes distintas; não duplicar observações ou manipular cenários para alcançar mínimo. DEC-016/LEARN-004 preservam 60 concluídas distintas, mínimo10 por janela; falta de evidência = INSUFFICIENT_EVIDENCE.

### Famílias e sinais
Três famílias iniciais, independentes por ativo: tendência EMA9/21 de5min e recuperaçãoEMA9 em UPTREND; rompimento acima máxima20 anteriores com volume>1,2x média anterior; reversão em SIDEWAYS com RSI14 recuperando35 após sobrevenda e retorno à banda inferior Bollinger20/2. Contexto é camada transversal.

SIGNAL-005.1–005.10 (DEC-041 a DEC-050) define regimes horários EMA20/50, ADX/DI14 e ATR14, volatilidade por nearest rank75 dos100 anteriores, T por gatilho/força/qualidade/volume, matriz R, contexto C, concordância A, seleção representativa e saídas específicas. Fórmulas canônicas estão em [decisões](DECISIONS.md), sem completar bordas por suposição.

S = round_half_up(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A), limiar>=70. H operacional zero em UNVALIDATED/insuficiência, pertencente à política versionada e comum às suas estratégias, sem misturar BTC/ETH. H validado calculado entre50–90 só após gate completo; ativá-lo exige nova configuração/validação independente, sem retroatividade. Máquina de estados e primeira referência permanecem pendentes. Score não é probabilidade, orçamento ou garantia de execução.

Escolha interna por S arredondado, bruto, T, R, ID canônico; não somar scores. Coordenador mantém sua própria ordenação nota/tempo/rodízio/ID. ENTRY_CANDIDATE/EXIT_REQUEST/HOLD/WAIT e RISK_ALERT, identidade/ciclo, expiração/idempotência e independência dos alertas preservados. Saídas estratégicas conforme origem vão à próxima abertura elegível; proteções OPS-002 prevalecem. Mudança de regime/notícia negativa isolada não liquida automaticamente.

## Controles preservados
Capital fictício centralizado10.000 UC sem saldo permanente por agente; exposição individual20%/consolidada40%, risco planejado1% por operação/2% aberto, perda diária3% sobre início do dia UTC. Somente spot-long simulado, sem alavancagem/short/dinheiro real. Uma posição por ativo; autorização financeira separada, próxima abertura elegível sem retroatividade; stop2%, take4%, taxa0,10%, deslizamento0,05% por execução. Gaps podem exceder risco planejado.
LEARN-004, DEC-016 e auditoria persistente/idempotente preservados. Posições conservam proteção e estratégia/versão de origem durante promoção/rollback. Candidatas não usam capital oficial; gates não provam eficácia estatística. Sem API real de negociação ou infraestrutura paga obrigatória.

## Referência visual aprovada
Imagem escolhida em 2026-10-29:
`C:\Users\evert\.codex\generated_images\01a18866-132a-7252-ab17-198456d91aae\exec-48b0374a-0e09-4b38-9137-2bcf85f735ef.png`
Caminho local externo, sem cópia nesta tarefa; disponibilidade em outra máquina não garantida. Orienta layout/aparência, não comprova produto executável, preços ou rentabilidade.

## Pendências e estado real
REQ-093 a REQ-100: ativação experimental/operacional de H; bootstrap/referência; indexação/bordas matemáticas; precisão/serialização; precedência contextual; ordem temporal proteção/abertura/saída/falha; avaliação adicional; verificação quantitativa de oportunidades H=0 mantendo70. Médias nulas RSI e composição/bordas de F não explicitadas não ganharam defaults.
Persistem detalhes LEARN/OPS-003/ARCH-001, inclusive geração/ciclos, estatística complementar, confiabilidade, contratos, tecnologias e hardware. Aprovação funcional não significa implementação/testes completos. Histórico DOCS/GIT no [checkpoint](DEVELOPMENT_STATE.md); DOCS-007-R2 ainda não publicada, nenhuma implementação, simulação ou teste de código realizado nesta tarefa.
