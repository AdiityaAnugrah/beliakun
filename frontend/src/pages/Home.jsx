import { Helmet } from "react-helmet";
import BennerHome from "../components/BennerHome";
import Notif from "../components/Notif";
import ProductGrid from "../components/ProductGrid";
import Tombol from "../components/Tombol";

const Home = () => (
  <>
    <Helmet>
    <title>Beli Akun | Produk Digital & Jasa Coding Murah</title>
    <meta name="description" content="Beli CapCut Pro, akun PUBG, Canva Pro, GPT Pro, hingga jasa coding WordPress & bot. Aman, cepat, dan bergaransi!" />
    <meta name="keywords" content="beli akun, capcut pro, jasa coding, akun pubg, canva pro, akun ff, jasa bot telegram" />
    <meta name="author" content="Beli Akun" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="Beli Akun | Produk Digital & Jasa Coding Murah" />
    <meta property="og:description" content="Platform terpercaya untuk beli produk digital dan jasa coding. Lengkap, murah, dan cepat!" />
    <meta property="og:image" content="https://beliakun.com/assets/images/og-home.png" />
    <meta property="og:url" content="https://beliakun.com" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Beli Akun | Produk Digital & Jasa Coding Murah" />
    <meta name="twitter:description" content="Beli produk digital & jasa coding profesional seperti CapCut Pro, GPT, dan bot Telegram." />
    <meta name="twitter:image" content="https://beliakun.com/assets/images/og-home.png" />

    <link rel="icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/favicon.png" sizes="180x180" />

    <script type="application/ld+json">
        {`
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Beli Akun",
            "url": "https://beliakun.com",
            "logo": "https://beliakun.com/public/vite.svg.svg",
            "description": "Beli Akun adalah platform digital terpercaya untuk layanan seperti CapCut Pro, akun game, GPT Pro, dan jasa coding.",
            "sameAs": [
                "https://www.instagram.com/beliakun_official",
                "https://t.me/beliakun_official",
                "https://www.facebook.com/beliakun_official",
                "https://www.youtube.com/@beliakun_official",
            ]
        }
        `}
    </script>
    </Helmet>

    <Notif />
    <BennerHome />
    <ProductGrid />
    <div className="container mx-auto mt-8 mb-8 flex justify-center">
      <Tombol text="Lihat Semua Produk" style="home" link="/product" />
    </div>
  </>
);

export default Home;
