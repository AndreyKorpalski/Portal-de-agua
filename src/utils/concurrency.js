// Executa fn(item) para cada item, no máximo `limit` promessas em paralelo
// por vez. Importante pra ações em massa (ex: cobrar milhares de associados)
// sem abrir milhares de requisições simultâneas no navegador.
export async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = { status: 'fulfilled', value: await fn(items[i], i) };
      } catch (err) {
        results[i] = { status: 'rejected', reason: err };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
