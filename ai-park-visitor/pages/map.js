import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamic import for Leaflet components to avoid SSR issues with 'window'
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const GEC_CENTER = [20.2367, 85.7250]; // Slightly adjusted center for better view

const zones = [
    { id: "academic", name: "Cyber Slide Coaster", actual: "Academic Block", emoji: "🎢", lat: 20.23688889044562, lng: 85.72458273942492, crowd: "high", desc: "A high-speed virtual coaster through the halls of knowledge!" },
    { id: "canteen", name: "Hunger Splash Pool", actual: "Main Canteen", emoji: "🏊", lat: 20.23602305042361, lng: 85.72407790202783, crowd: "high", desc: "Enjoy a snack while wading in our shallow dining pool." },
    { id: "nescafe", name: "Mocha Monsoon", actual: "Nescafe", emoji: "☕", lat: 20.2364426056992, lng: 85.72357751292019, crowd: "medium", desc: "A warm, misty retreat for coffee lovers." },
    { id: "gym", name: "Turbo Torrent", actual: "Gym", emoji: "🌊", lat: 20.23583314455346, lng: 85.7257183718993, crowd: "low", desc: "Test your strength against the Turbo Torrent currents!" },
    { id: "basketball", name: "Aquadunk Arena", actual: "Basketball Court", emoji: "🏀", lat: 20.2358918875218, lng: 85.72539244568205, crowd: "medium", desc: "Slam dunk into the water in this unique aquatic court." },
    { id: "shakuntala", name: "Lagoon Lodge S", actual: "Shakuntala Devi Hostel", emoji: "🏨", lat: 20.235960996867888, lng: 85.7248473939289, crowd: "medium", desc: "Peaceful lakeside accommodation for students." },
    { id: "visvesaraya", name: "Lagoon Lodge V", actual: "Visvesaraya Hostel", emoji: "🏨", lat: 20.237394055813773, lng: 85.72392263159026, crowd: "medium", desc: "Wakened by the sound of the northern waterfalls." },
    { id: "sarabhai", name: "Lagoon Lodge B", actual: "Sarabhai Hostel", emoji: "🏨", lat: 20.237431909432193, lng: 85.72421656769006, crowd: "medium", desc: "The ultimate park-side living experience." },
    { id: "ramanujan", name: "Lagoon Lodge R", actual: "Ramanujan Hostel", emoji: "🏨", lat: 20.2364426056992, lng: 85.72335925809662, crowd: "medium", desc: "A quiet cove for calculating the trajectory of your next slide." },
    { id: "aryabhatta", name: "Lagoon Lodge A", actual: "AryaBhatta Hostel", emoji: "🏨", lat: 20.23609297638153, lng: 85.72331134850123, crowd: "medium", desc: "Zero in on relaxation at this classic lodge." },
    { id: "lawn1", name: "Thunder Wave Pool", actual: "Main Lawn", emoji: "🌊", lat: 20.236736939047887, lng: 85.72535705477475, crowd: "high", desc: "Our massive GEC wave pool — experience the thunder!" },
    { id: "lawn2", name: "Kiddy Splash Pad", actual: "Lawn 2", emoji: "⛲", lat: 20.23633806592702, lng: 85.72480794880123, crowd: "low", desc: "Safe and shallow fun for the youngest explorers." },
    { id: "lawn3", name: "Serpentine Slide", actual: "Lawn 3", emoji: "🐍", lat: 20.236917381315795, lng: 85.72394000708724, crowd: "medium", desc: "Twist and turn through the greenery on this giant slide." },
    { id: "gate1", name: "Splash Entry", actual: "Main Gate", emoji: "🚪", lat: 20.237488880104635, lng: 85.72538692914497, crowd: "medium", desc: "Scan your ticket and dive into the adventure!" },
    { id: "gate2", name: "VIP Portal", actual: "Gate 2", emoji: "🚪", lat: 20.236095760004375, lng: 85.7261787196638, crowd: "low", desc: "Quick access to the Turbo Torrent and Gym." },
];

const crowdConfig = {
    low: { color: "bg-fresh-green", label: "Low Crowd", ring: "ring-fresh-green" },
    medium: { color: "bg-sunny-yellow", label: "Moderate", ring: "ring-sunny-yellow" },
    high: { color: "bg-coral-orange", label: "Busy!", ring: "ring-coral-orange" },
};

