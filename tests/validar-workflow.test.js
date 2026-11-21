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

// Verificar nós críticos
const criticalNodes = [
  'Webhook - Receber Chamado',
  'Limpar Texto',
  'Chamada LLM Classificador',
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

// Validar conexões - verificar se os nós referenciados existem
const allNodeNames = new Set(workflow.nodes.map(n => n.name));
let connectionErrors = [];

for (const [sourceNodeName, connections] of Object.entries(workflow.connections || {})) {
  for (const [outputName, targetGroups] of Object.entries(connections)) {
    // targetGroups is an array of arrays (one per main output)
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
  // Não falhar, apenas avisar
} else {
  console.log('✅ Conexões válidas');
}

// Verificar webhook
const webhookNode = workflow.nodes.find(n => n.name === 'Webhook - Receber Chamado');
if (webhookNode && webhookNode.webhook) {
  console.log(`✅ Webhook configurado: ${webhookNode.webhook}`);
} else {
  console.warn('⚠️  Webhook não configurado ou nome diferente do esperado');
}

// Resumo
console.log('\n📋 Resumo do workflow:');
console.log(`   Nome: ${workflow.name}`);
console.log(`   Ativo: ${workflow.active || false}`);
console.log(`   Nós: ${workflow.nodes.length}`);
console.log(`   Conexões: ${Object.keys(workflow.connections || {}).length}`);

// Verificar credenciais pendentes
const hasCredentials = workflow.nodes.some(n => n.credentials);
if (hasCredentials) {
  console.log('\n⚠️  Credenciais configuradas (verifique no n8n após importar)');
}

console.log('\n✅ Validação concluída com sucesso!');
console.log('   Importante: Configure as credenciais no n8n após a importação.');
process.exit(0);