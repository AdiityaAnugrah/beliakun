import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
    return (
        <footer>
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-links">
                        <Link to="/">Home</Link>
                        <Link to="/about">About Us</Link>
                    </div>
                    <div className="footer-partners">
                        <h4>Our Partners</h4>
                        <div className="partner-logos">
                            <img
                                src="../partners/cloudflare.svg"
                                alt="Cloudflare"
                            />
                            <img
                                src="../partners/Midtrans.svg"
                                alt="Midtrans"
                            />
                        </div>
                    </div>
                </div>

                <hr className="footer-separator" />

                <div className="footer-bottom">
                    <div className="footer-socials">
                        <Link to="/">
                            <FaFacebookF />
                        </Link>
                        <Link to="/">
                            <FaInstagram />
                        </Link>
                        <Link to="/">
                            <FaTwitter />
                        </Link>
                    </div>
                    <div className="footer-legal">
                        <Link to="/">Terms & Conditions</Link>
                        <Link to="/">Privacy Policy</Link>
                    </div>
                </div>
            </div>

            <p className="footer-copy">
                &copy; {new Date().getFullYear()} AA_Code. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;
