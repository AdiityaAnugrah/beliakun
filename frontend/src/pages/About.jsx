import Topbar from "../components/Topbar";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import Swal from "sweetalert2";
import { subscribeEmail } from "../services/newsletterService";

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

    useEffect(() => {
        const counters = document.querySelectorAll(".counter");
        counters.forEach((counter) => {
            const updateCount = () => {
                const target = +counter.getAttribute("data-count");
                const current = +counter.innerText;
                const speed = 40;
                const increment = target / speed;
                if (current < target) {
                    counter.innerText = Math.ceil(current + increment);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const email = e.target.elements["email"].value.trim();
        const bottrap = e.target.elements["bottrap"].value;

        if (bottrap !== "") return; // Bot detected, silently ignore

        if (!email || !email.includes("@")) {
            return Swal.fire({
                icon: "error",
                title: "Oops!",
                text: "Please enter a valid email address.",
            });
        }

        try {
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
        }
    };


    return (
        <>
            <Topbar title="About Beli Akun" />
            <div className="page-container">
                {/* Layout */}
                <section className="about-layout">
                    <div className="about-text">
                        <h1>About Beli Akun</h1>
                        <p>Beli Akun is your trusted digital game store for game accounts, top-ups, tools, and more.</p>
                    </div>
                    <div className="about-image">
                        <img src="/assets/all/logo-light.svg" alt="Beli Akun About" />
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

                {/* Statistic Counters */}
                <section className="about-stats">
                    <div className="stats-grid">
                        <div className="stat-box">
                            <h3><span className="counter" data-count="10000">0</span>+</h3>
                            <p>Transactions</p>
                        </div>
                        <div className="stat-box">
                            <h3><span className="counter" data-count="100">0</span>+</h3>
                            <p>Digital Products</p>
                        </div>
                        <div className="stat-box">
                            <h3><span className="counter" data-count="4.9">0</span>/5</h3>
                            <p>Rating</p>
                        </div>
                        <div className="stat-box">
                            <h3><span className="counter" data-count="24">0</span>/7</h3>
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
                                onClick={() => toggleFaq(i)}
                            >
                                <h4>{item.q}</h4>
                                {faqOpen === i && <p>{item.a}</p>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Social Proof Bar */}
                <section className="social-proof">
                    <marquee behavior="scroll" direction="left">
                        ✅ Aldo from Bandung just purchased an MLBB account &nbsp; | &nbsp;
                        ✅ Sinta from Jakarta topped up Free Fire &nbsp; | &nbsp;
                        ✅ Rizky from Surabaya bought a Valorant key
                    </marquee>
                </section>

                {/* Client Reviews */}
                <section className="client-reviews">
                    <h2>Client Reviews</h2>
                    {reviews.length > 0 ? (
                        <Swiper
                            modules={[EffectFade, Pagination, Autoplay]}
                            effect="slide"
                            pagination={{ clickable: true }}
                            loop={true}
                            autoplay={{ delay: 4000 }}
                            className="review-swiper"
                        >
                            {reviews.map((r, i) => (
                                <SwiperSlide key={i}>
                                    <div className="review-card">
                                        <p>"{r.message}"</p>
                                        <div className="review-author">
                                            <img src={r.avatar} alt={r.name} />
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
                        <p>Loading reviews...</p>
                    )}
                </section>

                {/* Newsletter Signup */}
                <section className="newsletter">
                    <h2>Subscribe for Weekly Deals</h2>
                    <form onSubmit={handleSubscribe}>
                        <input type="email" name="email" placeholder="Enter your email..." required />
                        <input type="text" name="bottrap" style={{ display: "none" }} autoComplete="off" />
                        <button type="submit">Subscribe</button>
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
                                <img src={member.avatar} alt={member.name} />
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
                    <a href="/product" className="btn">Explore Products</a>
                </section>
            </div>
        </>
    );
};

export default About;