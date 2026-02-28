import Head from "next/head";
import Link from "next/link";
import { PhoneCall, HeartPulse, Search, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const emergencyActions = [
    {
        id: "security",
        label: "Call Security",
        desc: "Reach our on-site security team immediately for any safety concern.",
        emoji: "🛡️",
        color: "bg-sky-blue",
        hoverColor: "hover:bg-aqua",
        icon: PhoneCall,
        phone: "+1 (800) 911-PARK",
    },
    {
        id: "medical",
        label: "Medical Assistance",
        desc: "Our first-aid team is standing by. Click to alert the medical post.",
        emoji: "🏥",
        color: "bg-fresh-green",
        hoverColor: "hover:bg-green-500",
        icon: HeartPulse,
        phone: "+1 (800) MED-HELP",
    },
    {
        id: "lost",
        label: "Report Lost Person",
        desc: "Missing a family member? File a report and our team will assist immediately.",
        emoji: "🔍",
        color: "bg-coral-orange",
        hoverColor: "hover:bg-orange-500",
        icon: Search,
        href: "/lost-person",
        phone: null,
    },
];

export default function Emergency() {
    return (
        <>
            <Head>
                <title>Emergency Help | SunnySplash</title>
                <meta name="description" content="Emergency services and help at SunnySplash Water Park." />
            </Head>

            {/* Alert Banner */}
            <section className="bg-red-50 border-b-4 border-red-200 py-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 bg-red-100 border-2 border-red-300 text-red-700 px-6 py-3 rounded-2xl font-bold text-lg mb-4"
                    >
                        <AlertTriangle size={28} className="animate-pulse" />
                        <span>Emergency &amp; Safety Center</span>
                        <AlertTriangle size={28} className="animate-pulse" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <h1 className="text-5xl font-extrabold text-gray-800 font-fun mb-4">
                            Need Help? 🆘
                        </h1>
                        <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                            Our park team is here for you 24/7. Choose the right option below and help will reach you within minutes.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-16 bg-soft-white min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Animated Lifebuoy */}
                    <div className="flex justify-center mb-10">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="text-8xl"
                        >
                            🚨
                        </motion.div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {emergencyActions.map((action, i) => {
                            const Icon = action.icon;
                            const CardContent = (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`${action.color} ${action.hoverColor} text-white p-8 rounded-[1.75rem] soft-shadow hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center text-center cursor-pointer`}
                                >
                                    <div className="text-5xl mb-4">{action.emoji}</div>
                                    <div className="bg-white/20 rounded-full p-3 mb-4">
                                        <Icon size={28} />
                                    </div>
                                    <h2 className="text-xl font-extrabold font-poppins mb-2">{action.label}</h2>
                                    <p className="text-white/85 text-sm mb-4">{action.desc}</p>
                                    {action.phone && (
                                        <span className="bg-white/20 font-bold px-4 py-1.5 rounded-full text-sm">
                                            📞 {action.phone}
                                        </span>
                                    )}
                                    {action.href && (
                                        <span className="bg-white/20 font-bold px-4 py-1.5 rounded-full text-sm">
                                            Click to file a report →
                                        </span>
                                    )}
                                </motion.div>
                            );

                            return action.href ? (
                                <Link key={action.id} href={action.href} className="block">
                                    {CardContent}
                                </Link>
                            ) : (
                                <a key={action.id} href={`tel:${action.phone?.replace(/[^0-9]/g, "")}`}>
                                    {CardContent}
                                </a>
                            );
                        })}
                    </div>

                    {/* Park Emergency Info */}
                    <div className="bg-white rounded-[1.75rem] soft-shadow p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-bold font-poppins text-gray-800 mb-4">📍 Medical Post Locations</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>🏥 Main Medical Post — Near Central Fountain</li>
                                <li>🩺 First Aid Booth A — Near Wave Pool</li>
                                <li>🩺 First Aid Booth B — Near Coaster Zone</li>
                                <li>💊 AED Stations at every major ride</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-poppins text-gray-800 mb-4">📋 Important Reminders</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>✅ Always supervise children near water</li>
                                <li>✅ Follow all ride height restrictions</li>
                                <li>✅ Lifeguards are on duty at all times</li>
                                <li>✅ In any emergency, shout "HELP!" loudly</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
