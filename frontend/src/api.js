const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiRequest = async (path, { token, ...options } = {}) => {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Erreur API');
  }

  return response.json();
};

export { apiBase };
