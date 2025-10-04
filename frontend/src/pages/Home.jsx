import React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import BennerHome from "../components/BennerHome";
import Notif from "../components/Notif";
import ProductGrid from "../components/ProductGrid";
import Tombol from "../components/Tombol";
import "./Home.scss";

const Home = () => {
  const { t } = useTranslation();

  // JSON-LD pakai object + JSON.stringify (aman & valid untuk SEO)
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Beli Akun",
    url: "https://beliakun.com",
    logo: "https://beliakun.com/public/vite.svg.svg", // biarin sesuai aset kamu
    description:
      "Beli Akun adalah platform digital terpercaya untuk layanan seperti CapCut Pro, akun game, GPT Pro, dan jasa coding.",
    sameAs: [
      "https://www.instagram.com/beliakun_official",
      "https://t.me/beliakun_official",
      "https://www.facebook.com/beliakun_official",
      "https://www.youtube.com/@beliakun_official",
    ],
  };

  return (
    <>
      <Helmet>
        <title>Beli Akun | Produk Digital & Jasa Coding Murah</title>
        <meta
          name="description"
          content="Beli CapCut Pro, akun PUBG, Canva Pro, GPT Pro, hingga jasa coding WordPress & bot. Aman, cepat, dan bergaransi!"
        />
        <meta
          name="keywords"
          content="beli akun, capcut pro, jasa coding, akun pubg, canva pro, akun ff, jasa bot telegram"
        />
        <meta name="author" content="Beli Akun" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Beli Akun | Produk Digital & Jasa Coding Murah"
        />
        <meta
          property="og:description"
          content="Platform terpercaya untuk beli produk digital dan jasa coding. Lengkap, murah, dan cepat!"
        />
        <meta
          property="og:image"
          content="https://beliakun.com/assets/images/og-home.png"
        />
        <meta property="og:url" content="https://beliakun.com" />
        <meta property="og:site_name" content="Beli Akun" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Beli Akun | Produk Digital & Jasa Coding Murah"
        />
        <meta
          name="twitter:description"
          content="Beli produk digital & jasa coding profesional seperti CapCut Pro, GPT, dan bot Telegram."
        />
        <meta
          name="twitter:image"
          content="https://beliakun.com/assets/images/og-home.png"
        />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.png" sizes="180x180" />

        {/* Canonical */}
        <link rel="canonical" href="https://beliakun.com/" />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(orgLd)}</script>
      </Helmet>

      {/* Notifikasi global (pakai store existing) */}
      <Notif />

      <main className="home-page">
        {/* HERO */}
        <section className="home-hero" aria-label="Hero">
          <BennerHome />
        </section>

        {/* HEADER + GRID PRODUK */}
        <section
          className="home-products section"
          aria-label={t("home_featured_products", "Featured Products")}
        >
          

          {/* ProductGrid sudah punya wrapper sendiri — biarkan supaya sistem tidak berubah */}
          <ProductGrid />
        </section>

        {/* CTA BAWAH (opsional, tetap ada supaya mudah dijangkau di mobile) */}
        <section className="home-cta-bottom">
          <div className="container">
            <div className="center-btn">
              <Tombol
                style="home"
                link="/product"
                text={t("btn_see_all_products", "See All")}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
