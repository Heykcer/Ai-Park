import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Send } from "lucide-react";
import WaveDivider from "./WaveDivider";

export default function Footer() {
    return (
        <footer className="relative bg-gray-950 pt-24 pb-12 mt-auto overflow-hidden">
            {/* Wave Divider at the top of footer */}
            <div className="absolute top-0 left-0 right-0 transform rotate-180 -translate-y-[99%] z-10">
                <WaveDivider color="#030712" />
            </div>

            {/* Background Decorative Blur Orbs */}
            <div className="absolute top-20 -left-40 w-[40rem] h-[40rem] bg-sky-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] -right-40 w-[30rem] h-[30rem] bg-aqua/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-12">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block group">
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="text-4xl font-black font-fun text-white tracking-tighter block"
                            >
                                Sunny<span className="text-sky-blue">Splash</span>
                            </motion.span>
                        </Link>
                        <p className="text-white/40 leading-relaxed font-medium text-lg">
                            Diving into the future of entertainment. Experience the most advanced water park on the planet, powered by AI and pure imagination. 🌊✨
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { icon: Facebook, color: "hover:bg-blue-600" },
                                { icon: Instagram, color: "hover:bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" },
                                { icon: Twitter, color: "hover:bg-sky-400" }
                            ].map((social, idx) => (
                                <motion.a
                                    key={idx}
                                    href="#"
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 ${social.color} hover:text-white transition-all shadow-xl`}
                                >
                                    <social.icon size={20} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div>
                        <h3 className="text-xs font-black text-sky-blue uppercase tracking-[0.3em] mb-6">Quick Explore</h3>
                        <ul className="space-y-3">
                            {[
                                { label: "Rides & Attractions", href: "/rides" },
                                { label: "Booking Center", href: "/book" },
                                { label: "Interactive 3D Map", href: "/map" },
                                { label: "Safety & Emergency", href: "/emergency" },
                                { label: "Membership Club", href: "/login" }
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-white/50 hover:text-white font-bold transition-all flex items-center gap-3 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-sky-blue group-hover:scale-150 transition-all"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Support */}
                    <div>
                        <h3 className="text-xs font-black text-sky-blue uppercase tracking-[0.3em] mb-6">Get In Touch</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sky-blue shrink-0">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-sm mb-1 uppercase tracking-widest">Main Gate</h4>
                                    <p className="text-white/40 text-sm font-medium">Gandhi Engineering College , Bhubaneswar-752054</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-coral-orange shrink-0 text-orange-400">
                                    <Phone size={22} />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-sm mb-1 uppercase tracking-widest">Help Desk</h4>
                                    <p className="text-white/40 text-sm font-black">+91 (1800) SPLASH-FUN</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Premium Newsletter */}
                    <div>
                        <h3 className="text-xs font-black text-sky-blue uppercase tracking-[0.3em] mb-6">Newsletter</h3>
                        <p className="text-white/40 mb-6 font-medium text-sm">Join 50,000+ thrill seekers for exclusive early access and summer perks.</p>
                        <div className="bg-white/5 border border-white/10 p-2 rounded-2xl flex items-center group focus-within:border-sky-blue/50 transition-all">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-transparent flex-1 px-4 py-2 outline-none text-white font-bold text-sm placeholder:text-white/20"
                            />
                            <button className="bg-sky-blue hover:bg-aqua text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-sky-blue/20">
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="text-[10px] text-white/20 mt-4 px-2">By joining, you agree to our digital wave-agreement terms.</p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <p className="text-white/30 text-sm font-bold">
                            &copy; {new Date().getFullYear()} SunnySplash Global Assets.
                        </p>
                        <div className="flex gap-8 text-xs font-black text-white/20 uppercase tracking-[0.2em]">
                            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                            <Link href="#" className="hover:text-white transition-colors">Safety</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <div className="px-4 py-1 border border-white/20 rounded-md text-[10px] text-white font-black uppercase">PCI Secure</div>
                        <div className="px-4 py-1 border border-white/20 rounded-md text-[10px] text-white font-black uppercase">Premium SSL</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
