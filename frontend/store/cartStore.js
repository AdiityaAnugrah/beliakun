import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
    persist(
        (set) => ({
            cart: [],
            setCart: (cart) => set({ cart: cart }),
        }),
        {
            name: "cart-storage",
            getStorage: () => localStorage,
        }
    )
);

export default useCartStore;
