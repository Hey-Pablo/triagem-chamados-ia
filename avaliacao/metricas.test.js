const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calcularMetricas } = require('./metricas');

test('contabiliza acertos, erros e respostas inválidas no denominador', () => {
  const resultado = calcularMetricas([
    { esperado: 'acesso', previsto: 'acesso', tempoMs: 1000 },
    { esperado: 'acesso', previsto: 'fiscal', tempoMs: 3000 },
    { esperado: 'fiscal', previsto: null, tempoMs: 2000 },
  ]);
  assert.equal(resultado.acuracia, 1 / 3);
  assert.equal(resultado.porCategoria.acesso.acuracia, 0.5);
  assert.equal(resultado.porCategoria.fiscal.acuracia, 0);
  assert.equal(resultado.matriz.acesso.fiscal, 1);
  assert.equal(resultado.matriz.fiscal['não classificado'], 1);
  assert.equal(resultado.tempoMedioMs, 2000);
});
