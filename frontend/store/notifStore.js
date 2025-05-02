import { create } from "zustand";

const useNotifStore = create((set) => ({
    teks: "",
    show: false,
    setNotif: (teks) => {
        set({
            teks: teks,
        });
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
        setTimeout(() => {
            set({
                teks: "",
            });
        }, 4000);
    },
}));

export default useNotifStore;
