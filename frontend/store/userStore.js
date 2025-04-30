import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
    persist(
        (set) => ({
            nama: null,
            email: null,
            username: null,
            role: null,
            token: null,
            setNama: (nama) => set({ nama }),
            setEmail: (email) => set({ email }),
            setUsername: (username) => set({ username }),
            setRole: (role) => set({ role }),
            setToken: (token) => set({ token }),
            emptyUser: () =>
                set({
                    nama: null,
                    email: null,
                    username: null,
                    role: null,
                    token: null,
                }),
        }),
        {
            name: "user-storage",
            getStorage: () => localStorage,
        }
    )
);

export default useUserStore;
