export function extraireIdDepuisUrl(url: string): number {
  const segment = url.split('/').filter(Boolean).pop();
  return Number(segment);
}
