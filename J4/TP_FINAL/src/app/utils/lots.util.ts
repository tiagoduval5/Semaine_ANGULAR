export function decouperEnLots(ids: number[], taille = 20): number[][] {
  const lots: number[][] = [];
  for (let i = 0; i < ids.length; i += taille) {
    lots.push(ids.slice(i, i + taille));
  }
  return lots;
}
