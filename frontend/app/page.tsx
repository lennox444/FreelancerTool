'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Menu, X, Check, Clock, Users, Zap, Shield, Star, Search, Layout,
    BarChart3, FileText, CreditCard, Target, Send, Download, Briefcase,
    Wallet, PieChart, TrendingUp, TrendingDown, ShieldCheck, Calendar, ArrowRight,
    Fingerprint, Lock, ShieldAlert, BadgeEuro, Sparkles, ChevronRight
} from 'lucide-react';
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
    useMotionTemplate
} from 'framer-motion';
import PixelBlast from '@/components/landing/PixelBlast';

// --- ADVANCED COMPONENTS ---

const GlowCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-100, 100], [10, -10]), { stiffness: 100, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-10, 10]), { stiffness: 100, damping: 20 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = clientX - left - width / 2;
        const y = clientY - top - height / 2;
        mouseX.set(x);
        mouseY.set(y);
    }

    return (
        <motion.div
            onMouseMove={onMouseMove}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
            style={{ rotateX, rotateY, perspective: 1000 }}
            className={`group relative rounded-[2.5rem] md:rounded-[3rem] border border-slate-200/60 bg-white p-8 md:p-12 overflow-hidden shadow-sm transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1),0_0_20px_rgba(128,0,64,0.05)] hover:border-[#800040]/30 ${className}`}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition duration-500 group-hover:opacity-100 hidden md:block"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            500px circle at ${mouseX.get() + 200}px ${mouseY.get() + 200}px,
                            rgba(128, 0, 64, 0.08),
                            transparent 80%
                        )
                    `,
                }}
            />
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
};

const MagneticButton = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent) => {
        // Disable magnetic effect on small screens/touch
        if (window.innerWidth < 768) return;

        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const Reveal = ({ children, delay = 0, y = 15, x = 0, className = "" }: { children: React.ReactNode, delay?: number, y?: number, x?: number, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y, x }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

// --- MAIN LANDING PAGE ---

export default function LandingPage() {
    const router = useRouter();
    const [heroEmail, setHeroEmail] = useState('');

    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Parallax values
    const heroContentY = useTransform(smoothProgress, [0, 0.3], [0, 100]);
    const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.98]);

    const [isScrolled, setIsScrolled] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ clientX, clientY }: React.MouseEvent) {
        mouseX.set(clientX);
        mouseY.set(clientY);
    }

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            onMouseMove={handleMouseMove}
            className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#800040] selection:text-white overflow-x-hidden antialiased"
        >

            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[1200px] h-[1200px] bg-[#800040]/5 rounded-full blur-[200px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-blue-500/[0.03] rounded-full blur-[180px]" />
            </div>

            {/* --- NAVIGATION --- */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isScrolled ? 'py-4' : 'py-6 md:py-10'
                }`}>
                <div className="container mx-auto px-4 md:px-6">
                    <div className={`mx-auto max-w-7xl flex items-center justify-between px-6 md:px-10 py-3 rounded-full transition-all duration-700 ${isScrolled ? 'bg-white/90 backdrop-blur-2xl border border-slate-200/50 shadow-2xl' : 'bg-transparent'
                        }`}>
                        <Link href="/" className="group flex items-center gap-2">
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={130}
                                height={28}
                                className="h-6 md:h-7 w-auto transition-transform group-hover:scale-105"
                                priority
                            />
                        </Link>

                        <div className="hidden lg:flex items-center gap-10">
                            {['Funktionen', 'Steuern', 'Preise'].map((item) => (
                                <Link
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-[#800040] transition-colors"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 md:gap-8">
                            <Link href="/login" className="hidden sm:block text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 hover:text-slate-900 transition-colors">Login</Link>
                            <MagneticButton>
                                <Link href="/register">
                                    <button className="bg-[#800040] text-white text-[9px] md:text-[10px] font-black px-6 md:px-8 py-2.5 md:py-3 rounded-full shadow-wow hover:bg-black transition-all uppercase tracking-widest active:scale-95 leading-none">
                                        Gratis Starten
                                    </button>
                                </Link>
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 md:pt-40 md:pb-32 overflow-visible isolate">

                {/* --- ENHANCED PREMIUM BACKGROUND --- */}
                <div className="absolute inset-0 -z-10 bg-white overflow-hidden">
                    {/* Primary Pixel Engine */}
                    <div className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none">
                        <PixelBlast variant="square" pixelSize={6} color="#800040" patternScale={5} patternDensity={0.8} speed={0.3} transparent />
                    </div>

                    {/* Massive Floating Background Blobs */}
                    <motion.div
                        animate={{ x: [0, 40, -20, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.9, 1] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-pink-100/40 rounded-full blur-[160px]"
                    />
                    <motion.div
                        animate={{ x: [0, -30, 20, 0], y: [0, 50, -30, 0], scale: [1.1, 1, 1.15, 1.1] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-blue-100/30 rounded-full blur-[180px]"
                    />
                    <motion.div
                        animate={{ x: [-20, 30, -10], y: [40, -40, 40] }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-1/4 right-[20%] w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-[120px]"
                    />

                    {/* Dynamic Spotlight Follower */}
                    <motion.div
                        className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
                        style={{
                            background: useMotionTemplate`
                                radial-gradient(
                                    1200px circle at ${mouseX}px ${mouseY}px,
                                    rgba(128, 0, 64, 0.03),
                                    transparent 80%
                                )
                            `,
                        }}
                    />

                    {/* Premium Grain Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay pointer-events-none contrast-125 brightness-100" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                </div>

                <motion.div
                    style={{ y: heroContentY, opacity: heroOpacity, scale: heroScale }}
                    className="container mx-auto px-4 md:px-6 relative text-center"
                >
                    {/* Floating Visuals - Carefully hidden on mobile for clarity */}
                    <div className="absolute inset-0 pointer-events-none overflow-visible hidden xl:block">
                        {/* 3D Profit Card */}
                        <motion.div
                            animate={{ y: [0, -15, 0], rotateX: [10, 15, 10], rotateY: [-5, 5, -5] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[5%] left-[0%] p-6 rounded-[2.5rem] bg-white shadow-3xl border border-slate-100 backdrop-blur-md perspective-1000"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center"><TrendingUp size={20} /></div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Netto-Gewinn</p>
                                    <p className="text-xl font-black text-slate-950 mt-1">€8.420,00</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-32 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} transition={{ duration: 2, delay: 1 }} className="h-full bg-green-500 rounded-full" />
                            </div>
                        </motion.div>

                        {/* Person Stock Image 1 */}
                        <motion.div
                            animate={{ y: [0, 10, 0], rotate: [-2, 2, -2] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[15%] right-[-50px] z-10"
                        >
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300" className="w-48 h-64 object-cover rounded-[3rem] shadow-2xl border-4 border-white" alt="Freelancer Focus" />
                        </motion.div>

                        {/* Interactive Invoicing Card */}
                        <motion.div
                            animate={{ y: [0, 15, 0], rotateX: [-10, -5, -10], rotateY: [5, 15, 5] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-[10%] left-[2%] p-8 rounded-[3rem] bg-slate-950 text-white shadow-wow perspective-1000 text-left"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Check size={20} className="text-[#800040]" /></div>
                                <Sparkles className="text-white/20" size={16} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Rechnung bezahlt</p>
                            <p className="text-3xl font-black tracking-tighter">€4.250,00</p>
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800" />)}
                                </div>
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Stripe Live</span>
                            </div>
                        </motion.div>
                    </div>

                    <Reveal delay={0.1}>
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-slate-200 bg-white/60 text-[#800040] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm backdrop-blur-md cursor-default">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            Business Cockpit Deutschland
                        </div>
                    </Reveal>

                    <Reveal delay={0.2} y={20}>
                        <h1 className="text-[44px] sm:text-[60px] md:text-[120px] lg:text-[180px] font-extrabold tracking-[-0.09em] leading-[0.85] text-slate-950 mb-10 md:mb-14 py-2 flex flex-col items-center">
                            <span className="relative inline-block overflow-hidden pb-4">
                                {"Arbeite im".split("").map((char, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 + i * 0.03, ease: [0.33, 1, 0.68, 1] }}
                                        className="inline-block"
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </motion.span>
                                ))}
                            </span>
                            <span className="text-[#800040] italic relative">
                                {"Flow.".split("").map((char, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: "easeOut" }}
                                        className="inline-block"
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.2, delay: 1.5, ease: "easeInOut" }}
                                    className="absolute -bottom-2 left-0 h-1 md:h-2 bg-[#800040]/20 rounded-full"
                                />
                            </span>
                        </h1>
                    </Reveal>

                    <Reveal delay={0.4}>
                        <p className="text-lg md:text-3xl text-slate-600 font-bold max-w-3xl mx-auto mb-16 md:mb-24 leading-tight px-4 drop-shadow-sm">
                            Projekte & Rechnungen steuern. <br className="hidden sm:block" />
                            <span className="text-slate-950">Ohne Reibungsverluste. 100% für Freelancer.</span>
                        </p>
                    </Reveal>

                    <Reveal delay={0.5}>
                        <div className="flex flex-col sm:flex-row gap-5 items-center justify-center max-w-2xl mx-auto mb-20 md:mb-32 px-4 w-full">
                            <form
                                className="flex-1 w-full bg-white p-1.5 rounded-[2.2rem] shadow-2xl border border-slate-100 flex flex-col sm:flex-row items-center group transition-all focus-within:ring-4 focus-within:ring-[#800040]/5"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.push(`/register?email=${encodeURIComponent(heroEmail)}`);
                                }}
                            >
                                <input
                                    type="email"
                                    placeholder="Deine E-Mail Adresse"
                                    value={heroEmail}
                                    onChange={(e) => setHeroEmail(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 w-full px-8 py-4 text-base md:text-lg font-bold placeholder:text-slate-300 text-center sm:text-left"
                                />
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto whitespace-nowrap bg-slate-950 text-white px-10 py-4.5 rounded-[1.6rem] font-black text-[11px] uppercase shadow-xl hover:bg-[#800040] transition-all active:scale-95 tracking-widest"
                                >
                                    STARTEN
                                </button>
                            </form>
                        </div>
                    </Reveal>
                </motion.div>
            </section>

            {/* --- CORE FEATURES GRID --- */}
            <section id="funktionen" className="py-24 md:py-32 lg:py-44 relative bg-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20 mb-20 md:mb-32">
                        {/* Left – Text */}
                        <div className="flex-1 text-center md:text-left">
                            <Reveal x={-15}>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#800040] mb-8 md:mb-12">Die Infrastruktur</h2>
                                <p className="text-4xl sm:text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-[0.9] mb-10 md:mb-12">
                                    Alles synchron. <br /> Alles im Blick.
                                </p>
                                <p className="text-lg md:text-2xl text-slate-400 font-bold max-w-2xl">
                                    Keine Kompromisse bei der Verwaltung. Wir haben jedes Modul für die spezifischen Hürden deutscher Solo-Selbstständiger optimiert.
                                </p>
                            </Reveal>
                        </div>

                        {/* Right – Explainer Video */}
                        <div className="w-full max-w-[600px] lg:w-[600px] flex-shrink-0">
                            <motion.div
                                initial={{ opacity: 0, x: 60, scale: 0.94 }}
                                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                                className="relative"
                            >
                                {/* Glow halo */}
                                <motion.div
                                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.04, 1] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -inset-6 rounded-[3rem] bg-[#800040]/10 blur-3xl pointer-events-none"
                                />
                                {/* Subtle float */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative"
                                >
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full rounded-[2rem] shadow-[0_32px_80px_-8px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)] relative z-10"
                                        src="/FreelancerVideo.mp4"
                                    />
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[
                            { icon: Layout, title: "Dashboard", desc: "Zentraler Überblick über aktive Mandate, Budgets und Deadlines in Echtzeit.", delay: 0 },
                            { icon: FileText, title: "Rechnungen", desc: "Professionelle PDFs inkl. §19-Modus und automatisiertem Versand.", delay: 0.1 },
                            { icon: Search, title: "DATEV EXTF", desc: "Vollständiger Export für deinen Steuerberater. Kompatibel mit allen Kanzlei-Systemen.", delay: 0.2 },
                            { icon: PieChart, title: "Stundensatz", desc: "Berechnung deiner tatsächlichen Netto-Rentabilität nach Abzug aller Kosten.", delay: 0.1 },
                            { icon: Lock, title: "Mahnwesen", desc: "Dezent, aber konsequent: Automatisierte Zahlungserinnerungen für stabilen Cashflow.", delay: 0.2 },
                            { icon: ShieldCheck, title: "Datenschutz", desc: "Hosting in Deutschland, Ende-zu-Ende verschlüsselt und 100% DSGVO-konform.", delay: 0.3 },
                        ].map((item, i) => (
                            <Reveal key={i} delay={item.delay} y={20} className="h-full">
                                <GlowCard className="group h-full flex flex-col items-center text-center py-10 md:py-14">
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-slate-50 flex items-center justify-center text-[#800040] mb-8 group-hover:scale-110 group-hover:bg-[#800040] group-hover:text-white transition-all duration-500 shadow-sm">
                                        <item.icon size={28} className="md:w-8 md:h-8" />
                                    </div>
                                    <h4 className="text-2xl md:text-3xl font-black text-slate-950 mb-4 tracking-tight">{item.title}</h4>
                                    <p className="text-slate-400 font-bold leading-relaxed text-base md:text-lg max-w-[280px]">{item.desc}</p>
                                </GlowCard>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- IMMERSIVE IMAGE SECTION --- */}
            <section className="py-24 md:py-32 lg:py-44 bg-slate-50/50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-32">
                        <div className="flex-1 order-2 lg:order-1 relative group">
                            <Reveal x={-15}>
                                <div className="absolute -inset-4 bg-[#800040]/5 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <img
                                    src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200"
                                    className="w-full h-[300px] md:h-[500px] object-cover rounded-[3rem] md:rounded-[5rem] shadow-wow relative z-10"
                                    alt="Modern Workspace"
                                />
                                <div className="absolute top-10 right-10 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl z-20 hidden md:block border border-white">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#800040] mb-1">Qualitätssiegel</p>
                                    <p className="text-lg font-black text-slate-950 italic">Gefertigt in Deutschland.</p>
                                </div>
                            </Reveal>
                        </div>
                        <div className="flex-1 order-1 lg:order-2">
                            <Reveal x={15}>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#800040] mb-8 md:mb-12">Werte & Vision</h3>
                                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-950 tracking-tighter leading-[0.9] mb-10 md:mb-12">
                                    Fokus auf das, <br /> was zählt.
                                </h2>
                                <p className="text-lg md:text-2xl text-slate-400 font-bold mb-10 md:mb-14 leading-relaxed">
                                    Wir glauben, dass Freelancer keine Verwalter sein sollten. Unsere Mission ist es, die administrativen Hürden so weit zu reduzieren, dass dein Talent wieder im Mittelpunkt steht.
                                </p>
                                <div className="flex items-center gap-8">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-[#800040] text-[#800040]" />)}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Präzision & Zuverlässigkeit</span>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TAX ENGINE SECTION --- */}
            <section id="steuern" className="py-24 md:py-32 lg:py-44 bg-white relative">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20 md:gap-32">
                        <div className="flex-1">
                            <Reveal x={-15}>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#800040] mb-8 md:mb-10">Finanzielle Klarheit</h3>
                                <h2 className="text-4xl sm:text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-[0.9] mb-10 md:mb-12">
                                    Keine Sorgen <br /> vorm Finanzamt.
                                </h2>
                                <p className="text-lg md:text-2xl text-slate-500 font-bold mb-12 md:mb-16 max-w-xl">
                                    Das FreelancerTool berechnet voraussichtliche Steuerbelastungen in Echtzeit auf Basis des deutschen Einkommensteuer-Grundtarifs.
                                </p>

                                <div className="space-y-6 md:space-y-8 mb-16">
                                    {[
                                        "Echtzeit Steuerrücklagen-Berechnung",
                                        "Umsatzsteuer-Monitor (Normal & §19)",
                                        "Berücksichtigung von Betriebsausgaben",
                                        "Automatisiertes Mahnwesen"
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-4 md:gap-6">
                                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-slate-50 border-2 border-[#800040]/10 flex items-center justify-center text-[#800040]">
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                            <span className="text-base md:text-xl font-black text-slate-950">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[9px] font-bold text-slate-300 leading-relaxed max-w-md italic border-l border-slate-100 pl-4">
                                    * Die Berechnungen stellen keine steuerliche Beratung dar und ersetzen nicht die Prüfung durch einen Steuerberater.
                                </p>
                            </Reveal>
                        </div>

                        <div className="flex-1 w-full relative">
                            <Reveal x={15}>
                                <div className="p-8 md:p-14 rounded-[3.5rem] md:rounded-[5rem] bg-slate-50 border border-slate-100 shadow-wow overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#800040]/5 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />

                                    <div className="flex items-center gap-6 mb-12 md:mb-16">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-slate-950 text-white flex items-center justify-center shadow-xl"><PieChart size={30} /></div>
                                        <div>
                                            <h4 className="text-xl md:text-2xl font-black text-slate-950">Steuer-Cockpit</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Aktuell</p>
                                        </div>
                                    </div>

                                    <div className="space-y-10 md:space-y-12">
                                        {[
                                            { label: "Einkommensteuer", val: "€6.420", color: "bg-slate-950", p: "65%" },
                                            { label: "Umsatzsteuer (19%)", val: "€4.120", color: "bg-[#800040]", p: "40%" }
                                        ].map((stat, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-end mb-4">
                                                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                                                    <span className="text-3xl md:text-4xl font-black text-slate-950 tracking-tighter">{stat.val}</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-white rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} whileInView={{ width: stat.p }} transition={{ duration: 1.5, delay: i * 0.2 }} className={`h-full ${stat.color} rounded-full`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-16 p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Empfohlene Rücklage</p>
                                        <p className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none">€10.540,00</p>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING & CALL TO ACTION: THE HIGH-IMPACT FINALE --- */}
            <section id="preise" className="py-20 md:py-32 lg:py-40 relative overflow-hidden isolate min-h-[90vh] flex items-center">

                {/* --- INTENSIFIED PREMIUM BACKGROUND --- */}
                <div className="absolute inset-0 -z-10 bg-white">
                    <div className="absolute inset-0 w-full h-full opacity-[0.6] pointer-events-none">
                        <PixelBlast variant="square" pixelSize={6} color="#800040" patternScale={4} patternDensity={0.8} speed={0.3} transparent />
                    </div>
                    {/* Vibrant Gradient Orbs */}
                    <div className="absolute top-[-10%] right-[-10%] w-[1200px] h-[1200px] bg-[radial-gradient(circle,rgba(128,0,64,0.18)_0%,transparent_70%)] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] animate-blob" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(168,85,247,0.08)_0%,transparent_70%)] animate-pulse" />

                    {/* Premium High-Contrast Grain */}
                    <div className="absolute inset-0 opacity-[0.5] mix-blend-overlay pointer-events-none contrast-150" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                </div>

                <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                        {/* Left Side: Dramatic Headline */}
                        <div className="text-center lg:text-left">
                            <Reveal x={-30}>
                                <h2 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-[-0.08em] leading-[0.85] text-slate-950 py-4 mb-8">
                                    Komm in den <br /> <span className="text-[#800040] italic">Flow.</span>
                                </h2>
                                <p className="text-xl md:text-2xl text-slate-600 font-bold max-w-xl mx-auto lg:mx-0 drop-shadow-sm">
                                    Die professionelle Zentrale für dein Business. <br className="hidden md:block" />
                                    Keine Kompromisse mehr.
                                </p>
                            </Reveal>
                        </div>

                        {/* Right Side: The Reflective Card */}
                        <Reveal y={30} delay={0.2}>
                            <div className="relative p-8 md:p-14 lg:p-16 rounded-[4rem] bg-[#800040] text-white shadow-wow overflow-hidden group">

                                {/* Reflective Internal Effects */}
                                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-pink-400 rounded-full mix-blend-screen filter blur-[100px] opacity-25 pointer-events-none" />
                                <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent theme-shine pointer-events-none" />

                                <div className="relative z-10 flex flex-col gap-10">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase text-pink-200/50 tracking-[0.5em] mb-6">Full Feature Access</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-7xl md:text-8xl font-black leading-none tracking-tighter">25€</span>
                                            <span className="text-sm font-black text-white/40 uppercase tracking-widest">/ Monat</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-5 border-t border-white/10 pt-10">
                                        {[
                                            "Alle Management-Module",
                                            "Unbegrenzte Rechnungen (PDF)",
                                            "DATEV EXTF & DSGVO",
                                            "Monatlich kündbar"
                                        ].map((item) => (
                                            <li key={item} className="flex items-center gap-4">
                                                <div className="w-6 h-6 rounded-xl bg-white/10 flex items-center justify-center">
                                                    <Check size={14} className="text-white" strokeWidth={3} />
                                                </div>
                                                <span className="text-base font-black tracking-tight">{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-4">
                                        <MagneticButton className="w-full">
                                            <Link href="/register" className="block transform">
                                                <button className="w-full bg-white text-[#800040] py-5 rounded-[1.8rem] font-black text-xl uppercase tracking-widest hover:bg-pink-50 transition-all shadow-4xl active:scale-[0.98]">
                                                    GRATIS TESTEN
                                                </button>
                                            </Link>
                                        </MagneticButton>
                                        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] mt-6 text-center">Keine Kreditkarte · 14 Tage Pro</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="pt-32 pb-16 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-20 mb-32 text-center lg:text-left">
                        <div className="max-w-md mx-auto lg:mx-0">
                            <Link href="/" className="mb-10 block">
                                <Image src="/logo.svg" alt="Logo" width={150} height={32} className="h-8 w-auto mx-auto lg:mx-0" />
                            </Link>
                            <p className="text-xl md:text-2xl text-slate-400 font-bold leading-relaxed mb-10">
                                Die intuitive Lösung für Freelancer, die ihr Business steuern und ihren Aufwand minimieren wollen.
                            </p>
                            <div className="flex justify-center lg:justify-start gap-4">
                                <div className="px-4 py-2 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">Gefertigt in Deutschland</div>
                                <div className="px-4 py-2 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">DSGVO Konform</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 md:gap-24 w-full lg:w-auto">
                            {[
                                { title: 'Produkt', links: ['Funktionen', 'Dashboard', 'Preise'] },
                                { title: 'Rechtliches', links: ['Impressum', 'Datenschutz', 'AGB'] },
                                { title: 'Kontakt', links: ['Support', 'LinkedIn', 'Twitter'] }
                            ].map((col, i) => (
                                <div key={i}>
                                    <h5 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-900 mb-8">{col.title}</h5>
                                    <ul className="space-y-4">
                                        {col.links.map(l => (
                                            <li key={l}><Link href="#" className="text-slate-400 hover:text-[#800040] text-sm font-bold transition-all block">{l}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-16 border-t border-slate-50 text-center">
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">
                            © {new Date().getFullYear()} FREELANCERTOOL. ALLE RECHTE VORBEHALTEN.
                        </p>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');

                body {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    letter-spacing: -0.01em;
                    background: white;
                    color: #0f172a;
                    -webkit-font-smoothing: antialiased;
                }

                html {
                    scroll-behavior: smooth;
                }

                .shadow-wow {
                    box-shadow: 0 40px 100px -20px rgba(128,0,64,0.3), 0 20px 40px -10px rgba(0,0,0,0.1);
                }

                .shadow-3xl {
                    box-shadow: 0 50px 100px -20px rgba(0,0,0,0.08);
                }

                .shadow-4xl {
                    box-shadow: 0 30px 60px -10px rgba(128,0,64,0.4);
                }

                ::selection {
                    background-color: #800040;
                    color: white;
                }

                .perspective-1000 {
                    perspective: 1000px;
                }

                @media (max-width: 640px) {
                    .shadow-wow {
                        box-shadow: 0 20px 50px -10px rgba(128,0,64,0.25);
                    }
                }
            `}</style>
        </div>
    );
}
