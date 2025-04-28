import { Link } from "react-router-dom";
import { Img } from "react-image";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
    return (
        <footer>
            <div className="container my-6 mx-6">
                <div className="flex justify-between items-center py-4">
                    <div className="flex gap-4">
                        <Link to="/">Home</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/contact">Contact Us</Link>
                    </div>
                    <div className="flex flex-col">
                        <Img src="" alt="Logo" width={150} height={200} />
                    </div>
                </div>
                <hr
                    style={{
                        opacity: "0.5",
                        width: "100%",
                    }}
                />
                <div className="flex justify-between items-center py-4">
                    <div className="flex gap-2">
                        <Link to="/">
                            <FaFacebookF style={{ fontSize: "18px" }} />
                        </Link>
                        <Link to="/">
                            <FaInstagram style={{ fontSize: "18px" }} />
                        </Link>
                        <Link to="/">
                            <FaTwitter style={{ fontSize: "18px" }} />
                        </Link>
                    </div>
                    <div
                        className="flex gap-2 text-sm"
                        style={{ opacity: "0.7" }}
                    >
                        <Link to="/">Terms & Conditions</Link>
                        <Link to="/">Privacy Policy</Link>
                    </div>
                </div>
            </div>
            <p
                className="text-center mb-4"
                style={{
                    opacity: "0.5",
                    fontSize: "14px",
                }}
            >
                Copyright &copy;{" Ilenafurniture"} {new Date().getFullYear()}
            </p>
        </footer>
    );
};

export default Footer;
