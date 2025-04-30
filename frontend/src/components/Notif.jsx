const Notif = ({ teks, show }) => {
    return (
        <div className={`notif ${show ? "show" : ""}`}>
            <div>
                <p>{teks}</p>
            </div>
        </div>
    );
};

export default Notif;
