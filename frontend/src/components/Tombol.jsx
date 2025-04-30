import { Link } from "react-router-dom";

const Tombol = ({
    style = "kotak",
    text = "HARUS DI ISI YA",
    link = "",
    icon = "",
    onClick = () => {},
    type = "button",
    disabled = false,
}) => {
    if (link) {
        return (
            <Link onClick={onClick} to={link} className={`btn ${style}`}>
                {text}
                {icon}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={`btn ${style}`}
        >
            {text}
            {icon}
        </button>
    );
};

export default Tombol;
