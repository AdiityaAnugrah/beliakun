// services/checkoutService.js
const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export const checkoutManual = async (payload, token) => {
  try {
    const res = await fetch(`${API_URL}/payment/tripay/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return {
      status: res.status,
      data,
    };
  } catch (error) {
    console.error("Checkout failed", error);
    return {
      status: 500,
      message: "Server error",
    };
  }
};

export const getOrder = async (reference, token) => {
  try {
    const res = await fetch(`${API_URL}/order/${reference}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return {
      status: res.status,
      data,
    };
  } catch (error) {
    console.error("Gagal ambil order", error);
    return {
      status: 500,
      message: "Server error",
    };
  }
};

export const getPaymentChannels = async () => {
  try {
    const res = await fetch(`${API_URL}/payment/channels`);
    const data = await res.json();
    return data?.data || [];
  } catch (err) {
    console.error("Gagal ambil channel", err);
    return [];
  }
};
