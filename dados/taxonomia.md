# Taxonomia v1

Todos os chamados e nomes de filiais deste conjunto são fictícios. A categoria descreve a causa ou atividade principal informada, não a equipe responsável. Em caso de múltiplos temas, escolha o bloqueio principal; sem informação suficiente, use `outros` e reduza a confiança. Não infira causa técnica ausente.

| Categoria | Critério |
| --- | --- |
| `acesso` | Autenticação, senha, criação de usuário ou permissão. |
| `cadastro` | Inclusão, alteração, duplicidade ou qualidade de dados cadastrais. |
| `fiscal` | Nota fiscal, tributação, CFOP ou obrigações fiscais. |
| `financeiro` | Pagamentos, boletos, remessas, conciliação ou centros de custo. |
| `estoque` | Saldo, inventário, localização, separação ou transferência de itens. |
| `vendas` | Orçamentos, pedidos, descontos e campanhas de venda. |
| `infraestrutura` | Rede, computadores, impressoras ou outros equipamentos. |
| `outros` | Demanda sem informação suficiente ou que não se enquadra nas demais. |

A prioridade depende de impacto e urgência descritos, não da categoria. Aplique a primeira regra correspondente; não invente impacto ou prazo.

| Prioridade | Critério |
| --- | --- |
| `critica` | Operação de toda a empresa ou de todas as unidades paralisada, sem alternativa. |
| `alta` | Processo relevante ou entrega urgente bloqueado, sem alternativa, mas sem evidência de paralisação de toda a empresa. |
| `media` | Impacto localizado, existe alternativa ou pode aguardar, ou impacto e prazo não estão claros. |
| `baixa` | Solicitação planejada ou ajuste sem bloqueio, explicitamente para data futura e sem urgência. |

`não informado` significa que filial ou sistema não aparece no texto. A confiança é uma estimativa de 0 a 1, não uma probabilidade calibrada; a decisão de encaminhar para revisão e seu limite serão definidos na etapa do fluxo.
