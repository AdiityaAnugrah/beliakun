import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWishlistStore = create(
    persist(
        (set) => ({
            wishlist: [],
            setWishlist: (wishlist) => set({ wishlist }),
        }),
        {
            name: "wishlist-storage",
            getStorage: () => localStorage,
        }
    )
);

export default useWishlistStore;
