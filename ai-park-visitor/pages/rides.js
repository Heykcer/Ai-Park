import Head from "next/head";
import { useState } from "react";
import { Clock, Ruler, Flame, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";

const rides = [
    {
        id: 1,
        name: "Tsunami Blaster",
        emoji: "🌊",
        category: "Water Ride",
        thrill: "High",
        height: "120 cm+",
        wait: "25 min",
        description: "Brace yourself for the ultimate wave machine that will drench you to the bone!",
        color: "bg-sky-blue",
        badge: "Most Popular",
    },
    {
        id: 2,
        name: "Sky Coaster 360",
        emoji: "🎢",
        category: "Roller Coaster",
        thrill: "High",
        height: "140 cm+",
        wait: "40 min",
        description: "The park's most thrilling loop-the-loop coaster — not for the faint-hearted!",
        color: "bg-coral-orange",
        badge: "Thrill Seeker",
    },
    {
        id: 3,
        name: "Lazy River Cruise",
        emoji: "🛶",
        category: "Water Ride",
        thrill: "Low",
        height: "Any height",
        wait: "5 min",
        description: "Float gently along our winding tropical river. Perfect for all ages!",
        color: "bg-fresh-green",
        badge: null,
    },
    {
        id: 4,
        name: "Kiddie Splash Zone",
        emoji: "👶",
        category: "Kids Ride",
        thrill: "Low",
        height: "Under 120 cm",
        wait: "10 min",
        description: "A safe, colorful splash zone packed with fountains and mini slides for the little ones.",
        color: "bg-sunny-yellow",
        badge: "Family Favorite",
    },
    {
        id: 5,
        name: "AquaLoop Extreme",
        emoji: "🌀",
        category: "Water Ride",
        thrill: "High",
        height: "130 cm+",
        wait: "35 min",
        description: "Drop through a near-vertical tube in a sealed pipe for total darkness and weightlessness.",
        color: "bg-aqua",
        badge: "New!",
    },
    {
        id: 6,
        name: "Surfboard Simulator",
        emoji: "🏄",
        category: "Water Ride",
        thrill: "Medium",
        height: "110 cm+",
        wait: "20 min",
        description: "Practice your surf moves on our state-of-the-art indoor wave simulator.",
        color: "bg-sky-blue",
        badge: null,
    },
    {
        id: 7,
        name: "Thunder Falls",
        emoji: "⛰️",
        category: "Roller Coaster",
        thrill: "Medium",
        height: "120 cm+",
        wait: "30 min",
        description: "A white-knuckle mine-cart adventure that launches you over a 20-foot waterfall plunge!",
        color: "bg-coral-orange",
        badge: null,
    },
    {
        id: 8,
        name: "Mini Bumper Boats",
        emoji: "⛵",
        category: "Kids Ride",
        thrill: "Low",
        height: "Under 130 cm",
        wait: "15 min",
        description: "Bump and splash in our colorful fleet of mini boats — endless giggles guaranteed!",
        color: "bg-fresh-green",
        badge: null,
    },
    {
        id: 9,
        name: "Tornado Twister",
        emoji: "🌪️",
        category: "Water Ride",
        thrill: "High",
        height: "125 cm+",
        wait: "45 min",
        description: "Spin through a giant funnel at high speed on a family raft — hold on tight!",
        color: "bg-aqua",
        badge: "Staff Pick",
    },
];

const thrillColors = {
    Low: "bg-fresh-green/20 text-fresh-green",
    Medium: "bg-sunny-yellow/30 text-amber-600",
    High: "bg-coral-orange/20 text-coral-orange",
};

const categoryFilters = ["All", "Water Ride", "Roller Coaster", "Kids Ride"];

export default function Rides() {
    const [plan, setPlan] = useState([]);
    const [activeFilter, setActiveFilter] = useState("All");

    const togglePlan = (id) => {
        setPlan((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    const filtered =
        activeFilter === "All" ? rides : rides.filter((r) => r.category === activeFilter);

    return (
        <>
            <Head>
                <title>Rides & Attractions | SunnySplash</title>
                <meta name="description" content="Explore all rides and attractions at SunnySplash Water Park." />
            </Head>

            {/* Hero Banner */}
            <section className="bg-sky-gradient py-16 text-center relative overflow-hidden">
                <div className="absolute top-4 left-8 text-white/20 text-8xl select-none">🎢</div>
                <div className="absolute bottom-4 right-8 text-white/20 text-8xl select-none">🌊</div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl font-extrabold text-white font-fun drop-shadow-lg mb-4">
                        Rides & Attractions 🎢
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                        From heart-pounding coasters to lazy river floats — find your perfect adventure!
                    </p>
                </motion.div>
            </section>

            <section className="py-12 bg-soft-white min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-3 justify-center mb-10">
                        {categoryFilters.map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border-2 ${activeFilter === f
                                    ? "bg-sky-blue border-sky-blue text-white shadow-md scale-105"
                                    : "bg-white border-sky-100 text-gray-600 hover:border-sky-blue hover:text-sky-blue"
                                    }`}
                            >
                                {f === "Water Ride" && "🌊 "}
                                {f === "Roller Coaster" && "🎢 "}
                                {f === "Kids Ride" && "👶 "}
                                {f}
                            </button>
                        ))}
                        {plan.length > 0 && (
                            <div className="ml-4 flex items-center gap-2 bg-coral-orange/10 border-2 border-coral-orange/30 text-coral-orange px-5 py-2 rounded-full font-bold text-sm">
                                📋 My Plan: {plan.length} ride{plan.length !== 1 ? "s" : ""}
                            </div>
                        )}
                    </div>

                    {/* Rides Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((ride, i) => {
                            const inPlan = plan.includes(ride.id);
                            return (
                                <motion.div
                                    key={ride.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                    className="bg-white rounded-[1.75rem] soft-shadow hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                                >
                                    {/* Colorful Top Banner */}
                                    <div
                                        className={`${ride.color} h-32 flex items-center justify-center text-6xl relative`}
                                    >
                                        {ride.badge && (
                                            <span className="absolute top-3 right-3 bg-white/90 text-gray-800 px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                                {ride.badge}
                                            </span>
                                        )}
                                        <span className="group-hover:scale-125 transition-transform duration-300 select-none">
                                            {ride.emoji}
                                        </span>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        {/* Category Tag */}
                                        <span className="text-xs font-bold uppercase tracking-wider text-coral-orange mb-2">
                                            {ride.category}
                                        </span>

                                        <h2 className="text-xl font-extrabold font-poppins text-gray-800 mb-2">{ride.name}</h2>
                                        <p className="text-gray-500 text-sm mb-5 flex-grow">{ride.description}</p>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-3 mb-5">
                                            <div className="text-center bg-gray-50 rounded-xl p-2.5">
                                                <Flame size={16} className="mx-auto mb-1 text-coral-orange" />
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${thrillColors[ride.thrill]}`}>
                                                    {ride.thrill}
                                                </span>
                                                <p className="text-gray-400 text-[10px] mt-1">Thrill</p>
                                            </div>
                                            <div className="text-center bg-gray-50 rounded-xl p-2.5">
                                                <Ruler size={16} className="mx-auto mb-1 text-sky-blue" />
                                                <p className="text-xs font-bold text-gray-700">{ride.height}</p>
                                                <p className="text-gray-400 text-[10px] mt-1">Height</p>
                                            </div>
                                            <div className="text-center bg-gray-50 rounded-xl p-2.5">
                                                <Clock size={16} className="mx-auto mb-1 text-fresh-green" />
                                                <p className="text-xs font-bold text-gray-700">{ride.wait}</p>
                                                <p className="text-gray-400 text-[10px] mt-1">Wait</p>
                                            </div>
                                        </div>

                                        {/* Add to Plan */}
                                        <button
                                            onClick={() => togglePlan(ride.id)}
                                            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${inPlan
                                                ? "bg-fresh-green text-white shadow-md"
                                                : "bg-sky-blue/10 text-sky-blue hover:bg-sky-blue hover:text-white"
                                                }`}
                                        >
                                            {inPlan ? (
                                                <><Check size={16} /> Added to Plan!</>
                                            ) : (
                                                <><Plus size={16} /> Add to Plan</>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
}
