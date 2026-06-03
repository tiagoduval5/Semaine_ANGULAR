const BASE = 'https://digi-api.com/api/v1';

export async function fetchDigimons({ page, pageSize, name }) {
  let url = `${BASE}/digimon?page=${page}&pageSize=${pageSize}`;
  if (name) url += `&name=${encodeURIComponent(name)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
  const data = await res.json();

  return {
    items: (data.content ?? []).map((d) => ({
      id: Number(d.id),
      name: d.name,
      image: d.image ?? d.images?.[0]?.href ?? null,
    })),
    totalElements: data.pageable?.totalElements,
    totalPages: data.pageable?.totalPages,
    currentPage: data.pageable?.currentPage,
  };
}

export async function fetchDigimon(idOrName) {
  const res = await fetch(`${BASE}/digimon/${idOrName}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
  return res.json();
}
