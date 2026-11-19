# Triagem de Chamados com IA

> **Status: em desenvolvimento.** O código entra aos poucos; abaixo está o planejamento do projeto.

## O que é

Fluxo no n8n que recebe um chamado, usa um modelo de linguagem para classificar categoria e prioridade, extrair filial e sistema e resumir em uma linha, grava o resultado e avisa a equipe. Classificação com baixa confiança vai para revisão humana.

## O que prova

Automação com IA de ponta a ponta e, principalmente, medição: taxa de acerto em um conjunto rotulado.

## Stack

n8n em Docker. API do Claude com saída estruturada em JSON. Google Sheets ou Supabase. Bot do Telegram. Sobre o modelo: comece com `claude-opus-5-5` e rode a mesma avaliação com `claude-haiku-5-5`, que custa uma fração; a escolha sai dos seus números de acerto e custo.

## Estrutura

```
triagem-chamados-ia/
├─ workflows/triagem.json        # exportação do n8n
├─ prompts/classificador.md      # versões do prompt
├─ dados/chamados_rotulados.csv  # 40 chamados fictícios com gabarito
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
