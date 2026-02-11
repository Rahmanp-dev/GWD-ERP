"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function CanvasNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">G</div>
                    <span className="text-white font-bold text-xl tracking-tight">GWD<span className="text-gray-400">Academy</span></span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex space-x-8">
                    <Link href="#courses" className="text-gray-300 hover:text-white text-sm font-medium transition hover:text-blue-400">Programs</Link>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm font-medium transition hover:text-blue-400">Outcomes</Link>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm font-medium transition hover:text-blue-400">Events</Link>
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link href="/login" className="text-white hover:text-gray-200 text-sm font-medium">Student Login</Link>
                    <Link href="#courses" className="px-5 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
                        Start Learning
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-b border-white/10 p-4 space-y-4">
                    <Link href="#courses" className="block text-gray-300 hover:text-white text-sm font-bold">Programs</Link>
                    <Link href="#" className="block text-gray-300 hover:text-white text-sm font-bold">Outcomes</Link>
                    <Link href="/login" className="block text-gray-300 hover:text-white text-sm font-bold">Student Login</Link>
                    <Link href="#courses" className="block w-full text-center px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                        Start Learning
                    </Link>
                </div>
            )}
        </nav>
    );
}
