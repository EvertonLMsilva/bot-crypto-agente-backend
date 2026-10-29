# Arquitetura conceitual

Divisão de responsabilidades APPROVED (DEC-019); arquitetura implementada: nenhuma. Contratos concretos, frameworks, topologia e tecnologias PENDING. Blocos não implicam microsserviços. Referências: [decisões](DECISIONS.md), [requisitos](REQUIREMENTS.md).

## Fluxo aprovado
```text
PROVEDORES SIMULADOS
    |
    v
ANALISTA CENTRAL DE INTELIGÊNCIA
    | Dados, notícias, contexto e hipóteses
    +---------------------------+
    |                           |
    v                           v
AGENTE BTC                  AGENTE ETH
    | Estratégias próprias      | Estratégias próprias
    | Memória própria           | Memória própria
    | Aprendizado próprio       | Aprendizado próprio
    +-------------+-------------+
                  |
                  v
       COORDENADOR DE OPORTUNIDADES
                  |
                  v
          GESTOR DE ORÇAMENTO
                  |
                  v
          EXECUÇÃO SIMULADA
                  |
                  v
         RESULTADOS AUDITÁVEIS
                  |
                  v
        APRENDIZADO DOS AGENTES
```
BTC/ETH são exemplos, não composição definitiva do MVP. Resultados alimentam somente o aprendizado do respectivo especialista. Visualização observa atividades; persistência/auditoria apoiam todo o fluxo.

## 1. Frontend e ambiente 3D
DEC-001 a DEC-004 e DEC-008: um andar, salas centrais de análise/coordenação e orçamento, mesas ao redor e expansão lateral. Movimentos representam estados e não determinam análises, operações ou decisões; deslocamentos curtos sem bloquear processamento. Frontend 3D não executa lógica de negócio. Three.js PROPOSED (DEC-007); framework, linguagem e visual final PENDING. [Referência visual](PROJECT_CONTEXT.md).

## 2. Backend e serviços
Separar fontes/dados, inteligência contextual, estratégias individuais, priorização, gestão financeira, simulação operacional, aprendizado, visualização e persistência/auditoria. A separação conceitual não escolhe serviços físicos ou tecnologias.
STATUS: PENDING — aguardando definição arquitetural técnica.

## 3. Mecanismo dos agentes
DEC-009/DEC-015/DEC-026: especialistas exclusivos por ativo, estratégias/memória/candidatas independentes. Seleção/combinação adaptativa conforme regime/contexto, política versionada e evolução só após DEC-016. Famílias técnicas apenas PROPOSED; algoritmos concretos PENDING.
DEC-028: uma política ativa oficial, até três candidatas por ciclo/agente, isoladas sem consumir capital da carteira oficial, condições comparáveis e dados cronológicos. Baseline inicial UNVALIDATED pode operar simulado sob controles; histórico insuficiente não é evidência de desempenho. Toda promoção posterior exige LEARN-GATE integral. Preservar histórico/evidências/versões; não retroagir operações ou abandonar proteções na promoção/rollback. DEC-016 e limites financeiros inalterados; geração, ajustes, métricas, ciclos detalhados e monitoramento PENDING.

## 4. Comunicação e fluxo funcional de sinais
```text
Dados/contexto disponíveis no relógio simulado
  -> Especialista do ativo: regime e estratégias elegíveis
  -> Política ativa versionada: análise, divergências e score
  -> Decisão oficial por ativo/candle fechado (+ alertas)
       ENTRY_CANDIDATE -> Coordenador -> Gestor -> abertura elegível autorizada
       EXIT_REQUEST -> próxima abertura elegível, fora da fila de novas compras
       HOLD / WAIT -> registro do ciclo (WAIT sem reserva)
       RISK_ALERT -> evento persistido, sem ordem automática
  -> Auditoria / resultados -> aprendizado só do especialista responsável
```
Proteções stop/take seguem fluxo independente da fila, conforme OPS-002. Candidatas avaliam em isolamento. Contratos, transportes e implementação PENDING; substituir provedores preserva contratos dos especialistas. Frontend apenas reflete estados.

