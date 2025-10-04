import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer>
      <div className="footer-container">
        {/* Top */}
        <div className="footer-top">
          <div className="footer-links">
            <Link to="/">{t("home")}</Link>
            <Link to="/about">{t("about_us")}</Link>
          </div>

          <div className="footer-partners">
            <h4>{t("our_partners")}</h4>
            <div className="partner-logos">
              <img
                src="../partners/cloudflare.svg"
                alt={t("cloudflare")}
                loading="lazy"
              />
              <img
                src="../partners/Midtrans.svg"
                alt={t("midtrans")}
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <hr className="footer-separator" />

        {/* Bottom */}
        <div className="footer-bottom">
          <div className="footer-socials">
            <Link to="/" aria-label="Facebook">
              <FaFacebookF />
            </Link>
            <Link to="/" aria-label="Instagram">
              <FaInstagram />
            </Link>
            <Link to="/" aria-label="Twitter">
              <FaTwitter />
            </Link>
          </div>

          <div className="footer-legal">
            <Link to="/terms">{t("terms_conditions")}</Link>
            <Link to="/privacy">{t("privacy_policy")}</Link>
          </div>
        </div>

        <p className="footer-copy">
          &copy; {new Date().getFullYear()} AA_Code. {t("all_rights_reserved")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
