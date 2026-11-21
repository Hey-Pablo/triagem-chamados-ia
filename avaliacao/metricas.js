function calcularMetricas(registros) {
  const matriz = {}, porCategoria = {};
  let acertos = 0, tempo = 0;
  for (const r of registros) {
    const previsto = r.previsto || 'não classificado';
    matriz[r.esperado] ||= {};
    matriz[r.esperado][previsto] = (matriz[r.esperado][previsto] || 0) + 1;
    porCategoria[r.esperado] ||= { total: 0, acertos: 0 };
    porCategoria[r.esperado].total++;
    if (r.esperado === previsto) { acertos++; porCategoria[r.esperado].acertos++; }
    tempo += r.tempoMs;
  }
  for (const c of Object.values(porCategoria)) c.acuracia = c.acertos / c.total;
  return { total: registros.length, acertos, acuracia: registros.length ? acertos / registros.length : null, porCategoria, matriz, tempoMedioMs: registros.length ? tempo / registros.length : null, custo: null };
}
module.exports = { calcularMetricas };
