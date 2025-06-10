import { t } from "i18next";
import BennerHome from "../components/BennerHome";
import Notif from "../components/Notif";
import ProductGrid from "../components/ProductGrid";
import Tombol from "../components/Tombol";
import { FaArrowRight } from "react-icons/fa";


const Home = () => (
    <>
        <Notif />
        <BennerHome />
        <ProductGrid />
        <div className="container mx-auto mt-8 mb-8 flex justify-center">
            <Tombol
                text={t("btn_see_all_products")}
                style="home"
                link="/product" />
        </div>
    </>
);

export default Home;
