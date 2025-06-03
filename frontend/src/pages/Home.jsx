import BennerHome from "../components/BennerHome";
import Notif from "../components/Notif";
import ProductGrid from "../components/ProductGrid";

const Home = () => (
    <>
        <Notif />
        <BennerHome />
        <ProductGrid />
        <div className="container">
            <h1>Welcome to Home Page</h1>
            <p>Silakan kembangkan konten disini!</p>
        </div>
    </>
);

export default Home;