export default function ParkMap() {
    const [selected, setSelected] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [L, setL] = useState(null);

    useEffect(() => {
        setMounted(true);
        // Load leaflet to create custom icons
        import("leaflet").then((leaflet) => {
            setL(leaflet.default);
        });
    }, []);

    // Create custom icons once Leaflet is loaded
    const customIcon = (emoji) => {
        if (!L) return null;
        return L.divIcon({
            className: "custom-div-icon",
            html: `<div class="bg-white rounded-2xl shadow-lg p-2.5 flex items-center justify-center text-2xl border-2 border-white hover:scale-110 transition-transform duration-200">${emoji}</div>`,
            iconSize: [45, 45],
            iconAnchor: [22, 22],
        });
    };

    if (!mounted) return null;

    return (
        <>
            <Head>
                <title>Park Map | SunnySplash at GEC</title>
                <meta name="description" content="Explore Gandhi Engineering College transformed into SunnySplash Water Park." />
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            </Head>

            {/* Hero */}
            <section className="bg-sky-gradient py-14 text-center relative overflow-hidden">
                <div className="absolute top-4 left-8 text-white/20 text-7xl select-none">🗺️</div>
                <div className="absolute bottom-4 right-8 text-white/20 text-7xl select-none">🏫</div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-5xl font-extrabold text-white font-fun drop-shadow-lg mb-3">
                        GEC Adventure Map 🗺️
                    </h1>
                    <p className="text-white/90 text-xl">Gandhi Engineering College, Bhubaneswar — Styled for Endless Fun!</p>
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
                            <span className="text-sm font-bold text-sky-blue">@ GEC Bhubaneswar</span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Map Container */}
                        <div className="flex-1 min-h-[500px] lg:h-[600px] relative rounded-[2rem] overflow-hidden soft-shadow border-8 border-white">
                            {mounted && L && (
                                <MapContainer
                                    center={GEC_CENTER}
                                    zoom={17}
                                    style={{ height: "100%", width: "100%" }}
                                    className="z-10"
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />
                                    {zones.map((zone) => (
                                        <Marker
                                            key={zone.id}
                                            position={[zone.lat, zone.lng]}
                                            icon={customIcon(zone.emoji)}
                                            eventHandlers={{
                                                click: () => setSelected(zone),
                                            }}
                                        >
                                            <Popup className="custom-popup">
                                                <div className="font-fun text-center py-1">
                                                    <p className="font-black text-gray-800 text-lg uppercase leading-none">{zone.name}</p>
                                                    <p className="text-xs text-sky-blue font-bold tracking-widest">{zone.actual}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            )}

                            {/* Stylized Overlay Filter */}
                            <div className="absolute inset-0 pointer-events-none z-20 border-[20px] border-white/40 mix-blend-overlay"></div>
                        </div>

                        {/* Info Panel */}
                        <div className="lg:w-[350px]">
                            <div className="bg-white rounded-[2rem] soft-shadow p-8 h-full relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-blue/5 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-aqua/5 rounded-full blur-2xl"></div>

                                <AnimatePresence mode="wait">
                                    {selected ? (
                                        <motion.div
                                            key={selected.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="relative z-10"
                                        >
                                            <div className="w-24 h-24 bg-sky-gradient rounded-3xl flex items-center justify-center text-6xl mx-auto mb-6 shadow-xl">
                                                {selected.emoji}
                                            </div>
                                            <div className="text-center mb-6">
                                                <h2 className="text-3xl font-black font-fun text-gray-900 mb-1 leading-tight">{selected.name}</h2>
                                                <p className="text-sky-blue font-black text-xs uppercase tracking-[0.2em]">{selected.actual}</p>
                                            </div>

                                            <p className="text-gray-500 text-center mb-8 leading-relaxed font-medium">
                                                {selected.desc}
                                            </p>

                                            {selected.crowd && (
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-xs font-black uppercase text-gray-400 px-2">
                                                        <span>Live Activity</span>
                                                        <span className={selected.crowd === "high" ? "text-coral-orange" : "text-gray-800"}>
                                                            {crowdConfig[selected.crowd].label}
                                                        </span>
                                                    </div>
                                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${crowdConfig[selected.crowd].color} transition-all duration-1000`}
                                                            style={{ width: selected.crowd === "high" ? "85%" : selected.crowd === "medium" ? "45%" : "15%" }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            <button className="w-full mt-10 bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all transform hover:-translate-y-1 shadow-2xl">
                                                Get Directions
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-12 relative z-10">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-30">
                                                📍
                                            </div>
                                            <p className="text-gray-400 font-bold text-sm leading-relaxed px-4">
                                                Select a <span className="text-sky-blue">SunnySplash Attraction</span> on the campus map to view its details and activity level.
                                            </p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
