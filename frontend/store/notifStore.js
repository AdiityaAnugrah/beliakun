import { create } from "zustand";

const useNotifStore = create((set) => ({
    teks: "",
    show: false,
    setNotif: (teks) => {
        set({
            teks: teks,
            show: true,
        });
        setTimeout(() => {
            set({
                show: false,
            });
        }, 3000);
    },
    showNotif: () => {
        set({
            show: true,
        });
        setTimeout(() => {
            set({
                show: false,
            });
        }, 3000);
    },
}));

export default useNotifStore;
