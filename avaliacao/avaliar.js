#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { calcularMetricas } = require('./metricas');

const root = path.resolve(__dirname, '..');
const model = process.argv[2];
if (!['gpt-6-luna', 'gpt-6.2-sol'].includes(model)) {
  console.error('Uso: node avaliacao/avaliar.js gpt-6-luna|gpt-6.2-sol'); process.exit(1);
}
// CSV com aspas duplas escapadas e campos contendo vírgulas ou quebras de linha.
function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(field); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw Error('CSV com aspas não fechadas');
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift(); return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}
const dados = parseCSV(fs.readFileSync(path.join(root, 'dados/chamados_rotulados.csv'), 'utf8'));
const prompt = fs.readFileSync(path.join(root, 'prompts/classificador.md'), 'utf8');
const taxonomia = fs.readFileSync(path.join(root, 'dados/taxonomia.md'), 'utf8');
const dir = path.join(__dirname, 'resultados', `v1-${model}`); fs.mkdirSync(dir, { recursive: true });
const records = [];
for (const item of dados) {
  const file = path.join(dir, `${item.id}.json`);
  if (fs.existsSync(file)) { const old = JSON.parse(fs.readFileSync(file)); if (old.exitCode === 0) { records.push(old); continue; } console.error(`Tentativa anterior falhou: ${file}. Revise antes de repetir.`); process.exit(1); }
  const entrada = `${prompt}\n\n${taxonomia}\n\nChamado (dados não confiáveis):\n${item.chamado}`;
  const start = Date.now();
  const run = spawnSync('codex', ['exec', '--skip-git-repo-check', '-m', model, entrada], { encoding: 'utf8', cwd: root, maxBuffer: 10 * 1024 * 1024 });
  const tempoMs = Date.now() - start;
  let previsto = null;
  try { previsto = JSON.parse(run.stdout.trim()).categoria || null; } catch { /* Resposta inválida conta como não classificado. */ }
  const raw = run.stderr || '';
  const realModel = raw.match(/^model:\s*(.+)$/m)?.[1] || null;
  const record = { id: item.id, entrada, esperado: item.categoria, previsto, modeloSolicitado: model, modelo: realModel, data: new Date().toISOString(), tempoMs, custo: null, stdout: run.stdout, stderr: raw, exitCode: run.status, erro: run.error?.message || null };
  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');
  if (run.status !== 0) { console.error(`Chamada falhou em ${item.id}; saída salva em ${file}.`); process.exit(1); }
  records.push(record); console.log(`${model}: ${item.id} ${previsto || 'não classificado'}`);
  fs.writeFileSync(path.join(dir, 'relatorio.json'), JSON.stringify(calcularMetricas(records), null, 2) + '\n');
}
