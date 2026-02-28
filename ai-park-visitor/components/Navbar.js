import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Menu, X, Ticket, Map, Phone, Home, Waves, User, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const syncUser = () => {
            const stored = localStorage.getItem("sp_user");
            setLoggedInUser(stored ? JSON.parse(stored) : null);
        };
        syncUser();
        window.addEventListener("storage", syncUser);
        // Also re-check on route change
        router.events?.on("routeChangeComplete", syncUser);
        return () => {
            window.removeEventListener("storage", syncUser);
            router.events?.off("routeChangeComplete", syncUser);
        };
    }, [router]);

    const navLinks = [
        { name: "Home", href: "/", icon: Home },
        { name: "Rides", href: "/rides", icon: Waves },
        { name: "Tickets", href: "/book", icon: Ticket },
        { name: "Map", href: "/map", icon: Map },
        { name: "Emergency", href: "/emergency", icon: Phone },
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm font-fun">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative w-10 h-10 bg-sky-blue rounded-full flex items-center justify-center text-white water-splash group-hover:animate-bounce-slow">
                                <Waves size={24} />
                            </div>
                            <span className="text-2xl font-bold text-sky-blue">
                                Sunny<span className="text-sunny-yellow">Splash</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center gap-1.5 text-gray-700 hover:text-sky-blue font-medium text-lg transition-colors group"
                                >
                                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                                    {link.name}
                                </Link>
                            );
                        })}
                        <Link
                            href="/book"
                            className="bg-coral-orange hover:bg-orange-500 text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Book Now
                        </Link>
                        {/* Auth Button */}
                        {loggedInUser ? (
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 bg-sky-blue/10 hover:bg-sky-blue text-sky-blue hover:text-white px-4 py-2.5 rounded-full font-bold transition-all border-2 border-sky-blue/30 hover:border-sky-blue"
                            >
                                <User size={18} />
                                <span className="max-w-[90px] truncate">{loggedInUser.name.split(" ")[0]}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 bg-white border-2 border-sky-blue text-sky-blue hover:bg-sky-blue hover:text-white px-4 py-2.5 rounded-full font-bold transition-all"
                            >
                                <LogIn size={18} />
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-sky-blue focus:outline-none p-2"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 text-gray-700 hover:text-sky-blue hover:bg-sky-50 block px-3 py-3 rounded-xl font-medium text-lg transition-colors"
                                    >
                                        <Icon size={20} className="text-sky-blue" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                            <div className="pt-4 space-y-3">
                                <Link
                                    href="/book"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full flex justify-center items-center bg-coral-orange hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-colors"
                                >
                                    Book Tickets Now 🎟️
                                </Link>
                                {loggedInUser ? (
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full flex justify-center items-center gap-2 border-2 border-sky-blue text-sky-blue hover:bg-sky-blue hover:text-white px-6 py-3 rounded-xl font-bold transition-colors"
                                    >
                                        <User size={18} /> {loggedInUser.name.split(" ")[0]}'s Profile
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full flex justify-center items-center gap-2 border-2 border-sky-blue text-sky-blue hover:bg-sky-blue hover:text-white px-6 py-3 rounded-xl font-bold transition-colors"
                                    >
                                        <LogIn size={18} /> Login / Register
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
