import BennerHome from "../components/BennerHome";
import CategoryCarousel from "../components/CategoryCarousel";
import Notif from "../components/Notif";
import ProductGrid from "../components/ProductGrid";

const Home = () => (
    <>
        <Notif />
        <BennerHome />
        <ProductGrid />
        <div className="container">
        </div>
    </>
);

export default Home;
