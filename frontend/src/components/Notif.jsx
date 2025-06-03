import useNotifStore from "../../store/notifStore"; // atau sesuai path kamu

const Notif = () => {
    const { teks, show } = useNotifStore((state) => state);
    if (!teks) return null;

    return (
        <div className={`notif ${show ? "show" : ""}`}>
            <div>
                <p>{teks}</p>
            </div>
        </div>
    );
};

export default Notif;
