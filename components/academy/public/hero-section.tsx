"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <section className="relative bg-[#0a0a0a] text-white pt-32 pb-20 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
                >
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium text-gray-300">New Cohorts Drafting for March</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                >
                    Build Skills. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Earn Faster.</span><br />
                    Skip the Traditional Path.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    A modern trade school for the digital economy. We don't just teach theory.
                    We build your portfolio, reputation, and income streams.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="#courses" className="px-8 py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-100 transition transform hover:-translate-y-1 flex items-center">
                        Explore Programs <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                    <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-semibold text-lg rounded-lg hover:bg-white/10 transition flex items-center group">
                        <PlayCircle className="w-5 h-5 mr-2 text-gray-400 group-hover:text-white transition" />
                        See Student Outcomes
                    </button>
                </motion.div>

                {/* Social Proof / Companies */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-20 border-t border-white/5 pt-10"
                >
                    <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest font-semibold">Alumni hired by modern teams</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {['Google', 'Spotify', 'Shopify', 'Airbnb', 'Stripe'].map(brand => (
                            <span key={brand} className="text-xl font-bold text-white">{brand}</span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
