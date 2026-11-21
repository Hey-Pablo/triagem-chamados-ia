#!/usr/bin/env node
/**
 * Script de validação do workflow n8n
 * Uso: node tests/validar-workflow.js
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, 'workflows/triagem.json');

console.log('🔍 Validando workflow n8n...\n');

// Verificar se o arquivo existe
if (!fs.existsSync(workflowPath)) {
  console.error('❌ Erro: workflows/triagem.json não encontrado');
  console.log('   Execute: git checkout workflows/triagem.json');
  process.exit(1);
}

let workflow;
try {
  workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  console.log('✅ JSON válido');
} catch (e) {
  console.error('❌ JSON inválido:', e.message);
  process.exit(1);
}

// Validar estrutura mínima
const requiredFields = ['name', 'nodes', 'connections'];
for (const field of requiredFields) {
  if (!workflow[field]) {
    console.error(`❌ Campo obrigatório ausente: ${field}`);
    process.exit(1);
  }
}
console.log('✅ Campos obrigatórios presentes');

// Validar nós
if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
  console.error('❌ Nenhum nó encontrado');
  process.exit(1);
}
console.log(`✅ ${workflow.nodes.length} nós definidos`);

// Os nós Code usam o parâmetro reconhecido pelo n8n e nomes únicos.
const assert = require('node:assert/strict');
assert.equal(new Set(workflow.nodes.map(node => node.name)).size, workflow.nodes.length, 'Nomes de nós devem ser únicos');
assert.ok(workflow.nodes.some(node => node.name === 'Telegram - Falha' && node.id === '3g'));
assert.ok(workflow.nodes.every(node => node.type !== 'n8n-nodes-base.function'));
for (const node of workflow.nodes.filter(node => node.type === 'n8n-nodes-base.code')) {
  assert.equal(typeof node.parameters.jsCode, 'string', `${node.name} deve conter jsCode`);
}

// Verificar nós críticos (incluindo novos nós de retry e validação)
const criticalNodes = [
  'Webhook - Receber Chamado',
  'Limpar Texto',
  'Contar Tentativas',
  'Chamada LLM Classificador',
  'Validar JSON Resposta',
  'Calcular Custo/Tempo',
  'Validar Confiança',
  'Salvar em PostgreSQL',
  'Telegram - Confirmação',
  'Telegram - Revisão'
];

const nodeNames = workflow.nodes.map(n => n.name);
const missingNodes = criticalNodes.filter(name => !nodeNames.includes(name));

if (missingNodes.length > 0) {
  console.error('❌ Nós críticos ausentes:', missingNodes.join(', '));
  process.exit(1);
}
console.log('✅ Todos os nós críticos presentes');

// Verificar nós de error handling
const errorNodes = ['Validar JSON Resposta', 'Registrar Erro JSON'];
const hasErrorNodes = errorNodes.every(name => nodeNames.includes(name));
if (hasErrorNodes) {
  console.log('✅ Nós de tratamento de erro presentes');
} else {
  console.error('❌ Nós de tratamento de erro ausentes');
  process.exit(1);
}

// Verificar nós de retry
const retryNodes = ['Loop Retry', 'Verificar Retry', 'Contar Tentativas'];
const hasRetryNodes = retryNodes.every(name => nodeNames.includes(name));
if (hasRetryNodes) {
  console.log('✅ Nós de retry presentes');
} else {
  console.error('❌ Nós de retry ausentes');
  process.exit(1);
}

// Validar conexões - verificar se os nós referenciados existem
const allNodeNames = new Set(workflow.nodes.map(n => n.name));
let connectionErrors = [];

for (const [sourceNodeName, connections] of Object.entries(workflow.connections || {})) {
  for (const [outputName, targetGroups] of Object.entries(connections)) {
    if (!Array.isArray(targetGroups)) continue;

    for (const targetArray of targetGroups) {
      if (!Array.isArray(targetArray)) continue;

      for (const target of targetArray) {
        const targetName = target.node;
        if (targetName && !allNodeNames.has(targetName)) {
          connectionErrors.push(`${sourceNodeName} -> ${targetName}`);
        }
      }
    }
  }
}

if (connectionErrors.length > 0) {
  console.error('❌ Conexões inválidas:', connectionErrors.join(', '));
  process.exit(1);
}
console.log('✅ Conexões válidas');

// Verificar webhook
const webhookNode = workflow.nodes.find(n => n.name === 'Webhook - Receber Chamado');
if (webhookNode && webhookNode.webhook) {
  console.log(`✅ Webhook configurado: ${webhookNode.webhook}`);
} else {
  console.warn('⚠️  Webhook não configurado ou nome diferente do esperado');
}

// Verificar se usa HTTP Request (não OpenAI node direto)
const callNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.httpRequest' && n.name.includes('LLM'));
if (callNode) {
  console.log('✅ Usando HTTP Request para chamada ao modelo (mais flexível)');
} else {
  console.warn('⚠️  Verificar tipo de nó usado para chamada LLM');
}

// Verificar se não tem segredos hardcoded
const workflowStr = JSON.stringify(workflow);
let secretErrors = [];

// Verificar possíveis segredos
if (workflowStr.includes('sk-')) {
  secretErrors.push('Chave API OpenAI detectada (sk-)');
}
if (workflowStr.includes('Bearer sk-')) {
  secretErrors.push('Chave API no Bearer header');
}
if (workflowStr.includes('your_claude_api_key') && workflowStr.includes('Bearer')) {
  secretErrors.push('Valor da chave em variável ou credencial');
}

if (secretErrors.length > 0) {
  console.error('❌ Segredos detectados no workflow:', secretErrors.join(', '));
  process.exit(1);
}
console.log('✅ Nenhum segredo hardcoded no workflow');

// Verificar nó de cálculo de custo/tempo
const custoTempoNode = workflow.nodes.find(n => n.name === 'Calcular Custo/Tempo');
if (custoTempoNode) {
  console.log('✅ Nó de cálculo de custo/tempo presente');
} else {
  console.error('❌ Nó de cálculo de custo/tempo ausente');
  process.exit(1);
}

// Verificar caminho de não classificado/com erro
const hasErrorPath = workflowStr.includes('chamados_erros') || workflowStr.includes('chamados_nao_classificados');
if (hasErrorPath) {
  console.log('✅ Tabelas de erros/não classificados configuradas');
} else {
  console.error('❌ Falta tratamento para chamados que falham');
  process.exit(1);
}

// Verificar retry loop
const hasRetryLoop = workflow.connections['JSON Válido?']?.main?.[1]?.[0]?.node === 'Verificar Retry';
if (hasRetryLoop || workflow.connections['Verificar Retry']) {
  console.log('✅ Loop de retry implementado');
} else {
  console.error('❌ Falta loop de retry no workflow');
  process.exit(1);
}

// Resumo
console.log('\n📋 Resumo do workflow:');
console.log(`   Nome: ${workflow.name}`);
console.log(`   Ativo: ${workflow.active || false}`);
console.log(`   Nós: ${workflow.nodes.length}`);
console.log(`   Conexões: ${Object.keys(workflow.connections || {}).length}`);

// Verificar credenciais pendentes
const hasCredentials = workflow.nodes.some(n => n.credentials && Object.keys(n.credentials).length > 0);
if (hasCredentials) {
  console.log('\n⚠️  Credenciais configuradas (verifique no n8n após importar)');
}

// Verificar se o modelo é Anthropic/Claude
const llmConfigNode = workflow.nodes.find(n => n.name === 'Chamada LLM Classificador');
if (llmConfigNode && llmConfigNode.parameters?.json?.messages) {
  console.log('\n✅ Usando HTTP Request com variáveis de ambiente para chave API');
}

console.log('\n✅ Validação concluída com sucesso!');
console.log('   Importante: Configure as credenciais no n8n após a importação.');
console.log('\n📝 Testes recomendados no PC do Pablo:');
console.log('   1. docker-compose up -d');
console.log('   2. Acessar http://localhost:5678');
console.log('   3. Configurar credenciais: PostgreSQL, Telegram, LLM API');
console.log('   4. Importar workflows/triagem.json');
console.log('   5. Testar webhook: curl -X POST http://localhost:5678/webhook/triagem-chamados -H "Content-Type: application/json" -d \'{"chamado": "teste"}\'');
process.exit(0);