## 5. Fontes e inteligência contextual
DEC-011/DEC-012: provedores simulam dados financeiros e acontecimentos econômicos/políticos, identificados como fictícios, reproduzíveis e sem informação futura antecipada. Central não é só distribuidor de preços: coleta, organiza, valida e interpreta cotações/candles/volume/volatilidade/liquidez, notícias econômicas/financeiras, inflação/juros/emprego/bancos centrais, política/governos, geopolítica/conflitos/sanções, regulação/tributação, cripto/blockchains/corretoras, instituições, sentimento e outros eventos relevantes.
Produz resumos, classifica relevância/risco, identifica ativos potencialmente afetados e formula hipóteses fundamentadas. Preserva fontes, timestamps, incerteza, justificativas e distinção entre fatos/rumores/hipóteses/interpretações; compartilha conforme relevância sem consultas externas redundantes. Não decide compras/vendas, executa, autoriza capital ou substitui especialistas. Classificação contextual não comprova causalidade nem previsão garantida. Fontes reais confiáveis só posteriormente; MVP sem dependência de APIs externas pagas.

## 6. Regimes, análise e coordenação
DEC-027: classificar UPTREND/DOWNTREND/SIDEWAYS ou UNKNOWN por insuficiência/invalidade; volatilidade normal/elevada e contexto favorável/desfavorável/neutro/incerto. Determinismo e somente dados disponíveis no instante. Especialista registra evidências, contexto, divergências e versões.
Componentes 0–100: T técnica 35%, R adequação ao regime 25%, C contexto 15%, H histórico validado 15%, A concordância independente 10%.
S = round(0.35*T + 0.25*R + 0.15*C + 0.15*H + 0.10*A)
ENTRY exige S >=70, dados válidos/cronológicos/atuais, regime conhecido/válido, ao menos uma estratégia elegível, ausência de posição conflitante e duplicação; orçamento autoriza separadamente antes de executar. Score não é probabilidade, autorização, garantia de execução ou risco suficiente. Pesos/limiar não podem mudar autonomamente. Cálculos internos, dependências, histórico insuficiente e heurísticas permanecem pendentes/propostos; H=50 não obrigatório; baseline UNVALIDATED. Fórmula antiga 40/35/25 não aprovada.
DEC-029: Coordenador preserva notas/análises e ordena oportunidades do mesmo ciclo por maior nota válida, tempo simulado mais antigo, rodízio determinístico entre ativos em empate completo, ID estável final. Persistir rodízio; chegada assíncrona não determina ordem. Não recalcula estratégias, reserva capital ou executa.

## 7. Gerenciamento financeiro e execução simulada
DEC-018/DEC-020: Gestor recebe oportunidades priorizadas, controla orçamento centralizado compartilhado de 10.000 UC, sem saldo permanente por agente. Autoriza/rejeita e registra disponibilidade, limites, reservas/liberações sem duplicação. Exposição individual máxima 20% e consolidada 40% do patrimônio; risco planejado por operação 1% e total aberto 2%. Recalcular percentuais sobre patrimônio conforme regras auditáveis. Perda diária de referência 3% usa patrimônio do início do dia UTC, virada 00:00, e considera redução patrimonial/perdas não realizadas; ao atingir o limite, bloquear novas entradas. Risco inclui custos previstos e distância à proteção, sem garantir perda máxima: gaps/deslizamentos podem exceder planejamento. Faixas por pontuação não aprovadas.

