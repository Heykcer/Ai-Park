import Head from "next/head";
import { useState } from "react";
import { motion } from "framer-motion";

const zones = [
    { id: "wave", name: "Wave Pool", emoji: "🌊", x: 20, y: 15, crowd: "high", desc: "Our giant wave pool – always a splash!" },
    { id: "coaster", name: "Coaster Zone", emoji: "🎢", x: 65, y: 12, crowd: "medium", desc: "Thrill rides & roller coasters" },
    { id: "kids", name: "Kids Kingdom", emoji: "👶", x: 15, y: 55, crowd: "low", desc: "Safe splash zone for little ones" },
    { id: "lazy", name: "Lazy River", emoji: "🛶", x: 55, y: 55, crowd: "low", desc: "A winding tropical float ride" },
    { id: "extreme", name: "Extreme Slides", emoji: "🌀", x: 40, y: 30, crowd: "high", desc: "AquaLoop & Tornado Twister" },
    { id: "food", name: "Food Court", emoji: "🍔", x: 75, y: 55, crowd: "medium", desc: "Burgers, ice cream & more" },
    { id: "toilet1", name: "Restrooms A", emoji: "🚻", x: 10, y: 35, crowd: null, desc: "Public restrooms – Block A" },
    { id: "toilet2", name: "Restrooms B", emoji: "🚻", x: 85, y: 30, crowd: null, desc: "Public restrooms – Block B" },
    { id: "emergency", name: "Medical Post", emoji: "🏥", x: 50, y: 80, crowd: null, desc: "First aid & emergency medical post" },
    { id: "entrance", name: "Main Entrance", emoji: "🚪", x: 47, y: 95, crowd: null, desc: "Park entrance & ticket gates" },
];

const crowdConfig = {
    low: { color: "bg-fresh-green", label: "Low Crowd", ring: "ring-fresh-green" },
    medium: { color: "bg-sunny-yellow", label: "Moderate", ring: "ring-sunny-yellow" },
    high: { color: "bg-coral-orange", label: "Busy!", ring: "ring-coral-orange" },
};

export default function ParkMap() {
    const [selected, setSelected] = useState(null);

    return (
        <>
            <Head>
                <title>Park Map | SunnySplash</title>
                <meta name="description" content="Interactive illustrated map of SunnySplash Water Park." />
            </Head>

            {/* Hero */}
            <section className="bg-sky-gradient py-14 text-center relative overflow-hidden">
                <div className="absolute top-4 left-8 text-white/20 text-7xl select-none">🗺️</div>
                <div className="absolute bottom-4 right-8 text-white/20 text-7xl select-none">🌴</div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-5xl font-extrabold text-white font-fun drop-shadow-lg mb-3">
                        Park Map 🗺️
                    </h1>
                    <p className="text-white/90 text-xl">Click a zone to explore. Live crowd levels updated in real time.</p>
                </motion.div>
            </section>

            <section className="py-12 bg-soft-white min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 justify-center mb-8">
                        {Object.entries(crowdConfig).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full soft-shadow">
                                <span className={`w-3 h-3 rounded-full ${val.color}`}></span>
                                <span className="text-sm font-semibold text-gray-700">{val.label}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full soft-shadow">
                            <span className="text-sm">🚻 = Restrooms</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full soft-shadow">
                            <span className="text-sm">🏥 = Medical</span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Map */}
                        <div className="flex-1">
                            <div
                                className="relative w-full rounded-[2rem] overflow-hidden soft-shadow"
                                style={{
                                    paddingTop: "70%",
                                    background:
                                        "radial-gradient(ellipse at 30% 30%, #b3e5fc 0%, #e0f7fa 50%, #c8e6c9 100%)",
                                }}
                            >
                                {/* Decorative background elements */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    <div className="absolute top-[10%] left-[20%] w-48 h-24 bg-sky-blue rounded-full opacity-40"></div>
                                    <div className="absolute top-[50%] left-[10%] w-32 h-48 bg-aqua rounded-full opacity-30"></div>
                                    <div className="absolute top-[40%] left-[50%] w-56 h-20 bg-sky-blue rounded-full opacity-30"></div>
                                    <div className="absolute bottom-[10%] right-[10%] w-40 h-32 bg-aqua rounded-full opacity-30"></div>
                                </div>

                                {/* Park boundary */}
                                <div className="absolute inset-4 border-4 border-dashed border-white/60 rounded-3xl pointer-events-none"></div>

                                {/* Zone Markers */}
                                {zones.map((zone) => {
                                    const crowd = zone.crowd ? crowdConfig[zone.crowd] : null;
                                    const isSelected = selected?.id === zone.id;
                                    return (
                                        <motion.button
                                            key={zone.id}
                                            onClick={() => setSelected(zone)}
                                            whileHover={{ scale: 1.15 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`absolute flex flex-col items-center cursor-pointer group -translate-x-1/2 -translate-y-1/2`}
                                            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                                        >
                                            <div
                                                className={`bg-white rounded-2xl shadow-lg px-2.5 py-2 flex flex-col items-center transition-all duration-200 ${isSelected ? "ring-4 ring-offset-2 ring-sky-blue scale-110" : "hover:shadow-xl"
                                                    }`}
                                            >
                                                <span className="text-2xl">{zone.emoji}</span>
                                                {crowd && (
                                                    <span className={`w-2.5 h-2.5 rounded-full mt-1 ${crowd.color} animate-pulse`}></span>
                                                )}
                                            </div>
                                            <span className="mt-1 text-[10px] font-bold text-gray-700 bg-white/80 rounded-full px-1.5 whitespace-nowrap shadow-sm hidden group-hover:block">
                                                {zone.name}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info Panel */}
                        <div className="lg:w-72">
                            <div className="bg-white rounded-[1.75rem] soft-shadow p-6 h-full">
                                {selected ? (
                                    <motion.div
                                        key={selected.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <div className="text-6xl mb-4 text-center">{selected.emoji}</div>
                                        <h2 className="text-2xl font-extrabold font-fun text-gray-800 mb-2 text-center">{selected.name}</h2>
                                        <p className="text-gray-500 text-center mb-4">{selected.desc}</p>
                                        {selected.crowd && (
                                            <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-full ${selected.crowd === "low" ? "bg-fresh-green/20 text-fresh-green" :
                                                selected.crowd === "medium" ? "bg-yellow-100 text-amber-600" :
                                                    "bg-orange-100 text-coral-orange"
                                                } font-bold`}>
                                                <span className={`w-3 h-3 rounded-full ${crowdConfig[selected.crowd].color}`}></span>
                                                {crowdConfig[selected.crowd].label}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                        <div className="text-6xl mb-4">👆</div>
                                        <p className="text-gray-400 font-medium">Tap any zone on the map to see details and live crowd info</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
