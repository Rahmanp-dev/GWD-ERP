"use client";

import { motion } from "framer-motion";

export default function StatsBar({ stats }: { stats: any }) {
    const list = [
        { label: "Students Trained", value: stats.students || "2,400+", suffix: "" },
        { label: "Alumni Earnings", value: "8.5", suffix: "M+" }, // Mocked or Calculated
        { label: "Hiring Partners", value: stats.hiringPartners || "150", suffix: "+" },
        { label: "Active Freelancers", value: stats.activeFreelancers || "850", suffix: "+" },
    ];

    return (
        <div className="bg-[#0a0a0a] border-y border-white/10 relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {list.map((item, idx) => (
                        <div key={idx} className="text-center group">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-extrabold text-white mb-1 group-hover:text-blue-400 transition"
                            >
                                {item.value === 0 ? "100+" : item.value}<span className="text-gray-500 text-2xl">{item.suffix}</span>
                            </motion.div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