DEC-021/DEC-022: somente spot simulado, sem alavancagem/venda descoberta/operação real. Sinais em candles fechados; entrada na próxima abertura elegível, com autorização financeira anterior. Não executar retroativamente no candle de origem ou após perder abertura; ENTRY expira na abertura perdida; EXIT_REQUEST perdido exige reavaliação (DEC-029). Registrar preço efetivamente simulado. OPS-002: stop inicial 2% abaixo, take 4% acima; taxa 0,10% e deslizamento 0,05% por execução; uma posição por ativo, saída integral. Saída estratégica na próxima abertura elegível; stop/take ativos via OHLC.

DEC-023: avaliar gaps na abertura. Abaixo do stop de comprada, usar abertura desfavorável com deslizamento; acima do take, não conceder além do alvo sem regra aprovada. Só stop ou só take atingido: processar respectivo; ambos com sequência desconhecida: stop primeiro. Registrar razão/custos e impedir encerramento duplo. Não antecipar máxima/mínima/fechamento futuros; mudanças de proteção não retroagem.

DEC-024: stop obrigatório e vínculo com versão de origem; apertar proteção só conforme regra autorizada, sem ampliar risco. Promoção não muda retroativamente posições; rollback não abandona posições e preserva proteção/histórico. Parâmetros versionados e candidatas sujeitos integralmente a DEC-016; sem alteração autônoma de limites globais/gates.

DEC-029: ENTRY só vale até próxima abertura elegível; expiração/cancelamento libera reserva idempotentemente, sem transferir autorização; nova oportunidade exige nova análise/dados válidos e autorização própria. Relógio simulado: pausa não expira por tempo real/animação. HOLD/WAIT no ciclo corrente, WAIT sem reserva; RISK_ALERT adicional persistido com situação rastreável, sem ordem automática. Uma decisão oficial por ativo/candle fechado; identidade estável por sinal/ciclo, reprocessamento sem duplicar oportunidades/reservas/operações. Dados ausentes/inválidos bloqueiam novas entradas; posições não perdem proteção. Contingências não definidas PENDING.

Pendências: ciclo completo da ordem, detalhes restantes das reservas/contingências, redimensionamento/rejeição, precisão/reconciliação e recuperação. Não escolher contratos ou tecnologias nesta consolidação.

## 8. Persistência e auditoria
DEC-025: histórico e estado financeiros persistentes, auditáveis e idempotentes. Controlar caixa disponível/reservado, posições, patrimônio, realizado/não realizado, exposição, risco planejado, perda diária, taxas/deslizamentos e justificativas de autorizações/rejeições. Marcação a mercado usa preços conhecidos no instante, sem antecipação.

Cada operação preserva agente/ativo, estratégia/versão, oportunidade original, nota ao Coordenador, dados/contexto, orçamento, capital/risco autorizados, entrada/saída, custos, stop/take, resultado e eventos usados no aprendizado. Resultados alimentam só o especialista responsável; separar carteira de avaliações hipotéticas não executadas.

Correções por eventos de ajuste/compensação preservam originais; não duplicar reservas, execuções, taxas ou liquidações. Reinício preserva histórico/estado; mesmo cenário/parâmetros/sequência reproduz resultados. Também persistir identidades de sinais/ciclos, componentes disponíveis, divergências, estado do rodízio, expirações/cancelamentos e liberação idempotente. Rejeição por falta de capital não prova erro da estratégia. Banco, contratos, precisão, arredondamento, reconciliação, recuperação e avaliações hipotéticas detalhadas PENDING. Nenhum mecanismo implementado.

## 9. Segurança
Agentes não alteram código, segurança, limites financeiros, contratos, critérios obrigatórios ou autorizações. Candidatas não interferem em operações oficiais enquanto avaliadas. Gates não provam eficácia real. Operações reais e provedores pagos exigem autorização específica; não integram o MVP atual. Autenticação, credenciais e controles técnicos PENDING; nenhum implementado.

## 10. Infraestrutura e implantação
STATUS: PENDING — aguardando definição arquitetural.
Hardware, desempenho, observabilidade, custos e implantação ainda a definir. Não há frameworks ou provedores aprovados por este desenho.
