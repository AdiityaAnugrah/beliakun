const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export const getOrderHistory = async (token) => {
  try {
    const res = await fetch(`${API_URL}/order/history`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    return {
      status: res.status,
      data,
    };

  } catch (error) {
    console.error("Error fetching order history:", error);
    return {
      status: 500,
      data: { message: "Failed to fetch order history" },
    };
  }
};
