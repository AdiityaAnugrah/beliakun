import { Link } from "react-router-dom";

const Tombol = ({
    style = "kotak",
    text = "HARUS DI ISI YA",
    link = "#",
    icon = "",
    onClick = () => {},
}) => {
    return (
        <Link onClick={onClick} to={link} className={`btn ${style}`}>
            {text}
            {icon}
        </Link>
    );
};

export default Tombol;
