import { Link } from "react-router-dom";
import { Img } from "react-image";
import Tombol from "../components/Tombol";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [cari, setCari] = useState("");
    const [pathname, setPathname] = useState(window.location.pathname);

    useEffect(() => {
        if (cari) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [cari]);

    return (
        <nav className="w-full">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <Link to="/" style={{ corsor: "pointer" }}>
                        <Img src="" alt="Logo" width={150} height={200} />
                    </Link>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <ul className="flex">
                        <li>
                            <Link
                                to="/"
                                onClick={() => setPathname("/")}
                                className={pathname === "/" ? "active" : ""}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/project"
                                onClick={() => setPathname("/project")}
                                className={
                                    pathname === "/project" ? "active" : ""
                                }
                            >
                                Project
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/about"
                                onClick={() => setPathname("/about")}
                                className={
                                    pathname === "/about" ? "active" : ""
                                }
                            >
                                About Us
                            </Link>
                        </li>
                    </ul>
                    <div
                        style={{ backgroundColor: "whiteSmoke" }}
                        className={`bg-opacity-50 rounded-full search ${
                            open ? "show" : cari ? "show" : ""
                        }`}
                    >
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-transparent py-2 outline-none"
                            value={cari}
                            onChange={(e) => {
                                setCari(e.target.value);
                            }}
                        />
                        <Tombol
                            onClick={() => {
                                setOpen(!open);
                            }}
                            icon={<FaSearch />}
                            text=""
                            className="bg-transparent"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
