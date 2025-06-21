// services/tripayService.js
const API_URL = import.meta.env.VITE_URL_BACKEND;

export const createTripayTransaction = async (data) => {
  const res = await fetch(`${API_URL}/api/payment/tripay/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  return await res.json();
};