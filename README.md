# Triagem de Chamados com IA

> **Status: em desenvolvimento.** O código entra aos poucos; abaixo está o planejamento do projeto.

## O que é

Fluxo no n8n que recebe um chamado, usa um modelo de linguagem para classificar categoria e prioridade, extrair filial e sistema e resumir em uma linha, grava o resultado e avisa a equipe. Classificação com baixa confiança vai para revisão humana.

## O que prova

Automação com IA de ponta a ponta e, principalmente, medição: taxa de acerto em um conjunto rotulado.

## Stack

Planejado: n8n em Docker, saída estruturada em JSON, Google Sheets ou Supabase e bot do Telegram. A avaliação comparará modelo principal x modelo econômico; a escolha dependerá de acerto e custo medidos. Nenhuma integração ou avaliação foi implementada nesta etapa.

## Material disponível

A [taxonomia v1](dados/taxonomia.md) define oito categorias e quatro prioridades. O [conjunto rotulado](dados/chamados_rotulados.csv) contém 40 chamados fictícios com gabarito de categoria, prioridade, filial e sistema. O [prompt v1](prompts/classificador.md) inclui três exemplos e deve ser usado junto da taxonomia. O conjunto ainda não mede acurácia: nenhuma chamada a modelo foi feita nesta etapa.

Para verificar a estrutura do conjunto, com Python 3 instalado:

```bash
python3 -m unittest discover -s tests -v
```

O teste verifica formato, quantidade, identificadores, campos e cobertura dos rótulos; não valida a correção semântica dos gabaritos nem a qualidade do modelo. Não há variáveis necessárias nesta etapa; `.env.example` registra isso e `.env` está ignorado pelo Git.

## Estrutura

```
triagem-chamados-ia/
├─ workflows/triagem.json        # exportação do n8n
├─ prompts/classificador.md      # versões do prompt
├─ dados/                         # taxonomia e 40 chamados fictícios com gabarito
├─ tests/                         # validação estrutural do conjunto
├─ avaliacao/
│  ├─ avaliar.js                 # roda o prompt e calcula o acerto
│  └─ resultados/                # um relatório por versão e por modelo
├─ docker-compose.yml
└─ README.md                     # diagrama, importação, custo
```

## Plano

1. Defina a taxonomia: 8 categorias e 4 prioridades, com critério escrito para cada uma.
2. Escreva 40 chamados fictícios e rotule à mão.
3. Prompt versão 1 com saída em JSON (categoria, prioridade, filial, sistema, resumo, confiança) e 3 exemplos.
4. Script de avaliação fora do n8n: acerto por categoria e matriz de confusão. Itere até 85% de acerto de categoria.
5. Monte o fluxo: gatilho (formulário ou webhook), limpeza do texto, chamada ao modelo, validação do JSON, gravação e notificação.
6. Regra de confiança: abaixo do limite, o chamado vai para a fila de revisão com botões no Telegram.
7. Tratamento de erro: nova tentativa e registro "não classificado" quando falhar.
8. Registro de custo e tempo por chamado.
9. README com diagrama, vídeo de 2 minutos, resultado da avaliação e custo médio.

## Como deve funcionar

- Enviar o formulário cria uma linha classificada em poucos segundos e uma mensagem no Telegram.
- Chamado ambíguo aparece como "revisar", com as duas categorias mais prováveis.
- Nenhuma resposta sai para o usuário final sem aprovação humana.
- O relatório mostra o acerto de cada versão do prompt e de cada modelo testado.

## Prazo

1 a 2 semanas.

## Autor

Pablo Dilio · [Portfólio](https://hey-pablo.github.io/pablo-dilio-portfolio/) · [LinkedIn](https://www.linkedin.com/in/pablo-dilio-4063991b2)
