// services/newsletterService.js
const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export const subscribeEmail = async (email) => {
  const res = await fetch(`${API_URL}/api/newsletter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
};
