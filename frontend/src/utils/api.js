const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const request = async (path, { token, ...options } = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.message || "Une erreur est survenue.";
    throw new Error(message);
  }
  return payload;
};

export { API_URL, request };
