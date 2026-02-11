import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-50 z-0"></div>

      <div className="z-10 text-center max-w-2xl px-4">
        <div className="mb-8 flex justify-center">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
          GWD ERP
        </h1>

        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          The central nervous system for your enterprise. <br />
          Secure access for authorized personnel only.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="group px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
          >
            Access Portal
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 text-center text-gray-600 text-xs">
        &copy; {new Date().getFullYear()} GWD Labs. Restricted Area.
      </footer>
    </main>
  );
}
