import Head from "next/head";
import Link from "next/link";
import { Ticket, Map, PhoneCall, Sun, Cloud, Droplets, ArrowRight } from "lucide-react";
import WaveDivider from "../components/WaveDivider";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <Head>
        <title>SunnySplash Water Park | Endless Fun!</title>
        <meta name="description" content="The ultimate water park adventure for the whole family!" />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        {/* Background Image with Parallax-like effect */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.png"
            alt="Water Park Background"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-blue/60 via-aqua/40 to-soft-white z-10"></div>
          <div className="absolute inset-0 backdrop-blur-[2px] z-20"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 text-white/40 animate-bounce-slow z-30">
          <Cloud size={80} />
        </div>
        <div className="absolute top-24 right-20 text-white/40 animate-bounce-slow z-30" style={{ animationDelay: "1s" }}>
          <Cloud size={100} />
        </div>
        <div className="absolute top-8 right-1/4 text-sunny-yellow animate-float z-30 drop-shadow-2xl">
          <Sun size={120} fill="#FFD54F" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-40 text-center flex flex-col items-center">

          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="perspective-1000"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-white font-bold mb-6 text-sm border border-white/20">
              <span className="text-xl">🎢</span>
              New Summer Rides Are Open!
            </div>

            <h1 className="text-5xl md:text-8xl font-extrabold text-white font-fun text-shadow-lg mb-6 leading-tight">
              Dive Into The <br />
              <span className="text-sunny-yellow underline decoration-wavy decoration-white transition-all hover:text-white hover:decoration-sunny-yellow">Ultimate Fun!</span>
            </h1>

            <p className="text-xl md:text-2xl text-white font-medium max-w-2xl mx-auto mb-10 font-nunito drop-shadow-xl bg-black/10 backdrop-blur-sm p-4 rounded-2xl">
              Experience the biggest waves, the fastest slides, and the sunniest smiles. Perfect for families, thrill-seekers, and everyone in between! 👨‍👩‍👧‍👦☀️🌊
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto"
            initial={{ opacity: 0, scale: 0.8, translateZ: -100 }}
            animate={{ opacity: 1, scale: 1, translateZ: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
          >
            <Link
              href="/book"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-sunny-yellow hover:bg-yellow-400 text-gray-900 px-10 py-5 rounded-full font-bold text-xl shadow-[0_10px_20px_rgba(255,213,79,0.3)] hover:shadow-[0_15px_30px_rgba(255,213,79,0.5)] transition-all transform hover:-translate-y-2 hover:scale-105"
            >
              <Ticket className="group-hover:rotate-12 transition-transform" />
              Book Tickets
            </Link>

            <Link
              href="/map"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-white hover:bg-gray-50 text-sky-blue px-10 py-5 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-105"
            >
              <Map className="group-hover:scale-110 transition-transform" />
              Explore Park
            </Link>
          </motion.div>

        </div>
      </section>

      {/* The wavy divider separating Hero from next section */}
      <div className="-mt-1 relative z-20">
        <WaveDivider color="#fdfefe" />
      </div>

      {/* Features Preview Section */}
      <section className="py-24 bg-soft-white perspective-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-bold font-fun text-sky-blue mb-6"
            >
              Why Choose SunnySplash?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Discover a world of aquatic adventures designed to create unforgettable memories for every age!
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative h-[450px] overflow-hidden rounded-[3rem] shadow-2xl card-3d-hover"
            >
              <img src="/images/slide-card.png" alt="Crazy Slides" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-blue via-sky-blue/20 to-transparent z-10 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30 group-hover:bg-white group-hover:text-sky-blue transition-all duration-300">
                  <Droplets size={32} />
                </div>
                <h3 className="text-3xl font-bold font-poppins mb-3">50+ Crazy Slides</h3>
                <p className="text-white/80 mb-6 font-medium">From high-speed drops to relaxing lazy rivers, we have attractions for every thrill level.</p>
                <Link href="/rides" className="bg-sunny-yellow text-gray-900 px-6 py-2 rounded-full font-bold inline-flex items-center gap-1 hover:bg-white transition-colors">
                  Explore <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative h-[450px] overflow-hidden rounded-[3rem] shadow-2xl card-3d-hover"
            >
              <img src="/images/weather-card.png" alt="Sunny Weather" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-aqua via-aqua/20 to-transparent z-10 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30 group-hover:bg-white group-hover:text-aqua transition-all duration-300">
                  <Sun size={32} />
                </div>
                <h3 className="text-3xl font-bold font-poppins mb-3">Sunny Weather</h3>
                <p className="text-white/80 mb-6 font-medium">Located in the sunniest spot, guaranteeing perfect park days nearly all year round.</p>
                <Link href="/map" className="bg-sunny-yellow text-gray-900 px-6 py-2 rounded-full font-bold inline-flex items-center gap-1 hover:bg-white transition-colors">
                  View Map <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group relative h-[450px] overflow-hidden rounded-[3rem] shadow-2xl card-3d-hover"
            >
              <img src="/images/family-card.png" alt="Family Passes" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-coral-orange via-coral-orange/20 to-transparent z-10 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30 group-hover:bg-white group-hover:text-coral-orange transition-all duration-300">
                  <Ticket size={32} />
                </div>
                <h3 className="text-3xl font-bold font-poppins mb-3">Family Passes</h3>
                <p className="text-white/80 mb-6 font-medium">Great discounts for families and large groups. The more, the merrier!</p>
                <Link href="/book" className="bg-sunny-yellow text-gray-900 px-6 py-2 rounded-full font-bold inline-flex items-center gap-1 hover:bg-white transition-colors">
                  Pricing <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom wave */}
      <div className="rotate-180 bg-soft-white">
        <WaveDivider color="#ffffff" />
      </div>
    </>
  );
}

