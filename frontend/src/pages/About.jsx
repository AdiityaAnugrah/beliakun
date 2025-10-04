import Topbar from "../components/Topbar";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Swal from "sweetalert2";
import { subscribeEmail } from "../services/newsletterService";
import "./About.scss"; // <-- tambahkan stylesheet ini

const About = () => {
  const [faqOpen, setFaqOpen] = useState(null);
  const [reviews] = useState([
    {
      name: "Aldo",
      role: "MLBB Player",
      message: "Fast delivery and reliable service.",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      name: "Sinta",
      role: "Free Fire Gamer",
      message: "UI is clean. Process was smooth.",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
      name: "Rizky",
      role: "Valorant Agent",
      message: "Great support team!",
      avatar: "https://i.pravatar.cc/100?img=3",
    },
  ]);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  /** ----- Statistic counters (on-visible) ----- */
  const countersRef = useRef([]);
  useEffect(() => {
    const els = countersRef.current.filter(Boolean);
    if (!els.length) return;

    const animateNumber = (el) => {
      const target = parseFloat(el.getAttribute("data-count") || "0");
      const duration = 900; // ms
      const start = performance.now();
      const startVal = 0;

      const isIntegerTarget = Number.isInteger(target);
      const decimals = isIntegerTarget ? 0 : Math.max(0, (target.toString().split(".")[1] || "").length);

      const step = (ts) => {
        const p = Math.min(1, (ts - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        const val = startVal + (target - startVal) * eased;
        el.innerText = val.toFixed(decimals);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const seen = new WeakSet();
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && !seen.has(e.target)) {
              seen.add(e.target);
              animateNumber(e.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    } else {
      // fallback: langsung animasi
      els.forEach(animateNumber);
    }
  }, []);

  /** ----- Newsletter submit ----- */
  const [submitting, setSubmitting] = useState(false);
  const handleSubscribe = async (e) => {
    e.preventDefault();
    const email = e.target.elements["email"].value.trim();
    const bottrap = e.target.elements["bottrap"].value;

    if (bottrap !== "") return; // Bot honeypot

    if (!email || !email.includes("@")) {
      return Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Please enter a valid email address.",
      });
    }

    try {
      setSubmitting(true);
      const res = await subscribeEmail(email);
      Swal.fire({
        icon: "success",
        title: "Subscribed!",
        text: res.message || "You’re in!",
        timer: 2000,
        showConfirmButton: false,
      });
      e.target.reset();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="About Beli Akun" />

      <div className="page-container about-page">
        {/* Layout hero */}
        <section className="about-layout">
          <div className="about-text">
            <h1>About Beli Akun</h1>
            <p>
              Beli Akun is your trusted digital game store for game accounts,
              top-ups, tools, and more.
            </p>
          </div>
          <div className="about-image">
            <img
              src="/assets/all/logo-light.svg"
              alt="Beli Akun About"
              loading="lazy"
            />
          </div>
        </section>

        {/* Timeline */}
        <section className="about-timeline">
          <h2>Our Journey</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="dot" />
              <div className="content">
                <h4>2023</h4>
                <p>Idea born and validated in gamer community.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="dot" />
              <div className="content">
                <h4>2024</h4>
                <p>Beta launched with core features.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="dot" />
              <div className="content">
                <h4>2025</h4>
                <p>Official launch, partnered with Midtrans & Cloudflare.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="about-stats">
          <div className="stats-grid">
            <div className="stat-box">
              <h3>
                <span
                  className="counter"
                  data-count="10000"
                  ref={(el) => (countersRef.current[0] = el)}
                >
                  0
                </span>
                +
              </h3>
              <p>Transactions</p>
            </div>
            <div className="stat-box">
              <h3>
                <span
                  className="counter"
                  data-count="100"
                  ref={(el) => (countersRef.current[1] = el)}
                >
                  0
                </span>
                +
              </h3>
              <p>Digital Products</p>
            </div>
            <div className="stat-box">
              <h3>
                <span
                  className="counter"
                  data-count="4.9"
                  ref={(el) => (countersRef.current[2] = el)}
                >
                  0
                </span>
                /5
              </h3>
              <p>Rating</p>
            </div>
            <div className="stat-box">
              <h3>
                <span
                  className="counter"
                  data-count="24"
                  ref={(el) => (countersRef.current[3] = el)}
                >
                  0
                </span>
                /7
              </h3>
              <p>Support</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="about-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {[
              {
                q: "Are the game accounts safe?",
                a: "Yes, we only sell verified and legal accounts.",
              },
              {
                q: "How long does top up take?",
                a: "Usually within 1-5 minutes after payment confirmation.",
              },
              {
                q: "Can I get a refund?",
                a: "Only if we fail to deliver. Terms apply.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`faq-item ${faqOpen === i ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-toggle"
                  aria-expanded={faqOpen === i}
                  onClick={() => toggleFaq(i)}
                >
                  {item.q}
                  <span className="plus">{faqOpen === i ? "−" : "+"}</span>
                </button>
                {faqOpen === i && <p className="faq-answer">{item.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof Ticker (pengganti <marquee>) */}
        <section className="social-proof" aria-live="polite">
          <div className="ticker">
            <div className="track">
              <span>
                ✅ Aldo from Bandung just purchased an MLBB account &nbsp; | &nbsp; ✅ Sinta
                from Jakarta topped up Free Fire &nbsp; | &nbsp; ✅ Rizky from Surabaya bought a
                Valorant key &nbsp; | &nbsp;
              </span>
              {/* duplikasi untuk loop mulus */}
              <span aria-hidden="true">
                ✅ Aldo from Bandung just purchased an MLBB account &nbsp; | &nbsp; ✅ Sinta
                from Jakarta topped up Free Fire &nbsp; | &nbsp; ✅ Rizky from Surabaya bought a
                Valorant key &nbsp; | &nbsp;
              </span>
            </div>
          </div>
        </section>

        {/* Client Reviews */}
        <section className="client-reviews">
          <h2>Client Reviews</h2>
          {reviews.length > 0 ? (
            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              loop={true}
              autoplay={{ delay: 4000 }}
              className="review-swiper"
            >
              {reviews.map((r, i) => (
                <SwiperSlide key={i}>
                  <div className="review-card">
                    <p className="quote">“{r.message}”</p>
                    <div className="review-author">
                      <img src={r.avatar} alt={r.name} loading="lazy" />
                      <div>
                        <strong>{r.name}</strong>
                        <span>{r.role}</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="loading-reviews">Loading reviews...</p>
          )}
        </section>

        {/* Newsletter Signup */}
        <section className="newsletter">
          <h2>Subscribe for Weekly Deals</h2>
          <form onSubmit={handleSubscribe} className="newsletter-form" noValidate>
            <input
              type="email"
              name="email"
              placeholder="Enter your email..."
              aria-label="Email address"
              required
            />
            <input
              type="text"
              name="bottrap"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />
            <button type="submit" disabled={submitting} aria-busy={submitting}>
              {submitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </section>

        {/* Meet The Team */}
        <section className="team-grid-full">
          <h2>Meet The Team</h2>
          <div className="grid">
            {[
              {
                name: "Asep",
                role: "Backend Engineer",
                desc: "Handles all API and data security.",
                avatar: "https://i.pravatar.cc/100?img=4",
              },
              {
                name: "Budi",
                role: "Frontend Dev",
                desc: "Crafts the user interface and UX.",
                avatar: "https://i.pravatar.cc/100?img=5",
              },
              {
                name: "Citra",
                role: "Support Lead",
                desc: "Manages communication and social media.",
                avatar: "https://i.pravatar.cc/100?img=6",
              },
            ].map((member, i) => (
              <div className="team-member" key={i}>
                <img src={member.avatar} alt={member.name} loading="lazy" />
                <h4>{member.name}</h4>
                <p className="role">{member.role}</p>
                <p>{member.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <h2>Ready to Level Up?</h2>
          <p>Start browsing game accounts, top up services, or digital tools now.</p>
          <a href="/product" className="btn home">Explore Products</a>
        </section>
      </div>
    </>
  );
};

export default About;
